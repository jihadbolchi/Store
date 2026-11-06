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
  HeroBannerSettings,
} from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../data/initialData';
import { DELIVERY_CONFIG } from '../config/delivery';
import { buildWhatsAppOrderMessage, getWhatsAppOrderUrl } from '../utils/whatsapp';

import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
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
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

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

export type AdminTab = 'dashboard' | 'products' | 'categories' | 'orders' | 'banner' | 'database';

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
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
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

  // Hero Banner Settings
  heroBanner: HeroBannerSettings;
  updateHeroBanner: (settings: Partial<HeroBannerSettings>) => Promise<void>;
  resetHeroBanner: () => void;

  // Firebase synchronization status
  isFirebaseSyncing: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LS_KEY_PRODUCTS = 'dhaka_art_nook_products_v1';
const LS_KEY_CATEGORIES = 'dhaka_art_nook_categories_v1';
const LS_KEY_CART = 'dhaka_art_nook_cart_v1';
const LS_KEY_ORDERS = 'dhaka_art_nook_orders_v1';
const LS_KEY_HERO_BANNER = 'dhaka_art_nook_hero_banner_v1';

export const DEFAULT_HERO_BANNER: HeroBannerSettings = {
  imageUrl: '/src/assets/images/hero_tulips_craft_workspace_1793821760325.jpg',
  title: 'Where Art Meets Craft',
  subtitle: 'Curated art & DIY craft essentials for passionate makers across Bangladesh.',
  ctaText: 'Explore Collection',
};

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

  // Admin navigation state; authorization is derived only from Firebase Authentication.
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Firebase User Authentication state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Hero Banner Settings state
  const [heroBanner, setHeroBanner] = useState<HeroBannerSettings>(() => {
    try {
      const saved = localStorage.getItem(LS_KEY_HERO_BANNER);
      if (saved) return { ...DEFAULT_HERO_BANNER, ...JSON.parse(saved) };
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_HERO_BANNER;
  });

  const updateHeroBanner = async (settings: Partial<HeroBannerSettings>) => {
    const updated = { ...heroBanner, ...settings };
    setHeroBanner(updated);
    try {
      localStorage.setItem(LS_KEY_HERO_BANNER, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    addToast('Hero banner settings saved successfully!', 'success');

    try {
      await setDoc(doc(db, 'settings', 'heroBanner'), updated);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/heroBanner');
    }
  };

  const resetHeroBanner = async () => {
    setHeroBanner(DEFAULT_HERO_BANNER);
    try {
      localStorage.setItem(LS_KEY_HERO_BANNER, JSON.stringify(DEFAULT_HERO_BANNER));
    } catch (e) {
      console.error(e);
    }
    addToast('Hero banner reset to default image & text.', 'info');

    try {
      await setDoc(doc(db, 'settings', 'heroBanner'), DEFAULT_HERO_BANNER);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/heroBanner');
    }
  };

  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState<boolean>(true);

  // Toast System state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
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

  // 1. Live Firestore Sync: Products
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'products'),
      async (snapshot) => {
        setIsFirebaseSyncing(false);
        if (!snapshot.empty) {
          const liveProducts = snapshot.docs.map((d) => d.data() as Product);
          setProducts(liveProducts);
        } else {
          // If Firestore collection is empty, seed initial products
          for (const prod of INITIAL_PRODUCTS) {
            try {
              await setDoc(doc(db, 'products', prod.id), prod);
            } catch (e) {
              console.warn('Could not seed product to Firestore:', e);
            }
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'products');
      }
    );
    return () => unsub();
  }, []);

  // 2. Live Firestore Sync: Categories
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'categories'),
      async (snapshot) => {
        if (!snapshot.empty) {
          const liveCategories = snapshot.docs.map((d) => d.data() as Category);
          setCategories(liveCategories);
        } else {
          for (const cat of INITIAL_CATEGORIES) {
            try {
              await setDoc(doc(db, 'categories', cat.id), cat);
            } catch (e) {
              console.warn('Could not seed category to Firestore:', e);
            }
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'categories');
      }
    );
    return () => unsub();
  }, []);

  // 3. Live Firestore Sync: Hero Banner Settings
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'heroBanner'),
      (docSnap) => {
        if (docSnap.exists()) {
          setHeroBanner(docSnap.data() as HeroBannerSettings);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'settings/heroBanner');
      }
    );
    return () => unsub();
  }, []);

  // 4. Live Firestore Sync: Orders (admin only)
  useEffect(() => {
    if (!isUserAdmin) {
      setOrders([]);
      return;
    }
    const unsub = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const liveOrders = snapshot.docs.map((d) => d.data() as Order);
      liveOrders.sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime());
      setOrders(liveOrders);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'orders'));
    return () => unsub();
  }, [isUserAdmin]);

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

    const standardDeliveryCharge =
      customer.deliveryArea === 'inside_dhaka'
        ? DELIVERY_CONFIG.insideDhaka.fee
        : DELIVERY_CONFIG.outsideDhaka.fee;
    const qualifiesForFreeDelivery =
      DELIVERY_CONFIG.freeDeliveryThreshold > 0 &&
      cartSubtotal >= DELIVERY_CONFIG.freeDeliveryThreshold;
    const deliveryCharge = qualifiesForFreeDelivery ? 0 : standardDeliveryCharge;

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

    // Persist order in store & Firestore
    setOrders((prev) => [order, ...prev]);
    setLastCompletedOrder(order);

    try {
      setDoc(doc(db, 'orders', order.id), order).catch((err) => {
        console.warn('Could not sync order to Firestore:', err);
      });
    } catch (e) {
      console.warn(e);
    }

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
    try {
      setDoc(doc(db, 'orders', order.id), order).catch((err) => {
        console.warn('Could not sync order to Firestore:', err);
      });
    } catch (e) {
      console.warn(e);
    }
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
    try {
      updateDoc(doc(db, 'orders', orderId), { status }).catch((err) => {
        console.warn('Firestore order status update error:', err);
      });
    } catch (e) {
      console.warn(e);
    }
    addToast(`Order ${orderId} updated to ${status}.`, 'info');
  };

  // Product CRUD with Firestore Persistence
  const addProduct = async (data: Omit<Product, 'id' | 'createdAt'>) => {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    addToast(`Product "${data.name}" added successfully.`, 'success');

    try {
      await setDoc(doc(db, 'products', id), newProduct);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${id}`);
    }
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    addToast('Product updated successfully.', 'success');

    try {
      await updateDoc(doc(db, 'products', id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    addToast('Product deleted from inventory.', 'info');

    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  // Category CRUD with Firestore Persistence
  const addCategory = async (data: Omit<Category, 'id'>) => {
    const id = `cat-${Date.now()}`;
    const newCategory: Category = {
      ...data,
      id,
      itemCount: 0,
    };
    setCategories((prev) => [...prev, newCategory]);
    addToast(`Category "${data.name}" created.`, 'success');

    try {
      await setDoc(doc(db, 'categories', id), newCategory);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `categories/${id}`);
    }
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    addToast('Category updated.', 'success');

    try {
      await updateDoc(doc(db, 'categories', id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `categories/${id}`);
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((item) => item.id !== id));
    addToast('Category removed.', 'info');

    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
    }
  };

  // Reset demo data to Firestore & Local
  const resetToDemoData = async () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    addToast('Resetting catalog to authentic demo data...', 'info');

    try {
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
      addToast('Cloud catalog reset completed.', 'success');
    } catch (e) {
      console.warn('Could not sync reset demo data to Firestore:', e);
    }
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

        adminTab,
        setAdminTab,
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

        heroBanner,
        updateHeroBanner,
        resetHeroBanner,
        isFirebaseSyncing,
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
