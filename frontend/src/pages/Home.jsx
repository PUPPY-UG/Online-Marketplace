import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  Laptop, 
  Shirt, 
  Home as HomeIcon, 
  Dumbbell, 
  Package, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Coins, 
  MapPin, 
  Sparkles,
  Users
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Home({ onToast }) {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, isSeller } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [featRes, recRes] = await Promise.all([
          api.getFeaturedItems(),
          api.getRecentItems()
        ]);
        if (featRes.success) setFeaturedItems(featRes.items || []);
        if (recRes.success) setRecentItems(recRes.items || []);
      } catch (err) {
        console.warn('Failed to load homepage data:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    {
      name: 'Textbooks and Academic Materials',
      label: 'Textbooks & Books',
      icon: BookOpen,
      count: '4+ Titles',
      color: 'from-blue-600 to-indigo-600',
      bgLight: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
    },
    {
      name: 'Electronics and Gadgets',
      label: 'Electronics & Laptops',
      icon: Laptop,
      count: 'Laptops, Calc & Tech',
      color: 'from-cyan-600 to-blue-600',
      bgLight: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
    },
    {
      name: 'Clothing and Fashion',
      label: 'Fashion & Wear',
      icon: Shirt,
      count: 'Jackets & Blazers',
      color: 'from-purple-600 to-pink-600',
      bgLight: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
    },
    {
      name: 'Furniture and Accommodation Items',
      label: 'Hostel & Furniture',
      icon: HomeIcon,
      count: 'Beds, Desks & Stoves',
      color: 'from-amber-600 to-orange-600',
      bgLight: 'bg-amber-50 text-amber-700 hover:bg-amber-100'
    },
    {
      name: 'Sports and Fitness',
      label: 'Sports & Fitness',
      icon: Dumbbell,
      count: 'Boots & Gym Gear',
      color: 'from-emerald-600 to-teal-600',
      bgLight: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
    },
    {
      name: 'Other Campus Essentials',
      label: 'Campus Essentials',
      icon: Package,
      count: 'Kettles & Bags',
      color: 'from-rose-600 to-red-600',
      bgLight: 'bg-rose-50 text-rose-700 hover:bg-rose-100'
    }
  ];

  return (
    <div className="space-y-14 sm:space-y-20">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 via-navy-800 to-slate-900 text-white pt-12 pb-20 sm:pt-20 sm:pb-28">
        
        {/* Background glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* UCU Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-200 mb-6 backdrop-blur">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold">Uganda Christian University (UCU) Official Student Marketplace</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Buy Smart. Sell Easy. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-orange-400">
              Trade Within Your Campus.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Welcome to UniTrade, your trusted campus marketplace. Discover affordable textbooks, electronics, clothing and other student essentials or sell items you no longer need.
          </p>

          {/* Prominent Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <form onSubmit={handleHeroSearch} className="relative flex items-center shadow-2xl rounded-2xl bg-white p-2">
              <Search className="w-5 h-5 text-slate-400 ml-3" />
              <input
                type="text"
                placeholder="What are you looking for today? (e.g. Calculus, HP Laptop, Blazer...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 text-slate-800 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-blue hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md flex items-center space-x-1.5 flex-shrink-0"
              >
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 backdrop-blur">
              <div className="flex items-center space-x-2 text-brand-orange mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Zero Scams</span>
              </div>
              <p className="text-xs text-slate-300">Verified student listings replacing chaotic WhatsApp groups.</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 backdrop-blur">
              <div className="flex items-center space-x-2 text-blue-400 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Campus Pickup</span>
              </div>
              <p className="text-xs text-slate-300">Meet at Hamu Mukasa Library or Guild Canteen easily.</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 backdrop-blur">
              <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                <Coins className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">UGX Student Deals</span>
              </div>
              <p className="text-xs text-slate-300">Unbeatable prices on used textbooks and hostel items.</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 backdrop-blur">
              <div className="flex items-center space-x-2 text-purple-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Instant Trade</span>
              </div>
              <p className="text-xs text-slate-300">Fast handover between lectures right on campus.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Product Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-orange block">
              Campus Departments
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Explore by Category
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold text-brand-blue hover:text-blue-700 flex items-center space-x-1"
          >
            <span>All Items</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-brand-blue transition-colors line-clamp-1">
                  {cat.label}
                </h3>
                <span className="text-[11px] text-slate-400 mt-1">
                  {cat.count}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-1.5 text-brand-blue font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Handpicked Deals</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Campus Items
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold text-brand-blue hover:text-blue-700 flex items-center space-x-1"
          >
            <span>See more</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 h-80 animate-pulse"></div>
            ))}
          </div>
        ) : featuredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredItems.map(item => (
              <ProductCard key={item.id} item={item} onToast={onToast} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <p className="text-slate-500 text-sm">No featured items listed currently.</p>
          </div>
        )}
      </section>

      {/* 4. Seller Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-navy-900 via-blue-900 to-indigo-900 text-white p-8 sm:p-12 shadow-2xl">
          <div className="max-w-2xl relative z-10">
            <span className="px-3 py-1 rounded-full bg-brand-orange text-white text-xs font-extrabold uppercase tracking-wider mb-4 inline-block">
              For UCU Students
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-4">
              Finished with your semester books or upgrading your laptop?
            </h2>
            <p className="text-slate-200 text-sm sm:text-base mb-6 leading-relaxed">
              Do not let valuable items gather dust in your hostel. List them in 60 seconds on UniTrade and sell directly to fellow students right here in Mukono!
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={isAuthenticated ? (isSeller ? "/seller/products" : "/seller/dashboard") : "/register?role=seller"}
                className="px-6 py-3 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-extrabold text-sm transition-all shadow-lg hover:shadow-orange-500/30 flex items-center space-x-2"
              >
                <span>List an Item Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors border border-white/20 backdrop-blur"
              >
                Explore Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Recently Added Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 block">
              Fresh Arrivals
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Recently Added to UniTrade
            </h2>
          </div>
          <Link
            to="/products?sort=newest"
            className="text-xs sm:text-sm font-bold text-brand-blue hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 h-80 animate-pulse"></div>
            ))}
          </div>
        ) : recentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentItems.map(item => (
              <ProductCard key={item.id} item={item} onToast={onToast} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <p className="text-slate-500 text-sm">No recent items available.</p>
          </div>
        )}
      </section>

    </div>
  );
}
