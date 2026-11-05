/**
 * Dhaka Art Nook — Full-Stack E-Commerce Store
 * Online art & craft supplies store based in Dhaka, Bangladesh
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { Toast } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { LiveChatWidget } from './components/LiveChatWidget';

// Views
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { OrderSuccessView } from './views/OrderSuccessView';
import { AdminView } from './views/AdminView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';

import { DELIVERY_CONFIG } from './config/delivery';
import { MessageCircle } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentView } = useStore();

  return (
    <main className="min-h-[70vh] flex-1">
      {currentView === 'home' && <HomeView />}
      {currentView === 'shop' && <ShopView />}
      {currentView === 'product-detail' && <ProductDetailView />}
      {currentView === 'cart' && <CartView />}
      {currentView === 'checkout' && <CheckoutView />}
      {currentView === 'order-success' && <OrderSuccessView />}
      {currentView === 'admin' && <AdminView />}
      {currentView === 'about' && <AboutView />}
      {currentView === 'contact' && <ContactView />}
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

        {/* Real-time Customer Live Chat connected to Firestore */}
        <LiveChatWidget />

        {/* Floating WhatsApp Quick Action on Mobile / Small screens */}
        <div className="fixed bottom-5 left-5 z-40 sm:hidden">
          <a
            href={DELIVERY_CONFIG.whatsapp.waUrlBase}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Order on WhatsApp"
            className="w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
          </a>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </StoreProvider>
  );
}
