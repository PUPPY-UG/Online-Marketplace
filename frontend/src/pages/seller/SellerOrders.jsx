import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  PackageCheck, 
  ArrowLeft, 
  AlertCircle 
} from 'lucide-react';
import { api, formatUGX } from '../../services/api';

const STATUS_PROGRESSION = ['Pending', 'Paid', 'Ready for Pickup', 'Completed'];

export default function SellerOrders({ onToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getSellerOrders();
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      if (onToast) onToast('Failed to load incoming seller orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        if (onToast) onToast(`Order status updated to "${newStatus}"!`, 'success');
        await loadOrders();
      }
    } catch (err) {
      if (onToast) onToast('Could not update status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    if (filter === 'All') return true;
    if (filter === 'Active') return o.order_status !== 'Completed' && o.order_status !== 'Cancelled';
    if (filter === 'Completed') return o.order_status === 'Completed';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/seller/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Incoming Orders & Fulfilment
          </h1>
          <p className="text-xs text-slate-500">
            Coordinate with buyers, update handover progress, and mark completed sales
          </p>
        </div>

        {/* Filter Pills */}
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

      {/* Orders Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center">
          <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading incoming orders...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-6">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono font-black text-brand-orange">
                      {order.order_ref}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    Payment Method: <strong>{order.payment_method}</strong> ({order.payment_status})
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                    order.order_status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : order.order_status === 'Ready for Pickup'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}>
                    {order.order_status}
                  </span>
                </div>
              </div>

              {/* Product and Buyer Details Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Product Item */}
                <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <img
                    src={order.image_url}
                    alt={order.title}
                    className="w-16 h-16 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                  />
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-bold uppercase text-brand-orange">{order.category}</span>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{order.title}</h4>
                    <p className="text-slate-500">Quantity: <strong>{order.quantity}</strong></p>
                    <p className="font-black text-brand-blue text-sm">
                      Total: {formatUGX(order.price * order.quantity)}
                    </p>
                  </div>
                </div>

                {/* Buyer & Handover Info */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-2">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider">
                    Buyer Campus Fulfilment Contact
                  </h4>
                  <div className="flex items-center space-x-2">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span>Buyer: <strong>{order.buyer_name}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Phone: <strong className="text-slate-800">{order.buyer_phone}</strong></span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-orange flex-shrink-0 mt-0.5" />
                    <span>Pickup Point: <strong>{order.pickup_location}</strong></span>
                  </div>
                </div>

              </div>

              {/* Status Progression Controls */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <span className="text-xs font-bold text-slate-700">
                  Update Fulfilment Stage:
                </span>

                <div className="flex flex-wrap gap-2">
                  {STATUS_PROGRESSION.map((st) => {
                    const isCurrent = order.order_status === st;
                    return (
                      <button
                        key={st}
                        disabled={isCurrent || updatingId === order.order_id}
                        onClick={() => handleStatusChange(order.order_id, st)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-slate-900 text-white cursor-default shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-brand-orange hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No {filter.toLowerCase()} orders found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You currently have no orders in this status category.
          </p>
        </div>
      )}

    </div>
  );
}
