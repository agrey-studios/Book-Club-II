import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ResourceItem, Order } from '../types';
import { ArrowLeft, Smartphone, CreditCard, ShieldCheck, CheckCircle2, Lock, ArrowRight, BookOpen } from 'lucide-react';

interface CheckoutViewProps {
  itemType: 'resource' | 'subscription';
  resource?: ResourceItem;
  planName?: string;
  amountKsh: number;
  onBack: () => void;
  onSuccess: (order: Order) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  itemType,
  resource,
  planName,
  amountKsh,
  onBack,
  onSuccess
}) => {
  const { user, completeOrder, openReader } = useApp();
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '0712345678');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [step, setStep] = useState<'details' | 'processing' | 'confirmed'>('details');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const title = itemType === 'resource' ? resource?.title || 'Educational Resource' : `${planName || 'Book Club'} Subscription`;

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setErrorMsg('Please enter a valid phone number');
      return;
    }

    setErrorMsg(null);
    setStep('processing');

    try {
      const response = await fetch('/api/payments/mpesa-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          amountKsh,
          itemTitle: title,
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Payment authorization failed');
      }

      const order = await completeOrder(
        itemType,
        itemType === 'resource' ? resource?.id || 'res' : 'sub-tier',
        title,
        amountKsh,
        phoneNumber
      );

      setConfirmedOrder(order);
      setStep('confirmed');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Payment processing failed. Please try again.');
      setStep('details');
    }
  };

  return (
    <div className="w-[99%] md:w-[95%] max-w-2xl mx-auto px-1 sm:px-2 py-4 space-y-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-teal-700 hover:border-teal-400 font-semibold text-[12px] sm:text-[13px] shadow-2xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Material</span>
      </button>

      {/* Main Checkout Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold mb-2">
            <Lock className="w-3 h-3" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold">Checkout & Instant Access</h1>
          <p className="text-xs text-slate-300 mt-0.5 truncate">{title}</p>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-7 text-[12px] sm:text-[13px]">
          {step === 'details' && (
            <form onSubmit={handleInitiatePayment} className="space-y-4">
              {/* Order Summary Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Item</span>
                  <span className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">{title}</span>
                </div>
                {resource && (
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Format & Level</span>
                    <span>{resource.fileFormat.toUpperCase()} • {resource.gradeLevel}</span>
                  </div>
                )}
                <div className="border-t border-slate-200/80 pt-2 flex justify-between items-center text-slate-900">
                  <span className="font-bold">Total Payable</span>
                  <span className="text-base sm:text-lg font-black text-teal-700">KSh {amountKsh}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mpesa')}
                    className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                      paymentMethod === 'mpesa'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Lipa na M-Pesa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                      paymentMethod === 'card'
                        ? 'border-teal-500 bg-teal-50/50 text-teal-950'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-teal-600" />
                    <span>Card / Debit</span>
                  </button>
                </div>
              </div>

              {/* Form Input */}
              {paymentMethod === 'mpesa' ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    M-Pesa Safaricom Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="0712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] text-slate-400">Kenya</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    An STK Push prompt will be sent immediately to this phone to enter your PIN.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4000 1234 5678 9010"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-center"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-center"
                    />
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Pay KSh {amountKsh} Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'processing' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">Waiting for M-Pesa STK Authorization</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Please check your phone ({phoneNumber}) and enter your M-Pesa PIN to complete payment of KSh {amountKsh}.
                </p>
              </div>
            </div>
          )}

          {step === 'confirmed' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Payment Confirmed!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Receipt: <strong>{confirmedOrder?.transactionRef}</strong>
                </p>
                <p className="text-xs text-emerald-700 font-semibold mt-1">
                  You now have complete unlimited access to this material.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                {resource && (
                  <button
                    onClick={() => {
                      if (confirmedOrder) onSuccess(confirmedOrder);
                      openReader(resource.id);
                    }}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open in Digital Reader</span>
                  </button>
                )}
                <button
                  onClick={onBack}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-xs border border-slate-200"
                >
                  Return to Material
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
