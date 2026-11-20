import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  User, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Clock, 
  Loader2,
  DollarSign
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

  // Form States - with Compulsory Buyer Email
  const [buyerName, setBuyerName] = useState(user?.full_name || '');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '');
  const [pickupSpot, setPickupSpot] = useState(UCU_PICKUP_SPOTS[0]);
  const [customSpot, setCustomSpot] = useState('');
  const [notes, setNotes] = useState('');

  // Payment Selection: 'MTN Mobile Money' | 'Airtel Money' | 'PayPal'
  const [paymentMethod, setPaymentMethod] = useState('MTN Mobile Money');
  const [momoNumber, setMomoNumber] = useState(user?.phone || '+256 7');

  // Verification & Processing States
  const [processing, setProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(''); // e.g. 'VALIDATING', 'PROMPT_SENT', 'VERIFIED'
  const [formError, setFormError] = useState('');

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Cart is Empty</h2>
        <p className="text-xs text-slate-500 mb-6">Please add items to your shopping cart before proceeding to checkout.</p>
        <Link to="/products" className="px-5 py-2.5 bg-brand-blue text-white text-xs font-bold rounded-xl shadow-md">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  // Calculate USD conversion for PayPal (1 USD ≈ 3,700 UGX)
  const usdAmount = (totalAmount / 3700).toFixed(2);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // 1. Validate Compulsory Fields
    if (!buyerName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    if (!buyerEmail.trim()) {
      setFormError('Compulsory: Buyer email address is required for pickup notifications.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(buyerEmail.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!buyerPhone.trim()) {
      setFormError('Please enter a campus contact phone number.');
      return;
    }

    // 2. Validate Payment Details
    if (paymentMethod === 'MTN Mobile Money' || paymentMethod === 'Airtel Money') {
      const cleanPhone = momoNumber.replace(/\s+/g, '');
      if (cleanPhone.length < 9) {
        setFormError(`Please enter a valid mobile money number for ${paymentMethod}.`);
        return;
      }
    }

    const finalPickupLocation = pickupSpot.includes('Custom') && customSpot.trim()
      ? customSpot.trim()
      : pickupSpot;

    try {
      setProcessing(true);

      // Simulation Stage 1: Initiating Payment
      setProcessingStage('INITIATING');
      await new Promise(r => setTimeout(r, 600));

      // Simulation Stage 2: Prompt / Gateway authorization
      if (paymentMethod === 'MTN Mobile Money' || paymentMethod === 'Airtel Money') {
        setProcessingStage('PROMPT_PENDING');
        await new Promise(r => setTimeout(r, 1200));
      } else {
        setProcessingStage('PAYPAL_APPROVAL');
        await new Promise(r => setTimeout(r, 1000));
      }

      setProcessingStage('VERIFYING_SERVER');
      await new Promise(r => setTimeout(r, 600));

      // Execute Backend Order Creation & Verified Payment Capture
      const payload = {
        buyer_name: buyerName.trim(),
        buyer_email: buyerEmail.trim().toLowerCase(),
        buyer_phone: buyerPhone.trim(),
        pickup_location: finalPickupLocation,
        payment_method: paymentMethod,
        phone_number: momoNumber.trim(),
        notes: notes.trim()
      };

      const res = await api.checkout(payload);

      if (res.success && res.order) {
        setProcessingStage('SUCCESS');
        await new Promise(r => setTimeout(r, 400));

        clearCart();
        if (onToast) onToast(`Payment Verified! Order ${res.order.order_ref} created.`, 'success');
        navigate(`/order-confirmation/${res.order.id}`, { state: { order: res.order } });
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setFormError(err.message || 'Payment processing failed. Please check product availability.');
    } finally {
      setProcessing(false);
      setProcessingStage('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-wrap justify-between items-end gap-3">
        <div>
          <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">Campus Checkout</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Order & Payment Fulfillment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete your order and arrange campus pickup at Uganda Christian University.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified Student Protection</span>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-3 shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Please correct the following:</p>
            <p className="mt-0.5">{formError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleCheckoutSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Buyer & Pickup Information */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Buyer Information (With Compulsory Email) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2.5">
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-brand-blue font-bold text-xs flex items-center justify-center">1</span>
                  <h2 className="text-base font-bold text-slate-900">Buyer Information</h2>
                </div>
                <span className="text-[11px] text-brand-orange font-bold uppercase tracking-wider">Compulsory Fields</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Brian Okello"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue font-medium"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Contact Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="+256 700 000000"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue font-medium"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              {/* Compulsory Buyer Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Buyer University Email Address <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] text-emerald-600 font-semibold lowercase">Receives "Ready for Pickup" alert</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="e.g. student.buyer@ucu.ac.ug"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  When the seller marks your items as "Ready for Pickup", an automated email will be delivered to this address.
                </p>
              </div>

              {/* Campus Pickup Spot */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Agreed Campus Pickup Location <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={pickupSpot}
                    onChange={(e) => setPickupSpot(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue font-medium bg-white"
                  >
                    {UCU_PICKUP_SPOTS.map((spot) => (
                      <option key={spot} value={spot}>{spot}</option>
                    ))}
                  </select>
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {pickupSpot.includes('Custom') && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Specify Custom Campus Meeting Point
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tech Park Outside Room 12"
                    value={customSpot}
                    onChange={(e) => setCustomSpot(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue font-medium"
                  />
                </div>
              )}

              {/* Order Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Delivery / Collection Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. I am in lectures until 2:00 PM, let's meet near the main library steps."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue font-medium"
                />
              </div>
            </div>

            {/* 2. Payment Method Selection (MTN, Airtel, PayPal) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2.5">
                  <span className="w-7 h-7 rounded-full bg-orange-100 text-brand-orange font-bold text-xs flex items-center justify-center">2</span>
                  <h2 className="text-base font-bold text-slate-900">Payment Selection</h2>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">3 Secure Channels</span>
              </div>

              {/* Payment Option Cards */}
              <div className="space-y-3">
                
                {/* OPTION 1: MTN MOBILE MONEY */}
                <div 
                  onClick={() => setPaymentMethod('MTN Mobile Money')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'MTN Mobile Money'
                      ? 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-400/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* MTN Official Yellow Badge Logo */}
                      <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 font-black text-xs flex flex-col items-center justify-center shadow-sm flex-shrink-0">
                        <span className="text-[11px] tracking-tight leading-none">MTN</span>
                        <span className="text-[8px] font-bold tracking-tighter leading-none mt-0.5">MoMo</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">MTN Mobile Money</p>
                        <p className="text-[11px] text-slate-500">Fast USSD approval via Uganda MTN network (077/078/076)</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'MTN Mobile Money' ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'MTN Mobile Money' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                  </div>

                  {/* MTN Input when active */}
                  {paymentMethod === 'MTN Mobile Money' && (
                    <div className="mt-4 pt-3 border-t border-amber-200/60 space-y-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        Enter MTN Mobile Money Number
                      </label>
                      <input
                        type="tel"
                        value={momoNumber}
                        onChange={(e) => setMomoNumber(e.target.value)}
                        placeholder="e.g. +256 772 123456"
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      <p className="text-[10px] text-slate-500">
                        * A prompt will be sent to your phone to approve {formatUGX(totalAmount)} using your MoMo PIN.
                      </p>
                    </div>
                  )}
                </div>

                {/* OPTION 2: AIRTEL MONEY */}
                <div 
                  onClick={() => setPaymentMethod('Airtel Money')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'Airtel Money'
                      ? 'border-rose-400 bg-rose-50/50 ring-2 ring-rose-400/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Airtel Official Red Badge Logo */}
                      <div className="w-10 h-10 rounded-xl bg-rose-600 text-white font-black text-xs flex flex-col items-center justify-center shadow-sm flex-shrink-0">
                        <span className="text-[11px] tracking-tight leading-none">airtel</span>
                        <span className="text-[8px] font-bold tracking-tighter leading-none mt-0.5">money</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Airtel Money</p>
                        <p className="text-[11px] text-slate-500">Instant approval via Airtel Uganda network (070/075/074)</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'Airtel Money' ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'Airtel Money' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                  </div>

                  {/* Airtel Input when active */}
                  {paymentMethod === 'Airtel Money' && (
                    <div className="mt-4 pt-3 border-t border-rose-200/60 space-y-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        Enter Airtel Money Number
                      </label>
                      <input
                        type="tel"
                        value={momoNumber}
                        onChange={(e) => setMomoNumber(e.target.value)}
                        placeholder="e.g. +256 701 654321"
                        className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                      <p className="text-[10px] text-slate-500">
                        * You will receive an Airtel Money prompt on your handset to authorize {formatUGX(totalAmount)}.
                      </p>
                    </div>
                  )}
                </div>

                {/* OPTION 3: PAYPAL */}
                <div 
                  onClick={() => setPaymentMethod('PayPal')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'PayPal'
                      ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* PayPal Official Blue Logo Badge */}
                      <div className="w-10 h-10 rounded-xl bg-[#003087] text-white font-black text-xs flex items-center justify-center shadow-sm flex-shrink-0">
                        <span className="font-extrabold text-sm italic tracking-tighter">P<span className="text-[#0079C1]">P</span></span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-bold text-slate-900">PayPal Checkout</p>
                          <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">International & Cards</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Official PayPal API Integration • UGX to USD conversion</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'PayPal' ? 'border-[#0079C1] bg-[#0079C1] text-white' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'PayPal' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                  </div>

                  {paymentMethod === 'PayPal' && (
                    <div className="mt-4 pt-3 border-t border-blue-200/60 text-xs text-slate-600 space-y-2">
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-blue-200 font-medium">
                        <span>Converted Amount:</span>
                        <strong className="text-blue-900 font-bold">${usdAmount} USD <span className="text-slate-400 font-normal">(@ 3,700 UGX/$)</span></strong>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        * Backend creates and captures authenticated PayPal order reference via developer REST API.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Pay Action */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm sticky top-28 space-y-6">
              
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">
                Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h2>

              {/* Items List */}
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center space-x-3">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{item.title}</h4>
                      <p className="text-[11px] text-slate-500">Qty: {item.quantity} × {formatUGX(item.price)}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {formatUGX(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatUGX(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Campus Pickup / Handover</span>
                  <span className="font-semibold text-emerald-600">Free (Direct UCU Handover)</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Gateway Processing</span>
                  <span className="font-semibold text-emerald-600">Free</span>
                </div>
                <div className="flex justify-between items-baseline pt-3 border-t border-slate-200 text-sm">
                  <span className="font-bold text-slate-900">Total Payable</span>
                  <div className="text-right">
                    <span className="text-xl font-black text-brand-blue block">{formatUGX(totalAmount)}</span>
                    {paymentMethod === 'PayPal' && (
                      <span className="text-[11px] text-slate-500 block font-medium">≈ ${usdAmount} USD</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Payment Button */}
              <button
                type="submit"
                disabled={processing}
                className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-75 ${
                  paymentMethod === 'MTN Mobile Money'
                    ? 'bg-amber-400 hover:bg-amber-500 text-slate-900 shadow-amber-400/30'
                    : paymentMethod === 'Airtel Money'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                    : 'bg-[#0079C1] hover:bg-[#00457C] text-white shadow-blue-500/30'
                }`}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Pay {formatUGX(totalAmount)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-700 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secure Student Guarantee</span>
                </div>
                <p>
                  Funds are recorded securely. Order completion depends on you physically receiving your items and clicking <strong>CONFIRM PICKUP</strong>.
                </p>
              </div>

            </div>
          </div>

        </div>
      </form>

      {/* Interactive Payment Processing Modal */}
      {processing && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
            </div>

            <h3 className="text-lg font-black text-slate-900">
              Processing {paymentMethod}
            </h3>

            {processingStage === 'INITIATING' && (
              <p className="text-xs text-slate-500">
                Initiating payment request with {paymentMethod} gateway...
              </p>
            )}

            {processingStage === 'PROMPT_PENDING' && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left space-y-2">
                <p className="font-bold">📱 USSD Prompt Sent to {momoNumber}:</p>
                <p className="text-slate-600">
                  "Uganda Christian University UniTrade requests payment of <strong>{formatUGX(totalAmount)}</strong>. Please approve on your phone (Simulation)."
                </p>
              </div>
            )}

            {processingStage === 'PAYPAL_APPROVAL' && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs text-left space-y-2">
                <p className="font-bold">🌐 PayPal Secure Checkout:</p>
                <p className="text-slate-600">
                  Approving transaction for <strong>${usdAmount} USD</strong> through PayPal REST API Sandbox...
                </p>
              </div>
            )}

            {processingStage === 'VERIFYING_SERVER' && (
              <p className="text-xs text-emerald-700 font-semibold animate-pulse">
                Server verifying transaction status and generating campus order reference...
              </p>
            )}

            <p className="text-[10px] text-slate-400">
              Please do not refresh or close this window.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
