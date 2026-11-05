import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, Tag } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { products, categories, navigateTo, heroBanner } = useStore();

  // Category filter state specifically for the "All Products" section on the homepage
  const [selectedHomeCategory, setSelectedHomeCategory] = useState<string>('all');

  // 1. New Arrivals: exactly 4 products
  const newArrivals = products.slice(0, 4);

  // 2. Special Offers: exactly 4 products with discount prices
  const specialOffers = products
    .filter((p) => p.discountPrice && p.discountPrice < p.price && p.inStock)
    .slice(0, 4);

  // 3. All Products: filtered by selectedHomeCategory
  const filteredAllProducts = useMemo(() => {
    if (selectedHomeCategory === 'all') {
      return products;
    }
    return products.filter((p) => p.categoryId === selectedHomeCategory);
  }, [products, selectedHomeCategory]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-4 sm:pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 font-heading tracking-tight leading-tight [text-wrap:balance]">
                  {heroBanner.title}
                </h1>
                <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed max-w-lg">
                  {heroBanner.subtitle}
                </p>
              </div>

              {/* Clean CTA Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('all-products');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      navigateTo('shop');
                    }
                  }}
                  className="px-7 py-4 bg-[#005C6E] hover:bg-[#004b5a] active:scale-95 text-white font-bold text-sm rounded-2xl shadow-md flex items-center gap-2.5 transition-all cursor-pointer group"
                >
                  <span>{heroBanner.ctaText}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Media */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-200/90 bg-stone-100 aspect-16/10 sm:aspect-16/9 lg:aspect-4/3 group">
                <img
                  src={heroBanner.imageUrl || '/src/assets/images/hero_tulips_craft_workspace_1793821760325.jpg'}
                  alt={heroBanner.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                />
              </div>

              {/* Subtle ambient glow behind */}
              <div className="absolute -top-6 -right-6 w-48 h-48 bg-[#FFA000]/15 rounded-full blur-3xl pointer-events-none -z-10" />
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-[#008C99]/15 rounded-full blur-3xl pointer-events-none -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. NEW ARRIVALS: Exactly 4 products */}
      <section id="new-arrivals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-stone-200">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-heading">
              New Arrivals
            </h2>
          </div>

          <button
            onClick={() => {
              const el = document.getElementById('all-products');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs font-semibold text-[#005C6E] hover:text-[#008C99] flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 3. SPECIAL OFFERS: Exactly 4 products */}
      <section id="special-offers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#FFA000] flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#FFA000] mb-0.5">
                Limited Time Deals
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-heading">
                Special Offers
              </h2>
            </div>
          </div>
        </div>

        {/* 4 Discount Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {specialOffers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. ALL PRODUCTS: Category chips in a row ("All Products" first and selected by default, then every category) */}
      <section id="all-products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-heading">
              All Products
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Showing {filteredAllProducts.length} of {products.length} craft &amp; art supplies
            </p>
          </div>
        </div>

        {/* Category Chips in a row */}
        <div className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {/* Main "All Products" Chip (Shown First & Selected by Default) */}
            <button
              onClick={() => setSelectedHomeCategory('all')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedHomeCategory === 'all'
                  ? 'bg-[#005C6E] text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              All Products ({products.length})
            </button>

            {/* Individual Craft Categories beside it */}
            {categories.map((cat) => {
              const count = products.filter((p) => p.categoryId === cat.id).length;
              const isSelected = selectedHomeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedHomeCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#005C6E] text-white font-bold shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* All Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredAllProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};
