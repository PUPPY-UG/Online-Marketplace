import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Package, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  ArrowRight,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api, formatUGX } from '../../services/api';
import OrderTimeline from '../../components/OrderTimeline';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBuyerData() {
      try {
        setLoading(true);
        const res = await api.getBuyerOrders();
        if (res.success) {
          setOrders(res.orders || []);
        }
      } catch (err) {
        console.warn('Failed to load buyer orders:', err.message);
      } finally {
        setLoading(false);
      }
    }

    loadBuyerData();
  }, []);

  const pendingOrders = orders.filter(o => o.order_status !== 'Completed' && o.order_status !== 'Cancelled');
  const completedOrders = orders.filter(o => o.order_status === 'Completed');
  const totalSpent = completedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
            Student Buyer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Uganda Christian University (Mukono) • Residence: <strong>{user?.campus_residence || 'Main Campus'}</strong>
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/products"
            className="px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-extrabold text-xs transition-colors shadow-md flex items-center space-x-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Campus Market</span>
          </Link>
          <Link
            to="/cart"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors border border-slate-700 flex items-center space-x-1.5"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Cart ({itemCount})</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Purchases</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{orders.length}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Campus orders placed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-amber-600 font-bold uppercase tracking-wider block">Active Handover</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{pendingOrders.length}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Awaiting pickup on campus</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider block">Completed Orders</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{completedOrders.length}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Items received safely</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-brand-blue font-bold uppercase tracking-wider block">Total Spent (UGX)</span>
          <p className="text-2xl font-black text-brand-blue mt-1">{formatUGX(totalSpent)}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Simulated student transactions</span>
        </div>

      </div>

      {/* Main Content Grid: Recent Active Orders & Student Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Active Campus Orders */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <Clock className="w-5 h-5 text-brand-blue" />
              <span>Recent Orders & Live Tracking</span>
            </h2>
            <Link
              to="/buyer/orders"
              className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View All ({orders.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
              <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading your campus purchases...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-brand-blue">
                        {order.order_ref}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        order.order_status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}>
                        {order.order_status}
                      </span>
                      <Link
                        to={`/order-tracking/${order.id}`}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        Track Status
                      </Link>
                    </div>
                  </div>

                  {/* Items mini row */}
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-800 font-medium truncate max-w-xs">
                          {item.quantity} × {item.title}
                        </span>
                        <span className="font-bold text-slate-700">
                          {formatUGX(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-brand-orange" />
                      Pickup: <strong className="ml-1 text-slate-700 truncate max-w-[200px]">{order.pickup_location}</strong>
                    </span>
                    <span className="font-black text-sm text-slate-900">
                      Total: {formatUGX(order.total_amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No campus orders yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Discover books, calculators, jackets, and hostel furniture listed by UCU students.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors"
              >
                <span>Browse Products</span>
              </Link>
            </div>
          )}
        </div>

        {/* Student Profile & Quick Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Student Buyer Profile
            </h3>

            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{user?.full_name}</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">
                  Verified UCU Student
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-500" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>{user?.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-brand-orange" />
                <span>{user?.campus_residence || 'UCU Mukono'}</span>
              </div>
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-200 space-y-2 text-xs text-amber-900">
            <h4 className="font-bold text-sm text-amber-950 flex items-center space-x-1.5">
              <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>Campus Buyer Tips</span>
            </h4>
            <p>
              Always meet sellers inside UCU gates or main hostel entrances. Verify condition of items before clicking "Confirm Receipt".
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
