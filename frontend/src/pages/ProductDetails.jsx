import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  ShieldCheck, 
  ArrowLeft, 
  Star, 
  Tag, 
  Check, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api, formatUGX } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';

export default function ProductDetails({ onToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [sellerStats, setSellerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadItem() {
      try {
        setLoading(true);
        const res = await api.getItem(id);
        if (res.success && res.item) {
          setItem(res.item);
          setSellerStats(res.sellerStats);
        } else {
          setItem(null);
        }
      } catch (err) {
        if (onToast) onToast('Product not found or unavailable.', 'error');
        setItem(null);
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      if (onToast) onToast('Please sign in to add products to your cart.', 'error');
      navigate('/login');
      return;
    }

    if (item.seller_id === user?.id) {
      if (onToast) onToast('You cannot purchase your own listed product.', 'error');
      return;
    }

    try {
      setAdding(true);
      await addToCart(item.id, quantity);
      setAdded(true);
      if (onToast) onToast(`Added ${quantity} x "${item.title}" to cart!`, 'success');
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      if (onToast) onToast(err.message || 'Failed to add item to cart.', 'error');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-medium">Loading campus product details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-lg">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Item Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="px-5 py-2.5 bg-brand-blue text-white text-xs font-bold rounded-xl">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === item.seller_id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left: Large Product Image */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm aspect-[4/3] relative">
            <img
              src={item.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            
            {/* Condition Badge */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-slate-900 text-white shadow-md">
                Condition: {item.condition_state}
              </span>
            </div>

            {/* Availability Overlay */}
            {!item.is_available && (
              <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-rose-600 text-white text-sm font-black px-4 py-2 rounded-full uppercase tracking-wider shadow-xl">
                  Product Sold / Unavailable
                </span>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="mt-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              Product Description
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {item.description}
            </p>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="flex items-center">
                <Tag className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Category: <strong className="ml-1 text-slate-700">{item.category}</strong>
              </span>
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Listed on: <strong className="ml-1 text-slate-700">{new Date(item.created_at).toLocaleDateString()}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Price & Buying Box & Seller Card */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6">
            
            {/* Category tag */}
            <span className="text-[11px] font-bold text-brand-orange uppercase tracking-wider">
              {item.category}
            </span>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {item.title}
            </h1>

            {/* Price in UGX */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs uppercase font-bold text-slate-400 block mb-0.5">Campus Price</span>
              <span className="text-3xl font-black text-brand-blue tracking-tight">
                {formatUGX(item.price)}
              </span>
            </div>

            {/* Stock & Purchase Section */}
            {item.is_available ? (
              <div className="space-y-4 pt-2">
                
                {/* Quantity Selector */}
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-slate-700">Quantity:</span>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-bold text-slate-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  disabled={adding || isOwner}
                  className={`w-full py-3.5 px-6 rounded-2xl text-sm font-extrabold flex items-center justify-center space-x-2 shadow-lg transition-all ${
                    isOwner
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                      : added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-brand-blue hover:bg-blue-600 text-white hover:shadow-blue-500/30'
                  }`}
                >
                  {isOwner ? (
                    <span>Your Own Product Listing</span>
                  ) : added ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Added to Shopping Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>Add to Cart ({formatUGX(item.price * quantity)})</span>
                    </>
                  )}
                </button>

                <Link
                  to="/cart"
                  className="w-full block text-center py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  View Shopping Cart
                </Link>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center">
                <p className="text-xs font-bold text-rose-700">This product has been sold or is currently unavailable.</p>
              </div>
            )}

            {/* Campus Safety Notice */}
            <div className="pt-4 border-t border-slate-100 flex items-start space-x-3 text-xs text-slate-500">
              <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Official UCU Campus Safety:</strong> Always inspect goods in broad daylight at popular campus spots (Library, Tech Park, Dining Hall).
              </span>
            </div>

          </div>

          {/* Seller Information Card */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Seller Information
            </h3>

            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-blue to-indigo-600 flex items-center justify-center text-white font-black text-lg">
                {item.seller_name?.charAt(0) || 'S'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{item.seller_name}</h4>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <RatingStars rating={sellerStats?.averageRating || 5} size="sm" />
                  <span className="text-xs font-bold text-slate-700">
                    {sellerStats?.averageRating || 5.0}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({sellerStats?.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs text-slate-600 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-brand-orange" />
                <span>Residence: <strong>{item.seller_residence || 'UCU Main Campus'}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>Phone: <strong>{item.seller_phone}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>Email: <strong className="text-slate-700">{item.seller_email}</strong></span>
              </div>
            </div>

            {/* Recent Seller Reviews */}
            {sellerStats?.recentReviews && sellerStats.recentReviews.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-[11px] font-bold text-slate-700">Recent Campus Buyer Feedback:</p>
                {sellerStats.recentReviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800">{rev.buyer_name}</span>
                      <RatingStars rating={rev.rating} size="sm" />
                    </div>
                    <p className="text-slate-600 italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
