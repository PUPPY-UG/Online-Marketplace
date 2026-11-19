import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  MapPin, 
  ArrowLeft, 
  Star, 
  Clock, 
  CheckCircle2, 
  MessageSquarePlus, 
  AlertCircle 
} from 'lucide-react';
import { api, formatUGX } from '../../services/api';
import RatingStars from '../../components/RatingStars';

export default function BuyerOrders({ onToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  // Review Modal State
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getBuyerOrders();
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      if (onToast) onToast('Failed to load your orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleConfirmReceipt = async (orderId) => {
    if (!window.confirm('Have you physically received all items in this order on campus?')) {
      return;
    }

    try {
      const res = await api.updateOrderStatus(orderId, 'Completed');
      if (res.success) {
        if (onToast) onToast('Order marked as Completed! You can now rate the seller.', 'success');
        await loadOrders();
      }
    } catch (err) {
      if (onToast) onToast('Failed to update order.', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      if (onToast) onToast('Please enter your review feedback.', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.submitReview({
        order_id: selectedOrderForReview.id,
        rating,
        comment: comment.trim()
      });

      if (res.success) {
        if (onToast) onToast('Seller review submitted successfully!', 'success');
        setSelectedOrderForReview(null);
        setComment('');
        await loadOrders();
      }
    } catch (err) {
      if (onToast) onToast(err.message || 'Failed to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'All') return true;
    if (filter === 'Active') return o.order_status !== 'Completed' && o.order_status !== 'Cancelled';
    if (filter === 'Completed') return o.order_status === 'Completed';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/buyer/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Purchases & Orders
          </h1>
          <p className="text-xs text-slate-500">
            Track active handovers, confirm receipt of items, and rate your sellers
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-2xl self-start sm:self-auto">
          {['All', 'Active', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center">
          <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading your purchases...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5"
            >
              {/* Order Top Bar */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono font-black text-brand-blue">
                      {order.order_ref}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Handover Point: <strong className="text-slate-700">{order.pickup_location}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                    order.order_status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}>
                    {order.order_status}
                  </span>
                  <Link
                    to={`/order-tracking/${order.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors"
                  >
                    Track Order
                  </Link>
                </div>
              </div>

              {/* Items in this order */}
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded-xl border border-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{item.title}</h4>
                        <p className="text-[11px] text-slate-400">Seller: {item.seller_name}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <span className="text-slate-400 block">Qty: {item.quantity}</span>
                      <span className="font-bold text-slate-900">{formatUGX(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  Total Paid: <strong className="text-sm font-black text-slate-900 ml-1">{formatUGX(order.total_amount)}</strong>
                </div>

                <div className="flex items-center gap-2">
                  {order.order_status === 'Ready for Pickup' && (
                    <button
                      onClick={() => handleConfirmReceipt(order.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                    >
                      Confirm Item Received
                    </button>
                  )}

                  {order.order_status === 'Completed' && (
                    order.review ? (
                      <div className="flex items-center space-x-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>Reviewed ({order.review.rating}/5 Stars)</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedOrderForReview(order)}
                        className="px-4 py-2 bg-brand-orange hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center space-x-1"
                      >
                        <MessageSquarePlus className="w-4 h-4" />
                        <span>Rate & Review Seller</span>
                      </button>
                    )
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No {filter.toLowerCase()} purchases found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any orders matching this filter. Explore campus marketplace listings now!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600"
          >
            Explore Marketplace
          </Link>
        </div>
      )}

      {/* Review Submission Modal Dialog */}
      {selectedOrderForReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Rate Your Campus Seller</h3>
                <p className="text-xs text-slate-400">Order: {selectedOrderForReview.order_ref}</p>
              </div>
              <button
                onClick={() => setSelectedOrderForReview(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                  Select Rating (1 to 5 Stars)
                </label>
                <div className="flex justify-center py-2">
                  <RatingStars rating={rating} onChange={setRating} interactive size="lg" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Review Feedback
                </label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell other UCU students about the item condition, punctuality at the pickup spot, and communication..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-3 bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForReview(null)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
