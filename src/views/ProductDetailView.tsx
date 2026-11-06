import React, { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { DELIVERY_CONFIG } from '../config/delivery';
import {
  ShoppingBag,
  MessageCircle,
  Truck,
  ShieldCheck,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  ZoomIn,
} from 'lucide-react';

export const ProductDetailView: React.FC = () => {
  const {
    selectedProduct,
    addToCart,
    navigateTo,
    products,
    setActiveCategoryFilter,
  } = useStore();

  const product = selectedProduct || products[0];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'delivery'>('details');
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const availableImages = useMemo(
    () => (product?.images || []).filter((image) => typeof image === 'string' && image.trim() && !failedImages.has(image)),
    [product?.images, failedImages]
  );

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-stone-500 text-sm">Product not found.</p>
        <button
          onClick={() => navigateTo('shop')}
          className="mt-4 px-4 py-2 bg-[#0B6A75] text-white text-xs rounded-xl"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const effectivePrice = product.discountPrice ?? product.price;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const currentImage = availableImages[Math.min(selectedImageIndex, Math.max(availableImages.length - 1, 0))] || '';

  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const handleInstantWhatsApp = () => {
    const origin = window.location.origin;
    const productUrl = `${origin}/#product-${product.slug}`;
    const directImageUrl = currentImage.startsWith('/')
      ? `${origin}${currentImage}`
      : currentImage;

    const message = encodeURIComponent(
      `🎨 *DHAKA ART NOOK — DIRECT PRODUCT ORDER*
` +
      `━━━━━━━━━━━━━━━━━━━━━
` +
      `Product: *${product.name}*
` +
      `Quantity: *${quantity}*
` +
      `Unit Price: *৳${effectivePrice}*
` +
      `Estimated Line Total: *৳${effectivePrice * quantity}*
` +
      `Category: ${product.categoryName}
` +
      `🔗 Product Link: ${productUrl}
` +
      `🖼️ Image Preview: ${directImageUrl}
` +
      `━━━━━━━━━━━━━━━━━━━━━
` +
      `Hello! I'd like to order this item directly. Please confirm stock and delivery to my address.`
    );

    window.open(`${DELIVERY_CONFIG.whatsapp.waUrlBase}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-8 sm:space-y-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-500">
        <button
          onClick={() => navigateTo('home')}
          className="hover:text-stone-900 transition-colors cursor-pointer"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button
          onClick={() => {
            setActiveCategoryFilter('all');
            navigateTo('shop');
          }}
          className="hover:text-stone-900 transition-colors cursor-pointer"
        >
          Shop
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button
          onClick={() => {
            setActiveCategoryFilter(product.categoryId);
            navigateTo('shop');
          }}
          className="hover:text-stone-900 transition-colors cursor-pointer"
        >
          {product.categoryName}
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Contiguous Purchase Layout (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery with Interactive Zoom */}
        <div className="lg:col-span-7 space-y-4">
          <div
            onClick={() => currentImage && setIsZoomed(!isZoomed)}
            role={currentImage ? "button" : undefined}
            tabIndex={currentImage ? 0 : undefined}
            onKeyDown={(event) => { if (currentImage && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); setIsZoomed(!isZoomed); } }}
            className={`relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#e9e7e1] bg-white aspect-square sm:aspect-4/3 group transition-all ${
              isZoomed ? 'shadow-xl' : ''
            }`}
          >
            {currentImage ? (
              <>
                <img src={currentImage} alt={product.name} referrerPolicy="no-referrer"
                  onError={() => { setFailedImages((previous) => new Set(previous).add(currentImage)); setSelectedImageIndex(0); setIsZoomed(false); }}
                  className={`w-full h-full object-contain p-3 sm:p-5 transition-transform duration-300 ${isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'}`} />
                <div className="absolute bottom-3 right-3 bg-[#202525]/75 text-white text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 pointer-events-none">
                  <ZoomIn className="w-3.5 h-3.5" /><span>{isZoomed ? 'Tap to reset' : 'Tap to zoom'}</span>
                </div>
              </>
            ) : (
              <div className="product-image-fallback"><div className="text-center px-4"><span className="block text-3xl mb-2">✳</span><span className="text-sm font-medium">Product image coming soon</span></div></div>
            )}

            {product.badge && (
              <div className="absolute top-4 left-4 bg-stone-900 text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-xs">
                {product.badge}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {availableImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {availableImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-18 h-18 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-[#0B6A75] ring-2 ring-[#0B6A75]/20'
                      : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Product view ${idx + 1}`} loading="lazy" onError={() => setFailedImages((previous) => new Set(previous).add(img))} className="w-full h-full object-contain bg-white p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-7 lg:p-8 rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm space-y-5 sm:space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#0B6A75] mb-2">
              <span>{product.categoryName}</span>
              {product.craftType && <span className="text-stone-400">· {product.craftType}</span>}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-heading leading-tight tracking-tight">
              {product.name}
            </h1>
          </div>

          {/* Price & Stock Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-5 border-b border-stone-100">
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 font-tabular">
                  ৳{effectivePrice}
                </span>
                {hasDiscount && (
                  <span className="text-base text-stone-400 line-through font-tabular">
                    ৳{product.price}
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-xs font-bold text-[#FF8F00] bg-amber-50 px-2 py-0.5 rounded-md font-tabular">
                    Save {discountPercent}%
                  </span>
                )}
              </div>
              <div className="text-xs text-stone-500 mt-1">Inclusive of all local VAT / taxes</div>
            </div>

            <div className="text-left sm:text-right">
              {product.inStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{product.stock} in stock</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Quick Description */}
          <p className="text-sm sm:text-[15px] text-stone-600 leading-7">
            {product.description}
          </p>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="pdp-quantity" className="text-xs font-semibold text-stone-700">Quantity:</label>
              <div id="pdp-quantity" role="group" aria-label="Select quantity" className="flex items-center border border-stone-200 rounded-xl bg-white p-1 shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center text-sm font-bold font-tabular">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-stone-500">
                Total: <strong className="font-tabular text-stone-900">৳{effectivePrice * quantity}</strong>
              </span>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 gap-2.5 pt-2">
              <button
                disabled={!product.inStock}
                onClick={() => addToCart(product, quantity, true)}
                className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                  product.inStock
                    ? 'bg-[#0B6A75] hover:bg-[#084f57] text-white active:scale-95'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                disabled={!product.inStock}
                onClick={handleInstantWhatsApp}
                className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                  product.inStock
                    ? 'border border-[#0B6A75]/25 bg-white hover:bg-teal-50 text-[#0B6A75] active:scale-[0.99]'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order on WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Delivery & Trust Strip Inside Module */}
          <div className="bg-stone-50/80 rounded-xl p-4 border border-stone-200 space-y-3 text-xs sm:text-sm text-stone-600">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#0B6A75] shrink-0" />
              <span>
                <strong>৳80</strong> Inside Dhaka Metro (24h) · <strong>৳130</strong> All Districts (48h)
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Direct replacement guarantee for transit breakage or defect</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Specifications & Craft Guidance Tabs */}
      <div className="bg-white rounded-2xl border border-[#e9e7e1] p-5 sm:p-8 space-y-5 sm:space-y-6">
        <div className="flex items-center gap-3 border-b border-[#e9e7e1] pb-3">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2 text-xs sm:text-sm font-bold transition-colors border-b-2 -mb-3.5 cursor-pointer ${
              activeTab === 'details'
                ? 'border-[#006673] text-[#006673]'
                : 'border-transparent text-[#747b79] hover:text-[#202525]'
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-2 text-xs sm:text-sm font-bold transition-colors border-b-2 -mb-3.5 cursor-pointer ${
              activeTab === 'specs'
                ? 'border-[#0B6A75] text-[#0B6A75]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`pb-2 text-xs sm:text-sm font-bold transition-colors border-b-2 -mb-3.5 cursor-pointer ${
              activeTab === 'delivery'
                ? 'border-[#0B6A75] text-[#0B6A75]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            Delivery &amp; Packaging
          </button>
        </div>

        <div className="pt-2 text-sm text-[#555e5b] leading-7">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="divide-y divide-stone-100">
              {product.specifications ? (
                Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="py-2.5 flex justify-between gap-4">
                    <span className="font-medium text-stone-500">{key}</span>
                    <span className="font-semibold text-stone-900 text-right">{value}</span>
                  </div>
                ))
              ) : (
                <p className="py-3 text-stone-500">Specifications are not available for this product yet.</p>
              )}
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-3">
              <p>Delivery charges and estimated times are based on your delivery area:</p>
              <ul className="space-y-2 text-stone-600 text-xs sm:text-sm">
                <li className="flex justify-between gap-4"><span>{DELIVERY_CONFIG.insideDhaka.name}</span><strong className="text-[#202525]">৳{DELIVERY_CONFIG.insideDhaka.fee} · {DELIVERY_CONFIG.insideDhaka.estimatedDelivery}</strong></li>
                <li className="flex justify-between gap-4"><span>{DELIVERY_CONFIG.outsideDhaka.name}</span><strong className="text-[#202525]">৳{DELIVERY_CONFIG.outsideDhaka.fee} · {DELIVERY_CONFIG.outsideDhaka.estimatedDelivery}</strong></li>
              </ul>
              {DELIVERY_CONFIG.freeDeliveryThreshold > 0 && <p className="rounded-xl bg-[#edf5f4] p-3 text-[#006673]">Free delivery on orders of ৳{DELIVERY_CONFIG.freeDeliveryThreshold.toLocaleString('en-BD')} or more.</p>}
              <p className="text-xs text-stone-500">For order or delivery questions, contact us through the WhatsApp order option.</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#202525] font-heading">
              More from {product.categoryName}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
