export type ProductStatus = 'Active' | 'Draft' | 'Archived';
export type ProductType = 'Flavour' | 'Fragrance' | 'Essential Oil' | 'Botanical Extract';
export type ParentGroup = 'Flavours' | 'Fragrances';
export type InquiryStatus = 'New' | 'Contacted' | 'In Progress' | 'Completed';
export type SampleStatus = 'New' | 'Approved' | 'Shipped' | 'Completed';
export type ContactStatus = 'New' | 'Read' | 'Archived';
export type CertificateStatus = 'Active' | 'Expiring Soon' | 'Archived';
export type UserRole = 'Super Admin' | 'Admin' | 'Staff' | 'Editor' | 'Customer';

export interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  category: string;
  subcategory: string;
  productType: ProductType;
  parentGroup?: ParentGroup;
  shortDescription: string;
  fullDescription: string;
  applications: string;
  ingredientsNotes: string;
  casNumber?: string;
  tasteProfile?: string;
  olfactoryProfile?: string;
  solubility?: string;
  heatStability?: string;
  minimumOrderQuantity?: string;
  ifraDocUrl?: string;
  sdsDocUrl?: string;
  estimatedPricePerKg?: number;
  price?: number;
  salePrice?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  rating?: number;
  reviewCount?: number;
  variationsJson?: string;
  imageUrl: string;
  galleryUrls?: string;
  technicalDocUrl?: string;
  featured: boolean;
  status: ProductStatus;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariation?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentGroup: ParentGroup;
  description: string;
  imageUrl: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
  description: string;
  applications: string;
  imageUrl: string;
  featuredProducts: string;
  ctaText: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  submitterUid: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  productName: string;
  quantity: string;
  application: string;
  message: string;
  attachmentUrl?: string;
  inquiryType?: string;
  cartItemsJson?: string;
  estimatedTotal?: string;
  status: InquiryStatus;
  internalNotes?: string;
  createdAt: string;
}

export interface SampleRequest {
  id: string;
  submitterUid: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  productName: string;
  quantity: string;
  application: string;
  shippingAddress: string;
  message: string;
  status: SampleStatus;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  submitterUid: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  authorName: string;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  fileName: string;
  fileType: 'image' | 'pdf' | 'document';
  category: string;
  url: string;
  sizeKb: number;
  createdAt: string;
}

export interface Certificate {
  id: string;
  name: string;
  certificateNumber: string;
  issuingBody: string;
  issueDate: string;
  expiryDate: string;
  documentUrl: string;
  status: CertificateStatus;
  createdAt: string;
}

export interface PageContent {
  slug: string;
  title: string;
  heroHeading: string;
  heroSubheading: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  sectionOneTitle: string;
  sectionOneBody: string;
  sectionTwoTitle: string;
  sectionTwoBody: string;
  sectionThreeTitle: string;
  sectionThreeBody: string;
  visible: boolean;
  updatedAt: string;
}

export interface SiteSetting {
  companyName: string;
  logoText: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  linkedinUrl: string;
  googleMapsUrl: string;
  smtpHost: string;
  smtpPort: string;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
  analyticsId: string;
  updatedAt: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  type: 'Quote Notification' | 'Sample Notification' | 'Contact Notification' | 'Customer Confirmation' | 'Password Reset';
  sentAt: string;
  status: 'Dispatched' | 'Queued (Dev Mode)';
}

export type PublicRoute =
  | { page: 'home' }
  | { page: 'products'; categoryFilter?: string; groupFilter?: ParentGroup; search?: string }
  | { page: 'product-detail'; slug: string }
  | { page: 'industries'; slug?: string }
  | { page: 'about' }
  | { page: 'rd' }
  | { page: 'quality' }
  | { page: 'blog' }
  | { page: 'blog-detail'; slug: string }
  | { page: 'quote'; productPreselect?: string }
  | { page: 'sample'; productPreselect?: string }
  | { page: 'contact' }
  | { page: 'admin' }
  | { page: 'not-found' };
