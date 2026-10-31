import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import {
  HomePage,
  AboutPage,
  IndustriesPage,
  RDPage,
  QualityPage,
  BlogListPage,
  BlogDetailPage,
  QuotePage,
  SampleRequestPage,
  ContactPage,
} from './components/PublicPages';
import { ProductsCataloguePage, ProductDetailPage } from './components/ProductViews';
import { AdminDashboard } from './components/AdminDashboard';
import { AppLayout } from './layout';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const MainRouter: React.FC = () => {
  const { route, toasts, dismissToast } = useStore();

  const renderCurrentView = () => {
    switch (route.page) {
      case 'home':
        return <HomePage />;
      case 'products':
        return (
          <ProductsCataloguePage
            initialCategory={route.categoryFilter}
            initialGroup={route.groupFilter}
            initialSearch={route.search}
          />
        );
      case 'product-detail':
        return <ProductDetailPage slug={route.slug} />;
      case 'industries':
        return <IndustriesPage slug={route.slug} />;
      case 'about':
        return <AboutPage />;
      case 'rd':
        return <RDPage />;
      case 'quality':
        return <QualityPage />;
      case 'blog':
        return <BlogListPage />;
      case 'blog-detail':
        return <BlogDetailPage slug={route.slug} />;
      case 'quote':
        return <QuotePage productPreselect={route.productPreselect} />;
      case 'sample':
        return <SampleRequestPage productPreselect={route.productPreselect} />;
      case 'contact':
        return <ContactPage />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <HomePage />;
    }
  };

  const isAdminView = route.page === 'admin';

  return (
    <>
      <AppLayout isAdminView={isAdminView}>{renderCurrentView()}</AppLayout>

      {/* Global Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto p-4 bg-[#0F2922] text-[#FAF9F6] border border-[#FAF9F6]/15 rounded-lg shadow-xl flex items-start justify-between gap-3 transition-all transform animate-in slide-in-from-bottom-2"
          >
            <div className="flex items-start gap-2.5">
              {toast.type === 'success' && (
                <CheckCircle className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
              )}
              {toast.type === 'error' && (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              {toast.type === 'info' && (
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="text-xs font-semibold">{toast.title}</div>
                {toast.description && (
                  <div className="text-[11px] text-[#FAF9F6]/75 mt-0.5 leading-snug">
                    {toast.description}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-[#FAF9F6]/50 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainRouter />
    </StoreProvider>
  );
}
