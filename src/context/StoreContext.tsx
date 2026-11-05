import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  CartItem,
  CustomerDetails,
  Order,
  OrderItem,
  ToastMessage,
  DeliveryArea,
} from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../data/initialData';
import { DELIVERY_CONFIG } from '../config/delivery';
import { buildWhatsAppOrderMessage, getWhatsAppOrderUrl } from '../utils/whatsapp';

import {
  auth,
  FirebaseUser,
} from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

export type AppView =
  | 'home'
  | 'shop'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'order-success'
  | 'admin'
  | 'about'
  | 'contact';

export type AdminTab = 'dashboard' | 'products' | 'categories' | 'orders' | 'database';

interface StoreContextType {
  // Navigation & Views
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  viewProductDetail: (product: Product) => void;
  navigateTo: (view: AppView) => void;
  scrollToSection: (sectionId: string) => void;

  // Firebase User Authentication (Email & Password only)
  currentUser: FirebaseUser | null;
  isUserAdmin: boolean;
  isAdminEmailUnverified: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; user?: any; error?: string }>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<{ success: boolean; user?: any; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  sendVerificationEmail: () => Promise<{ success: boolean; message: string }>;
  reloadCurrentUser: () => Promise<void>;
  signOutUser: () => Promise<void>;

  // Catalog
  products: Product[];
  categories: Category[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategoryFilter: string;
  setActiveCategoryFilter: (catId: string) => void;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'name';
  setSortBy: (sort: 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'name') => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;

  // Cart
  cart: CartItem[];
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, openDrawer?: boolean) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;

  // Orders
  orders: Order[];
  lastCompletedOrder: Order | null;
  confirmWhatsAppOrder: (customer: CustomerDetails) => { success: boolean; url: string; order: Order };
  placeCodOrder: (customer: CustomerDetails) => { success: boolean; order: Order };
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Admin Auth & Management
  isAdminLoggedIn: boolean;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  loginAdmin: (email: string, pass: string) => boolean;
  logoutAdmin: () => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  resetToDemoData: () => void;

  // Toast System
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LS_KEY_PRODUCTS = 'dhaka_art_nook_products_v1';
const LS_KEY_CATEGORIES = 'dhaka_art_nook_categories_v1';
const LS_KEY_CART = 'dhaka_art_nook_cart_v1';
const LS_KEY_ORDERS = 'dhaka_art_nook_orders_v1';
const LS_KEY_ADMIN_AUTH = 'dhaka_art_nook_admin_auth_v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest' | 'name'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Products state
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LS_KEY_PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PRODUCTS;
  });

  // Categories state
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(LS_KEY_CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CATEGORIES;
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LS_KEY_CART);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LS_KEY_ORDERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'ord-seed-01',
        orderNumber: 'DAN-20261103-7482',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        customer: {
          fullName: 'Tania Ahmed',
          phone: '01711223344',
          address: 'House 42, Road 7A, Dhanmondi, Dhaka',
          deliveryArea: 'inside_dhaka',
          notes: 'Please call before delivery.',
        },
        items: [
          {
            productId: 'prod-resin-01',
            productName: 'Aurora Ultra-Clear 2:1 Epoxy Resin Art Kit (1500ml)',
            productImage: '/src/assets/images/product_resin_art_kit_1793820211674.jpg',
            productSlug: 'aurora-ultra-clear-epoxy-resin-kit-1500ml',
            price: 2200,
            quantity: 1,
            lineTotal: 2200,
          },
          {
            productId: 'prod-block-01',
            productName: 'Heritage Floral Mandala Hand-Carved Sheesham Wood Block',
            productImage: '/src/assets/images/product_block_print_set_1793820211690.jpg',
            productSlug: 'heritage-floral-mandala-hand-carved-sheesham-wood-block',
            price: 580,
            quantity: 1,
            lineTotal: 580,
          },
        ],
        subtotal: 2780,
        deliveryCharge: 80,
        grandTotal: 2860,
        status: 'confirmed',
        paymentMethod: 'whatsapp',
        notes: 'Confirmed via WhatsApp with bKash advance.',
      },
    ];
  });
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  // Admin Auth & Tab
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LS_KEY_ADMIN_AUTH) === 'true';
    } catch {
      return false;
    }
  });
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Firebase User Authentication state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Toast System state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        localStorage.removeItem('dhaka_art_nook_demo_user');
      } else {
        const savedDemo = localStorage.getItem('dhaka_art_nook_demo_user');
        if (savedDemo) {
          try {
            setCurrentUser(JSON.parse(savedDemo));
          } catch (e) {
            console.error(e);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Authorized Store Admin configuration from environment
  const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'jihadbolchi@gmail.com').toLowerCase().trim();

  // Secret Admin Access verification: must match admin email AND have verified email
  const isUserAdmin = Boolean(
    currentUser &&
    currentUser.email &&
    currentUser.email.toLowerCase().trim() === ADMIN_EMAIL &&
    currentUser.emailVerified === true
  );

  const isAdminEmailUnverified = Boolean(
    currentUser &&
    currentUser.email &&
    currentUser.email.toLowerCase().trim() === ADMIN_EMAIL &&
    !currentUser.emailVerified
  );

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setCurrentUser(userCredential.user);
      addToast('Signed in successfully!', 'success');
      return { success: true, user: userCredential.user };
    } catch (err: any) {
      let friendlyMessage = 'Unable to sign in. Please verify your email and password.';
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        friendlyMessage = 'Invalid email address or password. Please try again.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        friendlyMessage = 'Too many failed login attempts. Please reset your password or try later.';
      }
      return { success: false, error: friendlyMessage };
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const trimmedEmail = email.trim();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
      if (name.trim() && userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name.trim() });
      }

      // If registering as admin, send verification email immediately
      if (trimmedEmail.toLowerCase() === ADMIN_EMAIL) {
        try {
          await sendEmailVerification(userCredential.user);
          addToast('Account created! A verification link has been sent to your admin email.', 'info');
        } catch (e) {
          console.warn(e);
        }
      } else {
        addToast(`Account created! Welcome, ${name.trim() || 'Maker'}!`, 'success');
      }

      setCurrentUser(userCredential.user);
      return { success: true, user: userCredential.user };
    } catch (err: any) {
      let friendlyMessage = 'Unable to create account. Please check your details.';
      if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = 'An account with this email address already exists. Please sign in.';
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = 'Password must be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = 'Please provide a valid email address.';
      }
      return { success: false, error: friendlyMessage };
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      addToast('Password reset link sent! Please check your email inbox.', 'success');
      return { success: true, message: 'Password reset link sent.' };
    } catch (err: any) {
      let friendlyMessage = 'Could not send reset email.';
      if (err.code === 'auth/user-not-found') {
        friendlyMessage = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = 'Please provide a valid email address.';
      }
      return { success: false, message: friendlyMessage };
    }
  };

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) {
      return { success: false, message: 'No user is currently signed in.' };
    }
    try {
      await sendEmailVerification(auth.currentUser);
      addToast('Verification email sent! Check your inbox.', 'info');
      return { success: true, message: 'Verification link sent to your email.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to send verification email.' };
    }
  };

  const reloadCurrentUser = async () => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload();
        setCurrentUser({ ...auth.currentUser });
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.warn(err);
    }
    setCurrentUser(null);
    addToast('You have been logged out.', 'info');
  };

  const scrollToSection = (sectionId: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Sync products to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  // Sync categories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY_CART, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Sync orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY_ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  // Sync admin auth to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY_ADMIN_AUTH, isAdminLoggedIn ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
  }, [isAdminLoggedIn]);

  // Toast actions
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, openDrawer = true) => {
    if (!product.inStock || product.stock <= 0) {
      addToast(`"${product.name}" is currently out of stock.`, 'error');
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        return [...prevCart, { product, quantity: Math.min(quantity, product.stock) }];
      }
    });

    addToast(`Added "${product.name.slice(0, 30)}..." to your bag!`, 'success');

    if (openDrawer) {
      setIsCartDrawerOpen(true);
    }
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId) {
          const maxAllowed = item.product.stock;
          return { ...item, quantity: Math.min(quantity, maxAllowed) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
    addToast('Item removed from cart.', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartSubtotal = cart.reduce((total, item) => {
    const effectivePrice = item.product.discountPrice ?? item.product.price;
    return total + effectivePrice * item.quantity;
  }, 0);

  // Navigation helpers
  const navigateTo = (view: AppView) => {
    if (view === 'admin' && !isUserAdmin) {
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Order creation helper
  const createOrderObject = (customer: CustomerDetails, paymentMethod: 'whatsapp' | 'cod'): Order => {
    const timestamp = Date.now();
    const dateStr = new Date(timestamp).toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `DAN-${dateStr}-${randomSuffix}`;

    const orderItems: OrderItem[] = cart.map((item) => {
      const price = item.product.discountPrice ?? item.product.price;
      return {
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.images[0] || '/src/assets/images/hero_art_craft_workspace_1793820211229.jpg',
        productSlug: item.product.slug,
        price,
        quantity: item.quantity,
        lineTotal: price * item.quantity,
      };
    });

    const deliveryCharge =
      customer.deliveryArea === 'inside_dhaka'
        ? DELIVERY_CONFIG.insideDhaka.fee
        : DELIVERY_CONFIG.outsideDhaka.fee;

    const grandTotal = cartSubtotal + deliveryCharge;

    const order: Order = {
      id: `ord-${timestamp}`,
      orderNumber,
      createdAt: new Date(timestamp).toISOString(),
      customer,
      items: orderItems,
      subtotal: cartSubtotal,
      deliveryCharge,
      grandTotal,
      status: 'pending',
      paymentMethod,
      notes: customer.notes,
    };

    return order;
  };

  // Confirm via WhatsApp
  const confirmWhatsAppOrder = (customer: CustomerDetails) => {
    const order = createOrderObject(customer, 'whatsapp');

    // Build the WhatsApp message
    const message = buildWhatsAppOrderMessage(
      {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        customer: order.customer,
        items: order.items,
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        grandTotal: order.grandTotal,
        notes: order.notes,
      },
      window.location.origin
    );

    const waUrl = getWhatsAppOrderUrl(message);

    // Persist order in store
    setOrders((prev) => [order, ...prev]);
    setLastCompletedOrder(order);

    // Clear cart
    clearCart();

    // Trigger WhatsApp in new tab
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Direct user to success view
    navigateTo('order-success');
    addToast('Order generated! WhatsApp has opened in a new tab.', 'success');

    return { success: true, url: waUrl, order };
  };

  // Place Cash On Delivery (COD) Order
  const placeCodOrder = (customer: CustomerDetails) => {
    const order = createOrderObject(customer, 'cod');
    setOrders((prev) => [order, ...prev]);
    setLastCompletedOrder(order);
    clearCart();
    navigateTo('order-success');
    addToast('Order placed successfully! We will contact you soon.', 'success');
    return { success: true, order };
  };

  // Update order status in Admin
  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
    addToast(`Order ${orderId} updated to ${status}.`, 'info');
  };

  // Admin Auth
  const loginAdmin = (email: string, pass: string): boolean => {
    // Admin credentials for Dhaka Art Nook store
    if (
      (email.toLowerCase() === 'admin@dhakaartnook.com' && pass === 'ArtNook@2026!') ||
      (email.toLowerCase() === 'admin' && pass === 'admin')
    ) {
      setIsAdminLoggedIn(true);
      addToast('Welcome back, Admin!', 'success');
      return true;
    }
    addToast('Invalid credentials. Use admin@dhakaartnook.com / ArtNook@2026!', 'error');
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setCurrentView('home');
    addToast('Logged out of Admin panel.', 'info');
  };

  // Product CRUD
  const addProduct = (data: Omit<Product, 'id' | 'createdAt'>) => {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    addToast(`Product "${data.name}" added successfully.`, 'success');
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    addToast('Product updated successfully.', 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    addToast('Product deleted from inventory.', 'info');
  };

  // Category CRUD
  const addCategory = (data: Omit<Category, 'id'>) => {
    const id = `cat-${Date.now()}`;
    const newCategory: Category = {
      ...data,
      id,
      itemCount: 0,
    };
    setCategories((prev) => [...prev, newCategory]);
    addToast(`Category "${data.name}" created.`, 'success');
  };

  const updateCategory = (id: string, data: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    addToast('Category updated.', 'success');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((item) => item.id !== id));
    addToast('Category removed.', 'info');
  };

  // Reset demo data
  const resetToDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    addToast('Reset catalog to authentic demo data.', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedProduct,
        setSelectedProduct,
        viewProductDetail,
        navigateTo,
        scrollToSection,

        currentUser,
        isUserAdmin,
        isAdminEmailUnverified,
        isAuthModalOpen,
        setIsAuthModalOpen,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        sendVerificationEmail,
        reloadCurrentUser,
        signOutUser,

        products,
        categories,
        searchQuery,
        setSearchQuery,
        activeCategoryFilter,
        setActiveCategoryFilter,
        sortBy,
        setSortBy,
        inStockOnly,
        setInStockOnly,

        cart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,

        orders,
        lastCompletedOrder,
        confirmWhatsAppOrder,
        placeCodOrder,
        updateOrderStatus,

        isAdminLoggedIn,
        adminTab,
        setAdminTab,
        loginAdmin,
        logoutAdmin,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        resetToDemoData,

        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
