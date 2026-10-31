import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSession, signIn as authSignIn, signOut as authSignOut, useSession } from 'next-auth/react';
import {
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  db,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  Product,
  Category,
  Industry,
  Inquiry,
  SampleRequest,
  ContactMessage,
  BlogPost,
  MediaItem,
  Certificate,
  PageContent,
  SiteSetting,
  AdminUser,
  UserRole,
  EmailLog,
  CartItem,
  PublicRoute,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_INDUSTRIES,
  INITIAL_INQUIRIES,
  INITIAL_SAMPLE_REQUESTS,
  INITIAL_CONTACT_MESSAGES,
  INITIAL_BLOG_POSTS,
  INITIAL_MEDIA,
  INITIAL_CERTIFICATES,
  INITIAL_PAGES,
  INITIAL_SETTINGS,
  INITIAL_ADMINS,
} from '../data/seedData';
import { sanitizeString, toSlug } from '../utils/validation';

interface ToastNotification {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info';
}

interface StoreContextType {
  // Navigation
  route: PublicRoute;
  navigate: (newRoute: PublicRoute) => void;

  // Auth & RBAC
  isAdminAuthenticated: boolean;
  currentAdmin: AdminUser | null;
  authLoading: boolean;
  requestAdminOtp: (email: string) => Promise<{ ok: boolean; error?: string }>;
  verifyAdminOtp: (email: string, code: string) => Promise<{ ok: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;

  // Entities
  products: Product[];
  cartItems: CartItem[];
  cartOpen: boolean;
  addToCart: (product: Product, quantity?: number, selectedVariation?: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  appliedCoupon: {
    code: string;
    discountAmount: number;
    discountType: string;
    discountValue: number;
  } | null;
  applyCoupon: (code: string, subtotal: number) => Promise<{ ok: boolean; error?: string }>;
  removeCoupon: () => void;
  categories: Category[];
  industries: Industry[];
  inquiries: Inquiry[];
  sampleRequests: SampleRequest[];
  contactMessages: ContactMessage[];
  blogPosts: BlogPost[];
  media: MediaItem[];
  certificates: Certificate[];
  pages: Record<string, PageContent>;
  settings: SiteSetting;
  admins: AdminUser[];
  emailLogs: EmailLog[];

  // Toast Notifications
  toasts: ToastNotification[];
  addToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  // CRUD Actions
  saveProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string }) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  duplicateProduct: (product: Product) => Promise<void>;
  incrementProductView: (id: string) => Promise<void>;

  saveCategory: (cat: Omit<Category, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  saveIndustry: (ind: Omit<Industry, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => Promise<void>;
  deleteIndustry: (id: string) => Promise<void>;

  submitInquiry: (data: Omit<Inquiry, 'id' | 'submitterUid' | 'status' | 'createdAt'>) => Promise<void>;
  updateInquiryStatus: (id: string, status: Inquiry['status'], internalNotes?: string) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;

  submitSampleRequest: (data: Omit<SampleRequest, 'id' | 'submitterUid' | 'status' | 'createdAt'>) => Promise<void>;
  updateSampleStatus: (id: string, status: SampleRequest['status']) => Promise<void>;
  deleteSampleRequest: (id: string) => Promise<void>;

  submitContactMessage: (data: Omit<ContactMessage, 'id' | 'submitterUid' | 'status' | 'createdAt'>) => Promise<void>;
  updateContactStatus: (id: string, status: ContactMessage['status']) => Promise<void>;
  deleteContactMessage: (id: string) => Promise<void>;

  saveBlogPost: (post: Omit<BlogPost, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;

  uploadMediaFile: (file: { fileName: string; fileType: MediaItem['fileType']; category: string; url: string; sizeKb: number }) => Promise<MediaItem>;
  deleteMediaFile: (id: string) => Promise<void>;

  saveCertificate: (cert: Omit<Certificate, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => Promise<void>;
  deleteCertificate: (id: string) => Promise<void>;

  savePageContent: (page: PageContent) => Promise<void>;
  saveSiteSettings: (newSettings: SiteSetting) => Promise<void>;

  saveAdminUser: (admin: Omit<AdminUser, 'createdAt'> & { createdAt?: string }) => Promise<void>;
  deleteAdminUser: (uid: string) => Promise<void>;

  syncSeedToCloud: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'ff_luxury_v2_';
const LEGACY_STORAGE_KEY_PREFIX = 'skgroupofcompany_v1_';
const LEGACY_BRAND = 'SK Group of Company';

function loadCached<T>(key: string, fallback: T): T {
  try {
    const storageKey = STORAGE_KEY_PREFIX + key;
    const legacyStorageKey = LEGACY_STORAGE_KEY_PREFIX + key;
    const raw =
      localStorage.getItem(storageKey) ??
      localStorage.getItem(legacyStorageKey);
    if (raw) {
      const updated = raw
        .replace(new RegExp(`${LEGACY_BRAND}Products|${LEGACY_BRAND}|SylvaEssence`, 'g'), 'Flavour & Fragrances')
        .replace(/skgroupofcompany|sylvaessence/gi, 'flavourandfragrances');
      if (updated !== raw || localStorage.getItem(storageKey) === null) {
        try {
          localStorage.setItem(storageKey, updated);
        } catch {
          // ignore
        }
      }
      return JSON.parse(updated) as T;
    }
  } catch {
    // ignore storage errors
  }
  return fallback;
}

function saveCached<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: authSession, status: authSessionStatus } = useSession();
  const [route, setRoute] = useState<PublicRoute>({ page: 'home' });
  const [sessionAdmin, setSessionAdmin] = useState<AdminUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // State initialized with static seed data to guarantee 100% hydration matching between SSR and client
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountType: string;
    discountValue: number;
  } | null>(null);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [industries, setIndustries] = useState<Industry[]>(INITIAL_INDUSTRIES);
  const [inquiries, setInquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);
  const [sampleRequests, setSampleRequests] = useState<SampleRequest[]>(INITIAL_SAMPLE_REQUESTS);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(INITIAL_CONTACT_MESSAGES);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);
  const [media, setMedia] = useState<MediaItem[]>(INITIAL_MEDIA);
  const [certificates, setCertificates] = useState<Certificate[]>(INITIAL_CERTIFICATES);
  const [pages, setPages] = useState<Record<string, PageContent>>(INITIAL_PAGES);
  const [settings, setSettings] = useState<SiteSetting>(INITIAL_SETTINGS);
  const [admins, setAdmins] = useState<AdminUser[]>(INITIAL_ADMINS);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([
    {
      id: 'eml-1',
      to: 'inquiries@example.com',
      subject: '[New Quote Request] Alphonso Mango WONF — AlpenQuell Beverage Group',
      type: 'Quote Notification',
      sentAt: '2026-10-02T11:20:05Z',
      status: 'Dispatched',
    },
    {
      id: 'eml-2',
      to: 'd.vonberg@alpenquell.de',
      subject: 'Flavour & Fragrances — Confirmation of Quote Request #inq-1001',
      type: 'Customer Confirmation',
      sentAt: '2026-10-02T11:20:06Z',
      status: 'Dispatched',
    },
  ]);

  // Hydrate client-side localStorage state after mount without causing SSR mismatch
  useEffect(() => {
    setCartItems(loadCached<CartItem[]>('cart', []));
    setWishlist(loadCached<string[]>('wishlist', []));
    setAppliedCoupon(loadCached('applied_coupon', null));
    setSessionAdmin(loadCached('session_admin', null));
    setHydrated(true);
  }, []);

  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback(
    (title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, description, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      addToast(
        exists ? 'Removed from Wishlist' : 'Saved to Wishlist',
        exists ? 'Item removed from your saved list.' : 'Item saved for later consideration.',
        'info'
      );
      return updated;
    });
  }, [addToast]);

  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const applyCoupon = useCallback(
    async (code: string, subtotal: number) => {
      try {
        const res = await fetch('/api/coupons/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, subtotal }),
        });
        const result = (await res.json()) as { success?: boolean; data?: { code: string; discountAmount: number; discountType: string; discountValue: number }; error?: string };
        if (res.ok && result.success && result.data) {
          setAppliedCoupon(result.data);
          addToast(
            'Coupon Applied',
            `Promo code ${result.data.code} applied: saved $${result.data.discountAmount.toFixed(2)}`,
            'success'
          );
          return { ok: true };
        }
        return { ok: false, error: result.error || 'Invalid promotional code.' };
      } catch {
        return { ok: false, error: 'Could not validate promotional code.' };
      }
    },
    [addToast]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    addToast('Coupon Removed', 'Promotional discount removed.', 'info');
  }, [addToast]);

  const addToCart = useCallback(
    (product: Product, quantity = 1, selectedVariation?: string) => {
      if (product.status !== 'Active') {
        addToast('Product Unavailable', 'Only active formulations can be added to your cart.', 'error');
        return;
      }
      if (!Number.isFinite(quantity) || quantity < 1) return;

      const amount = Math.floor(quantity);
      setCartItems((prev) => {
        const existingIdx = prev.findIndex(
          (item) => item.product.id === product.id && item.selectedVariation === selectedVariation
        );
        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + amount,
          };
          return updated;
        }
        return [...prev, { product, quantity: amount, selectedVariation }];
      });
      setCartOpen(true);
      addToast('Added to Cart', `${product.name} (${amount}x) added to your selection.`, 'success');
    },
    [addToast]
  );

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (!Number.isFinite(quantity)) return;
    const amount = Math.floor(quantity);
    setCartItems((prev) =>
      amount < 1
        ? prev.filter((item) => item.product.id !== productId)
        : prev.map((item) =>
            item.product.id === productId ? { ...item, quantity: amount } : item
          )
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const navigate = useCallback((newRoute: PublicRoute) => {
    setRoute(newRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Persist client state to localStorage after initial client hydration
  useEffect(() => {
    if (!hydrated) return;
    saveCached('cart', cartItems);
  }, [cartItems, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveCached('wishlist', wishlist);
  }, [wishlist, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveCached('applied_coupon', appliedCoupon);
  }, [appliedCoupon, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveCached('session_admin', sessionAdmin);
  }, [sessionAdmin, hydrated]);

  // Synchronize products and categories from database API
  useEffect(() => {
    fetch('/api/products?limit=100&status=All')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          setProducts(json.data);
        }
      })
      .catch(() => {});

    fetch('/api/categories?includeInactive=true')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          setCategories(json.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!authSession?.user?.isAdmin) return;
    let cancelled = false;
    fetch('/api/inquiries')
      .then(async (response) => {
        if (!response.ok) throw new Error(`Inquiry sync returned HTTP ${response.status}.`);
        const result = (await response.json()) as { data?: Inquiry[] };
        if (!Array.isArray(result.data) || cancelled) return;
        setInquiries(result.data);
      })
      .catch((error: unknown) => {
        console.error('Unable to load saved inquiries:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [authSession?.user?.isAdmin]);

  // Update document title & meta description dynamically for SEO
  useEffect(() => {
    let title = settings.seoDefaultTitle;
    let desc = settings.seoDefaultDescription;

    if (route.page === 'products') {
      title = `Product Catalogue (${route.groupFilter || 'Flavours & Fragrances'}) | ${settings.companyName}`;
      desc = 'Search and filter natural food flavours, fine fragrances, botanical extracts, and essential oils.';
    } else if (route.page === 'product-detail') {
      const prod = products.find((p) => p.slug === route.slug);
      if (prod) {
        title = `${prod.name} (${prod.sku}) | ${settings.companyName}`;
        desc = prod.shortDescription;
      }
    } else if (route.page === 'blog-detail') {
      const post = blogPosts.find((b) => b.slug === route.slug);
      if (post) {
        title = post.seoTitle || `${post.title} | ${settings.companyName}`;
        desc = post.seoDescription || post.excerpt;
      }
    } else if (route.page === 'about' && pages.about) {
      title = `${pages.about.title} | ${settings.companyName}`;
      desc = pages.about.heroSubheading;
    } else if (route.page === 'rd' && pages.rd) {
      title = `${pages.rd.title} | ${settings.companyName}`;
      desc = pages.rd.heroSubheading;
    } else if (route.page === 'quality' && pages.quality) {
      title = `${pages.quality.title} | ${settings.companyName}`;
      desc = pages.quality.heroSubheading;
    } else if (route.page === 'industries') {
      title = `Industries Served — Food, Beverage, Perfumery & Pharma | ${settings.companyName}`;
    } else if (route.page === 'admin') {
      title = `Enterprise Admin Portal | ${settings.companyName}`;
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', desc);
  }, [route, products, blogPosts, pages, settings]);

  useEffect(() => {
    if (authSessionStatus === 'loading') return;
    if (!authSession?.user?.isAdmin || !authSession.user.email) {
      setSessionAdmin(null);
      return;
    }

    const email = authSession.user.email.toLowerCase();
    const matched = admins.find((admin) => admin.email.toLowerCase() === email);
    setSessionAdmin({
      uid: authSession.user.id || matched?.uid || email,
      email,
      name: matched?.name || authSession.user.name || 'Admin',
      role: matched?.role || 'Admin',
      createdAt: matched?.createdAt || new Date().toISOString(),
    });
  }, [authSession, authSessionStatus, admins]);

  // Auth.js sessions do not authenticate the Firebase client used by Firestore rules.
  const canWriteFirestoreAdmin = false;

  // Helper to record Email Notifications
  const dispatchEmailNotification = useCallback(
    (to: string, subject: string, type: EmailLog['type']) => {
      const newLog: EmailLog = {
        id: `eml-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        to,
        subject,
        type,
        sentAt: new Date().toISOString(),
        status: 'Dispatched',
      };
      setEmailLogs((prev) => [newLog, ...prev]);
      fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      }).catch(() => {});
    },
    []
  );

  // Auth Actions
  const requestAdminOtp = async (email: string): Promise<{ ok: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (
      !cleanEmail ||
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return { ok: false, error: 'Enter a valid email address.' };
    }

    try {
      const result = await authSignIn('email', {
        email: cleanEmail,
        redirect: false,
        redirectTo: window.location.origin,
      });
      if (result?.error || !result?.url) {
        return { ok: false, error: 'Unable to send a verification code to this address.' };
      }
      return { ok: true };
    } catch {
      return { ok: false, error: 'Unable to send a verification code. Please try again.' };
    }
  };

  const verifyAdminOtp = async (
    email: string,
    code: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\d{6}$/.test(code)) {
      return { ok: false, error: 'Enter the six-digit verification code.' };
    }

    try {
      const callbackUrl = new URL('/api/auth/callback/email', window.location.origin);
      callbackUrl.searchParams.set('email', cleanEmail);
      callbackUrl.searchParams.set('token', code);
      callbackUrl.searchParams.set('callbackUrl', window.location.origin);

      const response = await fetch(callbackUrl, { redirect: 'follow' });
      if (!response.ok) {
        return { ok: false, error: 'The verification code is invalid or has expired.' };
      }

      const session = await getSession();
      if (
        !session?.user?.isAdmin ||
        session.user.email?.toLowerCase() !== cleanEmail
      ) {
        return { ok: false, error: 'The verification code is invalid or has expired.' };
      }

      const matchedAdmin = admins.find((admin) => admin.email.toLowerCase() === cleanEmail);
      const admin: AdminUser = {
        uid: session.user.id || matchedAdmin?.uid || cleanEmail,
        email: cleanEmail,
        name: matchedAdmin?.name || session.user.name || 'Admin',
        role: matchedAdmin?.role || 'Admin',
        createdAt: matchedAdmin?.createdAt || new Date().toISOString(),
      };
      setSessionAdmin(admin);
      addToast('Authenticated', `Signed in as ${admin.name} (${admin.role})`);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Unable to verify the code. Please try again.' };
    }
  };

  const logoutAdmin = async () => {
    await authSignOut({ redirect: false });
    setSessionAdmin(null);
    addToast('Logged Out', 'Your administrative session has been terminated.', 'info');
  };

  const switchDemoRole = (role: UserRole) => {
    if (!sessionAdmin) return;
    const updated = { ...sessionAdmin, role };
    setSessionAdmin(updated);
    addToast('RBAC Role Switched', `Active permission tier is now ${role}`, 'info');
  };

  // Sync seed data to Firestore for authenticated admin
  const syncSeedToCloud = async () => {
    if (!canWriteFirestoreAdmin) {
      addToast(
        'Local & API Persistence Active',
        'Cloud Firestore writes are unavailable because this application no longer uses Firebase Authentication.',
        'info'
      );
      return;
    }
    try {
      for (const prod of products.slice(0, 10)) {
        const docId = toSlug(prod.id);
        const payload = {
          name: sanitizeString(prod.name, 160),
          sku: sanitizeString(prod.sku, 64),
          slug: toSlug(prod.slug),
          category: sanitizeString(prod.category, 100),
          subcategory: sanitizeString(prod.subcategory, 100),
          productType: prod.productType,
          shortDescription: sanitizeString(prod.shortDescription, 500),
          fullDescription: sanitizeString(prod.fullDescription, 5000),
          applications: sanitizeString(prod.applications, 1000),
          ingredientsNotes: sanitizeString(prod.ingredientsNotes, 1000),
          imageUrl: sanitizeString(prod.imageUrl, 1000),
          featured: Boolean(prod.featured),
          status: prod.status,
          views: Number(prod.views) || 0,
          createdAt: sanitizeString(prod.createdAt, 64),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'products', docId), payload);
      }
      addToast('Cloud Database Synchronized', 'Catalogue records pushed to Firestore.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
    }
  };

  // Product CRUD
  const saveProduct = async (
    input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string }
  ) => {
    const now = new Date().toISOString();
    const id = input.id ? toSlug(input.id) : `prod-${toSlug(input.name)}-${Date.now().toString(36)}`;
    const newProduct: Product = {
      id,
      name: sanitizeString(input.name, 160),
      sku: sanitizeString(input.sku, 64),
      slug: toSlug(input.slug || input.name),
      category: sanitizeString(input.category, 100),
      subcategory: sanitizeString(input.subcategory || 'Standard Formulation', 100),
      productType: input.productType,
      shortDescription: sanitizeString(input.shortDescription, 500),
      fullDescription: sanitizeString(input.fullDescription, 5000),
      applications: sanitizeString(input.applications, 1000),
      ingredientsNotes: sanitizeString(input.ingredientsNotes, 1000),
      imageUrl: sanitizeString(input.imageUrl, 1000),
      galleryUrls: sanitizeString(input.galleryUrls || input.imageUrl, 2000),
      technicalDocUrl: sanitizeString(
        input.technicalDocUrl || `/docs/TDS-${sanitizeString(input.sku, 32)}.pdf`,
        1000
      ),
      featured: Boolean(input.featured),
      status: input.status,
      views: typeof input.views === 'number' ? input.views : 1,
      createdAt: input.createdAt || now,
      updatedAt: now,
    };

    setProducts((prev) => {
      const exists = prev.some((p) => p.id === id);
      return exists ? prev.map((p) => (p.id === id ? newProduct : p)) : [newProduct, ...prev];
    });

    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    }).catch(() => {});

    if (canWriteFirestoreAdmin) {
      const { id: _unused, ...firestorePayload } = newProduct;
      try {
        await setDoc(doc(db, 'products', id), firestorePayload);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `products/${id}`);
      }
    }

    addToast('Product Saved', `${newProduct.name} (${newProduct.sku}) has been updated.`);
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(() => {});
    if (canWriteFirestoreAdmin) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      }
    }
    addToast('Product Deleted', 'The formulation has been removed from the catalogue.', 'info');
  };

  const duplicateProduct = async (product: Product) => {
    const copySku = `${product.sku}-COPY`;
    const copySlug = `${product.slug}-${Math.floor(100 + Math.random() * 900)}`;
    const { id: _ignoredId, createdAt: _ignoredCreated, updatedAt: _ignoredUpdated, ...rest } = product;
    await saveProduct({
      ...rest,
      name: `${product.name} (Copy)`,
      sku: copySku,
      slug: copySlug,
      status: 'Draft',
      views: 0,
    });
  };

  const incrementProductView = async (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, views: p.views + 1 } : p))
    );
  };

  // Category CRUD
  const saveCategory = async (
    cat: Omit<Category, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
  ) => {
    const now = new Date().toISOString();
    const id = cat.id ? toSlug(cat.id) : `cat-${toSlug(cat.name)}-${Date.now().toString(36)}`;
    const newCat: Category = {
      id,
      name: sanitizeString(cat.name, 120),
      slug: toSlug(cat.slug || cat.name),
      parentGroup: cat.parentGroup,
      description: sanitizeString(cat.description, 1000),
      imageUrl: sanitizeString(cat.imageUrl, 1000),
      displayOrder: Number(cat.displayOrder) || 1,
      active: Boolean(cat.active),
      createdAt: cat.createdAt || now,
    };
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === id);
      const updated = exists ? prev.map((c) => (c.id === id ? newCat : c)) : [...prev, newCat];
      return updated.sort((a, b) => a.displayOrder - b.displayOrder);
    });
    if (canWriteFirestoreAdmin) {
      const { id: _id, ...payload } = newCat;
      try {
        await setDoc(doc(db, 'categories', id), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `categories/${id}`);
      }
    }
    addToast('Category Saved', `${newCat.name} updated in ${newCat.parentGroup}.`);
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (canWriteFirestoreAdmin) {
      try {
        await deleteDoc(doc(db, 'categories', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
      }
    }
    addToast('Category Removed', 'Category deleted.', 'info');
  };

  // Industry CRUD
  const saveIndustry = async (
    ind: Omit<Industry, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
  ) => {
    const now = new Date().toISOString();
    const id = ind.id ? toSlug(ind.id) : `ind-${toSlug(ind.name)}-${Date.now().toString(36)}`;
    const newInd: Industry = {
      id,
      name: sanitizeString(ind.name, 120),
      slug: toSlug(ind.slug || ind.name),
      description: sanitizeString(ind.description, 2000),
      applications: sanitizeString(ind.applications, 1000),
      imageUrl: sanitizeString(ind.imageUrl, 1000),
      featuredProducts: sanitizeString(ind.featuredProducts, 1000),
      ctaText: sanitizeString(ind.ctaText || 'Request Industry Consultation', 120),
      createdAt: ind.createdAt || now,
    };
    setIndustries((prev) => {
      const exists = prev.some((i) => i.id === id);
      return exists ? prev.map((i) => (i.id === id ? newInd : i)) : [...prev, newInd];
    });
    if (canWriteFirestoreAdmin) {
      const { id: _id, ...payload } = newInd;
      try {
        await setDoc(doc(db, 'industries', id), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `industries/${id}`);
      }
    }
    addToast('Industry Saved', `${newInd.name} sector updated.`);
  };

  const deleteIndustry = async (id: string) => {
    setIndustries((prev) => prev.filter((i) => i.id !== id));
    if (canWriteFirestoreAdmin) {
      try {
        await deleteDoc(doc(db, 'industries', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `industries/${id}`);
      }
    }
    addToast('Industry Deleted', 'Industry sector removed.', 'info');
  };

  // Inquiries (Quote Requests)
  const submitInquiry = async (
    data: Omit<Inquiry, 'id' | 'submitterUid' | 'status' | 'createdAt'>
  ) => {
    const id = `inq-${Date.now()}`;
    const now = new Date().toISOString();
    const submitterUid = authSession?.user.id || 'public-b2b-visitor';
    const newInquiry: Inquiry = {
      id,
      submitterUid,
      name: sanitizeString(data.name, 120),
      company: sanitizeString(data.company, 160),
      email: sanitizeString(data.email, 160),
      phone: sanitizeString(data.phone, 64),
      country: sanitizeString(data.country, 100),
      productName: sanitizeString(data.productName, 160),
      quantity: sanitizeString(data.quantity, 100),
      application: sanitizeString(data.application, 300),
      message: sanitizeString(data.message, 3000),
      attachmentUrl: sanitizeString(data.attachmentUrl || '', 1000),
      status: 'New',
      internalNotes: '',
      createdAt: now,
    };

    const response = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInquiry),
    });
    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(result?.error || 'Unable to save inquiry.');
    }
    setInquiries((prev) => [newInquiry, ...prev]);

    dispatchEmailNotification(
      settings.email,
      `[New B2B Quote Request] ${newInquiry.productName} (${newInquiry.quantity}) — ${newInquiry.company}`,
      'Quote Notification'
    );
    dispatchEmailNotification(
      newInquiry.email,
      `Flavour & Fragrances — Quote Inquiry Received (${newInquiry.productName})`,
      'Customer Confirmation'
    );

    addToast(
      'Quote Request Submitted',
      `Reference #${id.toUpperCase()} logged. Confirmation email sent to ${newInquiry.email}.`
    );
  };

  const updateInquiryStatus = async (
    id: string,
    status: Inquiry['status'],
    internalNotes?: string
  ) => {
    const response = await fetch('/api/inquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, internalNotes }),
    });
    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(result?.error || 'Unable to update inquiry.');
    }
    setInquiries((prev) =>
      prev.map((inq) => inq.id === id
        ? {
            ...inq,
            status,
            internalNotes: internalNotes !== undefined
              ? sanitizeString(internalNotes, 2000)
              : inq.internalNotes,
          }
        : inq)
    );
    addToast('Inquiry Updated', `Inquiry status set to ${status}.`);
  };

  const deleteInquiry = async (id: string) => {
    const response = await fetch(`/api/inquiries/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(result?.error || 'Unable to delete inquiry.');
    }
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    addToast('Inquiry Deleted', 'Quote request removed.', 'info');
  };

  // Sample Requests
  const submitSampleRequest = async (
    data: Omit<SampleRequest, 'id' | 'submitterUid' | 'status' | 'createdAt'>
  ) => {
    const id = `smp-${Date.now()}`;
    const now = new Date().toISOString();
    const submitterUid = authSession?.user.id || 'public-b2b-visitor';
    const newSample: SampleRequest = {
      id,
      submitterUid,
      name: sanitizeString(data.name, 120),
      company: sanitizeString(data.company, 160),
      email: sanitizeString(data.email, 160),
      phone: sanitizeString(data.phone, 64),
      country: sanitizeString(data.country, 100),
      productName: sanitizeString(data.productName, 160),
      quantity: sanitizeString(data.quantity, 100),
      application: sanitizeString(data.application, 300),
      shippingAddress: sanitizeString(data.shippingAddress, 600),
      message: sanitizeString(data.message, 2000),
      status: 'New',
      createdAt: now,
    };

    const response = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newSample,
        inquiryType: 'Sample Request',
        message: `${newSample.message}\n\nShipping address: ${newSample.shippingAddress}`,
        cartItemsJson: '[]',
      }),
    });
    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(result?.error || 'Unable to save sample request.');
    }
    setSampleRequests((prev) => [newSample, ...prev]);

    dispatchEmailNotification(
      settings.email,
      `[New Lab Sample Request] ${newSample.productName} — ${newSample.company} (${newSample.country})`,
      'Sample Notification'
    );
    dispatchEmailNotification(
      newSample.email,
      `Flavour & Fragrances R&D — Sample Dispatch Confirmation (${newSample.productName})`,
      'Customer Confirmation'
    );

    addToast(
      'Laboratory Sample Requested',
      `Sample request #${id.toUpperCase()} queued for Geneva R&D dispatch.`
    );
  };

  const updateSampleStatus = async (id: string, status: SampleRequest['status']) => {
    let target: SampleRequest | undefined;
    setSampleRequests((prev) =>
      prev.map((smp) => {
        if (smp.id === id) {
          target = { ...smp, status };
          return target;
        }
        return smp;
      })
    );
    if (target && canWriteFirestoreAdmin) {
      const { id: _id, ...payload } = target;
      try {
        await setDoc(doc(db, 'sampleRequests', id), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `sampleRequests/${id}`);
      }
    }
    addToast('Sample Status Updated', `Sample request marked as ${status}.`);
  };

  const deleteSampleRequest = async (id: string) => {
    setSampleRequests((prev) => prev.filter((s) => s.id !== id));
    if (canWriteFirestoreAdmin) {
      try {
        await deleteDoc(doc(db, 'sampleRequests', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `sampleRequests/${id}`);
      }
    }
    addToast('Sample Request Deleted', 'Record removed.', 'info');
  };

  // Contact Messages
  const submitContactMessage = async (
    data: Omit<ContactMessage, 'id' | 'submitterUid' | 'status' | 'createdAt'>
  ) => {
    const id = `msg-${Date.now()}`;
    const now = new Date().toISOString();
    const submitterUid = authSession?.user.id || 'public-b2b-visitor';
    const newMsg: ContactMessage = {
      id,
      submitterUid,
      name: sanitizeString(data.name, 120),
      company: sanitizeString(data.company, 160),
      email: sanitizeString(data.email, 160),
      phone: sanitizeString(data.phone, 64),
      country: sanitizeString(data.country, 100),
      subject: sanitizeString(data.subject, 200),
      message: sanitizeString(data.message, 3000),
      status: 'New',
      createdAt: now,
    };

    setContactMessages((prev) => [newMsg, ...prev]);

    fetch('/api/contact-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg),
    }).catch(() => {});

    dispatchEmailNotification(
      settings.email,
      `[Corporate Contact] ${newMsg.subject} — ${newMsg.name} (${newMsg.company})`,
      'Contact Notification'
    );
    dispatchEmailNotification(
      newMsg.email,
      `Flavour & Fragrances — We have received your inquiry`,
      'Customer Confirmation'
    );

    addToast('Message Sent', 'Our Geneva commercial desk has received your message.');
  };

  const updateContactStatus = async (id: string, status: ContactMessage['status']) => {
    let target: ContactMessage | undefined;
    setContactMessages((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          target = { ...m, status };
          return target;
        }
        return m;
      })
    );
    if (target && canWriteFirestoreAdmin) {
      const { id: _id, ...payload } = target;
      try {
        await setDoc(doc(db, 'contactMessages', id), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `contactMessages/${id}`);
      }
    }
    addToast('Message Updated', `Contact message marked as ${status}.`);
  };

  const deleteContactMessage = async (id: string) => {
    setContactMessages((prev) => prev.filter((m) => m.id !== id));
    if (canWriteFirestoreAdmin) {
      try {
        await deleteDoc(doc(db, 'contactMessages', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `contactMessages/${id}`);
      }
    }
    addToast('Message Deleted', 'Contact message removed.', 'info');
  };

  // Blog CRUD
  const saveBlogPost = async (
    post: Omit<BlogPost, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
  ) => {
    const now = new Date().toISOString();
    const id = post.id ? toSlug(post.id) : `post-${Date.now()}`;
    const newPost: BlogPost = {
      id,
      title: sanitizeString(post.title, 200),
      slug: toSlug(post.slug || post.title),
      category: sanitizeString(post.category, 100),
      tags: sanitizeString(post.tags, 300),
      excerpt: sanitizeString(post.excerpt, 600),
      content: sanitizeString(post.content, 15000),
      featuredImage: sanitizeString(post.featuredImage, 1000),
      seoTitle: sanitizeString(post.seoTitle || post.title, 160),
      seoDescription: sanitizeString(post.seoDescription || post.excerpt, 300),
      published: Boolean(post.published),
      authorName: sanitizeString(post.authorName, 120),
      createdAt: post.createdAt || now,
    };

    setBlogPosts((prev) => {
      const exists = prev.some((b) => b.id === id);
      return exists ? prev.map((b) => (b.id === id ? newPost : b)) : [newPost, ...prev];
    });

    if (canWriteFirestoreAdmin) {
      const { id: _id, ...payload } = newPost;
      try {
        await setDoc(doc(db, 'blogPosts', id), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `blogPosts/${id}`);
      }
    }

    addToast('Journal Article Saved', `"${newPost.title}" has been updated.`);
  };

  const deleteBlogPost = async (id: string) => {
    setBlogPosts((prev) => prev.filter((b) => b.id !== id));
    if (canWriteFirestoreAdmin) {
      try {
        await deleteDoc(doc(db, 'blogPosts', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `blogPosts/${id}`);
      }
    }
    addToast('Article Deleted', 'Blog post removed.', 'info');
  };

  // Media Library
  const uploadMediaFile = async (file: {
    fileName: string;
    fileType: MediaItem['fileType'];
    category: string;
    url: string;
    sizeKb: number;
  }): Promise<MediaItem> => {
    const id = `med-${Date.now()}`;
    const newItem: MediaItem = {
      id,
      fileName: sanitizeString(file.fileName, 200),
      fileType: file.fileType,
      category: sanitizeString(file.category || 'General', 100),
      url: sanitizeString(file.url, 500000),
      sizeKb: Math.max(1, Math.round(file.sizeKb)),
      createdAt: new Date().toISOString(),
    };

    setMedia((prev) => [newItem, ...prev]);

    if (canWriteFirestoreAdmin) {
      const { id: _id, ...payload } = newItem;
      try {
        await setDoc(doc(db, 'media', id), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `media/${id}`);
      }
    }

    addToast('File Uploaded', `${newItem.fileName} added to Media Library.`);
    return newItem;
  };

  const deleteMediaFile = async (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
    if (canWriteFirestoreAdmin) {
      try {
        await deleteDoc(doc(db, 'media', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `media/${id}`);
      }
    }
    addToast('Media Removed', 'File deleted from Media Library.', 'info');
  };

  // Certificates
  const saveCertificate = async (
    cert: Omit<Certificate, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
  ) => {
    const now = new Date().toISOString();
    const id = cert.id ? toSlug(cert.id) : `cert-${Date.now()}`;
    const newCert: Certificate = {
      id,
      name: sanitizeString(cert.name, 160),
      certificateNumber: sanitizeString(cert.certificateNumber, 100),
      issuingBody: sanitizeString(cert.issuingBody, 160),
      issueDate: sanitizeString(cert.issueDate, 64),
      expiryDate: sanitizeString(cert.expiryDate, 64),
      documentUrl: sanitizeString(cert.documentUrl, 1000),
      status: cert.status,
      createdAt: cert.createdAt || now,
    };

    setCertificates((prev) => {
      const exists = prev.some((c) => c.id === id);
      return exists ? prev.map((c) => (c.id === id ? newCert : c)) : [newCert, ...prev];
    });

    if (canWriteFirestoreAdmin) {
      const { id: _id, ...payload } = newCert;
      try {
        await setDoc(doc(db, 'certificates', id), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `certificates/${id}`);
      }
    }

    addToast('Certificate Saved', `${newCert.name} updated.`);
  };

  const deleteCertificate = async (id: string) => {
    setCertificates((prev) => prev.filter((c) => c.id !== id));
    if (canWriteFirestoreAdmin) {
      try {
        await deleteDoc(doc(db, 'certificates', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `certificates/${id}`);
      }
    }
    addToast('Certificate Removed', 'Compliance certificate deleted.', 'info');
  };

  // CMS Pages & Settings
  const savePageContent = async (page: PageContent) => {
    const slug = toSlug(page.slug);
    const updated: PageContent = {
      slug,
      title: sanitizeString(page.title, 160),
      heroHeading: sanitizeString(page.heroHeading, 240),
      heroSubheading: sanitizeString(page.heroSubheading, 600),
      heroCtaPrimary: sanitizeString(page.heroCtaPrimary, 80),
      heroCtaSecondary: sanitizeString(page.heroCtaSecondary, 80),
      sectionOneTitle: sanitizeString(page.sectionOneTitle, 200),
      sectionOneBody: sanitizeString(page.sectionOneBody, 4000),
      sectionTwoTitle: sanitizeString(page.sectionTwoTitle, 200),
      sectionTwoBody: sanitizeString(page.sectionTwoBody, 4000),
      sectionThreeTitle: sanitizeString(page.sectionThreeTitle, 200),
      sectionThreeBody: sanitizeString(page.sectionThreeBody, 4000),
      visible: Boolean(page.visible),
      updatedAt: new Date().toISOString(),
    };
    setPages((prev) => ({ ...prev, [slug]: updated }));
    if (canWriteFirestoreAdmin) {
      try {
        await setDoc(doc(db, 'pages', slug), updated);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `pages/${slug}`);
      }
    }
    addToast('CMS Page Updated', `Published changes to "${updated.title}".`);
  };

  const saveSiteSettings = async (newSettings: SiteSetting) => {
    const sanitized: SiteSetting = {
      companyName: sanitizeString(newSettings.companyName, 160),
      logoText: sanitizeString(newSettings.logoText, 100),
      email: sanitizeString(newSettings.email, 160),
      phone: sanitizeString(newSettings.phone, 64),
      whatsapp: sanitizeString(newSettings.whatsapp, 64),
      address: sanitizeString(newSettings.address, 400),
      linkedinUrl: sanitizeString(newSettings.linkedinUrl, 300),
      googleMapsUrl: sanitizeString(newSettings.googleMapsUrl, 500),
      smtpHost: sanitizeString(newSettings.smtpHost, 160),
      smtpPort: sanitizeString(newSettings.smtpPort, 16),
      seoDefaultTitle: sanitizeString(newSettings.seoDefaultTitle, 160),
      seoDefaultDescription: sanitizeString(newSettings.seoDefaultDescription, 300),
      analyticsId: sanitizeString(newSettings.analyticsId, 64),
      updatedAt: new Date().toISOString(),
    };
    setSettings(sanitized);
    if (canWriteFirestoreAdmin) {
      try {
        await setDoc(doc(db, 'settings', 'global'), sanitized);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'settings/global');
      }
    }
    addToast('Global Settings Saved', 'Corporate configuration and SEO defaults updated.');
  };

  // Admin Users
  const saveAdminUser = async (admin: Omit<AdminUser, 'createdAt'> & { createdAt?: string }) => {
    const uid = toSlug(admin.uid || `admin-${Date.now()}`);
    const newAdmin: AdminUser = {
      uid,
      email: sanitizeString(admin.email, 160),
      name: sanitizeString(admin.name, 120),
      role: admin.role,
      createdAt: admin.createdAt || new Date().toISOString(),
    };
    setAdmins((prev) => {
      const exists = prev.some((a) => a.uid === uid);
      return exists ? prev.map((a) => (a.uid === uid ? newAdmin : a)) : [...prev, newAdmin];
    });
    if (canWriteFirestoreAdmin) {
      try {
        await setDoc(doc(db, 'admins', uid), newAdmin);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `admins/${uid}`);
      }
    }
    addToast('Administrator Saved', `${newAdmin.name} assigned role ${newAdmin.role}.`);
  };

  const deleteAdminUser = async (uid: string) => {
    setAdmins((prev) => prev.filter((a) => a.uid !== uid));
    if (canWriteFirestoreAdmin) {
      try {
        await deleteDoc(doc(db, 'admins', uid));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `admins/${uid}`);
      }
    }
    addToast('Administrator Removed', 'User access revoked.', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        route,
        navigate,
        isAdminAuthenticated:
          authSessionStatus === 'authenticated' &&
          (authSession?.user?.isAdmin === true ||
            ['Super Admin', 'Admin', 'Staff'].includes((authSession?.user as { role?: string })?.role || '')) &&
          Boolean(authSession?.user?.email),
        currentAdmin: sessionAdmin,
        authLoading: authSessionStatus === 'loading',
        requestAdminOtp,
        verifyAdminOtp,
        logoutAdmin,
        switchDemoRole,
        products,
        cartItems,
        cartOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        openCart,
        closeCart,
        wishlist,
        toggleWishlist,
        isInWishlist,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
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
        emailLogs,
        toasts,
        addToast,
        dismissToast,
        saveProduct,
        deleteProduct,
        duplicateProduct,
        incrementProductView,
        saveCategory,
        deleteCategory,
        saveIndustry,
        deleteIndustry,
        submitInquiry,
        updateInquiryStatus,
        deleteInquiry,
        submitSampleRequest,
        updateSampleStatus,
        deleteSampleRequest,
        submitContactMessage,
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
        saveAdminUser,
        deleteAdminUser,
        syncSeedToCloud,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
