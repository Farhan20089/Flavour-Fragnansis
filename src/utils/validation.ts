import { z } from 'zod';

// Synchronized verbatim with firebase-blueprint.json maxLength and pattern constraints
export const SLUG_REGEX = /^[a-z0-9\-]+$/;

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(160),
  sku: z.string().min(1, 'SKU is required').max(64),
  slug: z.string().min(1, 'Slug is required').max(160).regex(SLUG_REGEX, 'Lowercase letters, numbers, and hyphens only'),
  category: z.string().min(1, 'Category is required').max(100),
  subcategory: z.string().max(100),
  productType: z.enum(['Flavour', 'Fragrance', 'Essential Oil', 'Botanical Extract']),
  shortDescription: z.string().min(1, 'Short description is required').max(500),
  fullDescription: z.string().min(1, 'Full description is required').max(5000),
  applications: z.string().min(1, 'Applications are required').max(1000),
  ingredientsNotes: z.string().min(1, 'Olfactory / flavour notes required').max(1000),
  imageUrl: z.string().min(1, 'Image URL is required').max(1000),
  galleryUrls: z.string().max(2000).optional(),
  technicalDocUrl: z.string().max(1000).optional(),
  featured: z.boolean(),
  status: z.enum(['Active', 'Draft', 'Archived']),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(120),
  slug: z.string().min(1, 'Slug is required').max(120).regex(SLUG_REGEX),
  parentGroup: z.enum(['Flavours', 'Fragrances']),
  description: z.string().min(1, 'Description is required').max(1000),
  imageUrl: z.string().max(1000),
  displayOrder: z.number().min(0),
  active: z.boolean(),
});

export const inquirySchema = z.object({
  name: z.string().min(2, 'Full name is required').max(120),
  company: z.string().min(2, 'Company name is required').max(160),
  email: z.string().email('Enter a valid corporate email address').max(160),
  phone: z.string().min(5, 'Phone number is required').max(64),
  country: z.string().min(2, 'Country is required').max(100),
  productName: z.string().min(1, 'Please specify a product or formulation').max(160),
  quantity: z.string().min(1, 'Estimated volume/quantity is required').max(100),
  application: z.string().min(2, 'Target end-product application is required').max(300),
  message: z.string().min(5, 'Please provide project or formulation requirements').max(3000),
  attachmentUrl: z.string().max(1000).optional(),
});

export const sampleRequestSchema = z.object({
  name: z.string().min(2, 'Full name is required').max(120),
  company: z.string().min(2, 'Company name is required').max(160),
  email: z.string().email('Enter a valid corporate email address').max(160),
  phone: z.string().min(5, 'Phone number is required').max(64),
  country: z.string().min(2, 'Country is required').max(100),
  productName: z.string().min(1, 'Product selection is required').max(160),
  quantity: z.string().min(1, 'Sample quantity is required').max(100),
  application: z.string().min(2, 'Application is required').max(300),
  shippingAddress: z.string().min(8, 'Complete laboratory/company shipping address is required').max(600),
  message: z.string().max(2000),
});

export const contactMessageSchema = z.object({
  name: z.string().min(2, 'Name is required').max(120),
  company: z.string().min(1, 'Company is required').max(160),
  email: z.string().email('Valid email address is required').max(160),
  phone: z.string().min(5, 'Phone number is required').max(64),
  country: z.string().min(2, 'Country is required').max(100),
  subject: z.string().min(3, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(3000),
});

export const blogPostSchema = z.object({
  title: z.string().min(3, 'Title is required').max(200),
  slug: z.string().min(3, 'Slug is required').max(200).regex(SLUG_REGEX),
  category: z.string().min(1, 'Category is required').max(100),
  tags: z.string().max(300),
  excerpt: z.string().min(10, 'Excerpt is required').max(600),
  content: z.string().min(20, 'Article content is required').max(15000),
  featuredImage: z.string().max(1000),
  seoTitle: z.string().max(160),
  seoDescription: z.string().max(300),
  published: z.boolean(),
  authorName: z.string().min(2).max(120),
});

export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140) || 'item';
}

export function sanitizeString(val: string | undefined, maxLen: number): string {
  return (val || '').trim().slice(0, maxLen);
}
