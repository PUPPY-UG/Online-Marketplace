import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, 
  Package, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  Star, 
  TrendingUp, 
  ArrowRight,
  Eye,
  AlertCircle
} from 'lucide-react';
import { api, formatUGX } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import RatingStars from '../../components/RatingStars';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSellerData() {
      try {
        setLoading(true);
        const [itemsRes, ordersRes, reviewsRes] = await Promise.all([
          api.getSellerItems(),
          api.getSellerOrders(),
          api.getSellerReviews(user.id)
        ]);

        if (itemsRes.success) setItems(itemsRes.items || []);
        if (ordersRes.success) setOrders(ordersRes.orders || []);
        if (reviewsRes.success) setReviews(reviewsRes.reviews || []);
      } catch (err) {
        console.warn('Failed to load seller dashboard data:', err.message);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      loadSellerData();
    }
  }, [user]);

  const activeListings = items.filter(i => i.is_available && i.status === 'active');
  const incomingOrders = orders.filter(o => o.order_status !== 'Completed' && o.order_status !== 'Cancelled');
  const completedSales = orders.filter(o => o.order_status === 'Completed');
  const totalRevenue = completedSales.reduce((sum, o) => sum + (Number(o.price) * o.quantity), 0);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Seller Top Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-slate-900 to-navy-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5">
          <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
            Campus Seller Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Seller Dashboard: {user?.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Residence: <strong>{user?.campus_residence || 'UCU Mukono'}</strong> • Student ID: <strong>{user?.student_id || 'UCU/STU'}</strong>
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/seller/products?action=add"
            className="px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-extrabold text-xs transition-colors shadow-md flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
          <Link
            to="/seller/orders"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors border border-slate-700"
          >
            Manage Orders ({incomingOrders.length})
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Active Listings</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{activeListings.length}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{items.length} total listed items</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-amber-600 font-bold uppercase tracking-wider block">Incoming Orders</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{incomingOrders.length}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Awaiting pickup handover</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider block">Total Sales Revenue</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatUGX(totalRevenue)}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{completedSales.length} fulfilled orders</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-brand-blue font-bold uppercase tracking-wider block">Seller Rating</span>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{averageRating}</span>
            <RatingStars rating={Number(averageRating)} size="sm" />
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Based on {reviews.length} campus reviews</span>
        </div>

      </div>

      {/* Main Grid: Incoming Orders & Quick Listings Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Incoming Orders to Fulfil */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>Incoming Campus Orders</span>
            </h2>
            <Link
              to="/seller/orders"
              className="text-xs font-bold text-brand-orange hover:text-orange-700 flex items-center space-x-1"
            >
              <span>All Orders ({orders.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
              <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading incoming orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-800">
                        {order.order_ref}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Buyer: <strong className="text-slate-700">{order.buyer_name}</strong> ({order.buyer_phone})
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      order.order_status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {order.order_status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 truncate max-w-[200px]">
                      {order.quantity} × {order.title}
                    </span>
                    <span className="font-black text-brand-blue">
                      {formatUGX(order.price * order.quantity)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate max-w-[240px]">
                      Pickup: <strong>{order.pickup_location}</strong>
                    </span>
                    <Link
                      to="/seller/orders"
                      className="text-brand-orange hover:underline font-bold"
                    >
                      Update Status →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm space-y-3">
              <Store className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No incoming orders yet</h3>
              <p className="text-xs text-slate-500">
                Ensure your product prices are competitive and listed in the correct campus categories.
              </p>
            </div>
          )}
        </div>

        {/* My Listed Products Quick Overview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <Package className="w-5 h-5 text-brand-blue" />
              <span>My Product Listings</span>
            </h2>
            <Link
              to="/seller/products"
              className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Manage ({items.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm divide-y divide-slate-100">
            {items.slice(0, 5).map((item) => (
              <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-12 h-12 object-cover rounded-xl border border-slate-200"
                  />
                  <div className="text-xs">
                    <h4 className="font-bold text-slate-800 truncate max-w-[150px]">{item.title}</h4>
                    <span className="text-[11px] font-black text-brand-blue">{formatUGX(item.price)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    item.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {item.is_available ? 'Available' : 'Sold'}
                  </span>
                </div>
              </div>
            ))}

            <div className="pt-4 text-center">
              <Link
                to="/seller/products?action=add"
                className="w-full block py-2.5 rounded-xl bg-slate-900 hover:bg-brand-orange text-white text-xs font-bold transition-colors"
              >
                + Add Another Product
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
