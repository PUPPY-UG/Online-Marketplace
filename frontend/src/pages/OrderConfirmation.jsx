import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  MapPin, 
  Package, 
  ArrowRight, 
  Clock, 
  Receipt, 
  ShieldCheck, 
  Printer 
} from 'lucide-react';
import { api, formatUGX } from '../services/api';

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && id) {
      async function loadOrder() {
        try {
          const res = await api.getOrder(id);
          if (res.success && res.order) {
            setOrder({ ...res.order, items: res.items, payment: res.payment });
          }
        } catch (err) {
          console.warn('Could not load order:', err.message);
        } finally {
          setLoading(false);
        }
      }
      loadOrder();
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500">Retrieving order confirmation...</p>
      </div>
    );
  }

  const orderRef = order?.order_ref || `ORD-UCU-2026-${id}`;
  const total = order?.total_amount || 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner animate-in zoom-in duration-300">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            Order Placed Successfully
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            Thank You for Trading on UniTrade!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Your simulated payment transaction was completed and the campus seller has been notified for handover.
          </p>
        </div>

        {/* Order Reference Box */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200 pb-3">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Official Order Reference
              </span>
              <span className="text-lg font-black text-brand-blue font-mono">
                {orderRef}
              </span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Paid (Simulated)
              </span>
              <span className="text-lg font-black text-emerald-600">
                {formatUGX(total)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Campus Handover Spot:</strong>
                <span>{order?.pickup_location || 'Hamu Mukasa Main Library'}</span>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Receipt className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Payment Method:</strong>
                <span>{order?.payment_method || 'Mobile Money (MTN MoMo)'} (SIMULATED)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Handover Next Steps */}
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-left text-xs text-blue-900 space-y-1.5">
          <p className="font-bold">What happens next?</p>
          <ul className="list-disc pl-5 space-y-1 text-blue-800">
            <li>The seller is preparing your items and will update the status to <strong>"Ready for Pickup"</strong>.</li>
            <li>Meet the seller at your chosen campus spot, inspect the items, and click <strong>"Confirm Receipt"</strong> on your order tracking page.</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to={`/order-tracking/${id}`}
            className="flex-1 py-3 px-5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <Clock className="w-4 h-4" />
            <span>Track Order Status Live</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/buyer/orders"
            className="py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors border border-slate-200"
          >
            My Orders History
          </Link>
        </div>

      </div>
    </div>
  );
}
