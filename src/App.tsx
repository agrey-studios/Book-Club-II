import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HomeView } from './components/HomeView';
import { ExploreView } from './components/ExploreView';
import { ResourceDetailView } from './components/ResourceDetailView';
import { DigitalReader } from './components/DigitalReader';
import { OnlineExamView } from './components/OnlineExamView';
import { AiStudyToolsView } from './components/AiStudyToolsView';
import { RequestResourceView } from './components/RequestResourceView';
import { CommunityView } from './components/CommunityView';
import { PricingView } from './components/PricingView';
import { StudentDashboardView } from './components/StudentDashboardView';
import { TeacherDashboardView } from './components/TeacherDashboardView';
import { AdminPanelView } from './components/AdminPanelView';
import { UploadResourceModal } from './components/UploadResourceModal';
import { CheckoutView } from './components/CheckoutView';
import { SideMenuDrawer } from './components/SideMenuDrawer';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { Footer } from './components/Footer';
import { ResourceItem } from './types';

function MainApp() {
  const { 
    activeView, 
    setActiveView, 
    selectedResourceId, 
    setSelectedResourceId, 
    checkoutResource,
    setCheckoutResource,
    openReader,
    resources, 
    currentRole 
  } = useApp();

  // Active resource detail item
  const selectedResource = resources.find(r => r.id === selectedResourceId);

  const handleOpenReader = (res: ResourceItem) => {
    openReader(res.id);
  };

  const handlePurchase = (res: ResourceItem) => {
    setCheckoutResource(res);
    setActiveView('checkout');
  };

  const handleAiSummarize = (res: ResourceItem) => {
    setSelectedResourceId(null);
    setActiveView('ai-tools');
  };

  const isDetailView = (activeView === 'resource-detail' || (selectedResourceId && activeView !== 'upload' && activeView !== 'checkout' && activeView !== 'reader'));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      {activeView !== 'reader' && <Navbar />}

      {/* Main Content Area - All Pages Render as Single Page Views (No Popups) */}
      <main className="flex-1 pb-16 lg:pb-0">
        {/* Single Page Resource Detail */}
        {isDetailView && selectedResource ? (
          <ResourceDetailView
            resource={selectedResource}
            onBack={() => {
              setSelectedResourceId(null);
              setActiveView('home');
            }}
            onOpenReader={handleOpenReader}
            onPurchase={handlePurchase}
            onAiSummarize={handleAiSummarize}
          />
        ) : activeView === 'reader' && selectedResource ? (
          /* Single Page Digital Reader */
          <DigitalReader
            resource={selectedResource}
            onClose={() => {
              setActiveView('resource-detail');
            }}
          />
        ) : activeView === 'checkout' && checkoutResource ? (
          /* Single Page Checkout View */
          <CheckoutView
            itemType="resource"
            resource={checkoutResource}
            amountKsh={checkoutResource.priceKsh}
            onBack={() => {
              if (selectedResourceId) setActiveView('resource-detail');
              else setActiveView('explore');
            }}
            onSuccess={(order) => {
              openReader(checkoutResource.id);
            }}
          />
        ) : (
          <>
            {activeView === 'home' && <HomeView />}
            {activeView === 'explore' && <ExploreView />}
            {activeView === 'exams' && <OnlineExamView />}
            {activeView === 'ai-tools' && <AiStudyToolsView />}
            {activeView === 'requests' && <RequestResourceView />}
            {activeView === 'community' && <CommunityView />}
            {activeView === 'pricing' && <PricingView />}

            {activeView === 'library' && <StudentDashboardView />}
            {activeView === 'downloads' && <StudentDashboardView />}

            {activeView === 'dashboard' && (
              currentRole === 'admin' ? (
                <AdminPanelView />
              ) : currentRole === 'teacher' || currentRole === 'author' || currentRole === 'institution' ? (
                <TeacherDashboardView />
              ) : (
                <StudentDashboardView />
              )
            )}

            {activeView === 'admin-panel' && <AdminPanelView />}

            {activeView === 'upload' && (
              <UploadResourceModal 
                onClose={() => setActiveView('home')} 
                onSuccess={() => setActiveView('explore')} 
              />
            )}
          </>
        )}
      </main>

      {/* Footer (hidden while inside reader for full focus) */}
      {activeView !== 'reader' && <Footer />}

      {/* Mobile Bottom Navigation Bar */}
      {activeView !== 'reader' && <MobileBottomNav />}

      {/* PWA Install Notification */}
      <PwaInstallBanner />

      {/* Root-Level Side Menu Drawer (Fixes clipping and ensures side menu functions smoothly) */}
      <SideMenuDrawer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
