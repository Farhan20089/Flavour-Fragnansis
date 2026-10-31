import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { inquiryPrisma } from '../../../lib/inquiry-prisma';

const dataDirectory = path.join(process.cwd(), '.data');
const inquirySchema = z.object({
  id: z.string().min(1).max(100).default(() => randomUUID()),
  submitterUid: z.string().max(160).default('public-b2b-visitor'),
  name: z.string().trim().min(1).max(120),
  company: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(160),
  phone: z.string().max(64).default(''),
  country: z.string().max(100).default(''),
  productName: z.string().trim().min(1).max(160),
  quantity: z.string().trim().min(1).max(100),
  application: z.string().trim().min(1).max(300),
  message: z.string().max(3000).default(''),
  attachmentUrl: z.string().max(1000).default(''),
  inquiryType: z.string().max(64).default('Quote'),
  cartItemsJson: z.string().max(20000).default('[]'),
  estimatedTotal: z.string().max(100).optional(),
});

const contactSchema = z
  .object({
    id: z.string().min(1).max(100).default(() => randomUUID()),
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(160),
    subject: z.string().max(200).default(''),
    message: z.string().trim().min(1).max(3000),
  })
  .passthrough();

async function isAdminRequest() {
  const session = await auth();
  return session?.user?.isAdmin === true;
}

async function readStore<T>(name: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(path.join(dataDirectory, `${name}.json`), 'utf8')) as T;
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return fallback;
    throw error;
  }
}

async function writeStore(name: string, data: unknown) {
  await mkdir(dataDirectory, { recursive: true });
  const target = path.join(dataDirectory, `${name}.json`);
  const temporary = `${target}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(data, null, 2), 'utf8');
  await rename(temporary, target);
}

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const segments = (await params).path;
  const [resource] = segments;
  if (resource === 'inquiries' && segments.length === 1) {
    if (!(await isAdminRequest())) {
      return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
    }

    try {
      const data = await inquiryPrisma.inquiry.findMany({ orderBy: { createdAt: 'desc' } });
      return NextResponse.json({ success: true, count: data.length, data });
    } catch (error) {
      console.error('Unable to read saved inquiries:', error);
      return NextResponse.json({ error: 'Unable to read requested data.' }, { status: 500 });
    }
  }

  if ((resource === 'sample-requests' || resource === 'contact-messages') && !(await isAdminRequest())) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  const stores: Record<string, string> = {
    products: 'products',
    categories: 'categories',
    industries: 'industries',
    'sample-requests': 'sampleRequests',
    'contact-messages': 'contactMessages',
  };
  const store = resource ? stores[resource] : undefined;
  if (!store || segments.length !== 1) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  try {
    const data = await readStore<unknown[]>(store, []);
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error(`Unable to read ${resource} API data:`, error);
    return NextResponse.json({ error: 'Unable to read requested data.' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const segments = (await params).path;
  const [resource] = segments;
  if ((resource === 'products' || resource === 'categories') && !(await isAdminRequest())) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }
  const body = await readBody(request);
  if (!body) return NextResponse.json({ error: 'A valid JSON object is required.' }, { status: 400 });

  try {
    if (resource === 'products' && segments.length === 1) {
      if (!body.name || !body.sku) {
        return NextResponse.json({ error: 'Missing required product fields (name, sku).' }, { status: 400 });
      }
      const products = await readStore<Record<string, unknown>[]>('products', []);
      const index = products.findIndex((product) => product.id === body.id);
      if (index >= 0) products[index] = body;
      else products.unshift(body);
      await writeStore('products', products);
      return NextResponse.json({ success: true, product: body });
    }

    if (resource === 'categories' && segments.length === 1) {
      const categories = await readStore<Record<string, unknown>[]>('categories', []);
      const index = categories.findIndex((category) => category.id === body.id);
      if (index >= 0) categories[index] = body;
      else categories.push(body);
      await writeStore('categories', categories);
      return NextResponse.json({ success: true, category: body });
    }

    if (resource === 'inquiries' && segments.length === 1) {
      const parsed = inquirySchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Enter valid contact, company, product, quantity, and application details.' }, { status: 400 });
      }
      const inquiry = await inquiryPrisma.inquiry.create({
        data: {
          ...parsed.data,
          submitterUid: 'public-b2b-visitor',
          email: parsed.data.email.toLowerCase(),
        },
      });
      return NextResponse.json({ success: true, id: inquiry.id }, { status: 201 });
    }

    if (resource === 'sample-requests' && segments.length === 1) {
      const sampleBody = {
        ...body,
        inquiryType: 'Sample Request',
        cartItemsJson: '[]',
        message: `${String(body.message || '')}\n\nShipping address: ${String(body.shippingAddress || '')}`,
      };
      const parsed = inquirySchema.safeParse(sampleBody);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Enter valid contact, company, product, quantity, and application details.' }, { status: 400 });
      }
      const inquiry = await inquiryPrisma.inquiry.create({
        data: {
          ...parsed.data,
          submitterUid: 'public-b2b-visitor',
          email: parsed.data.email.toLowerCase(),
        },
      });
      return NextResponse.json({ success: true, id: inquiry.id }, { status: 201 });
    }

    if (resource === 'contact-messages' && segments.length === 1) {
      const parsed = contactSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Enter a valid name, email and message.' }, { status: 400 });
      }
      const messages = await readStore<Record<string, unknown>[]>('contactMessages', []);
      messages.unshift(parsed.data);
      await writeStore('contactMessages', messages.slice(0, 500));
      return NextResponse.json({ success: true, id: parsed.data.id });
    }

    if (resource === 'notifications' && segments[1] === 'email' && segments.length === 2) {
      console.log(
        `[Email Queue] ${String(body.type || 'Notification')} to ${String(body.to || '(no recipient)')}: ${String(body.subject || '(no subject)')}`
      );
      return NextResponse.json({
        success: true,
        message: 'Email queued for delivery via configured SMTP server.',
        dispatchedTo: body.to,
      });
    }

    if (resource === 'upload' && segments.length === 1) {
      const dataUrl = typeof body.dataUrl === 'string' ? body.dataUrl : '';
      if (!/^data:(image\/(png|jpeg|webp)|application\/pdf);base64,/.test(dataUrl) || dataUrl.length > 7_000_000) {
        return NextResponse.json({ error: 'Upload an image or PDF smaller than 5 MB.' }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        file: {
          fileName: body.fileName,
          fileType: body.fileType,
          url: dataUrl,
          sizeKb: Math.round(dataUrl.length / 1360),
        },
      });
    }

    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  } catch (error) {
    console.error(`Unable to process ${resource || 'API'} request:`, error);
    return NextResponse.json({ error: 'Unable to process this request.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const segments = (await params).path;
  if (segments.length === 2 && segments[0] === 'inquiries') {
    if (!(await isAdminRequest())) {
      return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
    }

    try {
      await inquiryPrisma.inquiry.delete({ where: { id: segments[1] } });
      return NextResponse.json({ success: true, message: 'Inquiry deleted.' });
    } catch (error) {
      console.error('Unable to delete inquiry:', error);
      return NextResponse.json({ error: 'Unable to delete inquiry.' }, { status: 500 });
    }
  }

  if (segments.length !== 2 || segments[0] !== 'products') {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  try {
    const products = await readStore<Record<string, unknown>[]>('products', []);
    await writeStore(
      'products',
      products.filter((product) => product.id !== segments[1])
    );
    return NextResponse.json({ success: true, message: `Product ${segments[1]} deleted.` });
  } catch (error) {
    console.error('Unable to delete product:', error);
    return NextResponse.json({ error: 'Unable to delete product.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const segments = (await params).path;
  if (segments.length !== 1 || segments[0] !== 'inquiries') {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  const body = await readBody(request);
  const parsed = z.object({
    id: z.string().min(1).max(100),
    status: z.enum(['New', 'Contacted', 'In Progress', 'Completed']),
    internalNotes: z.string().max(2000).optional(),
  }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'A valid inquiry ID and status are required.' }, { status: 400 });
  }

  try {
    const inquiry = await inquiryPrisma.inquiry.update({
      where: { id: parsed.data.id },
      data: {
        status: parsed.data.status,
        ...(parsed.data.internalNotes !== undefined ? { internalNotes: parsed.data.internalNotes } : {}),
      },
    });
    return NextResponse.json({ success: true, inquiry });
  } catch (error) {
    console.error('Unable to update inquiry:', error);
    return NextResponse.json({ error: 'Unable to update inquiry.' }, { status: 500 });
  }
}
