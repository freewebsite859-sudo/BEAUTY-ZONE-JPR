import React from 'react';
import { Sparkles, ShieldCheck, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setCurrentView, openAuthModal, setSelectedCity } = useApp();

  return (
    <footer className="bg-[#181411] text-stone-300 border-t border-stone-800 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Trust Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-stone-800">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-stone-100">Booking Deposit Escrow Protection</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Pay a small booking deposit online to lock your slot. The remaining balance is paid directly at the parlour counter after your service.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-300 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-stone-100">Daily 10:00 PM Auto Payouts</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Platform transparently settles advances directly to parlour bank accounts / UPI daily at 10:00 PM IST with 10% platform commission.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-stone-100">Verified Beauticians & Stylists</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Every listed parlour is verified for hygiene protocols, genuine products (O3+, Rica, L'Oréal, Moroccanoil), and certified stylists.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-serif-luxury text-2xl font-bold tracking-tight text-white">
                Aura
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-mono border border-stone-700">
                BeautyZone India
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              India's premier verified salon &amp; beauty parlour network. Enabling seamless appointments for clients and comprehensive digital tools for parlour entrepreneurs.
            </p>
            <div className="pt-2 text-xs text-stone-400 space-y-1.5">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                <span>Headquarters: Bandra Kurla Complex, Mumbai, Maharashtra 400051</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-stone-500" />
                <span>WhatsApp Helpline: +91 98200 11999 (Mon–Sun 9 AM – 9 PM IST)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-stone-500" />
                <span>Care &amp; Grievances: support@beautyzone.in</span>
              </p>
            </div>
          </div>

          {/* Popular Services */}
          <div>
            <h5 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
              Popular Treatments
            </h5>
            <ul className="text-xs space-y-2 text-stone-400">
              <li>Hydra-Glow Brightening Facial</li>
              <li>HD &amp; Airbrush Bridal Makeup</li>
              <li>Rica Chocolate Waxing</li>
              <li>Organic Eyebrow Threading</li>
              <li>Keratin &amp; Hair Spa Rituals</li>
              <li>Bridal Marwari Mehendi</li>
              <li>Rose Petal Manicure &amp; Pedicure</li>
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h5 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
              Parlours By City
            </h5>
            <ul className="text-xs space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => {
                    setSelectedCity('Mumbai');
                    setCurrentView('showcase');
                  }}
                  className="hover:text-amber-300 transition-colors"
                >
                  Parlours in Mumbai
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCity('Delhi NCR');
                    setCurrentView('showcase');
                  }}
                  className="hover:text-amber-300 transition-colors"
                >
                  Parlours in Delhi NCR
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCity('Bengaluru');
                    setCurrentView('showcase');
                  }}
                  className="hover:text-amber-300 transition-colors"
                >
                  Parlours in Bengaluru
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCity('Hyderabad');
                    setCurrentView('showcase');
                  }}
                  className="hover:text-amber-300 transition-colors"
                >
                  Parlours in Hyderabad
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCity('Pune');
                    setCurrentView('showcase');
                  }}
                  className="hover:text-amber-300 transition-colors"
                >
                  Parlours in Pune
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCity('Jaipur');
                    setCurrentView('showcase');
                  }}
                  className="hover:text-amber-300 transition-colors"
                >
                  Parlours in Jaipur
                </button>
              </li>
            </ul>
          </div>

          {/* Parlour Owners */}
          <div>
            <h5 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
              For Parlour Owners
            </h5>
            <ul className="text-xs space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => openAuthModal('owner_signup')}
                  className="text-amber-300 font-medium hover:underline"
                >
                  List Your Parlour
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('owner_dashboard')}
                  className="hover:text-stone-200 transition-colors"
                >
                  Owner Console
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('super_admin')}
                  className="hover:text-stone-200 transition-colors"
                >
                  Super Admin Console
                </button>
              </li>
              <li className="text-stone-500 pt-2 text-[11px] leading-relaxed">
                10% standard platform commission on advance bookings. Daily automated payouts at 10:00 PM IST directly to your bank account.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Indian Compliance */}
        <div className="pt-8 border-t border-stone-800 text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 BeautyZone Platform. All rights reserved across India.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>GST Compliant Invoicing</span>
            <span aria-hidden="true">·</span>
            <span>Booking Deposit Escrow</span>
            <span aria-hidden="true">·</span>
            <span>Indian English Standard</span>
            <span aria-hidden="true">·</span>
            <span>All amounts in INR (₹)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
