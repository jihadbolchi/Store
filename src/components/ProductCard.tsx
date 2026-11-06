import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, ArrowUpRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, viewProductDetail } = useStore();

  const effectivePrice = product.discountPrice ?? product.price;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const [imageFailed, setImageFailed] = useState(false);
  const primaryImage = product.images.find((image) => typeof image === 'string' && image.trim().length > 0);



  return (
    <div
      onClick={() => viewProductDetail(product)}
      role="button"
      tabIndex={0}
      aria-label={`View ${product.name}`}
      onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); viewProductDetail(product); } }}
      className="group relative bg-white border border-[#e9e7e1] rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006673] flex flex-col cursor-pointer"
    >
      {/* Image Container with Aspect Ratio */}
      <div className="relative aspect-square sm:aspect-4/3 w-full overflow-hidden bg-stone-50">
        {primaryImage && !imageFailed ? (
          <img src={primaryImage} alt={product.name} loading="lazy" decoding="async" sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 22vw" referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="product-image-fallback"><div className="text-center px-3"><span className="block text-2xl mb-2">✳</span><span className="text-xs font-medium">Image unavailable</span></div></div>
        )}

        {/* Subtle Tag Overlay (Max 1 subtle tag per design constitution) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {product.badge && (
            <span className="bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md shadow-xs">
              {product.badge}
            </span>
          )}
          {!product.inStock && (
            <span className="bg-rose-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-xs">
              Out of Stock
            </span>
          )}
        </div>

        {/* Discount Tag */}
        {hasDiscount && product.inStock && (
          <div className="absolute top-2.5 right-2.5 bg-[#fff0cc] text-[#85570a] text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs font-tabular">
            Save {discountPercent}%
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 flex justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-[#006673] shadow-sm">View details <ArrowUpRight size={14}/></span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category kicker */}
          <div className="text-[10px] font-semibold tracking-[.12em] uppercase text-[#8a918e] mb-1">
            {product.categoryName}
          </div>

          {/* Product Title */}
          <h3 className="text-[13px] sm:text-sm font-semibold text-[#202525] line-clamp-2 leading-snug group-hover:text-[#006673] transition-colors min-h-[2.4rem]">
            {product.name}
          </h3>
        </div>

        {/* Price & Action Row */}
        <div className="mt-3 pt-3 border-t border-[#f0efeb] flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-bold text-stone-900 font-tabular">
                ৳{effectivePrice}
              </span>
              {hasDiscount && (
                <span className="text-xs text-stone-400 line-through font-tabular">
                  ৳{product.price}
                </span>
              )}
            </div>
            <div className="text-[10px] text-[#858d88]">
              {product.inStock ? `${product.stock} in stock` : 'Restocking soon'}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            disabled={!product.inStock}
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1, true);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              product.inStock
                ? 'bg-[#006673] text-white hover:bg-[#00545f] active:scale-95'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
