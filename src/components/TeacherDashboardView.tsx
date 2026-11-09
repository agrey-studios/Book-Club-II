import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  PlusCircle, 
  Wallet, 
  DollarSign, 
  Download, 
  Eye, 
  Star, 
  FileText, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Smartphone,
  Check
} from 'lucide-react';
import { ResourceCard } from './ResourceCard';

export const TeacherDashboardView: React.FC = () => {
  const { 
    user, 
    resources, 
    wallet, 
    requestWithdrawal, 
    currentRole, 
    setActiveView 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'wallet' | 'analytics'>('overview');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(2000);
  const [withdrawPhone, setWithdrawPhone] = useState(user?.phoneNumber || '0712345678');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Filter resources authored by this user or general contributor demo resources
  const myResources = resources.filter(r => 
    r.authorId === user?.uid || 
    r.authorName.includes('Kiprono') || 
    r.authorName.includes('Otieno') || 
    r.authorName.includes('Ombati')
  );

  const publishedResources = myResources.filter(r => r.status === 'published');
  const pendingResources = myResources.filter(r => r.status === 'pending');

  const totalViews = myResources.reduce((acc, r) => acc + r.viewsCount, 0);
  const totalDownloads = myResources.reduce((acc, r) => acc + r.downloadsCount, 0);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0) return;
    if (withdrawAmount > wallet.balanceKsh) {
      setWithdrawError('Requested amount exceeds available wallet balance.');
      return;
    }

    try {
      await requestWithdrawal(withdrawAmount, withdrawPhone);
      setWithdrawSuccess(true);
      setWithdrawError(null);
      setTimeout(() => setWithdrawSuccess(false), 4000);
    } catch (err: any) {
      setWithdrawError(err?.message || 'Withdrawal failed');
    }
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Contributor Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-100 text-teal-800">
              Verified {currentRole.toUpperCase()}
            </span>
            <span className="text-xs text-slate-400">• Approved Contributor</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            {user?.displayName || 'Educator Contributor'} Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish curriculum notes, author set books, monitor royalties & request instant M-Pesa payouts.
          </p>
        </div>

        <button
          onClick={() => setActiveView('upload')}
          className="px-5 py-3 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 flex items-center gap-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload New Resource</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase text-slate-400">Available Wallet</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">KSh {wallet.balanceKsh.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-0.5">Ready for M-Pesa Cashout</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-teal-600 mb-2">
            <DollarSign className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase text-slate-400">Lifetime Royalties</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">KSh {wallet.totalEarnedKsh.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-0.5">70% Commission Share</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <Download className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase text-slate-400">Student Downloads</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalDownloads.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-0.5">Across All Materials</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase text-slate-400">Published Works</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{publishedResources.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">Active in Catalog</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-6 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'resources', label: `My Publications (${myResources.length})` },
          { id: 'wallet', label: 'Wallet & M-Pesa Cashout' },
          { id: 'analytics', label: 'Performance Analytics' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition-colors ${
              activeTab === tab.id ? 'bg-teal-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base text-slate-900">Your Active Publications</h2>
              <button onClick={() => setActiveTab('resources')} className="text-xs text-teal-600 hover:underline">
                Manage All ({myResources.length})
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {publishedResources.slice(0, 3).map((res) => (
                <ResourceCard key={res.id} resource={res} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: RESOURCES */}
      {activeTab === 'resources' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base text-slate-900">Uploaded Educational Works</h2>
            <button
              onClick={() => setActiveView('upload')}
              className="px-3.5 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-semibold"
            >
              Upload New
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {myResources.map((res) => (
              <div key={res.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={res.coverImage} alt={res.title} className="w-12 h-16 rounded-lg object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{res.title}</h4>
                    <span className="text-[11px] text-slate-500">
                      {res.category.toUpperCase()} • {res.educationLevel} • {res.isFree ? 'Free' : `KSh ${res.priceKsh}`}
                    </span>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                      <span>{res.downloadsCount} downloads</span>
                      <span>•</span>
                      <span>{res.viewsCount} views</span>
                      <span>•</span>
                      <span>★ {res.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    res.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {res.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: WALLET & CASHOUT */}
      {activeTab === 'wallet' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Cashout Form */}
          <div className="md:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-base text-slate-900 mb-1 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <span>Withdraw Royalties to M-Pesa</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Instant mobile money payout directly to your Safaricom M-Pesa line.
            </p>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Available Balance</label>
                <div className="text-xl font-bold text-emerald-700 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  KSh {wallet.balanceKsh.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Withdrawal Amount (KSh)</label>
                <input
                  type="number"
                  min={100}
                  max={wallet.balanceKsh}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">M-Pesa Phone Number</label>
                <input
                  type="tel"
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  placeholder="e.g. 0712 345 678"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900"
                />
              </div>

              {withdrawSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Withdrawal request initiated successfully! M-Pesa notification will arrive shortly.</span>
                </div>
              )}

              {withdrawError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
                  {withdrawError}
                </div>
              )}

              <button
                type="submit"
                disabled={wallet.balanceKsh <= 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 text-sm transition-all"
              >
                Cashout KSh {withdrawAmount.toLocaleString()} to M-Pesa
              </button>
            </form>
          </div>

          {/* Commission & Royalty Policy */}
          <div className="md:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 mb-3">Book Club Contributor Revenue Model</h3>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                  <span>Author / Teacher Share:</span>
                  <span className="font-bold text-emerald-700">70% of Net Sales</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                  <span>Book Club Platform Commission:</span>
                  <span className="font-bold text-slate-700">30% (Hosting, AI & Payment)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                  <span>Payout Processing Time:</span>
                  <span className="font-bold text-teal-700">Instant Automated STK Payout</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-teal-50 border border-teal-100 text-[11px] text-teal-900 leading-relaxed">
              <strong>Institutional Payouts:</strong> For schools and universities with commercial licensing, bulk quarterly bank transfers can be configured via the Institutional Management Console.
            </div>
          </div>
        </div>
      )}

      {/* TAB: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-base text-slate-900 mb-4">Resource Readership Analytics</h2>
          <div className="space-y-4 text-xs">
            {myResources.map((r) => (
              <div key={r.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">{r.title}</span>
                  <span className="font-semibold text-teal-700">Rating: ★ {r.rating} ({r.reviewsCount})</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-200">
                  <div>
                    <span className="block text-[10px] text-slate-400">Total Views</span>
                    <span className="font-bold text-slate-800">{r.viewsCount}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">Completed Downloads</span>
                    <span className="font-bold text-slate-800">{r.downloadsCount}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">Conversion Rate</span>
                    <span className="font-bold text-slate-800">
                      {Math.round((r.downloadsCount / (r.viewsCount || 1)) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
