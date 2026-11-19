import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, MapPin, Tag, Check, Eye } from 'lucide-react';
import { formatUGX } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ item, onToast }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      if (onToast) onToast('Please sign in to add products to your cart.', 'error');
      return;
    }

    try {
      setAdding(true);
      await addToCart(item.id, 1);
      setAdded(true);
      if (onToast) onToast(`"${item.title}" added to your cart!`, 'success');
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      if (onToast) onToast(err.message || 'Could not add to cart', 'error');
    } finally {
      setAdding(false);
    }
  };

  const conditionColors = {
    'New': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Like New': 'bg-blue-100 text-blue-800 border-blue-200',
    'Used': 'bg-amber-100 text-amber-800 border-amber-200'
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      {/* Product Image Container */}
      <Link to={`/products/${item.id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={item.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Condition Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border tracking-wide uppercase shadow-sm ${conditionColors[item.condition_state] || conditionColors['Used']}`}>
            {item.condition_state || 'Used'}
          </span>
        </div>

        {/* Stock Status Badge */}
        {!item.is_available && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              Sold / Unavailable
            </span>
          </div>
        )}

        {/* Quick View Pill */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="flex items-center space-x-1 bg-white/95 text-slate-800 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md backdrop-blur">
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </span>
        </div>
      </Link>

      {/* Card Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        
        {/* Category Pill */}
        <div className="mb-1.5">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center">
            <Tag className="w-3 h-3 mr-1 text-slate-400" />
            <span className="truncate">{item.category}</span>
          </span>
        </div>

        {/* Title */}
        <Link to={`/products/${item.id}`} className="block mb-2">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-brand-blue transition-colors line-clamp-2">
            {item.title}
          </h3>
        </Link>

        {/* Seller Info & Residence */}
        <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mb-3">
          <span className="font-medium text-slate-700 truncate max-w-[130px]">
            {item.seller_name || 'UCU Student'}
          </span>
          <span className="flex items-center text-[11px] text-slate-400 truncate max-w-[120px]">
            <MapPin className="w-3 h-3 mr-0.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{item.seller_residence || 'UCU Mukono'}</span>
          </span>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Price</span>
            <span className="text-base sm:text-lg font-black text-brand-blue tracking-tight">
              {formatUGX(item.price)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!item.is_available || adding}
            className={`p-2.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm ${
              !item.is_available
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-navy-900 hover:bg-brand-orange text-white hover:shadow-md'
            }`}
            title="Add to Shopping Cart"
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Add to Cart</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
