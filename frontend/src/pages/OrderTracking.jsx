import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Package, 
  MapPin, 
  User, 
  Phone, 
  CreditCard, 
  ArrowLeft, 
  CheckCircle2, 
  Star, 
  AlertCircle,
  MessageSquarePlus
} from 'lucide-react';
import { api, formatUGX } from '../services/api';
import OrderTimeline from '../components/OrderTimeline';
import RatingStars from '../components/RatingStars';
import { useAuth } from '../context/AuthContext';

export default function OrderTracking({ onToast }) {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [payment, setPayment] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review Form Modal / Box
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Status updating (buyer confirming receipt)
  const [updating, setUpdating] = useState(false);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await api.getOrder(id);
      if (res.success) {
        setOrder(res.order);
        setItems(res.items || []);
        setPayment(res.payment || null);
        setReview(res.review || null);
      }
    } catch (err) {
      if (onToast) onToast('Failed to retrieve order tracking info.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  const handleConfirmReceipt = async () => {
    if (!window.confirm('Have you physically received and inspected all items in this order on campus?')) {
      return;
    }

    try {
      setUpdating(true);
      const res = await api.updateOrderStatus(order.id, 'Completed');
      if (res.success) {
        if (onToast) onToast('Order marked as Completed! Please rate your seller below.', 'success');
        await loadOrderDetails();
        setShowReviewForm(true);
      }
    } catch (err) {
      if (onToast) onToast('Could not complete order.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      if (onToast) onToast('Please write a short review feedback comment.', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.submitReview({
        order_id: order.id,
        rating,
        comment: comment.trim()
      });

      if (res.success) {
        if (onToast) onToast('Review submitted successfully! Thank you.', 'success');
        setShowReviewForm(false);
        await loadOrderDetails();
      }
    } catch (err) {
      if (onToast) onToast(err.message || 'Failed to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500">Tracking campus order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-lg">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Order Not Found</h2>
        <Link to="/buyer/orders" className="px-5 py-2.5 bg-brand-blue text-white text-xs font-bold rounded-xl">
          Back to Orders
        </Link>
      </div>
    );
  }

  const isBuyer = user && user.id === order.buyer_id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/buyer/orders"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </Link>
        <span className="text-xs font-mono font-bold text-slate-400">
          Ref: {order.order_ref}
        </span>
      </div>

      {/* Main Tracking Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold text-brand-orange uppercase tracking-wider">
                Live Order Tracking
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-400">
                {new Date(order.created_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {order.order_ref}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
              order.order_status === 'Completed'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : order.order_status === 'Cancelled'
                ? 'bg-rose-100 text-rose-800 border-rose-200'
                : 'bg-blue-100 text-blue-800 border-blue-200'
            }`}>
              Status: {order.order_status}
            </span>
          </div>
        </div>

        {/* Visual Progression Timeline */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <OrderTimeline currentStatus={order.order_status} />
        </div>

        {/* Action Prompt for Buyer */}
        {isBuyer && order.order_status === 'Ready for Pickup' && (
          <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-emerald-900 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Seller is Waiting at the Pickup Location!</span>
              </h3>
              <p className="text-xs text-emerald-800">
                Meet at: <strong>{order.pickup_location}</strong>. Once you have inspected your items, confirm receipt below to release the transaction.
              </p>
            </div>
            <button
              onClick={handleConfirmReceipt}
              disabled={updating}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex-shrink-0"
            >
              {updating ? 'Updating...' : 'Confirm Receipt & Complete'}
            </button>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Handover Details */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-brand-orange" />
              <span>Campus Handover Location</span>
            </h4>
            <p className="text-slate-700 font-semibold text-sm">
              {order.pickup_location}
            </p>
            {order.notes && (
              <p className="text-slate-500 italic bg-white p-2.5 rounded-xl border border-slate-200">
                "{order.notes}"
              </p>
            )}
            <div className="pt-2 border-t border-slate-200 text-slate-500 space-y-1">
              <p>Buyer: <strong>{order.buyer_name}</strong></p>
              <p>Phone: <strong>{order.buyer_phone}</strong></p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Payment Details (Simulated)</span>
            </h4>
            <div className="flex justify-between">
              <span className="text-slate-500">Method:</span>
              <span className="font-bold text-slate-800">{order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status:</span>
              <span className="font-bold text-emerald-600">{order.payment_status}</span>
            </div>
            {payment && (
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono font-bold text-slate-700">{payment.transaction_ref}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Amount:</span>
              <span className="text-brand-blue">{formatUGX(order.total_amount)}</span>
            </div>
          </div>

        </div>

        {/* Order Items List */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            Purchased Products ({items.length})
          </h3>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-14 h-14 object-cover rounded-xl border border-slate-200"
                  />
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs sm:text-sm">{item.title}</h5>
                    <p className="text-[11px] text-slate-400">
                      Seller: {item.seller_name} ({item.seller_phone || 'UCU'})
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-400 block">Qty: {item.quantity}</span>
                  <span className="font-black text-slate-900">{formatUGX(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="pt-6 border-t border-slate-100">
          {review ? (
            <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Your Submitted Review:</span>
                </span>
                <RatingStars rating={review.rating} size="sm" />
              </div>
              <p className="text-xs text-slate-700 italic">"{review.comment}"</p>
            </div>
          ) : isBuyer && order.order_status === 'Completed' ? (
            <div>
              {!showReviewForm ? (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-colors flex items-center space-x-1.5"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Rate Seller & Write Campus Review</span>
                </button>
              ) : (
                <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">Rate Your Seller</h4>
                    <RatingStars rating={rating} onChange={setRating} interactive size="md" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Review Comments
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Was the item in good condition? Was the seller on time at the campus pickup spot?"
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-blue focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs transition-colors"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
}
