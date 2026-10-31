import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import nodemailer from 'nodemailer';

const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  selectedVariation: z.string().optional().nullable(),
});

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  customerEmail: z.string().trim().email().max(160),
  customerPhone: z.string().trim().min(5).max(30),
  shippingAddress: z.string().trim().min(5).max(200),
  shippingCity: z.string().trim().min(2).max(100),
  shippingState: z.string().trim().max(100).default(''),
  shippingZip: z.string().trim().min(2).max(20),
  shippingCountry: z.string().trim().default('Switzerland'),
  couponCode: z.string().trim().optional().nullable(),
  paymentMethod: z.enum(['COD', 'Card', 'Bank Transfer']).default('COD'),
  notes: z.string().max(500).optional().nullable(),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
});

function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FF-${date}-${rand}`;
}

async function sendOrderConfirmationEmail(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: Array<{ productName: string; quantity: number; price: number; subtotal: number }>;
}) {
  const host = process.env.EMAIL_SERVER_HOST;
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;
  const from = process.env.EMAIL_FROM || user;

  if (!host || !user || !pass || !from) {
    console.log(`[Order Email Simulated] Order #${order.orderNumber} placed by ${order.customerEmail}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      auth: { user, pass },
    });

    const itemsHtml = order.items
      .map(
        (i) =>
          `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #EEE;">${i.productName}</td>
            <td style="padding: 8px; border-bottom: 1px solid #EEE; text-align: center;">${i.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #EEE; text-align: right;">$${i.price.toFixed(2)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #EEE; text-align: right;">$${i.subtotal.toFixed(2)}</td>
          </tr>`
      )
      .join('');

    await transporter.sendMail({
      to: order.customerEmail,
      from,
      subject: `Order Confirmed: ${order.orderNumber} — Flavour & Fragrances`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FAF9F6; color: #0F1E19;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #9A7738; margin: 0 0 10px;">Flavour & Fragrances</p>
          <h1 style="font-size: 24px; font-weight: 600; color: #0C1612; margin: 0 0 16px;">Order Confirmation</h1>
          <p style="font-size: 14px; color: #4A5568; line-height: 1.5;">Thank you for your order, ${order.customerName}. Your order <strong>${order.orderNumber}</strong> has been received and is being prepared in our laboratory atelier.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background: #FFF; border-radius: 6px; overflow: hidden; font-size: 13px;">
            <thead>
              <tr style="background: #F4EFE6; text-align: left;">
                <th style="padding: 10px 8px;">Product</th>
                <th style="padding: 10px 8px; text-align: center;">Qty</th>
                <th style="padding: 10px 8px; text-align: right;">Unit Price</th>
                <th style="padding: 10px 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 12px 8px; font-weight: bold; text-align: right;">Total Amount:</td>
                <td style="padding: 12px 8px; font-weight: bold; text-align: right; color: #0C1612;">$${order.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <p style="font-size: 13px; color: #718096; line-height: 1.5;">You can track your order status anytime through our online portal.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Failed to send order email:', err);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const orderStatus = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    const isAdmin =
      session?.user?.isAdmin ||
      ['Super Admin', 'Admin', 'Staff'].includes(session?.user?.role as string);

    if (isAdmin) {
      const where: Record<string, unknown> = {};
      if (orderStatus && orderStatus !== 'All') where.orderStatus = orderStatus;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            items: true,
            payment: true,
          },
        }),
        prisma.order.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: orders,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    }

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Customer's own orders
    const orders = await prisma.order.findMany({
      where: {
        OR: [{ customerEmail: session.user.email.toLowerCase() }, { userId: session.user.id }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        payment: true,
      },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to retrieve orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid checkout data', issues: parsed.error.issues }, { status: 400 });
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      shippingCountry,
      couponCode,
      paymentMethod,
      notes,
      items,
    } = parsed.data;

    // Load products from DB
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Validate stock and calculate subtotal
    let subtotal = 0;
    const validatedItems: Array<{
      productId: string;
      productName: string;
      sku: string;
      price: number;
      quantity: number;
      subtotal: number;
      imageUrl: string;
      selectedVariation?: string | null;
    }> = [];

    for (const item of items) {
      const prod = productMap.get(item.productId);
      if (!prod) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }

      if (prod.status !== 'Active') {
        return NextResponse.json({ error: `Product "${prod.name}" is currently unavailable.` }, { status: 400 });
      }

      if (prod.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${prod.name}". Only ${prod.stockQuantity} units available.`,
          },
          { status: 400 }
        );
      }

      // Check for variation price override
      let unitPrice = prod.salePrice || prod.price;
      if (item.selectedVariation && prod.variationsJson) {
        try {
          const vars = JSON.parse(prod.variationsJson);
          if (Array.isArray(vars)) {
            const found = vars.find((v: { size: string; price: number }) => v.size === item.selectedVariation);
            if (found && typeof found.price === 'number') {
              unitPrice = found.price;
            }
          }
        } catch {
          // ignore parsing error, use default unitPrice
        }
      }

      const lineTotal = Number((unitPrice * item.quantity).toFixed(2));
      subtotal += lineTotal;

      validatedItems.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        price: unitPrice,
        quantity: item.quantity,
        subtotal: lineTotal,
        imageUrl: prod.imageUrl,
        selectedVariation: item.selectedVariation,
      });
    }

    subtotal = Number(subtotal.toFixed(2));

    // Process Coupon if provided
    let discountAmount = 0;
    let validCouponId: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon && coupon.active) {
        const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > new Date();
        const underLimit = !coupon.usageLimit || coupon.timesUsed < coupon.usageLimit;
        const meetsMin = subtotal >= coupon.minOrderAmount;

        if (notExpired && underLimit && meetsMin) {
          validCouponId = coupon.id;
          if (coupon.discountType === 'percentage') {
            discountAmount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
              discountAmount = coupon.maxDiscount;
            }
          } else {
            discountAmount = coupon.discountValue;
          }
          discountAmount = Math.min(discountAmount, subtotal);
          discountAmount = Number(discountAmount.toFixed(2));
        }
      }
    }

    const shippingFee = subtotal > 150 ? 0 : 15; // Free shipping over $150
    const taxAmount = Number(((subtotal - discountAmount) * 0.077).toFixed(2)); // Swiss VAT standard 7.7%
    const totalAmount = Number((subtotal - discountAmount + shippingFee + taxAmount).toFixed(2));
    const orderNumber = generateOrderNumber();

    // Execute critical transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      // 1. Decrement inventory and record logs
      for (const item of validatedItems) {
        const current = await tx.product.findUnique({ where: { id: item.productId } });
        if (!current || current.stockQuantity < item.quantity) {
          throw new Error(`Inventory race condition for product: ${item.productName}`);
        }

        const newStock = current.stockQuantity - item.quantity;
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: newStock },
        });

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            changeAmount: -item.quantity,
            previousStock: current.stockQuantity,
            newStock,
            reason: 'Order',
            referenceId: orderNumber,
            performedBy: session?.user?.email || customerEmail,
          },
        });
      }

      // 2. Increment coupon usage
      if (validCouponId) {
        await tx.coupon.update({
          where: { id: validCouponId },
          data: { timesUsed: { increment: 1 } },
        });
      }

      // 3. Create Order
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id || null,
          customerName,
          customerEmail: customerEmail.toLowerCase(),
          customerPhone,
          shippingAddress,
          shippingCity,
          shippingState,
          shippingZip,
          shippingCountry,
          subtotal,
          discountAmount,
          shippingFee,
          taxAmount,
          totalAmount,
          couponCode: validCouponId ? couponCode?.toUpperCase() : null,
          paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
          orderStatus: 'Processing',
          notes: notes || null,
          items: {
            create: validatedItems.map((i) => ({
              productId: i.productId,
              productName: i.productName,
              sku: i.sku,
              price: i.price,
              quantity: i.quantity,
              subtotal: i.subtotal,
              imageUrl: i.imageUrl,
              selectedVariation: i.selectedVariation,
            })),
          },
          payment: {
            create: {
              paymentMethod,
              amount: totalAmount,
              currency: 'USD',
              status: 'Pending',
              transactionId: `TXN-${orderNumber}`,
            },
          },
        },
        include: {
          items: true,
          payment: true,
        },
      });

      return createdOrder;
    });

    // Send asynchronous confirmation email
    void sendOrderConfirmationEmail({
      orderNumber: newOrder.orderNumber,
      customerName: newOrder.customerName,
      customerEmail: newOrder.customerEmail,
      totalAmount: newOrder.totalAmount,
      items: validatedItems,
    });

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: newOrder,
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Order creation failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to place order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

