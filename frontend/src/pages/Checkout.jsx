import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api, formatUGX } from '../services/api';

const UCU_PICKUP_SPOTS = [
  'Hamu Mukasa Main Library (Security / Main Steps)',
  'Guild Canteen / Tech Park Canopy Area',
  'Nkoyoyo Hall Steps',
  'Agape Hall Courtyard (Female Residence)',
  'Sabiti Hall Courtyard (Male Residence)',
  'Allan Galpin Hall Entrance',
  'Bishop Tucker Building Lawn',
  'Main Campus Gate (Bishop Tucker Road)',
  'Custom Meeting Spot (Specify in notes)'
];

export default function Checkout({ onToast }) {
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form States
  const [buyerName, setBuyerName] = useState(user?.full_name || '');
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '');
  const [pickupSpot, setPickupSpot] = useState(UCU_PICKUP_SPOTS[0]);
  const [customSpot, setCustomSpot] = useState('');
  const [notes, setNotes] = useState('');

  // Payment Simulation States
  const [paymentMethod, setPaymentMethod] = useState('Mobile Money (MTN MoMo)');
  const [momoPhone, setMomoPhone] = useState(user?.phone || '+256 7');
  const [processing, setProcessing] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Cart is Empty</h2>
        <p className="text-xs text-slate-500 mb-6">Please add items to your shopping cart before proceeding to checkout.</p>
        <Link to="/products" className="px-5 py-2.5 bg-brand-blue text-white text-xs font-bold rounded-xl">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!buyerName.trim() || !buyerPhone.trim()) {
      if (onToast) onToast('Please enter your full name and campus contact phone.', 'error');
      return;
    }

    const finalPickupLocation = pickupSpot.includes('Custom') && customSpot.trim()
      ? customSpot.trim()
      : pickupSpot;

    try {
      setProcessing(true);

      const payload = {
        buyer_name: buyerName.trim(),
        buyer_phone: buyerPhone.trim(),
        pickup_location: finalPickupLocation,
        payment_method: paymentMethod,
        phone_number: momoPhone,
        network_provider: paymentMethod.includes('Airtel') ? 'Airtel Uganda' : 'MTN Uganda',
        notes: notes.trim()
      };

      const res = await api.checkout(payload);

      if (res.success && res.order) {
        if (onToast) onToast('Simulated Payment Approved! Order Created.', 'success');
        navigate(`/order-confirmation/${res.order.id}`, { state: { order: res.order } });
      }
    } catch (err) {
      if (onToast) onToast(err.message || 'Checkout failed. Please check item availability.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Simulation Banner Notice */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 flex items-start space-x-3 text-amber-900 shadow-sm">
        <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className="font-extrabold text-amber-950 block text-sm mb-0.5">
            ACADEMIC DEMONSTRATION SIMULATOR ONLY (MGT3151)
          </strong>
          This checkout simulates campus e-commerce and mobile money payment processing for academic demonstration at Uganda Christian University. <strong>No real Mobile Money PINs or credit card numbers are ever requested or charged.</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Delivery/Pickup & Payment Method */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-8">
          
          {/* 1. Recipient Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-brand-blue" />
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                1. Student Buyer Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  placeholder="e.g. Brian Okello"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Active Phone / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  placeholder="e.g. +256 774 332211"
                />
              </div>
            </div>
          </div>

          {/* 2. Campus Pickup Location */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <MapPin className="w-5 h-5 text-brand-orange" />
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                2. UCU Campus Handover Spot
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Designated Campus Handover Point
              </label>
              <select
                value={pickupSpot}
                onChange={(e) => setPickupSpot(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-blue focus:outline-none bg-white"
              >
                {UCU_PICKUP_SPOTS.map((spot) => (
                  <option key={spot} value={spot}>{spot}</option>
                ))}
              </select>
            </div>

            {pickupSpot.includes('Custom') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specific Location on/near Campus
                </label>
                <input
                  type="text"
                  required
                  value={customSpot}
                  onChange={(e) => setCustomSpot(e.target.value)}
                  placeholder="e.g. Near Soba Hostel Gate or Allan Galpin Common Room"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-blue focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Order Notes / Preferred Meeting Time
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Available after 1:00 PM lecture, please text when you arrive."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue focus:outline-none"
              />
            </div>
          </div>

          {/* 3. Simulated Payment Method Selection */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                3. Payment Method (Simulated)
              </h2>
            </div>

            <div className="space-y-3">
              
              {/* Option 1: MTN MoMo */}
              <label
                className={`flex items-start p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'Mobile Money (MTN MoMo)'
                    ? 'border-amber-400 bg-amber-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Mobile Money (MTN MoMo)"
                  checked={paymentMethod === 'Mobile Money (MTN MoMo)'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 text-amber-500 focus:ring-amber-400"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center space-x-2">
                      <span>MTN Mobile Money</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200 text-amber-900 uppercase">
                        Simulation
                      </span>
                    </span>
                    <Smartphone className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Simulates instant MoMo prompt to recipient phone. Approved automatically in demo mode.
                  </p>
                </div>
              </label>

              {/* Option 2: Airtel Money */}
              <label
                className={`flex items-start p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'Mobile Money (Airtel Money)'
                    ? 'border-rose-400 bg-rose-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Mobile Money (Airtel Money)"
                  checked={paymentMethod === 'Mobile Money (Airtel Money)'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 text-rose-500 focus:ring-rose-400"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center space-x-2">
                      <span>Airtel Money</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-200 text-rose-900 uppercase">
                        Simulation
                      </span>
                    </span>
                    <Smartphone className="w-4 h-4 text-rose-500" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Simulates Airtel Money USSD push transaction. Instant confirmation for demonstration.
                  </p>
                </div>
              </label>

              {/* Option 3: Cash on Pickup */}
              <label
                className={`flex items-start p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'Cash on Pickup (Simulation)'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash on Pickup (Simulation)"
                  checked={paymentMethod === 'Cash on Pickup (Simulation)'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center space-x-2">
                      <span>Cash on Campus Pickup</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-200 text-emerald-900 uppercase">
                        In-Person
                      </span>
                    </span>
                    <Banknote className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Meet the seller in person on campus, inspect the item, and pay in cash upon handover.
                  </p>
                </div>
              </label>

            </div>

            {/* Simulated Phone Prompt Input */}
            {paymentMethod.includes('Mobile Money') && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Simulated Mobile Number for Push Prompt
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={momoPhone}
                    onChange={(e) => setMomoPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue"
                    placeholder="+256 7..."
                  />
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  * Demo mode: any fictitious 10-digit Ugandan number will succeed.
                </p>
              </div>
            )}

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={processing}
            className="w-full py-4 rounded-2xl bg-brand-orange hover:bg-orange-600 text-white font-black text-sm tracking-wider uppercase transition-all shadow-xl hover:shadow-orange-500/30 flex items-center justify-center space-x-2 disabled:bg-slate-300"
          >
            {processing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Simulating Campus Gateway Transaction...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay Now (Simulate UGX Payment) • {formatUGX(totalAmount)}</span>
              </>
            )}
          </button>

        </form>

        {/* Right Sidebar: Items Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Order Items ({items.length})
            </h3>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center space-x-3">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-14 h-14 object-cover rounded-xl border border-slate-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-bold text-slate-800 truncate">{item.title}</p>
                    <p className="text-slate-400">Qty: {item.quantity} × {formatUGX(item.price)}</p>
                    <p className="text-slate-500 text-[11px]">Seller: {item.seller_name}</p>
                  </div>
                  <div className="text-xs font-black text-slate-900">
                    {formatUGX(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold">{formatUGX(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Handover Service</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Due:</span>
                <span className="text-brand-blue">{formatUGX(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Trust guarantee */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-600 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>UCU Student Protection</span>
            </div>
            <p>
              Your funds are held securely in simulated escrow until you inspect and confirm receipt of the items on campus.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
