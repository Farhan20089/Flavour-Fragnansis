import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Building2,
  Inbox,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Award,
  Users,
  Settings,
  LogOut,
  Plus,
  Search,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  MessageSquare,
  Upload,
  Eye,
  Menu,
  X,
  Shield,
  Save,
  ShoppingBag,
  Boxes,
  Tag,
  Star,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SafeImage } from './SafeImage';
import { AdminDashboardOverview } from './admin/AdminDashboardOverview';
import { AdminOrdersTab } from './admin/AdminOrdersTab';
import { AdminInventoryTab } from './admin/AdminInventoryTab';
import { AdminCouponsTab } from './admin/AdminCouponsTab';
import { AdminReviewsTab } from './admin/AdminReviewsTab';
import { AdminUsersTab } from './admin/AdminUsersTab';
import {
  Product,
  Category,
  Industry,
  Inquiry,
  SampleRequest,
  ContactMessage,
  BlogPost,
  Certificate,
  PageContent,
  SiteSetting,
  UserRole,
} from '../types';

function getOtpButtonLabel(pending: boolean, requested: boolean): string {
  if (pending) return 'Please wait…';
  if (requested) return 'Verify code and sign in';
  return 'Send verification code';
}

function getProductStatusBadgeClass(status: Product['status']): string {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Draft':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-red-100 text-red-800';
  }
}

function formatInquiryItems(cartItemsJson?: string) {
  if (!cartItemsJson || cartItemsJson === '[]') return '';
  try {
    const items: unknown = JSON.parse(cartItemsJson);
    if (!Array.isArray(items)) return 'Cart items unavailable.';
    return items
      .map((item: unknown) => {
        if (!item || typeof item !== 'object') return '';
        const line = item as Record<string, unknown>;
        if (typeof line.name !== 'string') return '';
        const sku = typeof line.sku === 'string' ? ` (${line.sku})` : '';
        const quantity = typeof line.quantity === 'number' ? ` × ${line.quantity}` : '';
        return `${line.name}${sku}${quantity}`;
      })
      .filter(Boolean)
      .join(' · ');
  } catch (error) {
    console.error('Unable to parse saved inquiry cart items:', error);
    return 'Saved cart details could not be read.';
  }
}

export function AdminLoginForm() {
  const { requestAdminOtp, verifyAdminOtp } = useStore();
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [loginPending, setLoginPending] = useState(false);
  const [loginError, setLoginError] = useState('');

  async function handlePasswordSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError('');
    setLoginPending(true);
    try {
      const res = await signIn('credentials', {
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
        redirect: false,
      });

      if (res?.error) {
        setLoginError('Invalid administrator credentials.');
      } else {
        window.location.reload();
      }
    } catch {
      setLoginError('Authentication service unreachable.');
    } finally {
      setLoginPending(false);
    }
  }

  async function handleOtpSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError('');
    setLoginPending(true);
    try {
      const result = otpRequested
        ? await verifyAdminOtp(loginEmail, verificationCode)
        : await requestAdminOtp(loginEmail);
      if (!result.ok) {
        setLoginError(result.error || 'Unable to complete sign-in.');
      } else if (!otpRequested) {
        setOtpRequested(true);
      }
    } finally {
      setLoginPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#171717] p-6 text-[#FAF8F3]">
      <section className="w-full max-w-md space-y-6 border border-[#171717]/20 bg-white p-8 text-[#171717] shadow-2xl md:p-10">
        <header className="space-y-2 text-center">
          <h1 className="font-serif text-3xl font-light text-[#171717]">Flavour &amp; Fragrances</h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#B89555]">Executive Administration Portal</p>
          <p className="text-xs text-[#171717]/60 font-light">
            Authorized personnel access for catalog, inventory, orders, and security governance.
          </p>
        </header>

        {/* Tab Selector */}
        <div className="flex border border-[#171717]/15 bg-[#FAF8F3] p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setLoginMode('password');
              setLoginError('');
            }}
            className={`flex-1 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
              loginMode === 'password' ? 'bg-[#171717] text-white' : 'text-[#171717]/60 hover:text-[#171717]'
            }`}
          >
            Password Access
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('otp');
              setLoginError('');
            }}
            className={`flex-1 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
              loginMode === 'otp' ? 'bg-[#171717] text-white' : 'text-[#171717]/60 hover:text-[#171717]'
            }`}
          >
            Email OTP Verification
          </button>
        </div>

        {loginError && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {loginError}
          </p>
        )}

        {loginMode === 'password' ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-login-email" className="block text-xs font-semibold text-[#0C1612]">
                Admin Email Address
              </label>
              <input
                id="admin-login-email"
                type="email"
                required
                autoComplete="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                className="mt-1 w-full rounded-md border border-[#0C1612]/15 bg-[#FAF9F6] px-3 py-2 text-xs focus:border-[#0C1612] focus:outline-none"
                placeholder="admin@flavourandfragrances.com"
              />
            </div>

            <div>
              <label htmlFor="admin-login-password" className="block text-xs font-semibold text-[#0C1612]">
                Admin Password
              </label>
              <input
                id="admin-login-password"
                type="password"
                required
                autoComplete="current-password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                className="mt-1 w-full rounded-md border border-[#0C1612]/15 bg-[#FAF9F6] px-3 py-2 text-xs focus:border-[#0C1612] focus:outline-none"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loginPending}
              className="w-full cursor-pointer rounded-full bg-[#0C1612] py-2.5 text-xs font-semibold text-[#FAF9F6] transition-colors hover:bg-[#9A7738] disabled:opacity-60"
            >
              {loginPending ? 'Authenticating…' : 'Sign In as Administrator'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-otp-email" className="block text-xs font-semibold text-[#0C1612]">
                Admin Email Address
              </label>
              <input
                id="admin-otp-email"
                type="email"
                required
                autoComplete="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                readOnly={otpRequested}
                className="mt-1 w-full rounded-md border border-[#0C1612]/15 bg-[#FAF9F6] px-3 py-2 text-xs focus:border-[#0C1612] focus:outline-none"
                placeholder="admin@flavourandfragrances.com"
              />
            </div>

            {otpRequested && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setOtpRequested(false);
                    setVerificationCode('');
                    setLoginError('');
                  }}
                  className="mb-2 text-xs text-[#9A7738] hover:underline"
                >
                  Use a different email
                </button>
                <div>
                  <label htmlFor="admin-otp-code" className="block text-xs font-semibold text-[#0C1612]">
                    Six-digit verification code
                  </label>
                  <input
                    id="admin-otp-code"
                    type="text"
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="mt-1 w-full rounded-md border border-[#0C1612]/15 bg-[#FAF9F6] px-3 py-2 text-sm font-normal tracking-[0.3em] focus:border-[#0C1612] focus:outline-none"
                    placeholder="123456"
                  />
                </div>
                <p className="mt-2 text-xs text-[#0F1E19]/60">The code expires in 10 minutes.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loginPending}
              className="w-full cursor-pointer rounded-full bg-[#0C1612] py-2.5 text-xs font-semibold text-[#FAF9F6] transition-colors hover:bg-[#9A7738] disabled:opacity-60"
            >
              {getOtpButtonLabel(loginPending, otpRequested)}
            </button>
          </form>
        )}

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-xs text-gray-500"><span className="bg-white px-2">OR SINGLE SIGN-ON</span></div>
        </div>

        <button
          type="button"
          onClick={() => signIn('google', { redirectTo: '/admin' })}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded border border-[#0F2922]/20 bg-[#FAF9F6] py-2.5 text-xs font-semibold text-[#0F2922] transition-colors hover:bg-[#0F2922]/5"
        >
          <Shield className="h-4 w-4 text-[#C5A059]" />
          <span>Sign In with Authorized Google SSO</span>
        </button>

        <div className="border-t border-gray-100 pt-4 text-center text-xs text-[#0F1E19]/60">
          <Link href="/" className="text-[#0F2922] hover:underline">← Return to Public Website</Link>
        </div>
      </section>
    </div>
  );
};

export function AdminDashboard() {
  const {
    isAdminAuthenticated,
    currentAdmin,
    logoutAdmin,
    switchDemoRole,
    products,
    categories,
    industries,
    inquiries,
    sampleRequests,
    contactMessages,
    blogPosts,
    media,
    certificates,
    pages,
    settings,
    admins,
    saveProduct,
    deleteProduct,
    duplicateProduct,
    saveCategory,
    deleteCategory,
    saveIndustry,
    deleteIndustry,
    updateInquiryStatus,
    deleteInquiry,
    updateSampleStatus,
    deleteSampleRequest,
    updateContactStatus,
    deleteContactMessage,
    saveBlogPost,
    deleteBlogPost,
    uploadMediaFile,
    deleteMediaFile,
    saveCertificate,
    deleteCertificate,
    savePageContent,
    saveSiteSettings,
    syncSeedToCloud,
    addToast,
    navigate,
  } = useStore();

  // Navigation tab in Admin
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'orders'
    | 'inventory'
    | 'products'
    | 'categories'
    | 'coupons'
    | 'reviews'
    | 'industries'
    | 'inquiries'
    | 'samples'
    | 'contacts'
    | 'blog'
    | 'media'
    | 'pages'
    | 'certificates'
    | 'users'
    | 'settings'
  >('dashboard');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Products filtering & pagination
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('All');
  const [productStatusFilter, setProductStatusFilter] = useState('All');
  const [productPage, setProductPage] = useState(1);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Modals for Categories, Industries, Blog, and Certificates
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [industryModalOpen, setIndustryModalOpen] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);

  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);

  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);

  const [viewingInquiry, setViewingInquiry] = useState<Inquiry | null>(null);
  const [inquiryNotes, setInquiryNotes] = useState('');

  const [selectedPageKey, setSelectedPageKey] = useState<string>('home');
  const [pageFormData, setPageFormData] = useState<PageContent>(pages.home);

  const [settingsFormData, setSettingsFormData] = useState<SiteSetting>(settings);

  // Synchronize Page Editor state when selection changes
  const handleSelectPage = (key: string) => {
    setSelectedPageKey(key);
    if (pages[key]) {
      setPageFormData(pages[key]);
    }
  };

  // Role permissions:
  // Super Admin: full access
  // Admin: can manage products, inquiries, pages, and blog
  // Editor: can manage website content and blog only
  const userRole = currentAdmin?.role || 'Super Admin';
  const canEditProducts = userRole === 'Super Admin' || userRole === 'Admin';
  const canEditSettings = userRole === 'Super Admin';

  if (!isAdminAuthenticated) return <AdminLoginForm />;

  // Filtered Products for Admin Table
  const filteredProducts = products.filter((p) => {
    if (productCatFilter !== 'All' && p.category !== productCatFilter) return false;
    if (productStatusFilter !== 'All' && p.status !== productStatusFilter) return false;
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const productsPerPage = 8;
  const totalProductPages = Math.ceil(filteredProducts.length / productsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (productPage - 1) * productsPerPage,
    productPage * productsPerPage
  );

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#171717] text-[#FAF8F3] flex-shrink-0 flex flex-col justify-between border-r border-white/10">
        <div>
          {/* Brand & Mobile Toggle */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="font-serif text-2xl font-light tracking-tight text-white">
                Flavour &amp; Fragrances
              </div>
              <div className="text-[9px] font-mono tracking-widest uppercase text-[#B89555]">
                Enterprise Atelier Suite
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-1"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav
            className={`p-3 space-y-1 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-white/15 text-white font-semibold border-l-2 border-[#B89555]'
                  : 'text-[#FAF8F3]/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#B89555]" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('orders');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'orders'
                  ? 'bg-white/15 text-white font-semibold border-l-2 border-[#B89555]'
                  : 'text-[#FAF8F3]/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-[#B89555]" />
              <span>Orders &amp; Dispatch</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('inventory');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'inventory'
                  ? 'bg-white/15 text-white font-semibold border-l-2 border-[#B89555]'
                  : 'text-[#FAF8F3]/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Boxes className="w-4 h-4 text-[#B89555]" />
              <span>Stock Inventory</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('products');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'products'
                  ? 'bg-white/15 text-white font-semibold border-l-2 border-[#B89555]'
                  : 'text-[#FAF8F3]/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-[#B89555]" />
                <span>Formulations</span>
              </div>
              <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded">
                {products.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('categories');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'categories'
                  ? 'bg-white/15 text-white font-semibold border-l-2 border-[#B89555]'
                  : 'text-[#FAF8F3]/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-[#B89555]" />
              <span>Categories ({categories.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('coupons');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'coupons'
                  ? 'bg-white/15 text-white font-semibold border-l-2 border-[#B89555]'
                  : 'text-[#FAF8F3]/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Tag className="w-4 h-4 text-[#B89555]" />
              <span>Coupons &amp; Perks</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('reviews');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'reviews'
                  ? 'bg-white/15 text-white font-semibold border-l-2 border-[#B89555]'
                  : 'text-[#FAF8F3]/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Star className="w-4 h-4 text-[#B89555]" />
              <span>Reviews Moderation</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('industries');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'industries'
                  ? 'bg-white/15 text-white font-semibold border-l-2 border-[#B89555]'
                  : 'text-[#FAF8F3]/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#B89555]" />
              <span>Industries ({industries.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('inquiries');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'inquiries'
                  ? 'bg-white/15 text-white font-semibold border-l-2 border-[#B89555]'
                  : 'text-[#FAF8F3]/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Inbox className="w-4 h-4 text-[#B89555]" />
                <span>Inquiries &amp; Orders</span>
              </div>
              <span className="text-[10px] font-mono bg-[#B89555] text-white px-1.5 py-0.5 rounded font-semibold">
                {inquiries.filter((i) => i.status === 'New').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('samples');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'samples'
                  ? 'bg-white/15 text-white font-semibold border-l-2 border-[#B89555]'
                  : 'text-[#FAF8F3]/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <FlaskConical className="w-4 h-4 text-[#B89555]" />
                <span>Sample Requests</span>
              </div>
              <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded">
                {sampleRequests.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('contacts');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'contacts'
                  ? 'bg-white/15 text-white font-semibold border-l-2 border-[#B89555]'
                  : 'text-[#FAF8F3]/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[#B89555]" />
              <span>Contact Messages ({contactMessages.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('blog');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'blog'
                  ? 'bg-white/15 text-white font-semibold border-l-2 border-[#B89555]'
                  : 'text-[#FAF8F3]/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#B89555]" />
              <span>Blog / Articles ({blogPosts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('media');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'media'
                  ? 'bg-white/15 text-white font-semibold border-l-2 border-[#B89555]'
                  : 'text-[#FAF8F3]/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-[#B89555]" />
              <span>Media Library ({media.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('pages');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'pages'
                  ? 'bg-white/15 text-white font-semibold border-l-2 border-[#B89555]'
                  : 'text-[#FAF8F3]/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-[#B89555]" />
              <span>Page CMS</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('certificates');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'certificates'
                  ? 'bg-white/15 text-white font-semibold border-l-2 border-[#B89555]'
                  : 'text-[#FAF8F3]/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4 text-[#B89555]" />
              <span>Certificates ({certificates.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('users');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'users'
                  ? 'bg-white/15 text-white font-semibold border-l-2 border-[#B89555]'
                  : 'text-[#FAF8F3]/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-[#B89555]" />
              <span>Admin Users ({admins.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('settings');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'settings'
                  ? 'bg-white/15 text-white font-semibold border-l-2 border-[#B89555]'
                  : 'text-[#FAF8F3]/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 text-[#B89555]" />
              <span>Global Settings</span>
            </button>
          </nav>
        </div>

        {/* User Info & Session Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-white truncate max-w-[140px]">
                {currentAdmin?.name || 'Administrator'}
              </div>
              <div className="font-mono text-[9px] uppercase tracking-wider text-[#B89555]">{currentAdmin?.role}</div>
            </div>
            <button
              type="button"
              onClick={logoutAdmin}
              title="Sign Out"
              className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Quick RBAC Switcher for testing */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/60">
            <span>Role Switch:</span>
            <div className="flex gap-1">
              {(['Super Admin', 'Admin', 'Editor'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => switchDemoRole(r)}
                  className={`px-1.5 py-0.5 rounded ${
                    currentAdmin?.role === r
                      ? 'bg-[#C5A059] text-[#0F2922] font-semibold'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {r[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar with quick links & Cloud Sync */}
        <div className="h-14 border-b border-[#0F2922]/10 bg-white px-6 flex items-center justify-between">
          <div className="text-xs text-[#0F1E19]/70 capitalize font-medium flex items-center gap-2">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#0F2922] font-semibold">{activeTab}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={syncSeedToCloud}
              className="px-3 py-1.5 text-xs font-medium text-[#0F2922] border border-[#0F2922]/20 rounded hover:bg-[#FAF9F6] transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Sync Cloud DB</span>
            </button>
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded bg-[#0F2922] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#16382E]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Live Website</span>
            </Link>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* TAB 1: EXECUTIVE DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <AdminDashboardOverview onNavigateTab={setActiveTab} />
          )}

          {/* TAB: ORDERS & FULFILLMENT */}
          {activeTab === 'orders' && (
            <AdminOrdersTab />
          )}

          {/* TAB: STOCK INVENTORY */}
          {activeTab === 'inventory' && (
            <AdminInventoryTab />
          )}

          {/* TAB: COUPONS & PERKS */}
          {activeTab === 'coupons' && (
            <AdminCouponsTab />
          )}

          {/* TAB: REVIEWS MODERATION */}
          {activeTab === 'reviews' && (
            <AdminReviewsTab />
          )}

          {/* TAB 2: PRODUCTS TABLE & CRUD */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#0F2922]">
                    Product Catalogue Management
                  </h2>
                  <p className="text-xs text-gray-500">
                    Add, edit, duplicate, or archive flavour and fragrance formulations.
                  </p>
                </div>
                {canEditProducts && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setProductModalOpen(true);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#0F2922] hover:bg-[#16382E] rounded transition-colors flex items-center gap-1.5 self-start md:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Formulation</span>
                  </button>
                )}
              </div>

              {/* Filters & Search */}
              <div className="p-4 bg-white border border-[#0F2922]/10 rounded-lg flex flex-wrap gap-4 items-center justify-between">
                <div className="flex-1 min-w-[240px] relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setProductPage(1);
                    }}
                    placeholder="Search by name or SKU..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <select
                    value={productCatFilter}
                    onChange={(e) => {
                      setProductCatFilter(e.target.value);
                      setProductPage(1);
                    }}
                    className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={productStatusFilter}
                    onChange={(e) => {
                      setProductStatusFilter(e.target.value);
                      setProductPage(1);
                    }}
                    className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white border border-[#0F2922]/10 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF9F6] border-b border-gray-100 text-[#0F2922]">
                      <tr>
                        <th className="py-3 px-4">Image</th>
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-4">SKU</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Featured</th>
                        <th className="py-3 px-4">Created</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-2.5 px-4">
                            <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 border border-gray-200">
                              <SafeImage src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-[#0F2922] max-w-[200px] truncate">
                            {p.name}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-gray-600">{p.sku}</td>
                          <td className="py-2.5 px-4 text-gray-600">{p.category}</td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getProductStatusBadgeClass(p.status)}`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            {p.featured ? (
                              <span className="text-[#C5A059] font-semibold">Yes</span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-gray-500">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                title="View on site"
                                onClick={() => navigate({ page: 'product-detail', slug: p.slug })}
                                className="p-1 text-gray-500 hover:text-[#0F2922]"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {canEditProducts && (
                                <>
                                  <button
                                    type="button"
                                    title="Edit"
                                    onClick={() => {
                                      setEditingProduct(p);
                                      setProductModalOpen(true);
                                    }}
                                    className="p-1 text-gray-500 hover:text-blue-600"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    title="Duplicate"
                                    onClick={() => duplicateProduct(p)}
                                    className="p-1 text-gray-500 hover:text-emerald-600"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    title="Delete"
                                    onClick={() => {
                                      if (confirm(`Delete formulation ${p.name}?`)) {
                                        deleteProduct(p.id);
                                      }
                                    }}
                                    className="p-1 text-gray-500 hover:text-red-600"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="p-3 bg-[#FAF9F6] border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div>
                    Page {productPage} of {totalProductPages} ({filteredProducts.length} items)
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={productPage === 1}
                      onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                      className="px-2 py-1 border border-gray-200 rounded disabled:opacity-40"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={productPage >= totalProductPages}
                      onClick={() => setProductPage((p) => Math.min(totalProductPages, p + 1))}
                      className="px-2 py-1 border border-gray-200 rounded disabled:opacity-40"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#0F2922]">
                    Category Management
                  </h2>
                  <p className="text-xs text-gray-500">
                    Organize flavours and fragrances into top-level and sub-level taxonomies.
                  </p>
                </div>
                {canEditProducts && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryModalOpen(true);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#0F2922] rounded flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Category</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((c) => (
                  <div key={c.id} className="p-5 bg-white border border-[#0F2922]/10 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-[#C5A059] uppercase tracking-wider">
                        {c.parentGroup}
                      </span>
                      <span className="text-xs font-mono text-gray-400">Order: {c.displayOrder}</span>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-[#0F2922]">{c.name}</h3>
                    <p className="text-xs text-gray-600 line-clamp-3">{c.description}</p>
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          c.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {c.active ? 'Active' : 'Disabled'}
                      </span>
                      {canEditProducts && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategory(c);
                              setCategoryModalOpen(true);
                            }}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete ${c.name}?`)) deleteCategory(c.id);
                            }}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: INDUSTRIES */}
          {activeTab === 'industries' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#0F2922]">
                    Industry Sector Management
                  </h2>
                  <p className="text-xs text-gray-500">
                    Control market segment landing pages and application cross-references.
                  </p>
                </div>
                {canEditProducts && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingIndustry(null);
                      setIndustryModalOpen(true);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#0F2922] rounded flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Industry</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {industries.map((ind) => (
                  <div key={ind.id} className="p-6 bg-white border border-[#0F2922]/10 rounded-lg space-y-3">
                    <h3 className="font-display text-2xl font-semibold text-[#0F2922]">{ind.name}</h3>
                    <p className="text-xs text-gray-700 leading-relaxed">{ind.description}</p>
                    <div className="text-xs text-gray-500">
                      <strong>Applications:</strong> {ind.applications}
                    </div>
                    <div className="pt-3 border-t border-gray-100 flex justify-end gap-2 text-xs">
                      {canEditProducts && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingIndustry(ind);
                              setIndustryModalOpen(true);
                            }}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete ${ind.name}?`)) deleteIndustry(ind.id);
                            }}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: QUOTE INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#0F2922]">
                  Inquiries & Orders
                </h2>
                <p className="text-xs text-gray-500">
                  Manage B2B commercial requests, volume targets, and client correspondence.
                </p>
              </div>

              <div className="bg-white border border-[#0F2922]/10 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F6] border-b border-gray-100 text-[#0F2922]">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Product / Application</th>
                      <th className="py-3 px-4">Volume</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-gray-50/80">
                        <td className="py-3 px-4 font-mono text-gray-500">
                          {new Date(inq.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#0F2922]">{inq.name}</div>
                          <div className="text-[10px] text-gray-500">{inq.email}</div>
                        </td>
                        <td className="py-3 px-4 font-medium">{inq.company} ({inq.country})</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#0F2922]">{inq.productName}</div>
                          <div className="text-[10px] text-gray-500 truncate max-w-[200px]">
                            {inq.inquiryType || 'Quote inquiry'} · {inq.application}
                          </div>
                          {formatInquiryItems(inq.cartItemsJson) && (
                            <div className="mt-1 max-w-[240px] truncate text-[10px] text-emerald-800">
                              {formatInquiryItems(inq.cartItemsJson)}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono">{inq.quantity}</td>
                        <td className="py-3 px-4">
                          <select
                            value={inq.status}
                            onChange={(e) => {
                              void updateInquiryStatus(inq.id, e.target.value as Inquiry['status'])
                                .catch((error: unknown) => {
                                  console.error('Unable to update inquiry status:', error);
                                  addToast('Inquiry Update Failed', 'The inquiry status could not be saved.', 'error');
                                });
                            }}
                            className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setViewingInquiry(inq);
                                setInquiryNotes(inq.internalNotes || '');
                              }}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Detail
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Delete inquiry?')) {
                                  void deleteInquiry(inq.id).catch((error: unknown) => {
                                    console.error('Unable to delete inquiry:', error);
                                    addToast('Inquiry Delete Failed', 'The inquiry could not be deleted.', 'error');
                                  });
                                }
                              }}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: SAMPLE REQUESTS */}
          {activeTab === 'samples' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#0F2922]">
                  Laboratory Sample Requests
                </h2>
                <p className="text-xs text-gray-500">
                  Track 72-hour R&D sample requests and shipping destinations.
                </p>
              </div>

              <div className="bg-white border border-[#0F2922]/10 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F6] border-b border-gray-100 text-[#0F2922]">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Scientist</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Formulation</th>
                      <th className="py-3 px-4">Address</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sampleRequests.map((smp) => (
                      <tr key={smp.id} className="hover:bg-gray-50/80">
                        <td className="py-3 px-4 font-mono text-gray-500">
                          {new Date(smp.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#0F2922]">{smp.name}</div>
                          <div className="text-[10px] text-gray-500">{smp.email}</div>
                        </td>
                        <td className="py-3 px-4">{smp.company}</td>
                        <td className="py-3 px-4 font-semibold text-[#0F2922]">{smp.productName}</td>
                        <td className="py-3 px-4 text-gray-600 truncate max-w-[200px]">
                          {smp.shippingAddress}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={smp.status}
                            onChange={(e) =>
                              updateSampleStatus(smp.id, e.target.value as SampleRequest['status'])
                            }
                            className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                          >
                            <option value="New">New</option>
                            <option value="Approved">Approved</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Delete sample request?')) deleteSampleRequest(smp.id);
                            }}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: CONTACT MESSAGES */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#0F2922]">
                  Corporate Contact Messages
                </h2>
                <p className="text-xs text-gray-500">
                  Inbound correspondence submitted through public contact forms.
                </p>
              </div>

              <div className="bg-white border border-[#0F2922]/10 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F6] border-b border-gray-100 text-[#0F2922]">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Sender</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Message</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {contactMessages.map((msg) => (
                      <tr key={msg.id} className="hover:bg-gray-50/80">
                        <td className="py-3 px-4 font-mono text-gray-500">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#0F2922]">{msg.name}</div>
                          <div className="text-[10px] text-gray-500">
                            {msg.company} ({msg.country})
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">{msg.subject}</td>
                        <td className="py-3 px-4 text-gray-600 truncate max-w-[260px]">
                          {msg.message}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={msg.status}
                            onChange={(e) =>
                              updateContactStatus(msg.id, e.target.value as ContactMessage['status'])
                            }
                            className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                          >
                            <option value="New">New</option>
                            <option value="Read">Read</option>
                            <option value="Archived">Archived</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Delete contact message?')) deleteContactMessage(msg.id);
                            }}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: BLOG CMS */}
          {activeTab === 'blog' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#0F2922]">
                    Technical Journal CMS
                  </h2>
                  <p className="text-xs text-gray-500">
                    Publish research articles, compliance bulletins, and technical whitepapers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBlogPost(null);
                    setBlogModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0F2922] rounded flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Article</span>
                </button>
              </div>

              <div className="bg-white border border-[#0F2922]/10 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F6] border-b border-gray-100 text-[#0F2922]">
                    <tr>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {blogPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50/80">
                        <td className="py-3 px-4 font-semibold text-[#0F2922] max-w-[280px] truncate">
                          {post.title}
                        </td>
                        <td className="py-3 px-4">{post.category}</td>
                        <td className="py-3 px-4 text-gray-600">{post.authorName}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              post.published
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBlogPost(post);
                                setBlogModalOpen(true);
                              }}
                              className="text-blue-600 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete ${post.title}?`)) deleteBlogPost(post.id);
                              }}
                              className="text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: MEDIA LIBRARY */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#0F2922]">
                    Media & Document Assets
                  </h2>
                  <p className="text-xs text-gray-500">
                    Upload product imagery, safety dossiers, and technical datasheets.
                  </p>
                </div>
                <label htmlFor="admin-media-file-input" className="px-4 py-2 text-xs font-semibold text-white bg-[#0F2922] rounded flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Upload Asset</span>
                  <input
                    id="admin-media-file-input"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          uploadMediaFile({
                            fileName: file.name,
                            fileType: file.type.includes('pdf') ? 'pdf' : 'image',
                            category: 'Uploads',
                            url: reader.result as string,
                            sizeKb: Math.round(file.size / 1024),
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {media.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border border-[#0F2922]/10 rounded-lg space-y-2 flex flex-col justify-between"
                  >
                    <div className="aspect-square bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                      {item.fileType === 'pdf' ? (
                        <FileText className="w-10 h-10 text-gray-400" />
                      ) : (
                        <SafeImage src={item.url} alt={item.fileName} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#0F2922] truncate" title={item.fileName}>
                        {item.fileName}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">{item.sizeKb} KB</div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(item.url);
                          addToast('URL Copied', 'Asset address copied to clipboard.');
                        }}
                        className="text-[10px] text-blue-600 hover:underline"
                      >
                        Copy URL
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete ${item.fileName}?`)) deleteMediaFile(item.id);
                        }}
                        className="text-[10px] text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: CMS PAGE MANAGEMENT */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#0F2922]">
                  CMS Corporate Page Content
                </h2>
                <p className="text-xs text-gray-500">
                  Update website page headings, body copy, and section visibility without code changes.
                </p>
              </div>

              <div className="flex gap-2 border-b border-gray-200 pb-3">
                {['home', 'about', 'rd', 'quality', 'contact'].map((pageKey) => (
                  <button
                    key={pageKey}
                    type="button"
                    onClick={() => handleSelectPage(pageKey)}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded ${
                      selectedPageKey === pageKey
                        ? 'bg-[#0F2922] text-white'
                        : 'bg-white border text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageKey}
                  </button>
                ))}
              </div>

              {pageFormData && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await savePageContent(pageFormData);
                  }}
                  className="p-6 bg-white border border-[#0F2922]/10 rounded-lg space-y-6 max-w-4xl"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="page-title-input" className="block text-xs font-semibold text-[#0F2922] mb-1">
                        Page Title (SEO)
                      </label>
                      <input
                        id="page-title-input"
                        type="text"
                        value={pageFormData.title}
                        onChange={(e) =>
                          setPageFormData({ ...pageFormData, title: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm bg-gray-50 border rounded"
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-[#0F2922] mb-1">
                        Section Visibility
                      </span>
                      <label htmlFor="page-visibility-checkbox" className="flex items-center gap-2 text-xs pt-2 cursor-pointer">
                        <input
                          id="page-visibility-checkbox"
                          type="checkbox"
                          checked={pageFormData.visible}
                          onChange={(e) =>
                            setPageFormData({ ...pageFormData, visible: e.target.checked })
                          }
                        />
                        <span>Page is published and active in navigation</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="page-hero-heading-input" className="block text-xs font-semibold text-[#0F2922] mb-1">
                      Hero Section Headline
                    </label>
                    <input
                      id="page-hero-heading-input"
                      type="text"
                      value={pageFormData.heroHeading}
                      onChange={(e) =>
                        setPageFormData({ ...pageFormData, heroHeading: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-gray-50 border rounded"
                    />
                  </div>

                  <div>
                    <label htmlFor="page-hero-subheading-input" className="block text-xs font-semibold text-[#0F2922] mb-1">
                      Hero Section Subheading
                    </label>
                    <textarea
                      id="page-hero-subheading-input"
                      rows={2}
                      value={pageFormData.heroSubheading}
                      onChange={(e) =>
                        setPageFormData({ ...pageFormData, heroSubheading: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-gray-50 border rounded"
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded space-y-4 border">
                    <h4 className="text-xs font-semibold uppercase text-gray-500">
                      Editorial Block 1
                    </h4>
                    <div>
                      <label htmlFor="page-section-one-title-input" className="block text-xs font-semibold text-[#0F2922] mb-1">
                        Title
                      </label>
                      <input
                        id="page-section-one-title-input"
                        type="text"
                        value={pageFormData.sectionOneTitle}
                        onChange={(e) =>
                          setPageFormData({ ...pageFormData, sectionOneTitle: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm bg-white border rounded"
                      />
                    </div>
                    <div>
                      <label htmlFor="page-section-one-body-input" className="block text-xs font-semibold text-[#0F2922] mb-1">
                        Body Content
                      </label>
                      <textarea
                        id="page-section-one-body-input"
                        rows={3}
                        value={pageFormData.sectionOneBody}
                        onChange={(e) =>
                          setPageFormData({ ...pageFormData, sectionOneBody: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm bg-white border rounded"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded space-y-4 border">
                    <h4 className="text-xs font-semibold uppercase text-gray-500">
                      Editorial Block 2
                    </h4>
                    <div>
                      <label htmlFor="page-section-two-title-input" className="block text-xs font-semibold text-[#0F2922] mb-1">
                        Title
                      </label>
                      <input
                        id="page-section-two-title-input"
                        type="text"
                        value={pageFormData.sectionTwoTitle}
                        onChange={(e) =>
                          setPageFormData({ ...pageFormData, sectionTwoTitle: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm bg-white border rounded"
                      />
                    </div>
                    <div>
                      <label htmlFor="page-section-two-body-input" className="block text-xs font-semibold text-[#0F2922] mb-1">
                        Body Content
                      </label>
                      <textarea
                        id="page-section-two-body-input"
                        rows={3}
                        value={pageFormData.sectionTwoBody}
                        onChange={(e) =>
                          setPageFormData({ ...pageFormData, sectionTwoBody: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm bg-white border rounded"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-semibold text-white bg-[#0F2922] hover:bg-[#16382E] rounded transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Publish Changes to {selectedPageKey} Page</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 11: CERTIFICATES */}
          {activeTab === 'certificates' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#0F2922]">
                    ISO & Quality Certificates
                  </h2>
                  <p className="text-xs text-gray-500">
                    Uploaded certificates appear on the public Quality page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCert(null);
                    setCertModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0F2922] rounded flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Certificate</span>
                </button>
              </div>

              <div className="bg-white border border-[#0F2922]/10 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F6] border-b border-gray-100 text-[#0F2922]">
                    <tr>
                      <th className="py-3 px-4">Certificate Name</th>
                      <th className="py-3 px-4">Number</th>
                      <th className="py-3 px-4">Issuing Body</th>
                      <th className="py-3 px-4">Expiry Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {certificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-gray-50/80">
                        <td className="py-3 px-4 font-semibold text-[#0F2922]">{cert.name}</td>
                        <td className="py-3 px-4 font-mono">{cert.certificateNumber}</td>
                        <td className="py-3 px-4 text-gray-600">{cert.issuingBody}</td>
                        <td className="py-3 px-4 font-mono">{cert.expiryDate}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              cert.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {cert.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCert(cert);
                                setCertModalOpen(true);
                              }}
                              className="text-blue-600 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete ${cert.name}?`)) deleteCertificate(cert.id);
                              }}
                              className="text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 12: USERS & RBAC */}
          {activeTab === 'users' && (
            <AdminUsersTab currentRole={userRole} />
          )}

          {/* TAB 13: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#0F2922]">
                  Global Organization & SMTP Settings
                </h2>
                <p className="text-xs text-gray-500">
                  Manage company contact points, social links, SMTP server parameters, and analytics.
                </p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!canEditSettings) {
                    addToast('Permission Denied', 'Only Super Admin can modify global settings.', 'error');
                    return;
                  }
                  await saveSiteSettings(settingsFormData);
                }}
                className="p-8 bg-white border border-[#0F2922]/10 rounded-lg space-y-6 max-w-4xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="settings-company-name-input" className="block text-xs font-semibold text-[#0F2922] mb-1">
                      Company Legal Name
                    </label>
                    <input
                      id="settings-company-name-input"
                      type="text"
                      value={settingsFormData.companyName}
                      onChange={(e) =>
                        setSettingsFormData({ ...settingsFormData, companyName: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-gray-50 border rounded"
                    />
                  </div>

                  <div>
                    <label htmlFor="settings-logo-text-input" className="block text-xs font-semibold text-[#0F2922] mb-1">
                      Logo Text / Wordmark
                    </label>
                    <input
                      id="settings-logo-text-input"
                      type="text"
                      value={settingsFormData.logoText}
                      onChange={(e) =>
                        setSettingsFormData({ ...settingsFormData, logoText: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-gray-50 border rounded"
                    />
                  </div>

                  <div>
                    <label htmlFor="settings-email-input" className="block text-xs font-semibold text-[#0F2922] mb-1">
                      Official Email
                    </label>
                    <input
                      id="settings-email-input"
                      type="email"
                      value={settingsFormData.email}
                      onChange={(e) =>
                        setSettingsFormData({ ...settingsFormData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-gray-50 border rounded"
                    />
                  </div>

                  <div>
                    <label htmlFor="settings-phone-input" className="block text-xs font-semibold text-[#0F2922] mb-1">
                      Phone Number
                    </label>
                    <input
                      id="settings-phone-input"
                      type="text"
                      value={settingsFormData.phone}
                      onChange={(e) =>
                        setSettingsFormData({ ...settingsFormData, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-gray-50 border rounded"
                    />
                  </div>

                  <div>
                    <label htmlFor="settings-whatsapp-input" className="block text-xs font-semibold text-[#0F2922] mb-1">
                      WhatsApp Business
                    </label>
                    <input
                      id="settings-whatsapp-input"
                      type="text"
                      value={settingsFormData.whatsapp}
                      onChange={(e) =>
                        setSettingsFormData({ ...settingsFormData, whatsapp: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-gray-50 border rounded"
                    />
                  </div>

                  <div>
                    <label htmlFor="settings-analytics-id-input" className="block text-xs font-semibold text-[#0F2922] mb-1">
                      Analytics Tracking ID
                    </label>
                    <input
                      id="settings-analytics-id-input"
                      type="text"
                      value={settingsFormData.analyticsId}
                      onChange={(e) =>
                        setSettingsFormData({ ...settingsFormData, analyticsId: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-gray-50 border rounded"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="settings-address-input" className="block text-xs font-semibold text-[#0F2922] mb-1">
                    Headquarters Address
                  </label>
                  <input
                    id="settings-address-input"
                    type="text"
                    value={settingsFormData.address}
                    onChange={(e) =>
                      setSettingsFormData({ ...settingsFormData, address: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-gray-50 border rounded"
                  />
                </div>

                <div className="p-4 bg-gray-50 rounded border space-y-4">
                  <h4 className="text-xs font-semibold uppercase text-gray-500">
                    SMTP Mail Server Configuration
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="settings-smtp-host-input" className="block text-xs font-semibold text-[#0F2922] mb-1">
                        SMTP Host
                      </label>
                      <input
                        id="settings-smtp-host-input"
                        type="text"
                        value={settingsFormData.smtpHost}
                        onChange={(e) =>
                          setSettingsFormData({ ...settingsFormData, smtpHost: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm bg-white border rounded"
                      />
                    </div>
                    <div>
                      <label htmlFor="settings-smtp-port-input" className="block text-xs font-semibold text-[#0F2922] mb-1">
                        SMTP Port
                      </label>
                      <input
                        id="settings-smtp-port-input"
                        type="text"
                        value={settingsFormData.smtpPort}
                        onChange={(e) =>
                          setSettingsFormData({ ...settingsFormData, smtpPort: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm bg-white border rounded"
                      />
                    </div>
                  </div>
                </div>

                {canEditSettings && (
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-semibold text-white bg-[#0F2922] hover:bg-[#16382E] rounded transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Global Settings</span>
                  </button>
                )}
              </form>
            </div>
          )}
        </div>
      </main>

      {/* PRODUCT CREATE/EDIT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl p-6 md:p-8 rounded-xl shadow-2xl my-8 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="font-display text-2xl font-semibold text-[#0F2922]">
                {editingProduct ? 'Edit Formulation' : 'Create New Formulation'}
              </h3>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const fd = new FormData(form);

                await saveProduct({
                  id: editingProduct?.id,
                  name: fd.get('name') as string,
                  sku: fd.get('sku') as string,
                  slug: (fd.get('slug') as string) || (fd.get('name') as string),
                  category: fd.get('category') as string,
                  subcategory: (fd.get('subcategory') as string) || 'Standard Formulation',
                  productType: fd.get('productType') as Product['productType'],
                  shortDescription: fd.get('shortDescription') as string,
                  fullDescription: fd.get('fullDescription') as string,
                  applications: fd.get('applications') as string,
                  ingredientsNotes: fd.get('ingredientsNotes') as string,
                  casNumber: fd.get('casNumber') as string,
                  tasteProfile: fd.get('tasteProfile') as string,
                  olfactoryProfile: fd.get('olfactoryProfile') as string,
                  solubility: fd.get('solubility') as string,
                  heatStability: fd.get('heatStability') as string,
                  minimumOrderQuantity: fd.get('minimumOrderQuantity') as string,
                  ifraDocUrl: fd.get('ifraDocUrl') as string,
                  sdsDocUrl: fd.get('sdsDocUrl') as string,
                  imageUrl: (fd.get('imageUrl') as string) || editingProduct?.imageUrl || '',
                  featured: fd.get('featured') === 'on',
                  status: fd.get('status') as Product['status'],
                  views: editingProduct?.views || 0,
                  createdAt: editingProduct?.createdAt,
                });
                setProductModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="product-form-name" className="block font-semibold text-[#0F2922] mb-1">Product Name *</label>
                  <input
                    id="product-form-name"
                    type="text"
                    name="name"
                    required
                    defaultValue={editingProduct?.name || ''}
                    className="w-full px-3 py-2 bg-gray-50 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="product-form-sku" className="block font-semibold text-[#0F2922] mb-1">SKU / Code *</label>
                  <input
                    id="product-form-sku"
                    type="text"
                    name="sku"
                    required
                    defaultValue={editingProduct?.sku || ''}
                    className="w-full px-3 py-2 bg-gray-50 border rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="product-form-category" className="block font-semibold text-[#0F2922] mb-1">Category *</label>
                  <select
                    id="product-form-category"
                    name="category"
                    defaultValue={editingProduct?.category || categories[0]?.name}
                    className="w-full px-3 py-2 bg-gray-50 border rounded"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="product-form-type" className="block font-semibold text-[#0F2922] mb-1">Product Type *</label>
                  <select
                    id="product-form-type"
                    name="productType"
                    defaultValue={editingProduct?.productType || 'Flavour'}
                    className="w-full px-3 py-2 bg-gray-50 border rounded"
                  >
                    <option value="Flavour">Flavour</option>
                    <option value="Fragrance">Fragrance</option>
                    <option value="Essential Oil">Essential Oil</option>
                    <option value="Botanical Extract">Botanical Extract</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="product-form-status" className="block font-semibold text-[#0F2922] mb-1">Status *</label>
                  <select
                    id="product-form-status"
                    name="status"
                    defaultValue={editingProduct?.status || 'Active'}
                    className="w-full px-3 py-2 bg-gray-50 border rounded"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="product-form-short-desc" className="block font-semibold text-[#0F2922] mb-1">
                  Short Description *
                </label>
                <input
                  id="product-form-short-desc"
                  type="text"
                  name="shortDescription"
                  required
                  defaultValue={editingProduct?.shortDescription || ''}
                  className="w-full px-3 py-2 bg-gray-50 border rounded"
                />
              </div>

              <div>
                <label htmlFor="product-form-full-desc" className="block font-semibold text-[#0F2922] mb-1">
                  Full Technical Description *
                </label>
                <textarea
                  id="product-form-full-desc"
                  name="fullDescription"
                  rows={3}
                  required
                  defaultValue={editingProduct?.fullDescription || ''}
                  className="w-full px-3 py-2 bg-gray-50 border rounded"
                />
              </div>

              <div>
                <label htmlFor="product-form-ingredients" className="block font-semibold text-[#0F2922] mb-1">
                  Sensory Notes / Key Ingredients *
                </label>
                <input
                  id="product-form-ingredients"
                  type="text"
                  name="ingredientsNotes"
                  required
                  defaultValue={editingProduct?.ingredientsNotes || ''}
                  className="w-full px-3 py-2 bg-gray-50 border rounded"
                />
              </div>

              <div>
                <label htmlFor="product-form-applications" className="block font-semibold text-[#0F2922] mb-1">
                  Target Applications (comma-separated) *
                </label>
                <input
                  id="product-form-applications"
                  type="text"
                  name="applications"
                  required
                  defaultValue={editingProduct?.applications || ''}
                  className="w-full px-3 py-2 bg-gray-50 border rounded"
                />
              </div>

              <div className="rounded-xl border border-emerald-900/10 bg-emerald-50/40 p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-800">B2B Technical Specifications</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {([
                    ['casNumber', 'CAS Number', editingProduct?.casNumber],
                    ['tasteProfile', 'Taste Profile (Flavours)', editingProduct?.tasteProfile],
                    ['olfactoryProfile', 'Olfactory Profile (Fragrances)', editingProduct?.olfactoryProfile],
                    ['solubility', 'Solubility (oil / water / alcohol)', editingProduct?.solubility],
                    ['heatStability', 'Heat Stability / Process Conditions', editingProduct?.heatStability],
                    ['minimumOrderQuantity', 'Minimum Order Quantity (MOQ)', editingProduct?.minimumOrderQuantity],
                    ['ifraDocUrl', 'IFRA Certificate URL', editingProduct?.ifraDocUrl],
                    ['sdsDocUrl', 'SDS Document URL', editingProduct?.sdsDocUrl],
                  ] as [string, string, string | undefined][]).map(([name, label, value]) => (
                    <div key={name}>
                      <label htmlFor={`spec-${name}`} className="block font-semibold text-[#0F2922]">
                        {label}
                      </label>
                      <input
                        id={`spec-${name}`}
                        type="text"
                        name={name}
                        defaultValue={value}
                        maxLength={name === 'ifraDocUrl' || name === 'sdsDocUrl' ? 1000 : 500}
                        className="mt-1 w-full rounded border bg-white px-3 py-2 font-normal"
                        placeholder={name.endsWith('DocUrl') ? 'Verified document URL only' : 'Leave blank to show “Available on request”'}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="product-form-image-url" className="block font-semibold text-[#0F2922] mb-1">Image URL</label>
                <input
                  id="product-form-image-url"
                  type="text"
                  name="imageUrl"
                  defaultValue={editingProduct?.imageUrl || ''}
                  className="w-full px-3 py-2 bg-gray-50 border rounded font-mono"
                  placeholder="https://... or select from media"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  name="featured"
                  id="featured-check"
                  defaultChecked={editingProduct?.featured || false}
                />
                <label htmlFor="featured-check" className="font-semibold text-[#0F2922]">
                  Mark as Featured Formulation on Homepage
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0F2922] text-white font-semibold rounded"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY CREATE/EDIT MODAL */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="font-display text-xl font-semibold text-[#0F2922]">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const name = (fd.get('name') as string) || '';
                await saveCategory({
                  id: editingCategory?.id,
                  name,
                  slug: (fd.get('slug') as string) || name.toLowerCase().replace(/\s+/g, '-'),
                  parentGroup: (fd.get('parentGroup') as 'Flavours' | 'Fragrances') || 'Flavours',
                  displayOrder: Number(fd.get('displayOrder')) || 0,
                  active: fd.get('active') === 'on',
                  description: (fd.get('description') as string) || '',
                  imageUrl: (fd.get('imageUrl') as string) || '',
                });
                setCategoryModalOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label htmlFor="cat-modal-name" className="block font-semibold text-[#0F2922] mb-1">
                  Category Name *
                </label>
                <input
                  id="cat-modal-name"
                  type="text"
                  name="name"
                  required
                  defaultValue={editingCategory?.name || ''}
                  className="w-full px-3 py-2 bg-gray-50 border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cat-modal-parent" className="block font-semibold text-[#0F2922] mb-1">
                    Taxonomy Group *
                  </label>
                  <select
                    id="cat-modal-parent"
                    name="parentGroup"
                    defaultValue={editingCategory?.parentGroup || 'Flavours'}
                    className="w-full px-3 py-2 bg-gray-50 border rounded"
                  >
                    <option value="Flavours">Flavours</option>
                    <option value="Fragrances">Fragrances</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="cat-modal-order" className="block font-semibold text-[#0F2922] mb-1">
                    Display Order
                  </label>
                  <input
                    id="cat-modal-order"
                    type="number"
                    name="displayOrder"
                    defaultValue={editingCategory?.displayOrder || 0}
                    className="w-full px-3 py-2 bg-gray-50 border rounded"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="cat-modal-desc" className="block font-semibold text-[#0F2922] mb-1">
                  Description
                </label>
                <textarea
                  id="cat-modal-desc"
                  name="description"
                  rows={2}
                  defaultValue={editingCategory?.description || ''}
                  className="w-full px-3 py-2 bg-gray-50 border rounded"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  name="active"
                  id="cat-modal-active"
                  defaultChecked={editingCategory?.active ?? true}
                />
                <label htmlFor="cat-modal-active" className="font-semibold text-[#0F2922]">
                  Category is Active and Publicly Visible
                </label>
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F2922] text-white font-semibold rounded"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INDUSTRY CREATE/EDIT MODAL */}
      {industryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="font-display text-xl font-semibold text-[#0F2922]">
                {editingIndustry ? 'Edit Industry Sector' : 'Add Industry Sector'}
              </h3>
              <button
                type="button"
                onClick={() => setIndustryModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const name = (fd.get('name') as string) || '';
                await saveIndustry({
                  id: editingIndustry?.id,
                  name,
                  slug: (fd.get('slug') as string) || name.toLowerCase().replace(/\s+/g, '-'),
                  description: (fd.get('description') as string) || '',
                  applications: (fd.get('applications') as string) || '',
                  imageUrl: (fd.get('imageUrl') as string) || '',
                  featuredProducts: (fd.get('featuredProducts') as string) || '',
                  ctaText: (fd.get('ctaText') as string) || 'Explore Formulations',
                });
                setIndustryModalOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label htmlFor="ind-modal-name" className="block font-semibold text-[#0F2922] mb-1">
                  Industry Name *
                </label>
                <input
                  id="ind-modal-name"
                  type="text"
                  name="name"
                  required
                  defaultValue={editingIndustry?.name || ''}
                  className="w-full px-3 py-2 bg-gray-50 border rounded"
                />
              </div>
              <div>
                <label htmlFor="ind-modal-desc" className="block font-semibold text-[#0F2922] mb-1">
                  Description *
                </label>
                <textarea
                  id="ind-modal-desc"
                  name="description"
                  rows={2}
                  required
                  defaultValue={editingIndustry?.description || ''}
                  className="w-full px-3 py-2 bg-gray-50 border rounded"
                />
              </div>
              <div>
                <label htmlFor="ind-modal-apps" className="block font-semibold text-[#0F2922] mb-1">
                  Key Target Applications *
                </label>
                <input
                  id="ind-modal-apps"
                  type="text"
                  name="applications"
                  required
                  defaultValue={editingIndustry?.applications || ''}
                  placeholder="e.g. Fine Perfumery, Bakery, Confectionery"
                  className="w-full px-3 py-2 bg-gray-50 border rounded"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIndustryModalOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F2922] text-white font-semibold rounded"
                >
                  Save Industry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BLOG POST CREATE/EDIT MODAL */}
      {blogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="font-display text-xl font-semibold text-[#0F2922]">
                {editingBlogPost ? 'Edit Editorial Article' : 'Create Editorial Article'}
              </h3>
              <button
                type="button"
                onClick={() => setBlogModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const title = (fd.get('title') as string) || '';
                await saveBlogPost({
                  id: editingBlogPost?.id,
                  title,
                  slug: (fd.get('slug') as string) || title.toLowerCase().replace(/\s+/g, '-'),
                  category: (fd.get('category') as string) || 'Formulation Insights',
                  tags: (fd.get('tags') as string) || 'Science, Fragrance',
                  excerpt: (fd.get('excerpt') as string) || '',
                  content: (fd.get('content') as string) || '',
                  featuredImage: (fd.get('featuredImage') as string) || '',
                  seoTitle: title,
                  seoDescription: (fd.get('excerpt') as string) || '',
                  published: fd.get('published') === 'on',
                  authorName: (fd.get('authorName') as string) || 'Master Perfumer & Flavourist',
                });
                setBlogModalOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label htmlFor="blog-modal-title" className="block font-semibold text-[#0F2922] mb-1">
                  Article Title *
                </label>
                <input
                  id="blog-modal-title"
                  type="text"
                  name="title"
                  required
                  defaultValue={editingBlogPost?.title || ''}
                  className="w-full px-3 py-2 bg-gray-50 border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="blog-modal-cat" className="block font-semibold text-[#0F2922] mb-1">
                    Category *
                  </label>
                  <input
                    id="blog-modal-cat"
                    type="text"
                    name="category"
                    required
                    defaultValue={editingBlogPost?.category || 'Formulation Insights'}
                    className="w-full px-3 py-2 bg-gray-50 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="blog-modal-author" className="block font-semibold text-[#0F2922] mb-1">
                    Author
                  </label>
                  <input
                    id="blog-modal-author"
                    type="text"
                    name="authorName"
                    defaultValue={editingBlogPost?.authorName || 'Master Perfumer & Flavourist'}
                    className="w-full px-3 py-2 bg-gray-50 border rounded"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="blog-modal-excerpt" className="block font-semibold text-[#0F2922] mb-1">
                  Summary Excerpt *
                </label>
                <textarea
                  id="blog-modal-excerpt"
                  name="excerpt"
                  rows={2}
                  required
                  defaultValue={editingBlogPost?.excerpt || ''}
                  className="w-full px-3 py-2 bg-gray-50 border rounded"
                />
              </div>
              <div>
                <label htmlFor="blog-modal-content" className="block font-semibold text-[#0F2922] mb-1">
                  Article Body Content *
                </label>
                <textarea
                  id="blog-modal-content"
                  name="content"
                  rows={4}
                  required
                  defaultValue={editingBlogPost?.content || ''}
                  className="w-full px-3 py-2 bg-gray-50 border rounded"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  name="published"
                  id="blog-modal-published"
                  defaultChecked={editingBlogPost?.published ?? true}
                />
                <label htmlFor="blog-modal-published" className="font-semibold text-[#0F2922]">
                  Publish Article Immediately
                </label>
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setBlogModalOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F2922] text-white font-semibold rounded"
                >
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CERTIFICATE CREATE/EDIT MODAL */}
      {certModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="font-display text-xl font-semibold text-[#0F2922]">
                {editingCert ? 'Edit Certification' : 'Upload Certification'}
              </h3>
              <button
                type="button"
                onClick={() => setCertModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                await saveCertificate({
                  id: editingCert?.id,
                  name: (fd.get('name') as string) || '',
                  certificateNumber: (fd.get('certificateNumber') as string) || '',
                  issuingBody: (fd.get('issuingBody') as string) || '',
                  issueDate: (fd.get('issueDate') as string) || '2024-01-01',
                  expiryDate: (fd.get('expiryDate') as string) || '2027-01-01',
                  documentUrl: (fd.get('documentUrl') as string) || '#',
                  status: (fd.get('status') as Certificate['status']) || 'Active',
                });
                setCertModalOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label htmlFor="cert-modal-name" className="block font-semibold text-[#0F2922] mb-1">
                  Certificate Name *
                </label>
                <input
                  id="cert-modal-name"
                  type="text"
                  name="name"
                  required
                  defaultValue={editingCert?.name || ''}
                  className="w-full px-3 py-2 bg-gray-50 border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cert-modal-issuing" className="block font-semibold text-[#0F2922] mb-1">
                    Auditing Body / Issuer *
                  </label>
                  <input
                    id="cert-modal-issuing"
                    type="text"
                    name="issuingBody"
                    required
                    defaultValue={editingCert?.issuingBody || ''}
                    className="w-full px-3 py-2 bg-gray-50 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="cert-modal-num" className="block font-semibold text-[#0F2922] mb-1">
                    Certificate Number *
                  </label>
                  <input
                    id="cert-modal-num"
                    type="text"
                    name="certificateNumber"
                    required
                    defaultValue={editingCert?.certificateNumber || ''}
                    className="w-full px-3 py-2 bg-gray-50 border rounded font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cert-modal-issue" className="block font-semibold text-[#0F2922] mb-1">
                    Issue Date
                  </label>
                  <input
                    id="cert-modal-issue"
                    type="text"
                    name="issueDate"
                    defaultValue={editingCert?.issueDate || '2024-01-01'}
                    className="w-full px-3 py-2 bg-gray-50 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="cert-modal-expiry" className="block font-semibold text-[#0F2922] mb-1">
                    Expiry Date
                  </label>
                  <input
                    id="cert-modal-expiry"
                    type="text"
                    name="expiryDate"
                    defaultValue={editingCert?.expiryDate || '2027-01-01'}
                    className="w-full px-3 py-2 bg-gray-50 border rounded"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setCertModalOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F2922] text-white font-semibold rounded"
                >
                  Save Certification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INQUIRY DETAIL MODAL */}
      {viewingInquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-6 md:p-8 rounded-xl shadow-2xl space-y-5 text-xs">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="font-display text-2xl font-semibold text-[#0F2922]">
                Inquiry Detail #{viewingInquiry.id}
              </h3>
              <button
                type="button"
                onClick={() => setViewingInquiry(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <strong>Client:</strong> {viewingInquiry.name} ({viewingInquiry.company})
              </div>
              <div>
                <strong>Contact:</strong> {viewingInquiry.email} · {viewingInquiry.phone}
              </div>
              <div>
                <strong>Location:</strong> {viewingInquiry.country}
              </div>
              <div>
                <strong>Product Requested:</strong> {viewingInquiry.productName}
              </div>
              {viewingInquiry.inquiryType && (
                <div>
                  <strong>Inquiry Type:</strong> {viewingInquiry.inquiryType}
                </div>
              )}
              {formatInquiryItems(viewingInquiry.cartItemsJson) && (
                <div>
                  <strong>Cart Line Items:</strong> {formatInquiryItems(viewingInquiry.cartItemsJson)}
                </div>
              )}
              {viewingInquiry.estimatedTotal && (
                <div>
                  <strong>Estimated Total:</strong> {viewingInquiry.estimatedTotal}
                </div>
              )}
              <div>
                <strong>Estimated Volume:</strong> {viewingInquiry.quantity}
              </div>
              <div>
                <strong>Target Application:</strong> {viewingInquiry.application}
              </div>
              <div className="p-3 bg-gray-50 border rounded mt-2">
                <strong>Project Brief / Message:</strong>
                <p className="mt-1 text-gray-700 whitespace-pre-line">{viewingInquiry.message}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <label htmlFor="inquiry-internal-notes" className="block font-semibold text-[#0F2922]">
                Internal Technical & Commercial Notes
              </label>
              <textarea
                id="inquiry-internal-notes"
                rows={3}
                value={inquiryNotes}
                onChange={(e) => setInquiryNotes(e.target.value)}
                placeholder="Record assigned chemist, FOB quotation pricing, or follow-up milestones..."
                className="w-full px-3 py-2 bg-gray-50 border rounded text-xs"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <select
                aria-label="Inquiry Status"
                value={viewingInquiry.status}
                onChange={(e) => {
                  updateInquiryStatus(
                    viewingInquiry.id,
                    e.target.value as Inquiry['status'],
                    inquiryNotes
                  );
                  setViewingInquiry({
                    ...viewingInquiry,
                    status: e.target.value as Inquiry['status'],
                  });
                }}
                className="px-3 py-1.5 bg-gray-50 border rounded"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setViewingInquiry(null)}
                  className="px-3 py-1.5 border rounded"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateInquiryStatus(viewingInquiry.id, viewingInquiry.status, inquiryNotes);
                    setViewingInquiry(null);
                  }}
                  className="px-4 py-1.5 bg-[#0F2922] text-white font-semibold rounded"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
