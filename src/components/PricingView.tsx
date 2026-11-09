import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { MarketplaceModal } from './MarketplaceModal';

export const PricingView: React.FC = () => {
  const { user } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number } | null>(null);

  const plans = [
    {
      name: 'Book Club Free',
      tier: 'free',
      price: 0,
      period: 'Forever free',
      description: 'Ideal for independent learners exploring foundational educational notes and public readers.',
      features: [
        'Access all free textbooks and CBC notes',
        'Online standard e-reader mode',
        'Standard search & discovery filters',
        'Up to 5 offline document downloads',
        'Basic personal digital library',
        'Community discussion forum access'
      ],
      isPopular: false,
      buttonText: 'Current Free Tier',
      highlight: false
    },
    {
      name: 'Book Club Plus',
      tier: 'plus',
      price: 199,
      period: 'per month',
      description: 'Perfect for primary, secondary, and college students needing comprehensive revision packs.',
      features: [
        'Everything in Free',
        'Unlimited offline document downloads',
        'Access to Plus verified teacher notes',
        'KJSEA & KCSE national mock exam archives',
        'Advanced e-reader: Dark, Sepia & font scaling',
        'Unlimited digital library storage',
        'Ad-free reading experience'
      ],
      isPopular: true,
      buttonText: 'Upgrade to Plus (KSh 199/mo)',
      highlight: true
    },
    {
      name: 'Book Club Premium',
      tier: 'premium',
      price: 399,
      period: 'per month',
      description: 'The ultimate academic edge with unlimited Gemini-4-Argon thinking AI study tutor.',
      features: [
        'Everything in Book Club Plus',
        'Unlimited AI Study Assistant with Deep Thinking',
        'AI Notes Summarizer & Instant Exam Takeaways',
        'Automated AI Revision Question Generator',
        'Interactive Spaced-Repetition Flashcards',
        'Personalized 7-Day AI Study Timetable Planner',
        'Full access to all premium textbooks & novels',
        'Priority educator response on Resource Requests'
      ],
      isPopular: false,
      buttonText: 'Get Premium (KSh 399/mo)',
      highlight: false
    }
  ];

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Pricing Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Flexible Academic Subscriptions
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
          Invest in Your Academic Excellence
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
          Unlock verified national past papers, high-thinking AI study companions, and complete digital textbooks.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {plans.map((p) => {
          const isCurrent = user?.subscriptionTier === p.tier;
          return (
            <div
              key={p.tier}
              className={`relative bg-white rounded-3xl p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between shadow-xs ${
                p.highlight
                  ? 'border-teal-500 shadow-xl ring-2 ring-teal-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {p.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-teal-600 text-white shadow-sm flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>MOST POPULAR VALUE</span>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{p.description}</p>

                {/* Price Display */}
                <div className="mt-6 mb-6 pb-6 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                      {p.price === 0 ? 'FREE' : `KSh ${p.price}`}
                    </span>
                    {p.price > 0 && <span className="text-xs text-slate-500 font-medium">/{p.period}</span>}
                  </div>
                </div>

                {/* Feature List */}
                <div className="space-y-3 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900 block text-[11px] uppercase tracking-wider">
                    Included Benefits:
                  </span>
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl font-bold text-xs bg-slate-100 text-slate-500 cursor-default"
                  >
                    Your Active Plan
                  </button>
                ) : p.price === 0 ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl font-semibold text-xs bg-slate-100 text-slate-700"
                  >
                    Free Access Included
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedPlan({ name: p.name, price: p.price })}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all ${
                      p.highlight
                        ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>{p.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security & Guarantee Trust Strip */}
      <div className="mt-12 max-w-2xl mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600 flex items-center justify-center gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0" />
        <span>
          Instant activation via M-Pesa. Cancel or upgrade anytime with no commitments.
        </span>
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <MarketplaceModal
          itemType="subscription"
          planName={selectedPlan.name}
          amountKsh={selectedPlan.price}
          onClose={() => setSelectedPlan(null)}
          onSuccess={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
};
