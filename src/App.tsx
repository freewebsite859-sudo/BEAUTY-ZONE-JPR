/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PromotionalBanner } from './components/PromotionalBanner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';

// Views
import { HomeShowcase } from './views/HomeShowcase';
import { SalonDetailView } from './views/SalonDetailView';
import { TeamMemberView } from './views/TeamMemberView';
import { CustomerPortal } from './views/CustomerPortal';
import { SalonOwnerDashboard } from './views/SalonOwnerDashboard';
import { SuperAdminDashboard } from './views/SuperAdminDashboard';

const MainContent: React.FC = () => {
  const { currentView } = useApp();

  return (
    <main className="flex-1 min-h-[calc(100vh-250px)]">
      {currentView === 'showcase' && <HomeShowcase />}
      {currentView === 'salon_detail' && <SalonDetailView />}
      {currentView === 'staff_profile' && <TeamMemberView />}
      {currentView === 'customer_portal' && <CustomerPortal />}
      {currentView === 'owner_dashboard' && <SalonOwnerDashboard />}
      {currentView === 'super_admin' && <SuperAdminDashboard />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 font-sans selection:bg-rose-100 selection:text-stone-900">
        <PromotionalBanner />
        <Navbar />
        <MainContent />
        <Footer />
        <BookingModal />
        <AuthModal />
      </div>
    </AppProvider>
  );
}
