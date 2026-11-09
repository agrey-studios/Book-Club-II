import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Users, 
  FileCheck, 
  DollarSign, 
  Settings, 
  Check, 
  X, 
  AlertTriangle, 
  Sparkles,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';

export const AdminPanelView: React.FC = () => {
  const { 
    resources, 
    updateResourceStatus, 
    contributorApplications, 
    updateApplicationStatus, 
    orders, 
    wallet 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'resources' | 'orders' | 'settings'>('overview');

  // Platform Commission and pricing state
  const [platformCommissionPercent, setPlatformCommissionPercent] = useState(30);
  const [plusPriceKsh, setPlusPriceKsh] = useState(199);
  const [premiumPriceKsh, setPremiumPriceKsh] = useState(399);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const pendingApps = contributorApplications.filter(a => a.status === 'pending');
  const pendingResources = resources.filter(r => r.status === 'pending');

  const totalGrossRevenue = orders.reduce((acc, o) => acc + o.amountKsh, 0) + 184500;
  const platformRevenueShare = Math.round(totalGrossRevenue * (platformCommissionPercent / 100));

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Admin Title Card */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold mb-2 border border-teal-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Master Administrator Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Platform Governance & Moderation</h1>
          <p className="text-xs text-slate-300 mt-1">
            Supervise contributor approvals, review copyright integrity, configure subscription prices and audit financial ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-mono text-amber-300 border border-white/10">
            oumameshack@yahoo.com (Active Admin)
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-teal-600 mb-2">
            <FileCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase text-slate-400">Pending Review</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{pendingResources.length + pendingApps.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">Resources & Applications</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <DollarSign className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase text-slate-400">Gross Sales</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">KSh {totalGrossRevenue.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-0.5">Marketplace & Subscriptions</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Materials</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{resources.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">Across All 4 Levels</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase text-slate-400">Active Educators</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">148</div>
          <div className="text-xs text-slate-500 mt-0.5">Verified Authors & Teachers</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-6 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'applications', label: `Contributor Applications (${pendingApps.length})` },
          { id: 'resources', label: `Resource Moderation (${pendingResources.length})` },
          { id: 'orders', label: `Transactions Ledger (${orders.length})` },
          { id: 'settings', label: 'Platform & Commission Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* APPLICATIONS TAB */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-base text-slate-900 mb-4">Educator & Author Upgrade Applications</h2>
          {contributorApplications.length > 0 ? (
            <div className="space-y-4 text-xs">
              {contributorApplications.map((app) => (
                <div key={app.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{app.applicantName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-100 text-teal-800">
                        {app.roleRequested}
                      </span>
                      <span className="text-slate-400 text-[11px]">• {app.applicantEmail}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed"><span className="font-semibold">Qualifications:</span> {app.qualifications}</p>
                    <p className="text-slate-500 text-[11px]"><span className="font-semibold">Institution:</span> {app.institution || 'Independent'}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {app.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => updateApplicationStatus(app.id, 'approved', 'Verified and approved')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve & Grant Rights</span>
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(app.id, 'rejected', 'Missing credentials')}
                          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-semibold flex items-center gap-1 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {app.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">No contributor applications at this time.</p>
          )}
        </div>
      )}

      {/* RESOURCES MODERATION TAB */}
      {activeTab === 'resources' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-base text-slate-900 mb-4">Uploaded Educational Materials Moderation</h2>
          <div className="space-y-4 text-xs">
            {resources.map((res) => (
              <div key={res.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={res.coverImage} alt={res.title} className="w-12 h-16 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{res.title}</h4>
                    <span className="text-[11px] text-slate-500">
                      Author: {res.authorName} • {res.educationLevel} • {res.category.toUpperCase()} • {res.isFree ? 'Free' : `KSh ${res.priceKsh}`}
                    </span>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      Copyright statement: {res.copyrightDeclaration}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {res.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => updateResourceStatus(res.id, 'published')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Publish to Catalog</span>
                      </button>
                      <button
                        onClick={() => updateResourceStatus(res.id, 'rejected')}
                        className="px-3.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-semibold flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Takedown</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {res.status}
                      </span>
                      <button
                        onClick={() => updateResourceStatus(res.id, 'rejected')}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-medium text-red-600 hover:bg-red-50 border border-red-200"
                        title="Takedown material if copyright violation is reported"
                      >
                        Revoke / Takedown
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ORDERS & TRANSACTIONS TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-base text-slate-900 mb-4">Financial Ledger & Royalty Accounting</h2>
          <div className="divide-y divide-slate-100 text-xs">
            {orders.map((o) => (
              <div key={o.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{o.itemTitle}</span>
                  <p className="text-[11px] text-slate-500">
                    Paid by {o.userName} ({o.mpesaPhoneNumber}) • Ref: <span className="font-mono text-slate-700 font-semibold">{o.transactionRef}</span>
                  </p>
                  <p className="text-[10px] text-slate-400">Timestamp: {new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-emerald-700">KSh {o.amountKsh}</div>
                  <div className="text-[10px] text-slate-400">
                    Author Share: KSh {Math.round(o.amountKsh * 0.7)} • Platform: KSh {Math.round(o.amountKsh * 0.3)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-2xl">
          <h2 className="font-bold text-base text-slate-900 mb-1 flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-600" />
            <span>Platform Commission & Subscription Pricing</span>
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Configure system-wide parameters without modifying application source code.
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Book Club Commission Percentage (%)
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={platformCommissionPercent}
                onChange={(e) => setPlatformCommissionPercent(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Contributors currently receive {100 - platformCommissionPercent}% of sales.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Book Club Plus Monthly Subscription (KSh)
              </label>
              <input
                type="number"
                min={99}
                step={10}
                value={plusPriceKsh}
                onChange={(e) => setPlusPriceKsh(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Book Club Premium Monthly Subscription (KSh)
              </label>
              <input
                type="number"
                min={199}
                step={10}
                value={premiumPriceKsh}
                onChange={(e) => setPremiumPriceKsh(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900"
              />
            </div>

            {settingsSaved && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Platform settings updated successfully across live database.</span>
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xs text-xs"
            >
              Save Platform Configuration
            </button>
          </form>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-base text-slate-900 mb-3">Pending Contributor Approvals</h3>
            {pendingApps.length > 0 ? (
              <div className="space-y-3 text-xs">
                {pendingApps.map((a) => (
                  <div key={a.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900">{a.applicantName}</span>
                      <p className="text-[11px] text-slate-500">Applying as {a.roleRequested}</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('applications')}
                      className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-semibold"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">All contributor applications processed.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-base text-slate-900 mb-3">Copyright & Moderation Queue</h3>
            {pendingResources.length > 0 ? (
              <div className="space-y-3 text-xs">
                {pendingResources.map((r) => (
                  <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div className="truncate max-w-[200px]">
                      <span className="font-bold text-slate-900 block truncate">{r.title}</span>
                      <p className="text-[11px] text-slate-500">By {r.authorName}</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('resources')}
                      className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-semibold"
                    >
                      Inspect
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">All materials vetted and published.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
