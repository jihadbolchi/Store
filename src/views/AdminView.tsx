import React, { useState } from 'react';
import { useStore, AdminTab } from '../context/StoreContext';
import { Product, Category, Order } from '../types';
import { SUPABASE_SQL_SCHEMA } from '../utils/supabaseSchema';
import {
  Shield,
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Database,
  Plus,
  Pencil,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
  Upload,
  Copy,
  ExternalLink,
  RefreshCw,
  X,
  Image as ImageIcon,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    isUserAdmin,
    currentUser,
    signOutUser,
    adminTab,
    setAdminTab,
    products,
    categories,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    updateOrderStatus,
    resetToDemoData,
    addToast,
    navigateTo,
    heroBanner,
    updateHeroBanner,
    resetHeroBanner,
    isFirebaseSyncing,
  } = useStore();

  // Search & Filter state for Products Table
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('all');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    categoryId: '',
    categoryName: '',
    description: '',
    price: 0,
    discountPrice: '' as string | number,
    stock: 10,
    inStock: true,
    featured: false,
    badge: '',
    craftType: '',
    imagesText: '',
  });

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
  });

  // Delete Confirmation Modal
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'product' | 'category';
    id: string;
    title: string;
  } | null>(null);

  // If not an authorized, email-verified admin, display standard 404 with zero hint of admin presence
  if (!isUserAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-2xl font-bold font-mono">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
            Page Not Found
          </h1>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            The page you are looking for does not exist, has been removed, or is temporarily unavailable.
          </p>
        </div>
        <div>
          <button
            onClick={() => navigateTo('home')}
            className="px-6 py-3 bg-[#0B6A75] hover:bg-[#08535c] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Dashboard calculations
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const outOfStockProducts = products.filter((p) => !p.inStock || p.stock <= 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.discountPrice ?? p.price) * p.stock, 0);

  // Filtered products for admin table
  const adminFilteredProducts = products.filter((p) => {
    if (adminCategoryFilter !== 'all' && p.categoryId !== adminCategoryFilter) return false;
    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase().trim();
      return p.name.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q);
    }
    return true;
  });

  // Handle opening product modal for create/edit
  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        slug: product.slug,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice ?? '',
        stock: product.stock,
        inStock: product.inStock,
        featured: product.featured,
        badge: product.badge || '',
        craftType: product.craftType || '',
        imagesText: product.images.join('\n'),
      });
    } else {
      setEditingProduct(null);
      const defaultCategory = categories[0] || { id: 'cat-resin', name: 'Resin Art Supplies' };
      setProductForm({
        name: '',
        slug: '',
        categoryId: defaultCategory.id,
        categoryName: defaultCategory.name,
        description: '',
        price: 500,
        discountPrice: '',
        stock: 15,
        inStock: true,
        featured: false,
        badge: 'New',
        craftType: 'Craft Material',
        imagesText: '/src/assets/images/hero_art_craft_workspace_1793820211229.jpg',
      });
    }
    setIsProductModalOpen(true);
  };

  // Save product (create or edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      addToast('Product name is required.', 'error');
      return;
    }

    const category = categories.find((c) => c.id === productForm.categoryId) || categories[0];
    const imageList = productForm.imagesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const generatedSlug =
      productForm.slug.trim() ||
      productForm.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const priceNum = Number(productForm.price) || 0;
    const discountNum =
      productForm.discountPrice === '' || productForm.discountPrice === undefined
        ? undefined
        : Number(productForm.discountPrice);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: productForm.name.trim(),
        slug: generatedSlug,
        categoryId: category.id,
        categoryName: category.name,
        description: productForm.description.trim(),
        price: priceNum,
        discountPrice: discountNum,
        stock: Number(productForm.stock),
        inStock: productForm.inStock && Number(productForm.stock) > 0,
        featured: productForm.featured,
        badge: productForm.badge.trim() || undefined,
        craftType: productForm.craftType.trim() || undefined,
        images: imageList.length > 0 ? imageList : ['/src/assets/images/hero_art_craft_workspace_1793820211229.jpg'],
      });
    } else {
      addProduct({
        name: productForm.name.trim(),
        slug: generatedSlug,
        categoryId: category.id,
        categoryName: category.name,
        description: productForm.description.trim(),
        price: priceNum,
        discountPrice: discountNum,
        stock: Number(productForm.stock),
        inStock: productForm.inStock && Number(productForm.stock) > 0,
        featured: productForm.featured,
        badge: productForm.badge.trim() || undefined,
        craftType: productForm.craftType.trim() || undefined,
        images: imageList.length > 0 ? imageList : ['/src/assets/images/hero_art_craft_workspace_1793820211229.jpg'],
      });
    }

    setIsProductModalOpen(false);
  };

  // Image upload with client-side canvas compression
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 800;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setProductForm((prev) => ({
            ...prev,
            imagesText: compressedDataUrl + (prev.imagesText ? '\n' + prev.imagesText : ''),
          }));
          addToast('Compressed image added to product list!', 'success');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle open category modal
  const handleOpenCategoryModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        slug: '',
        description: '',
        image: '/src/assets/images/hero_art_craft_workspace_1793820211229.jpg',
      });
    }
    setIsCategoryModalOpen(true);
  };

  // Save category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    const generatedSlug =
      categoryForm.slug.trim() ||
      categoryForm.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: categoryForm.name.trim(),
        slug: generatedSlug,
        description: categoryForm.description.trim(),
        image: categoryForm.image.trim(),
      });
    } else {
      addCategory({
        name: categoryForm.name.trim(),
        slug: generatedSlug,
        description: categoryForm.description.trim(),
        image: categoryForm.image.trim(),
      });
    }

    setIsCategoryModalOpen(false);
  };

  const copySqlSchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    addToast('Supabase SQL schema copied to clipboard!', 'success');
  };

  // Hero Banner state & handlers
  const [bannerForm, setBannerForm] = useState({
    imageUrl: heroBanner.imageUrl,
    title: heroBanner.title,
    subtitle: heroBanner.subtitle,
    ctaText: heroBanner.ctaText,
  });

  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size should be less than 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setBannerForm((prev) => ({ ...prev, imageUrl: base64Url }));
      addToast('Banner image loaded. Remember to click "Save Banner Settings".', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.imageUrl.trim()) {
      addToast('Hero banner image is required.', 'error');
      return;
    }
    updateHeroBanner({
      imageUrl: bannerForm.imageUrl.trim(),
      title: bannerForm.title.trim() || 'Where Art Meets Craft',
      subtitle: bannerForm.subtitle.trim() || 'Curated art & DIY craft essentials for passionate makers across Bangladesh.',
      ctaText: bannerForm.ctaText.trim() || 'Explore Collection',
    });
  };

  const handleResetBanner = () => {
    resetHeroBanner();
    setBannerForm({
      imageUrl: '/src/assets/images/hero_tulips_craft_workspace_1793821760325.jpg',
      title: 'Where Art Meets Craft',
      subtitle: 'Curated art & DIY craft essentials for passionate makers across Bangladesh.',
      ctaText: 'Explore Collection',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Admin Bar */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-[#0B6A75] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900 font-heading">
              Dhaka Art Nook — Store Admin
            </h1>
            <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Firestore Cloud Connected · {currentUser?.email || 'Store Admin'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
>
          <button
            onClick={resetToDemoData}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset catalog to authentic default items"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={() => navigateTo('home')}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Store</span>
          </button>

          <button
            onClick={signOutUser}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Admin Tab Selector */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-stone-200 pb-2 scrollbar-none">
        <button
          onClick={() => setAdminTab('dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            adminTab === 'dashboard'
              ? 'bg-[#0B6A75] text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setAdminTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            adminTab === 'products'
              ? 'bg-[#0B6A75] text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products ({products.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            adminTab === 'categories'
              ? 'bg-[#0B6A75] text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            adminTab === 'orders'
              ? 'bg-[#0B6A75] text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('banner')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            adminTab === 'banner'
              ? 'bg-[#0B6A75] text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Hero Banner</span>
        </button>

        <button
          onClick={() => setAdminTab('database')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            adminTab === 'database'
              ? 'bg-[#0B6A75] text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Supabase SQL Schema</span>
        </button>
      </div>

      {/* TAB 1: DASHBOARD */}
      {adminTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-xs text-stone-500 font-medium">Total Products</div>
              <div className="text-2xl font-extrabold text-stone-900 font-tabular mt-1">
                {totalProducts}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-medium">
                {products.filter((p) => p.inStock).length} in stock
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-xs text-stone-500 font-medium">Craft Categories</div>
              <div className="text-2xl font-extrabold text-stone-900 font-tabular mt-1">
                {totalCategories}
              </div>
              <div className="text-[11px] text-stone-400 mt-1">Resin, Blocks, Wax, Paints</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-xs text-stone-500 font-medium">Out of Stock Alerts</div>
              <div className={`text-2xl font-extrabold font-tabular mt-1 ${outOfStockProducts.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {outOfStockProducts.length}
              </div>
              <div className="text-[11px] text-stone-400 mt-1">
                {outOfStockProducts.length > 0 ? 'Needs supplier restock' : 'Inventory healthy'}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-xs text-stone-500 font-medium">Total Catalog Value</div>
              <div className="text-2xl font-extrabold text-[#0B6A75] font-tabular mt-1">
                ৳{totalInventoryValue.toLocaleString()}
              </div>
              <div className="text-[11px] text-stone-400 mt-1">At retail stock valuation</div>
            </div>
          </div>

          {/* Low Stock Alerts */}
          {outOfStockProducts.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>Out of Stock Attention</span>
              </div>
              <div className="divide-y divide-rose-100">
                {outOfStockProducts.map((p) => (
                  <div key={p.id} className="py-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-rose-950">{p.name}</span>
                    <button
                      onClick={() => handleOpenProductModal(p)}
                      className="text-xs font-semibold text-[#0B6A75] hover:underline cursor-pointer"
                    >
                      Update Stock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders Preview */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-900 font-heading">
                Recent Orders Received
              </h2>
              <button
                onClick={() => setAdminTab('orders')}
                className="text-xs font-semibold text-[#0B6A75] hover:underline cursor-pointer"
              >
                View all ({orders.length})
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-stone-500 py-4">No customer orders placed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500">
                      <th className="py-2.5 font-semibold">Order Ref</th>
                      <th className="py-2.5 font-semibold">Customer</th>
                      <th className="py-2.5 font-semibold">Area</th>
                      <th className="py-2.5 font-semibold">Total</th>
                      <th className="py-2.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id}>
                        <td className="py-3 font-bold font-tabular text-stone-900">#{o.orderNumber}</td>
                        <td className="py-3">{o.customer.fullName} ({o.customer.phone})</td>
                        <td className="py-3 capitalize">{o.customer.deliveryArea.replace('_', ' ')}</td>
                        <td className="py-3 font-bold font-tabular text-[#0B6A75]">৳{o.grandTotal}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-md font-semibold uppercase text-[10px] ${
                            o.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>


        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {adminTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0B6A75]"
                />
              </div>

              <select
                value={adminCategoryFilter}
                onChange={(e) => setAdminCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleOpenProductModal()}
              className="px-4 py-2.5 bg-[#0B6A75] hover:bg-[#084f57] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500">
                    <th className="py-3 px-4 font-semibold">Product</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Price</th>
                    <th className="py-3 px-4 font-semibold">Stock</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {adminFilteredProducts.map((p) => {
                    const effectivePrice = p.discountPrice ?? p.price;
                    return (
                      <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0] || '/src/assets/images/hero_art_craft_workspace_1793820211229.jpg'}
                              alt={p.name}
                              className="w-10 h-10 object-cover rounded-lg border border-stone-200 bg-stone-50"
                            />
                            <div>
                              <div className="font-bold text-stone-900">{p.name}</div>
                              <div className="text-[10px] text-stone-400 font-mono">{p.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-stone-600">{p.categoryName}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold font-tabular text-stone-900">৳{effectivePrice}</span>
                          {p.discountPrice && (
                            <span className="text-[10px] text-stone-400 line-through ml-1 font-tabular">৳{p.price}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-tabular font-medium">{p.stock} units</td>
                        <td className="py-3 px-4">
                          {p.inStock && p.stock > 0 ? (
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                              In Stock
                            </span>
                          ) : (
                            <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                              Out of Stock
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenProductModal(p)}
                              className="p-1.5 text-stone-500 hover:text-[#0B6A75] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit product"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmation({ type: 'product', id: p.id, title: p.name })}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES MANAGEMENT */}
      {adminTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-stone-900 font-heading">
              Categories Management
            </h2>
            <button
              onClick={() => handleOpenCategoryModal()}
              className="px-4 py-2.5 bg-[#0B6A75] hover:bg-[#084f57] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c) => {
              const productCount = products.filter((p) => p.categoryId === c.id).length;
              return (
                <div key={c.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between">
                  <div className="aspect-16/9 relative overflow-hidden bg-stone-100">
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-stone-900 text-sm">{c.name}</h3>
                      <span className="text-[11px] font-semibold text-[#0B6A75] bg-teal-50 px-2 py-0.5 rounded-md font-tabular">
                        {productCount} items
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-2">{c.description}</p>
                  </div>
                  <div className="p-4 pt-0 flex justify-end gap-2 border-t border-stone-100 mt-2">
                    <button
                      onClick={() => handleOpenCategoryModal(c)}
                      className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium rounded-lg hover:bg-stone-50 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirmation({ type: 'category', id: c.id, title: c.name })}
                      className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-800 font-medium rounded-lg hover:bg-rose-50 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS MANAGEMENT */}
      {adminTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-stone-900 font-heading">
              Customer Orders ({orders.length})
            </h2>
          </div>

          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-stone-100 text-xs">
                  <div>
                    <span className="font-bold text-stone-900 font-tabular text-sm">#{o.orderNumber}</span>
                    <span className="text-stone-400 ml-2">
                      {new Date(o.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold font-tabular text-sm text-[#0B6A75]">
                      ৳{o.grandTotal} BDT
                    </span>
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                      className="px-2.5 py-1 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="font-semibold text-stone-800">Customer:</div>
                    <div className="text-stone-700">{o.customer.fullName} · {o.customer.phone}</div>
                    <div className="text-stone-500 mt-1">{o.customer.address}</div>
                    <div className="text-[#0B6A75] font-medium mt-0.5">
                      {o.customer.deliveryArea === 'inside_dhaka' ? 'Inside Dhaka (৳80)' : 'Outside Dhaka (৳130)'}
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold text-stone-800">Ordered Items:</div>
                    <div className="space-y-1 mt-1">
                      {o.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-stone-600">
                          <span>{item.quantity}× {item.productName}</span>
                          <span className="font-tabular font-medium">৳{item.lineTotal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: HERO BANNER SETTINGS */}
      {adminTab === 'banner' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-5 border-b border-stone-100">
              <div>
                <h2 className="text-xl font-bold text-stone-900 font-heading flex items-center gap-2.5">
                  <ImageIcon className="w-5 h-5 text-[#0B6A75]" />
                  <span>Homepage Hero Banner Settings</span>
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Customize the main hero image, headline, description, and CTA button seen by all visitors.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetBanner}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset to Default</span>
                </button>
              </div>
            </div>

            {/* Live Interactive Preview Card */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Live Preview (How it appears on Homepage)
                </span>
                <span className="text-[11px] text-stone-400">Desktop &amp; Mobile Responsive</span>
              </div>

              <div className="p-6 sm:p-8 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-7 space-y-3">
                    <h3 className="text-2xl sm:text-3xl font-black text-stone-900 font-heading leading-tight">
                      {bannerForm.title || 'Where Art Meets Craft'}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 line-clamp-3">
                      {bannerForm.subtitle || 'Curated art & DIY craft essentials for passionate makers across Bangladesh.'}
                    </p>
                    <div>
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#005C6E] text-white text-xs font-bold rounded-xl shadow-xs">
                        {bannerForm.ctaText || 'Explore Collection'}
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-5">
                    <div className="aspect-16/10 rounded-2xl overflow-hidden shadow-md border border-stone-200 bg-stone-200">
                      <img
                        src={bannerForm.imageUrl || '/src/assets/images/hero_tulips_craft_workspace_1793821760325.jpg'}
                        alt="Hero Banner Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/src/assets/images/hero_tulips_craft_workspace_1793821760325.jpg';
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner Settings Form */}
            <form onSubmit={handleSaveBanner} className="space-y-6 pt-2">
              {/* Image Input Options */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-800 block">
                  Hero Banner Image <span className="text-rose-500">*</span>
                </label>

                {/* Local Device Upload Button */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <label className="px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>Upload Image from Phone / Computer</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerFileUpload}
                      className="hidden"
                    />
                  </label>

                  <span className="text-xs text-stone-400 text-center sm:text-left">or enter direct image URL below:</span>
                </div>

                {/* Direct Image URL input */}
                <input
                  type="text"
                  required
                  value={bannerForm.imageUrl}
                  onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                  placeholder="https://... or /src/assets/images/... or uploaded base64 data"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B6A75]"
                />
              </div>

              {/* Preset Gallery Choices */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 block">
                  Or pick from curated studio presets:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {[
                    {
                      name: 'Pastel Tulips & Studio',
                      url: '/src/assets/images/hero_tulips_craft_workspace_1793821760325.jpg',
                    },
                    {
                      name: 'Artisan Workshop & Resin',
                      url: '/src/assets/images/hero_art_craft_workspace_1793820211229.jpg',
                    },
                    {
                      name: 'Hand-Carved Block Prints',
                      url: '/src/assets/images/product_block_print_set_1793820211690.jpg',
                    },
                    {
                      name: 'Artist Paints & Canvases',
                      url: '/src/assets/images/product_oil_gouache_paints_1793820213139.jpg',
                    },
                    {
                      name: 'Handmade Soap & Candle Wax',
                      url: '/src/assets/images/product_soap_candle_wax_1793820212032.jpg',
                    },
                  ].map((preset, idx) => {
                    const isSelected = bannerForm.imageUrl === preset.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setBannerForm({ ...bannerForm, imageUrl: preset.url })}
                        className={`group p-2 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-2 ${
                          isSelected
                            ? 'border-[#0B6A75] bg-teal-50/40 shadow-xs ring-2 ring-[#0B6A75]/20'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="aspect-16/10 rounded-xl overflow-hidden bg-stone-100">
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-stone-800 line-clamp-1">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title, Subtitle, and CTA Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Hero Main Title / Headline</label>
                  <input
                    type="text"
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    placeholder="Where Art Meets Craft"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6A75]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">CTA Button Text</label>
                  <input
                    type="text"
                    value={bannerForm.ctaText}
                    onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })}
                    placeholder="Explore Collection"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6A75]"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-stone-700">Hero Subtitle / Description</label>
                  <textarea
                    rows={2}
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                    placeholder="Curated art & DIY craft essentials for passionate makers across Bangladesh."
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6A75]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#0B6A75] hover:bg-[#084f57] active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Banner Settings</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: DATABASE & SUPABASE SQL SCHEMA */}
      {adminTab === 'database' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-heading">
                Supabase &amp; PostgreSQL Database Schema
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Complete SQL schema, foreign keys, trigram indexes, Row Level Security (RLS) policies, and seed statements.
              </p>
            </div>
            <button
              onClick={copySqlSchema}
              className="px-4 py-2 bg-[#0B6A75] hover:bg-[#084f57] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy SQL Script</span>
            </button>
          </div>

          <div className="relative">
            <pre className="bg-stone-900 text-stone-200 text-xs p-5 rounded-2xl overflow-x-auto font-mono max-h-96 leading-relaxed">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        </div>
      )}

      {/* PRODUCT ADD/EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-lg font-heading">
                {editingProduct ? 'Edit Product' : 'Add New Craft Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Product Title *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Ultra-Clear 2:1 Epoxy Resin Art Kit (1500ml)"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Category *</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => {
                      const cat = categories.find((c) => c.id === e.target.value);
                      setProductForm({
                        ...productForm,
                        categoryId: e.target.value,
                        categoryName: cat?.name || '',
                      });
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Craft Type Tag</label>
                  <input
                    type="text"
                    value={productForm.craftType}
                    onChange={(e) => setProductForm({ ...productForm, craftType: e.target.value })}
                    placeholder="e.g. Resin Art, Block Printing, Candle Wax"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Regular Price (৳ BDT) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-tabular"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Discount Price (৳ Optional)</label>
                  <input
                    type="number"
                    min={0}
                    value={productForm.discountPrice}
                    onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                    placeholder="Optional discount"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-tabular"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Stock Count *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        stock: Number(e.target.value),
                        inStock: Number(e.target.value) > 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-tabular"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              {/* Image upload and URLs */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-stone-700">Product Images (URLs or Local Upload)</label>
                  <label className="inline-flex items-center gap-1 text-[#0B6A75] hover:underline cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload &amp; Compress File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={productForm.imagesText}
                  onChange={(e) => setProductForm({ ...productForm, imagesText: e.target.value })}
                  placeholder="One image URL per line"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={productForm.inStock}
                    onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                    className="rounded text-[#0B6A75]"
                  />
                  <span>Mark as In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                    className="rounded text-[#0B6A75]"
                  />
                  <span>Show in Featured Homepage</span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0B6A75] hover:bg-[#084f57] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY ADD/EDIT MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-stone-900 text-base font-heading">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Crystal Resin Art"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Description</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Image URL</label>
                <input
                  type="text"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B6A75] text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 text-base">
              Delete {deleteConfirmation.type === 'product' ? 'Product' : 'Category'}?
            </h3>
            <p className="text-xs text-stone-500">
              Are you sure you want to delete <strong>"{deleteConfirmation.title}"</strong>? This action will remove it from the catalog.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmation.type === 'product') {
                    deleteProduct(deleteConfirmation.id);
                  } else {
                    deleteCategory(deleteConfirmation.id);
                  }
                  setDeleteConfirmation(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
