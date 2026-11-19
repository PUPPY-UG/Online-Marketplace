import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  ShieldCheck, 
  MapPin, 
  ArrowLeft 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatUGX } from '../services/api';

export default function Cart({ onToast }) {
  const { items, totalAmount, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const navigate = useNavigate();

  const handleUpdate = async (id, newQty) => {
    try {
      await updateQuantity(id, newQty);
    } catch (err) {
      if (onToast) onToast('Failed to update quantity.', 'error');
    }
  };

  const handleRemove = async (id, title) => {
    try {
      await removeFromCart(id);
      if (onToast) onToast(`Removed "${title}" from cart.`, 'info');
    } catch (err) {
      if (onToast) onToast('Failed to remove item.', 'error');
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500">Loading your cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-16 px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-20 h-20 bg-blue-50 text-brand-blue rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Cart is Empty</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            You haven't added any campus items to your shopping cart yet. Browse our marketplace to find great textbooks, electronics, and hostel essentials!
          </p>
          <div className="pt-4">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-brand-blue hover:bg-blue-600 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Review your selected university items before campus pickup checkout
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'}
                  alt={item.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-slate-100 flex-shrink-0"
                />
                <div className="space-y-1 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange">
                    {item.category}
                  </span>
                  <Link
                    to={`/products/${item.item_id}`}
                    className="font-bold text-slate-900 text-sm hover:text-brand-blue transition-colors line-clamp-1 block"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    Seller: <span className="font-semibold text-slate-700">{item.seller_name}</span>
                  </p>
                  <div className="text-xs font-black text-brand-blue">
                    {formatUGX(item.price)} each
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Total */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => handleUpdate(item.id, item.quantity - 1)}
                    className="p-1.5 px-2.5 text-slate-600 hover:bg-slate-200 font-bold"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-800">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdate(item.id, item.quantity + 1)}
                    className="p-1.5 px-2.5 text-slate-600 hover:bg-slate-200 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[100px]">
                  <span className="text-xs text-slate-400 block font-medium">Subtotal</span>
                  <span className="text-sm font-black text-slate-900">
                    {formatUGX(item.price * item.quantity)}
                  </span>
                </div>

                <button
                  onClick={() => handleRemove(item.id, item.title)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-blue hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Order Summary & Checkout Box */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-lg space-y-6 sticky top-28">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs text-slate-600 border-b border-slate-100 pb-5">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-800">{formatUGX(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Campus Handover / Pickup Fee</span>
                <span className="font-bold text-emerald-600">FREE (In-Person)</span>
              </div>
              <div className="flex justify-between">
                <span>UCU Safety Escrow (Simulation)</span>
                <span className="font-bold text-emerald-600">Included</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-bold text-slate-900">Total Amount:</span>
              <span className="text-2xl font-black text-brand-blue tracking-tight">
                {formatUGX(totalAmount)}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-2xl bg-brand-orange hover:bg-orange-600 text-white font-black text-sm tracking-wide uppercase transition-all shadow-lg hover:shadow-orange-500/30 flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 flex items-start space-x-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>
                All purchases use simulated transactions. No real funds or real Mobile Money PINs required.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
