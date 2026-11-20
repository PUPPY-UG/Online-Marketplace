import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Search, 
  User, 
  LogOut, 
  Shield, 
  Store, 
  LayoutDashboard, 
  Menu, 
  X,
  ChevronDown,
  Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ucuLogo from '../assets/ucu-logo.png';

export default function Navbar() {
  const { user, isAuthenticated, isBuyer, isSeller, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-navy-900 text-white shadow-md">
      {/* Top Notice Bar */}
      <div className="bg-navy-800 text-slate-300 text-xs py-1.5 px-4 border-b border-navy-700">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-200">Uganda Christian University (UCU)</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">Course: MGT3151 E-Commerce MVP</span>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span className="text-amber-400 font-medium">Safe Campus Trading: Meet in public places (Library, Canteen)</span>
            <Link to="/products" className="text-blue-400 hover:text-blue-300 font-semibold underline">
              Browse All Items
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden border border-white/20">
              <img src={ucuLogo} alt="Uganda Christian University Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">Uni<span className="text-brand-orange">Trade</span></span>
                <span className="text-[10px] bg-brand-blue/30 text-blue-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">UCU</span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider font-medium">Campus Marketplace</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search textbooks, electronics, clothing, hostel items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-24 py-2.5 rounded-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-slate-900 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 px-4 py-1.5 rounded-full bg-brand-blue hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right Navigation Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Marketplace Explorer */}
            <Link
              to="/products"
              className="hidden lg:flex items-center space-x-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              <span>Explore</span>
            </Link>

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center group"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-200" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-orange text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-navy-900 shadow-md animate-bounce">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Profile or Guest Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 pl-2.5 pr-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden xl:block text-left text-xs leading-tight">
                    <p className="font-semibold text-white truncate max-w-[120px]">{user?.full_name}</p>
                    <p className="text-[10px] text-brand-orange font-bold uppercase">{user?.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-white text-slate-800 shadow-2xl py-2 border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-blue-100 text-blue-700">
                          {user?.role}
                        </span>
                        <span className="text-xs text-slate-500 truncate">
                          📍 {user?.campus_residence || 'UCU Mukono'}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      {isBuyer && (
                        <>
                          <Link
                            to="/buyer/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <LayoutDashboard className="w-4 h-4 mr-2.5 text-blue-600" />
                            Buyer Dashboard
                          </Link>
                          <Link
                            to="/buyer/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Package className="w-4 h-4 mr-2.5 text-blue-600" />
                            My Orders & Purchases
                          </Link>
                        </>
                      )}

                      {isSeller && (
                        <>
                          <Link
                            to="/seller/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-brand-orange"
                          >
                            <Store className="w-4 h-4 mr-2.5 text-brand-orange" />
                            Seller Dashboard
                          </Link>
                          <Link
                            to="/seller/products"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-brand-orange"
                          >
                            <Package className="w-4 h-4 mr-2.5 text-brand-orange" />
                            Manage My Listings
                          </Link>
                        </>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-600"
                        >
                          <Shield className="w-4 h-4 mr-2.5 text-purple-600" />
                          Administrator Dashboard
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-brand-orange hover:bg-orange-600 text-white shadow-md transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search and Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-navy-800 space-y-3">
            <form onSubmit={handleSearch} className="px-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </form>

            <div className="flex flex-col space-y-1 pt-2">
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
              >
                Browse Marketplace
              </Link>
              {isAuthenticated ? (
                <>
                  {isBuyer && (
                    <Link
                      to="/buyer/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
                    >
                      Buyer Dashboard
                    </Link>
                  )}
                  {isSeller && (
                    <Link
                      to="/seller/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
                    >
                      Seller Dashboard
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-left px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-slate-800"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="pt-2 flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-semibold rounded-lg bg-slate-800 text-slate-200 border border-slate-700"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-semibold rounded-lg bg-brand-orange text-white"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
