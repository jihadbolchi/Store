/**
 * Dhaka Art Nook — Full-Stack E-Commerce Store
 * Online art & craft supplies store based in Dhaka, Bangladesh
 */

import React, { Suspense, lazy } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { Toast } from './components/Toast';
import { AuthModal } from './components/AuthModal';

// Load each route on demand to keep the initial storefront bundle light.
const HomeView = lazy(() => import('./views/HomeView').then((module) => ({ default: module.HomeView })));
const ShopView = lazy(() => import('./views/ShopView').then((module) => ({ default: module.ShopView })));
const ProductDetailView = lazy(() => import('./views/ProductDetailView').then((module) => ({ default: module.ProductDetailView })));
const CartView = lazy(() => import('./views/CartView').then((module) => ({ default: module.CartView })));
const CheckoutView = lazy(() => import('./views/CheckoutView').then((module) => ({ default: module.CheckoutView })));
const OrderSuccessView = lazy(() => import('./views/OrderSuccessView').then((module) => ({ default: module.OrderSuccessView })));
const AdminView = lazy(() => import('./views/AdminView').then((module) => ({ default: module.AdminView })));
const AboutView = lazy(() => import('./views/AboutView').then((module) => ({ default: module.AboutView })));
const ContactView = lazy(() => import('./views/ContactView').then((module) => ({ default: module.ContactView })));

const PageLoading: React.FC = () => (
  <div className="mx-auto flex min-h-[45vh] max-w-7xl items-center justify-center px-4" role="status" aria-live="polite">
    <div className="flex items-center gap-3 text-sm text-stone-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-stone-200 border-t-[#0B6A75]" />
      <span>Loading your store…</span>
    </div>
  </div>
);

const MainContent: React.FC = () => {
  const { currentView } = useStore();

  return (
    <main className="min-h-[70vh] flex-1">
      <Suspense fallback={<PageLoading />}>
        {currentView === 'home' && <HomeView />}
        {currentView === 'shop' && <ShopView />}
        {currentView === 'product-detail' && <ProductDetailView />}
        {currentView === 'cart' && <CartView />}
        {currentView === 'checkout' && <CheckoutView />}
        {currentView === 'order-success' && <OrderSuccessView />}
        {currentView === 'admin' && <AdminView />}
        {currentView === 'about' && <AboutView />}
        {currentView === 'contact' && <ContactView />}
      </Suspense>
    </main>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-stone-900 font-sans selection:bg-[#005C6E] selection:text-white">
        {/* Navigation Top Bar */}
        <Header />

        {/* Dynamic Page Views */}
        <MainContent />

        {/* Global Slide-In Cart Drawer */}
        <CartDrawer />

        {/* Global Toast System */}
        <Toast />

        {/* Firebase User Authentication Modal */}
        <AuthModal />

        {/* Footer */}
        <Footer />
      </div>
    </StoreProvider>
  );
}
