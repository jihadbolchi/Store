import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, SlidersHorizontal, RotateCcw, PackageCheck } from 'lucide-react';

export const ShopView: React.FC = () => {
  const {
    products,
    categories,
    activeCategoryFilter,
    setActiveCategoryFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    inStockOnly,
    setInStockOnly,
  } = useStore();

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (activeCategoryFilter !== 'all' && p.categoryId !== activeCategoryFilter) {
        return false;
      }

      // In stock filter
      if (inStockOnly && (!p.inStock || p.stock <= 0)) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        const matchesCategory = p.categoryName.toLowerCase().includes(query);
        const matchesBadge = p.badge?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCategory && !matchesBadge) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.discountPrice ?? a.price;
      const priceB = b.discountPrice ?? b.price;

      if (sortBy === 'price-asc') {
        return priceA - priceB;
      }
      if (sortBy === 'price-desc') {
        return priceB - priceA;
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      // default: featured first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [products, activeCategoryFilter, inStockOnly, searchQuery, sortBy]);

  const activeCategory = categories.find((c) => c.id === activeCategoryFilter);

  const resetFilters = () => {
    setActiveCategoryFilter('all');
    setSearchQuery('');
    setSortBy('featured');
    setInStockOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#0B6A75] mb-1">
            Artisan Catalog
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 font-heading">
            {activeCategory ? activeCategory.name : 'All Art & Craft Supplies'}
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            {activeCategory
              ? activeCategory.description
              : 'Browse our complete catalog of curated artist materials with doorstep delivery across Bangladesh.'}
          </p>
        </div>

        <div className="text-xs text-stone-500 font-medium">
          Showing <span className="font-bold text-stone-900 font-tabular">{filteredProducts.length}</span> of {products.length} products
        </div>
      </div>

      {/* Control Bar: Search, Category Buttons, and Filters */}
      <div className="space-y-4">
        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search resin, wood blocks, wax, paints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B6A75] transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs cursor-pointer font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Dropdown & In-Stock Switch */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-700 shadow-2xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <label htmlFor="shop-sort" className="font-medium text-stone-500 whitespace-nowrap">Sort:</label>
              <select
                id="shop-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-semibold text-stone-900 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            {/* In-Stock Toggle Button */}
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                inStockOnly
                  ? 'bg-teal-50 border-[#0B6A75] text-[#0B6A75]'
                  : 'bg-white border-stone-300 text-stone-600 hover:text-stone-900'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>In Stock Only</span>
            </button>
          </div>
        </div>

        {/* Category Horizontal Filter Bar (Interactive Buttons) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategoryFilter === 'all'
                ? 'bg-[#0B6A75] text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            All Supplies ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            const isActive = activeCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0B6A75] text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto my-12 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
            <Filter className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-stone-900 font-heading">
            No Supplies Found
          </h3>
          <p className="text-xs text-stone-500">
            We couldn't find any items matching your active filters or search terms. Try clearing filters or searching for resin, blocks, or pigments.
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0B6A75] hover:bg-[#084f57] rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
