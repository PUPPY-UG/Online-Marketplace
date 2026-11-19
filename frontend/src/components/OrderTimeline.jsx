import React from 'react';
import { Check, Clock, CreditCard, PackageCheck, CheckCircle2, XCircle } from 'lucide-react';

export default function OrderTimeline({ currentStatus = 'Pending' }) {
  if (currentStatus === 'Cancelled') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-center space-x-3 text-rose-800">
        <XCircle className="w-6 h-6 flex-shrink-0 text-rose-600" />
        <div>
          <h4 className="font-bold text-sm">Order Cancelled</h4>
          <p className="text-xs text-rose-600">This campus order was cancelled. Any simulated payment is refunded.</p>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'Pending', label: 'Order Placed', icon: Clock, desc: 'Awaiting seller review' },
    { key: 'Paid', label: 'Payment Confirmed', icon: CreditCard, desc: 'Simulated payment verified' },
    { key: 'Ready for Pickup', label: 'Ready for Pickup', icon: PackageCheck, desc: 'Seller waiting at pickup spot' },
    { key: 'Completed', label: 'Completed', icon: CheckCircle2, desc: 'Inspected and handed over' }
  ];

  const statusOrder = ['Pending', 'Paid', 'Ready for Pickup', 'Completed'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="py-4">
      <div className="relative">
        
        {/* Connecting Progress Bar */}
        <div className="absolute top-5 left-6 right-6 h-1 bg-slate-200 -z-0">
          <div
            className="h-full bg-brand-blue transition-all duration-500"
            style={{
              width: currentIndex >= 0 ? `${(currentIndex / (steps.length - 1)) * 100}%` : '0%'
            }}
          />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-4 relative z-10">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center text-center px-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-md ${
                    isCompleted
                      ? 'bg-brand-blue text-white ring-4 ring-blue-100'
                      : 'bg-white text-slate-400 border-2 border-slate-300'
                  }`}
                >
                  {isCompleted && idx < currentIndex ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                <div className="mt-3">
                  <p className={`text-xs font-bold leading-tight ${isCurrent ? 'text-brand-blue' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                  <p className="hidden sm:block text-[11px] text-slate-400 mt-0.5 leading-tight">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
