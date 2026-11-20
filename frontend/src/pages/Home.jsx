import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShieldCheck, 
  MapPin, 
  Coins, 
  Clock, 
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, isSeller } = useAuth();
  const navigate = useNavigate();

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center bg-navy-900 text-white">
      
      {/* Hero Section - Matching the Reference Design Exactly */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 via-navy-800 to-slate-900 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        
        {/* Subtle background glow accents */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-blue/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          
          {/* UCU Identification Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs text-slate-200 mb-6 backdrop-blur shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold tracking-wide">Uganda Christian University (UCU) Official Student Marketplace</span>
          </div>

          {/* Main Hero Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Buy Smart. Sell Easy. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-orange-400">
              Trade Within Your Campus.
            </span>
          </h1>

          {/* Supporting Welcome Description */}
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Welcome to UniTrade, your trusted campus marketplace. Discover affordable textbooks, electronics, clothing and other student essentials or sell items you no longer need.
          </p>

          {/* Prominent Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <form onSubmit={handleHeroSearch} className="relative flex items-center shadow-2xl rounded-2xl bg-white p-2">
              <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="What are you looking for today? (e.g. Calculus, HP Laptop, Blazer...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 text-slate-800 text-sm focus:outline-none placeholder-slate-400 font-medium"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-blue hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md flex items-center space-x-1.5 flex-shrink-0"
              >
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Four Feature Cards */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            
            {/* Card 1: Zero Scams */}
            <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-4 backdrop-blur shadow-sm hover:border-slate-600 transition-colors">
              <div className="flex items-center space-x-2 text-brand-orange mb-1.5">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">Zero Scams</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Verified student listings replacing chaotic WhatsApp groups.
              </p>
            </div>

            {/* Card 2: Campus Pickup */}
            <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-4 backdrop-blur shadow-sm hover:border-slate-600 transition-colors">
              <div className="flex items-center space-x-2 text-blue-400 mb-1.5">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">Campus Pickup</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Meet at Hamu Mukasa Library or Guild Canteen easily.
              </p>
            </div>

            {/* Card 3: UGX Student Deals */}
            <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-4 backdrop-blur shadow-sm hover:border-slate-600 transition-colors">
              <div className="flex items-center space-x-2 text-emerald-400 mb-1.5">
                <Coins className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">UGX Student Deals</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Unbeatable prices on used textbooks and hostel items.
              </p>
            </div>

            {/* Card 4: Instant Trade */}
            <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-4 backdrop-blur shadow-sm hover:border-slate-600 transition-colors">
              <div className="flex items-center space-x-2 text-purple-400 mb-1.5">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">Instant Trade</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Fast handover between lectures right on campus.
              </p>
            </div>

          </div>

          {/* Quick Action Navigation Shortcuts */}
          <div className="mt-10 flex flex-wrap justify-center items-center gap-3">
            <Link
              to="/products"
              className="px-6 py-2.5 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center space-x-2"
            >
              <span>Browse All Items</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={isAuthenticated ? (isSeller ? "/seller/products" : "/seller/dashboard") : "/login"}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4 text-brand-orange" />
              <span>Sell an Item</span>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
