import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Filter, 
  Search, 
  SlidersHorizontal, 
  RotateCcw, 
  Tag, 
  ArrowUpDown, 
  ChevronRight,
  PackageX
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api, formatUGX } from '../services/api';

const CATEGORIES = [
  'All',
  'Textbooks and Academic Materials',
  'Electronics and Gadgets',
  'Clothing and Fashion',
  'Furniture and Accommodation Items',
  'Sports and Fitness',
  'Other Campus Essentials'
];

const CONDITIONS = ['All', 'New', 'Like New', 'Used'];

export default function Products({ onToast }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter States
  const categoryParam = searchParams.get('category') || 'All';
  const searchParam = searchParams.get('search') || '';
  const conditionParam = searchParams.get('condition') || 'All';
  const sortParam = searchParams.get('sort') || 'newest';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  const [searchInput, setSearchInput] = useState(searchParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const params = {};
        if (categoryParam !== 'All') params.category = categoryParam;
        if (searchParam) params.search = searchParam;
        if (conditionParam !== 'All') params.condition_state = conditionParam;
        if (sortParam) params.sort = sortParam;
        if (minPriceParam) params.minPrice = minPriceParam;
        if (maxPriceParam) params.maxPrice = maxPriceParam;

        const res = await api.getItems(params);
        if (res.success) {
          setItems(res.items || []);
        }
      } catch (err) {
        if (onToast) onToast('Failed to load marketplace listings.', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [categoryParam, searchParam, conditionParam, sortParam, minPriceParam, maxPriceParam]);

  const updateFilter = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val && val !== 'All') {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('search', searchInput.trim());
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (minPrice) next.set('minPrice', minPrice);
    else next.delete('minPrice');
    if (maxPrice) next.set('maxPrice', maxPrice);
    else next.delete('maxPrice');
    setSearchParams(next);
  };

  const resetFilters = () => {
    setSearchInput('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Breadcrumb / Title Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            UniTrade Campus Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse authentic second-hand student gear across Uganda Christian University Mukono campus
          </p>
        </div>

        {/* Top Controls: Search & Sort */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="relative">
            <select
              value={sortParam}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-blue shadow-sm"
            >
              <option value="newest">Sort: Recently Added</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filter Panel */}
        <aside className={`lg:block ${showMobileFilters ? 'block' : 'hidden'} lg:col-span-1 space-y-6`}>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            
            {/* Search Input Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Search Keyword
              </label>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="e.g. Java, HP, Blazer..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </form>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                Categories
              </label>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => {
                  const isActive = categoryParam === cat || (cat === 'All' && !categoryParam);
                  return (
                    <button
                      key={cat}
                      onClick={() => updateFilter('category', cat)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                        isActive
                          ? 'bg-brand-blue text-white font-bold shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Condition Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                Item Condition
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {CONDITIONS.map((cond) => {
                  const isActive = conditionParam === cond || (cond === 'All' && !conditionParam);
                  return (
                    <button
                      key={cond}
                      onClick={() => updateFilter('condition', cond)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cond}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter (UGX) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Price Range (UGX)
              </label>
              <form onSubmit={handlePriceApply} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min UGX"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  />
                  <input
                    type="number"
                    placeholder="Max UGX"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors"
                >
                  Apply Price Filter
                </button>
              </form>
            </div>

            {/* Reset Filters */}
            <button
              onClick={resetFilters}
              className="w-full py-2 flex items-center justify-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>

          </div>
        </aside>

        {/* Main Product Grid */}
        <main className="lg:col-span-3">
          
          {/* Active Filters Summary */}
          {(searchParam || categoryParam !== 'All' || conditionParam !== 'All' || minPriceParam || maxPriceParam) && (
            <div className="mb-4 flex flex-wrap items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">Active filters:</span>
              {categoryParam !== 'All' && (
                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center space-x-1">
                  <span>{categoryParam}</span>
                  <button onClick={() => updateFilter('category', 'All')} className="hover:text-blue-900 ml-1 font-black">×</button>
                </span>
              )}
              {searchParam && (
                <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 font-bold flex items-center space-x-1">
                  <span>"{searchParam}"</span>
                  <button onClick={() => updateFilter('search', '')} className="hover:text-orange-900 ml-1 font-black">×</button>
                </span>
              )}
              {conditionParam !== 'All' && (
                <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center space-x-1">
                  <span>{conditionParam}</span>
                  <button onClick={() => updateFilter('condition', 'All')} className="hover:text-slate-900 ml-1 font-black">×</button>
                </span>
              )}
            </div>
          )}

          {/* Product Cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {items.map((item) => (
                <ProductCard key={item.id} item={item} onToast={onToast} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto my-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <PackageX className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No matching campus products</h3>
              <p className="text-xs text-slate-500 mb-6">
                We could not find any items matching your selected criteria. Try adjusting your search keyword or clearing the category and price filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm"
              >
                Clear All Filters
              </button>
            </div>
          )}

        </main>

      </div>
    </div>
  );
}
