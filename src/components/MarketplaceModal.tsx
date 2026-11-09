import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ResourceItem, Order } from '../types';
import { X, Smartphone, CreditCard, ShieldCheck, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

interface MarketplaceModalProps {
  itemType: 'resource' | 'subscription';
  resource?: ResourceItem;
  planName?: string;
  amountKsh: number;
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

export const MarketplaceModal: React.FC<MarketplaceModalProps> = ({
  itemType,
  resource,
  planName,
  amountKsh,
  onClose,
  onSuccess
}) => {
  const { user, completeOrder } = useApp();
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
      // Call server-side payment verification endpoint
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

      // Record verified order in Firestore
      const order = await completeOrder(
        itemType,
        itemType === 'resource' ? resource?.id || 'res' : 'sub-tier',
        title,
        amountKsh,
        phoneNumber
      );

      setConfirmedOrder(order);
      setStep('confirmed');
      setTimeout(() => {
        onSuccess(order);
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Payment processing failed. Please try again.');
      setStep('details');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold mb-2">
            <Lock className="w-3 h-3" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
          <h2 className="text-lg font-bold">Checkout & Instant Access</h2>
          <p className="text-xs text-slate-300 mt-0.5 truncate">{title}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'details' && (
            <form onSubmit={handleInitiatePayment} className="space-y-4 text-xs">
              {/* Payment Methods */}
              <div>
                <label className="block font-semibold text-slate-700 mb-2">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mpesa')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      paymentMethod === 'mpesa'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <span>Lipa Na M-Pesa</span>
                      <span className="block text-[10px] text-slate-400 font-normal">STK Push prompt</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-teal-500 bg-teal-50/50 text-teal-950 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <span>Debit / Credit Card</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Visa & Mastercard</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Phone number input */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  M-Pesa Registered Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 0712 345 678"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">KE (+254)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  A payment prompt will automatically appear on your phone screen.
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Item Subtotal:</span>
                  <span>KSh {amountKsh}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Author / Contributor share (70%):</span>
                  <span>KSh {Math.round(amountKsh * 0.7)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Book Club platform commission (30%):</span>
                  <span>KSh {Math.round(amountKsh * 0.3)}</span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Total Payable:</span>
                  <span className="text-emerald-700">KSh {amountKsh}</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 text-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>Pay KSh {amountKsh} via M-Pesa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'processing' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center animate-bounce">
                <Smartphone className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                STK Push Sent to {phoneNumber}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Please enter your M-Pesa PIN on your phone to authorize payment of <strong className="text-slate-900">KSh {amountKsh}</strong>.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-teal-600 font-semibold pt-2">
                <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Awaiting verified server receipt...</span>
              </div>
            </div>
          )}

          {step === 'confirmed' && (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Payment Verified!</h3>
              <p className="text-xs text-slate-500">
                Transaction Reference: <strong className="text-slate-900 font-mono">{confirmedOrder?.transactionRef}</strong>
              </p>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                Your material is unlocked and permanently saved to your Book Club account library.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
