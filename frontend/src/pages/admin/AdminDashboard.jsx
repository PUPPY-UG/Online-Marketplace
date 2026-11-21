import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Package, 
  ShoppingBag, 
  Star, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Printer,
  Search,
  CreditCard,
  Mail,
  Clock,
  ArrowRight
} from 'lucide-react';
import { api, formatUGX } from '../../services/api';
import RatingStars from '../../components/RatingStars';

export default function AdminDashboard({ onToast }) {
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'users' | 'products' | 'orders' | 'payments' | 'emails' | 'reviews' | 'reports'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [emails, setEmails] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search filter inside tables
  const [tableSearch, setTableSearch] = useState('');

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, prodsRes, ordersRes, paymentsRes, emailsRes, reviewsRes, reportsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminProducts(),
        api.getAdminOrders(),
        api.getAdminPayments(),
        api.getAdminEmails(),
        api.getAdminReviews(),
        api.getAdminReports()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users || []);
      if (prodsRes.success) setProducts(prodsRes.products || []);
      if (ordersRes.success) setOrders(ordersRes.orders || []);
      if (paymentsRes.success) setPayments(paymentsRes.payments || []);
      if (emailsRes.success) setEmails(emailsRes.emails || []);
      if (reviewsRes.success) setReviews(reviewsRes.reviews || []);
      if (reportsRes.success) setReports(reportsRes.report || null);
    } catch (err) {
      if (onToast) onToast('Failed to load administrative data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleToggleUserStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'deactivated' : 'active';
    try {
      const res = await api.toggleUserStatus(user.id, nextStatus);
      if (res.success) {
        if (onToast) onToast(res.message, 'success');
        await loadAllAdminData();
      }
    } catch (err) {
      if (onToast) onToast(err.message || 'Failed to update user.', 'error');
    }
  };

  const handleModerateProduct = async (product) => {
    const nextStatus = product.status === 'active' ? 'deactivated' : 'active';
    const nextAvail = nextStatus === 'active';
    try {
      const res = await api.moderateProduct(product.id, {
        status: nextStatus,
        is_available: nextAvail
      });
      if (res.success) {
        if (onToast) onToast(res.message, 'success');
        await loadAllAdminData();
      }
    } catch (err) {
      if (onToast) onToast('Moderation action failed.', 'error');
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Control Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            UniTrade Campus Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Uganda Christian University (UCU) • Campus Administration
          </p>
        </div>

        <button
          onClick={handlePrintReport}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs transition-colors shadow-md flex items-center space-x-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export Audit Report</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto p-1.5 bg-slate-100 rounded-2xl gap-2 text-xs font-bold">
        {[
          { id: 'stats', label: 'System Overview', icon: Shield },
          { id: 'users', label: `Users (${users.length})`, icon: Users },
          { id: 'products', label: `Listings (${products.length})`, icon: Package },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'payments', label: `Payment Records (${payments.length})`, icon: CreditCard },
          { id: 'emails', label: `Email Logs (${emails.length})`, icon: Mail },
          { id: 'reviews', label: `Reviews (${reviews.length})`, icon: Star },
          { id: 'reports', label: 'Sales Reports', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setTableSearch(''); }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: System Statistics (Fulfills Section 8 Metrics) */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-400 font-bold uppercase block">Total Registered Users</span>
              <p className="text-3xl font-black text-slate-900 mt-1">{stats.totalUsers}</p>
              <span className="text-[10px] text-slate-500 block mt-1">
                {stats.totalBuyers} Buyers • {stats.totalSellers} Sellers • {stats.activeUsers} Active
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] text-blue-500 font-bold uppercase block">Total Listed Products</span>
              <p className="text-3xl font-black text-blue-600 mt-1">{stats.totalProducts}</p>
              <span className="text-[10px] text-slate-500 block mt-1">
                {stats.availableProducts} Available for Sale ({stats.soldOrUnavailable} Sold/Inactive)
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] text-purple-500 font-bold uppercase block">Total Campus Orders</span>
              <p className="text-3xl font-black text-purple-600 mt-1">{stats.totalOrders}</p>
              <span className="text-[10px] text-slate-500 block mt-1">
                {stats.paidOrders} Paid Orders
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] text-amber-500 font-bold uppercase block">Awaiting Pickup</span>
              <p className="text-3xl font-black text-amber-600 mt-1">{stats.ordersAwaitingPickup}</p>
              <span className="text-[10px] text-slate-500 block mt-1">
                {stats.completedOrders} Fully Completed Orders
              </span>
            </div>

          </div>

          {/* Activity Breakdown Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Campus Sales Volume</span>
              <p className="text-2xl font-black text-emerald-600">{formatUGX(stats.totalSalesVolume)}</p>
              <p className="text-xs text-slate-500">Accumulated across MTN, Airtel, and PayPal</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Automated Emails Delivered</span>
              <p className="text-2xl font-black text-blue-600">{stats.totalEmailsSent || 0} Alerts</p>
              <p className="text-xs text-slate-500">Pickup ready alerts & verification OTPs</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Campus Trust Rating</span>
              <p className="text-2xl font-black text-amber-500">{stats.averageRating} / 5.0</p>
              <p className="text-xs text-slate-500">Based on {stats.totalReviews} verified student reviews</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Registered Campus Users</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="pl-8 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Campus Hall</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Email Verification</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users
                  .filter(u => u.full_name?.toLowerCase().includes(tableSearch.toLowerCase()) || u.email?.toLowerCase().includes(tableSearch.toLowerCase()))
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{u.full_name}</p>
                        <p className="text-[11px] text-slate-500">{u.email}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{u.phone}</td>
                      <td className="py-3 px-4 text-slate-600">{u.campus_residence}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800' : u.role === 'seller' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.email_verified ? (
                          <span className="inline-flex items-center text-emerald-600 font-bold text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Verified
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Unverified</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                              u.status === 'active'
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                          >
                            {u.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Product Listings Management */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">All Campus Listings</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products by title..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="pl-8 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Seller</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products
                  .filter(p => p.title?.toLowerCase().includes(tableSearch.toLowerCase()))
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 flex items-center space-x-3">
                        <img src={p.image_url} alt={p.title} className="w-10 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{p.title}</p>
                          <span className="text-[10px] text-slate-400">Condition: {p.condition_state}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.category}</td>
                      <td className="py-3 px-4 font-black text-brand-blue">{formatUGX(p.price)}</td>
                      <td className="py-3 px-4 text-slate-700">{p.seller_name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.status === 'active' && p.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.status === 'active' && p.is_available ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleModerateProduct(p)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                            p.status === 'active'
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {p.status === 'active' ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Orders Overview */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">All Campus Orders</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="pl-8 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Buyer & Email</th>
                  <th className="py-3 px-4">Pickup Spot</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders
                  .filter(o => o.order_ref?.toLowerCase().includes(tableSearch.toLowerCase()) || o.buyer_name?.toLowerCase().includes(tableSearch.toLowerCase()))
                  .map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-brand-blue">{o.order_ref}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{o.buyer_name}</p>
                        <p className="text-[11px] text-slate-500">{o.buyer_email}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-600 line-clamp-1">{o.pickup_location}</td>
                      <td className="py-3 px-4 font-black text-slate-900">{formatUGX(o.total_amount)}</td>
                      <td className="py-3 px-4 text-slate-600">{o.payment_method}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          o.order_status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : o.order_status === 'Ready for Pickup' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {o.order_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Payment Records (Fulfills Section 8 Payment Records) */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Campus Payment Transaction Records</h3>
              <p className="text-xs text-slate-500">Audit logs across MTN MoMo, Airtel Money, and PayPal</p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search transaction ref..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="pl-8 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Currency</th>
                  <th className="py-3 px-4">Phone / Provider</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments
                  .filter(pay => pay.transaction_ref?.toLowerCase().includes(tableSearch.toLowerCase()) || pay.payment_method?.toLowerCase().includes(tableSearch.toLowerCase()))
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-purple-700">{p.transaction_ref}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{p.order_ref || `Order #${p.order_id}`}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{p.payment_method}</td>
                      <td className="py-3 px-4 font-black text-slate-900">{formatUGX(p.amount)}</td>
                      <td className="py-3 px-4 font-bold text-slate-500">{p.currency || 'UGX'}</td>
                      <td className="py-3 px-4 text-slate-600">{p.phone_number || p.network_provider || 'Direct'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(p.paid_at || p.created_at || Date.now()).toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: Email Notification Audit Logs (Fulfills Section 8 Email Records) */}
      {activeTab === 'emails' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Automated Email Notification Records</h3>
              <p className="text-xs text-slate-500">System delivery logs for "Ready for Pickup" alerts and verification OTPs</p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search recipient email..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="pl-8 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Notification ID</th>
                  <th className="py-3 px-4">Recipient Email</th>
                  <th className="py-3 px-4">Notification Type</th>
                  <th className="py-3 px-4">Associated Order</th>
                  <th className="py-3 px-4">Delivery Status</th>
                  <th className="py-3 px-4">Sent Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emails
                  .filter(e => e.recipient_email?.toLowerCase().includes(tableSearch.toLowerCase()) || e.notification_type?.toLowerCase().includes(tableSearch.toLowerCase()))
                  .map((em) => (
                    <tr key={em.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">#{em.id}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{em.recipient_email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          em.notification_type === 'READY_FOR_PICKUP' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {em.notification_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {em.order_ref || (em.order_id ? `Order #${em.order_id}` : 'N/A')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center text-emerald-600 font-bold text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> {em.delivery_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(em.sent_date || Date.now()).toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: Reviews */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Campus Seller Reviews & Ratings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Buyer: {rev.buyer_name} → Seller: {rev.seller_name}</span>
                  <RatingStars rating={rev.rating} size="sm" />
                </div>
                <p className="text-xs text-slate-600 italic">"{rev.comment}"</p>
                <span className="text-[10px] text-slate-400 block">{new Date(rev.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: Reports & Analytics */}
      {activeTab === 'reports' && reports && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Sales Breakdown by Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.categoryBreakdown?.map((cat, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{cat.category}</h4>
                  <p className="text-xl font-black text-brand-blue mt-1">{cat.count} Items</p>
                  <p className="text-xs text-slate-500">Value: {formatUGX(cat.total_value)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
