import React, { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { products, categories, navigateTo, heroBanner, setActiveCategoryFilter } = useStore();
  const [selectedHomeCategory, setSelectedHomeCategory] = useState('all');
  const newArrivals = products.slice(0, 4);
  const specialOffers = products.filter((p) => p.discountPrice && p.discountPrice < p.price && p.inStock).slice(0, 4);
  const filteredAllProducts = useMemo(() => selectedHomeCategory === 'all'
    ? products : products.filter((p) => p.categoryId === selectedHomeCategory), [products, selectedHomeCategory]);

  const goToShop = (category = 'all') => {
    setActiveCategoryFilter(category);
    navigateTo('shop');
  };

  return (
    <div className="pb-20">
      <section className="pt-5 sm:pt-9 pb-12 sm:pb-16">
        <div className="page-shell">
          <div className="relative overflow-hidden rounded-[24px] sm:rounded-[30px] bg-[#f2f0e9] min-h-[430px] sm:min-h-[500px] grid lg:grid-cols-2 items-center">
            <div className="relative z-10 px-6 py-10 sm:px-12 lg:px-14 lg:py-16 max-w-2xl">
              <div className="section-kicker mb-4">A thoughtful world of making</div>
              <h1 className="text-[2.45rem] sm:text-5xl lg:text-[3.65rem] font-semibold leading-[1.08] tracking-[-.045em] text-[#173d40]">
                {heroBanner.title || 'Create Something Beautiful.'}
              </h1>
              <p className="mt-5 max-w-md text-sm sm:text-base leading-7 text-[#66716e]">
                {heroBanner.subtitle || 'Discover art and craft essentials selected for curious minds and creative hands.'}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button onClick={() => goToShop()} className="brand-button inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold shadow-sm">
                  {heroBanner.ctaText || 'Explore the collection'} <ArrowRight size={16}/>
                </button>
                <button onClick={() => document.getElementById('shop-by-category')?.scrollIntoView({behavior:'smooth'})} className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-[#31575a] hover:text-[#006673]">
                  Browse categories <ArrowUpRight size={16}/>
                </button>
              </div>
            </div>
            <div className="relative h-[260px] sm:h-[340px] lg:h-full lg:min-h-[500px]">
              <img src={heroBanner.imageUrl || '/assets/hero-art-craft.jpg'} alt="Art and craft materials" className="absolute inset-0 h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }}/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#f2f0e9]/25 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#f2f0e9] lg:via-[#f2f0e9]/10 lg:to-transparent"/>
            </div>
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-[#e6c47d]/40 pointer-events-none"/>
          </div>
        </div>
      </section>

      <section id="shop-by-category" className="page-shell py-8 sm:py-12">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div><div className="section-kicker mb-2">Find your materials</div><h2 className="section-heading">Shop by category</h2></div>
          <button onClick={() => goToShop()} className="text-sm font-semibold text-[#006673] inline-flex items-center gap-1">All categories <ArrowRight size={15}/></button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.slice(0,5).map((cat, index) => (
            <button key={cat.id} onClick={() => goToShop(cat.id)} className="group text-left rounded-2xl border border-[#e9e7e1] bg-white px-4 py-5 sm:p-6 hover:border-[#9dbfc0] hover:shadow-sm transition-all">
              <span className="text-[11px] font-semibold tracking-widest text-[#b17b22]">0{index+1}</span>
              <span className="mt-3 block text-sm sm:text-base font-semibold text-[#263536] group-hover:text-[#006673]">{cat.name}</span>
              <span className="mt-2 block text-xs text-[#828986]">{products.filter(p => p.categoryId === cat.id).length} products</span>
            </button>
          ))}
        </div>
      </section>

      {newArrivals.length > 0 && <section id="new-arrivals" className="page-shell py-10 sm:py-14 scroll-mt-24">
        <div className="flex items-end justify-between mb-6"><div><div className="section-kicker mb-2">Recently added</div><h2 className="section-heading">New arrivals</h2></div><button onClick={() => goToShop()} className="text-sm font-semibold text-[#006673]">View all <ArrowRight className="inline" size={15}/></button></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">{newArrivals.map(p => <ProductCard key={p.id} product={p}/>)}</div>
      </section>}

      {specialOffers.length > 0 && <section id="special-offers" className="py-10 sm:py-14 bg-[#f3f0e7]">
        <div className="page-shell"><div className="flex items-end justify-between mb-6"><div><div className="section-kicker mb-2">Selected offers</div><h2 className="section-heading">Thoughtful finds, special prices</h2></div></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">{specialOffers.map(p => <ProductCard key={p.id} product={p}/>)}</div>
        </div>
      </section>}

      <section id="all-products" className="page-shell py-12 sm:py-16 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6"><div><div className="section-kicker mb-2">Explore the store</div><h2 className="section-heading">Made for your next idea</h2><p className="mt-2 text-sm text-[#78817d]">{filteredAllProducts.length} of {products.length} products</p></div><button onClick={() => goToShop()} className="text-sm font-semibold text-[#006673]">Open full shop <ArrowUpRight className="inline" size={15}/></button></div>
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          <button onClick={() => setSelectedHomeCategory('all')} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold border transition-colors ${selectedHomeCategory==='all'?'bg-[#006673] text-white border-[#006673]':'bg-white text-[#52605d] border-[#e5e5df]'}`}>All products</button>
          {categories.map(cat => <button key={cat.id} onClick={() => setSelectedHomeCategory(cat.id)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold border transition-colors ${selectedHomeCategory===cat.id?'bg-[#006673] text-white border-[#006673]':'bg-white text-[#52605d] border-[#e5e5df]'}`}>{cat.name}</button>)}
        </div>
        {filteredAllProducts.length ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">{filteredAllProducts.map(p => <ProductCard key={p.id} product={p}/>)}</div> : <p className="py-12 text-center text-sm text-[#78817d]">No products in this category yet.</p>}
      </section>
    </div>
  );
};
