import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import CartDrawer from './components/cart/CartDrawer';
import AgeGateModal from './components/common/AgeGateModal';
import ScrollToTop from './components/common/ScrollToTop';
import LoadingScreen from './components/common/LoadingScreen';
import { useCustomerAuthStore } from './store/useCustomerAuthStore';
import PhoneVerificationGate from './components/auth/PhoneVerificationGate';

// Direct import for homepage to ensure zero-CLS hydration
import HomePage from './pages/HomePage';
const ShopPage = lazy(() => import('./pages/ShopPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const COALibraryPage = lazy(() => import('./pages/COALibraryPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const QualityPage = lazy(() => import('./pages/QualityPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ShippingReturnsPage = lazy(() => import('./pages/ShippingReturnsPage'));
const TermsPage = lazy(() => import('./pages/legal/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/legal/PrivacyPage'));
const ResearchUsePolicyPage = lazy(() => import('./pages/legal/ResearchUsePolicyPage'));
const RefundPolicyPage = lazy(() => import('./pages/legal/RefundPolicyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Customer Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const AccountPage = lazy(() => import('./pages/account/AccountPage'));

// Admin Routes (Lazy loaded, noindex, authenticated)
const AdminLogin = lazy(() => import('./admin/AdminLogin'));
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminProducts = lazy(() => import('./admin/AdminProducts'));
const AdminCategories = lazy(() => import('./admin/AdminCategories'));
const AdminImages = lazy(() => import('./admin/AdminImages'));
const AdminOrders = lazy(() => import('./admin/AdminOrders'));
const AdminCustomers = lazy(() => import('./admin/AdminCustomers'));
const AdminAccount = lazy(() => import('./admin/AdminAccount'));
const AdminCOA = lazy(() => import('./admin/AdminCOA'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--chrome)] border-t-[var(--ink)] animate-spin" />
        <span className="text-xs font-mono text-[var(--ink-muted)]">Loading Research Reagents...</span>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const checkAuth = useCustomerAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (window.location.pathname.startsWith('/admin')) return false;
    return true;
  });

  if (isAdminRoute) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/products" replace />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="images" element={<AdminImages />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="coa" element={<AdminCOA />} />
            <Route path="account" element={<AdminAccount />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      <ScrollToTop />
      <AgeGateModal />
      <Header />
      <CartDrawer />

      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/coa" element={<COALibraryPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<PhoneVerificationGate><CheckoutPage /></PhoneVerificationGate>} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/account" element={<PhoneVerificationGate><AccountPage /></PhoneVerificationGate>} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/quality" element={<QualityPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
            <Route path="/legal/terms" element={<TermsPage />} />
            <Route path="/legal/privacy" element={<PrivacyPage />} />
            <Route path="/legal/research-use-policy" element={<ResearchUsePolicyPage />} />
            <Route path="/legal/refund-policy" element={<RefundPolicyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
