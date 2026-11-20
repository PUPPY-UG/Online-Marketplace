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
import heroBg from '../assets/hero-bg.jpg';

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
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col justify-center overflow-hidden bg-navy-950 text-white">
      
      {/* Background Image Layer - Shifted so "merry christmas" is clearly visible */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src={heroBg} 
          alt="UniTrade Festive Campus Background" 
          className="w-full h-full object-cover object-[center_35%] filter brightness-95 contrast-105 transform scale-105 translate-y-16 sm:translate-y-24 md:translate-y-28"
        />
        {/* Balanced Dark Vignette Overlay preserving visual identity & providing text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 via-navy-950/30 to-navy-950/80"></div>
        {/* Subtle center highlight */}
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-navy-950/60 pointer-events-none"></div>
      </div>

      {/* Hero Content Section */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* UCU Identification Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/85 border border-white/20 text-xs text-slate-100 mb-6 backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold tracking-wide">Uganda Christian University (UCU) Official Student Marketplace</span>
          </div>

          {/* Main Hero Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight drop-shadow-[0_3px_12px_rgba(0,0,0,0.85)]">
            Buy Smart. Sell Easy. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-orange-400">
              Trade Within Your Campus.
            </span>
          </h1>

          {/* Supporting Welcome Description */}
          <p className="mt-5 text-base sm:text-lg text-slate-100 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
            Welcome to UniTrade, your trusted campus marketplace. Discover affordable textbooks, electronics, clothing and other student essentials or sell items you no longer need.
          </p>

          {/* Prominent Search Bar */}
          <div className="mt-6 max-w-2xl mx-auto">
            <form onSubmit={handleHeroSearch} className="relative flex items-center shadow-2xl rounded-2xl bg-white/95 backdrop-blur-md p-2 border border-white/40">
              <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="What are you looking for today? (e.g. Calculus, HP Laptop, Blazer...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 text-slate-800 text-sm focus:outline-none placeholder-slate-400 font-medium bg-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-blue hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md flex items-center space-x-1.5 flex-shrink-0"
              >
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Four Feature Cards - Ample top spacing so "merry christmas" is 100% visible */}
          <div className="mt-24 sm:mt-32 lg:mt-36 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            
            {/* Card 1: Zero Scams */}
            <div className="bg-slate-900/75 border border-white/15 rounded-2xl p-4 backdrop-blur-md shadow-xl hover:border-brand-orange/60 transition-all hover:bg-slate-900/85">
              <div className="flex items-center space-x-2 text-brand-orange mb-1.5">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">Zero Scams</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Verified student listings replacing chaotic WhatsApp groups.
              </p>
            </div>

            {/* Card 2: Campus Pickup */}
            <div className="bg-slate-900/80 border border-white/15 rounded-2xl p-4 backdrop-blur-md shadow-xl hover:border-blue-400/60 transition-all hover:bg-slate-900/90">
              <div className="flex items-center space-x-2 text-blue-400 mb-1.5">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">Campus Pickup</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Meet at Hamu Mukasa Library or Guild Canteen easily.
              </p>
            </div>

            {/* Card 3: UGX Student Deals */}
            <div className="bg-slate-900/80 border border-white/15 rounded-2xl p-4 backdrop-blur-md shadow-xl hover:border-emerald-400/60 transition-all hover:bg-slate-900/90">
              <div className="flex items-center space-x-2 text-emerald-400 mb-1.5">
                <Coins className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">UGX Student Deals</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Unbeatable prices on used textbooks and hostel items.
              </p>
            </div>

            {/* Card 4: Instant Trade */}
            <div className="bg-slate-900/80 border border-white/15 rounded-2xl p-4 backdrop-blur-md shadow-xl hover:border-purple-400/60 transition-all hover:bg-slate-900/90">
              <div className="flex items-center space-x-2 text-purple-400 mb-1.5">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">Instant Trade</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Fast handover between lectures right on campus.
              </p>
            </div>

          </div>

          {/* Quick Action Navigation Shortcuts */}
          <div className="mt-10 flex flex-wrap justify-center items-center gap-3">
            <Link
              to="/products"
              className="px-6 py-2.5 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-orange-500/25 flex items-center space-x-2"
            >
              <span>Browse All Items</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={isAuthenticated ? (isSeller ? "/seller/products" : "/seller/dashboard") : "/login"}
              className="px-6 py-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-100 border border-white/20 font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center space-x-2 backdrop-blur-md"
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
