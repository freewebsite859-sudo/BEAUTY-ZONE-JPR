import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, AlertCircle, CheckCircle, Sparkles, Store, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateAge } from '../utils/formatters';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalDefaultTab,
    registerCustomer,
    registerOwnerAndParlour,
    setCurrentUserRole,
    setCurrentView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'customer_signup' | 'owner_signup' | 'login'>('customer_signup');

  // Customer registration state
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custDob, setCustDob] = useState('');
  const [custWhatsapp, setCustWhatsapp] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [custConfirmPassword, setCustConfirmPassword] = useState('');
  const [custAgeError, setCustAgeError] = useState('');

  // Owner registration state
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerWhatsapp, setOwnerWhatsapp] = useState('');
  const [parlourName, setParlourName] = useState('');
  const [parlourCity, setParlourCity] = useState('Mumbai');
  const [parlourPincode, setParlourPincode] = useState('400050');
  const [parlourAddress, setParlourAddress] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');

  // Sign in state
  const [loginIdentifier, setLoginIdentifier] = useState('sneha.k@gmail.com');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [loginRole, setLoginRole] = useState<'customer' | 'owner' | 'super_admin'>('customer');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalDefaultTab);
      setErrorMsg('');
      setSuccessMsg('');
      setCustAgeError('');
    }
  }, [isAuthModalOpen, authModalDefaultTab]);

  // Real-time Age Check when Date of Birth changes
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustDob(value);
    if (value) {
      const age = calculateAge(value);
      if (age < 16) {
        setCustAgeError(`Age calculated is ${age} years. Minimum age required to register is 16 years.`);
      } else {
        setCustAgeError('');
      }
    } else {
      setCustAgeError('');
    }
  };

  if (!isAuthModalOpen) return null;

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!custName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!custEmail.trim() || !custEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!custDob) {
      setErrorMsg('Please select your Date of birth.');
      return;
    }
    const age = calculateAge(custDob);
    if (age < 16) {
      setErrorMsg('You must be at least 16 years of age to register as per platform policy.');
      return;
    }
    if (!custWhatsapp || custWhatsapp.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit WhatsApp number.');
      return;
    }
    if (custPassword.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      return;
    }
    if (custPassword !== custConfirmPassword) {
      setErrorMsg('Password and Confirm Password do not match.');
      return;
    }

    const success = registerCustomer({
      fullName: custName.trim(),
      email: custEmail.trim(),
      dob: custDob,
      whatsappNumber: custWhatsapp.trim(),
    });

    if (success) {
      setSuccessMsg('Account created successfully! Welcome to BeautyZone.');
      setTimeout(() => {
        closeAuthModal();
      }, 1000);
    }
  };

  const handleOwnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!ownerName.trim()) {
      setErrorMsg('Please enter the owner full name.');
      return;
    }
    if (!parlourName.trim()) {
      setErrorMsg('Please enter the parlour / salon name.');
      return;
    }
    if (!ownerWhatsapp || ownerWhatsapp.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit WhatsApp number.');
      return;
    }
    if (!parlourPincode || parlourPincode.length < 6) {
      setErrorMsg('Please enter a valid 6-digit Indian Pincode.');
      return;
    }

    registerOwnerAndParlour(
      {
        fullName: ownerName.trim(),
        email: ownerEmail.trim() || 'owner@beautyzone.in',
        whatsappNumber: ownerWhatsapp.trim().startsWith('+91') ? ownerWhatsapp.trim() : `+91 ${ownerWhatsapp.trim()}`,
      },
      {
        name: parlourName.trim(),
        city: parlourCity,
        pincode: parlourPincode.trim(),
        address: parlourAddress.trim() || `${parlourName}, ${parlourCity}`,
      }
    );

    setSuccessMsg('Parlour application submitted! Redirecting to Owner Portal...');
    setTimeout(() => {
      closeAuthModal();
    }, 1200);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUserRole(loginRole);
    if (loginRole === 'owner') {
      setCurrentView('owner_dashboard');
    } else if (loginRole === 'super_admin') {
      setCurrentView('super_admin');
    } else {
      setCurrentView('showcase');
    }
    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FAF8F5] rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#1C1815] text-[#FAF8F5] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif-luxury text-xl font-semibold tracking-tight text-white">
              BeautyZone
            </span>
            <span className="text-xs text-amber-300 font-medium">· Account Access</span>
          </div>
          <button
            onClick={closeAuthModal}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-100/80 p-1 gap-1">
          <button
            onClick={() => {
              setActiveTab('customer_signup');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'customer_signup'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            I'm a customer
          </button>
          <button
            onClick={() => {
              setActiveTab('owner_signup');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'owner_signup'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            I own a parlour
          </button>
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'login'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sign in
          </button>
        </div>

        {/* Feedback Alerts */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: Customer Signup */}
          {activeTab === 'customer_signup' && (
            <form onSubmit={handleCustomerSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Sneha Kulkarni"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="sneha.k@gmail.com"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              {/* Date of Birth field with Age >= 16 check */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-800">
                    Date of birth *
                  </label>
                  <span className="text-[10px] text-amber-800 font-medium">
                    (Minimum age: 16 years)
                  </span>
                </div>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={custDob}
                  onChange={handleDobChange}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
                {custAgeError && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{custAgeError}</span>
                  </p>
                )}
                {custDob && !custAgeError && (
                  <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Age: {calculateAge(custDob)} years (Eligible)</span>
                  </p>
                )}
              </div>

              {/* WhatsApp Number (+91) */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  WhatsApp number * (for appointment slips)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-stone-200 bg-stone-100 text-xs text-stone-600 font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={custWhatsapp}
                    onChange={(e) => setCustWhatsapp(e.target.value.replace(/\D/g, ''))}
                    placeholder="98200 12345"
                    className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-r-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={custPassword}
                    onChange={(e) => setCustPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={custConfirmPassword}
                    onChange={(e) => setCustConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                </div>
              </div>

              <div className="text-[11px] text-stone-500 pt-1">
                By registering, you agree to our 25% Advance Booking Policy and Indian English communication standards.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1C1815] text-[#FAF8F5] hover:bg-stone-800 rounded-xl text-xs font-semibold transition-all shadow-sm"
              >
                Create Customer Account
              </button>
            </form>
          )}

          {/* TAB 2: Parlour Owner Signup */}
          {activeTab === 'owner_signup' && (
            <form onSubmit={handleOwnerSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Owner Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Kavita Chawla"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Parlour / Salon Name *
                </label>
                <input
                  type="text"
                  required
                  value={parlourName}
                  onChange={(e) => setParlourName(e.target.value)}
                  placeholder="e.g. Roop Shringar Bridal Studio"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    City *
                  </label>
                  <select
                    value={parlourCity}
                    onChange={(e) => setParlourCity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={parlourPincode}
                    onChange={(e) => setParlourPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="400050"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Owner WhatsApp number *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-stone-200 bg-stone-100 text-xs text-stone-600 font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={ownerWhatsapp}
                    onChange={(e) => setOwnerWhatsapp(e.target.value.replace(/\D/g, ''))}
                    placeholder="98112 33441"
                    className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-r-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <div className="font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Platform Terms &amp; Daily 10:00 PM Payouts</span>
                </div>
                <p>
                  • Standard platform commission is 10% on confirmed bookings.
                </p>
                <p>
                  • Daily auto payouts at 10:00 PM IST directly to your bank account / UPI without withdrawal request.
                </p>
                <p>
                  • Applications enter 'Pending' status for quick verification by Super Admin.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
              >
                Submit Parlour Application
              </button>
            </form>
          )}

          {/* TAB 3: Sign In */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Select Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLoginRole('customer')}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-medium border ${
                      loginRole === 'customer'
                        ? 'bg-amber-100/70 border-amber-700 text-amber-900'
                        : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginRole('owner')}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-medium border ${
                      loginRole === 'owner'
                        ? 'bg-amber-100/70 border-amber-700 text-amber-900'
                        : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    Parlour Owner
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginRole('super_admin')}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-medium border ${
                      loginRole === 'super_admin'
                        ? 'bg-amber-100/70 border-amber-700 text-amber-900'
                        : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    Super Admin
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Email or WhatsApp number
                </label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1C1815] text-[#FAF8F5] hover:bg-stone-800 rounded-xl text-xs font-semibold transition-all shadow-sm"
              >
                Sign In to BeautyZone
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
