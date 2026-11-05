import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Shield,
  User,
  LogIn,
  LogOut,
  MailCheck,
  ChevronDown,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentView,
    navigateTo,
    scrollToSection,
    cartCount,
    setIsCartDrawerOpen,
    currentUser,
    isUserAdmin,
    isAdminEmailUnverified,
    sendVerificationEmail,
    reloadCurrentUser,
    setIsAuthModalOpen,
    signOutUser,
  } = useStore();

  const [panelOpen, setPanelOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (view: any) => {
    navigateTo(view);
    setPanelOpen(false);
  };

  const handleSectionClick = (sectionId: string) => {
    scrollToSection(sectionId);
    setPanelOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-stone-200/80 shadow-2xs transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* 1. Official Logo & Brand Name */}
        <button
          onClick={() => handleNavClick('home')}
          className="group flex items-center gap-1.5 sm:gap-2.5 text-left shrink min-w-0 cursor-pointer focus-visible:outline-none"
        >
          <img
            src="/assets/aistudio/IMG-20261105-WA0000_cdc70869.jpg"
            alt="Dhaka Art Nook"
            className="h-9 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-2xs shrink-0"
          />
          <span className="text-base sm:text-2xl md:text-3xl font-black tracking-tight font-heading whitespace-nowrap block truncate">
            <span className="text-[#005C6E]">Dhaka</span>{' '}
            <span className="text-[#008C99]">Art</span>{' '}
            <span className="text-[#FFA000]">Nook</span>
          </span>
        </button>

        {/* 2. Actions: Search, Cart, Single Unified Menu/Profile Icon */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Search Button */}
          <button
            onClick={() => navigateTo('shop')}
            aria-label="Search art supplies"
            className="p-2 text-stone-600 hover:text-[#005C6E] hover:bg-stone-100/80 rounded-xl transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            aria-label="Open Cart Drawer"
            className="relative p-2 text-stone-700 hover:text-[#005C6E] hover:bg-stone-100/80 rounded-xl transition-colors cursor-pointer group"
          >
            <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform text-[#005C6E]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-[#FFA000] text-stone-900 font-bold text-[10px] sm:text-[11px] w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-xs font-tabular animate-scale">
                {cartCount}
              </span>
            )}
          </button>

          {/* Single Unified Menu & Profile Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setPanelOpen(!panelOpen)}
              aria-label="Open Navigation and Account Menu"
              className="p-1.5 sm:p-2 flex items-center gap-1.5 rounded-xl border border-stone-200/90 hover:bg-stone-100/80 transition-colors cursor-pointer text-stone-700"
            >
              {currentUser ? (
                <div className="flex items-center gap-1">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-6 h-6 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-[#005C6E] text-white font-bold text-[11px] flex items-center justify-center">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <Menu className="w-4 h-4 text-stone-600" />
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold px-0.5">
                  <Menu className="w-5 h-5 text-stone-700" />
                </div>
              )}
            </button>

            {/* Merged Navigation & Profile Flyout Panel */}
            {panelOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-stone-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 text-stone-800">
                {/* Section A: Navigation Links */}
                <div className="py-1 space-y-0.5 text-xs font-medium">
                  <button
                    onClick={() => handleNavClick('home')}
                    className={`w-full px-3 py-2 text-left rounded-xl hover:bg-stone-50 hover:text-[#005C6E] transition-colors cursor-pointer flex items-center justify-between ${
                      currentView === 'home' ? 'text-[#005C6E] font-bold bg-teal-50/50' : ''
                    }`}
                  >
                    <span>Home</span>
                  </button>

                  <button
                    onClick={() => handleSectionClick('new-arrivals')}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-stone-50 hover:text-[#005C6E] transition-colors cursor-pointer"
                  >
                    <span>New Arrivals</span>
                  </button>

                  <button
                    onClick={() => handleSectionClick('special-offers')}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-stone-50 hover:text-[#005C6E] transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>Special Offers</span>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                      Deals
                    </span>
                  </button>

                  <button
                    onClick={() => handleSectionClick('all-products')}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-stone-50 hover:text-[#005C6E] transition-colors cursor-pointer"
                  >
                    <span>All Products</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="my-1.5 border-t border-stone-100" />

                {/* Section B: Account State */}
                {currentUser ? (
                  <div className="pt-1 pb-1 space-y-1.5">
                    {/* User Info Header */}
                    <div className="px-3 py-1.5 bg-stone-50/80 rounded-xl">
                      <div className="text-xs font-bold text-stone-900 truncate">
                        {currentUser.displayName || 'Maker Account'}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {currentUser.email}
                      </div>
                    </div>

                    {/* Unverified Admin Warning (secretly shown only to the admin email) */}
                    {isAdminEmailUnverified && (
                      <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                        <div className="font-semibold flex items-center gap-1">
                          <MailCheck className="w-3.5 h-3.5 text-amber-600" />
                          <span>Email Verification Needed</span>
                        </div>
                        <p className="text-[10px] text-amber-800">
                          Verify your email to unlock administrator privileges.
                        </p>
                        <div className="flex gap-1.5 pt-0.5">
                          <button
                            type="button"
                            onClick={() => sendVerificationEmail()}
                            className="px-2 py-1 bg-amber-200/70 hover:bg-amber-300 rounded-md text-[10px] font-bold cursor-pointer"
                          >
                            Resend Link
                          </button>
                          <button
                            type="button"
                            onClick={() => reloadCurrentUser()}
                            className="px-2 py-1 bg-white hover:bg-stone-100 border border-amber-300 rounded-md text-[10px] font-bold cursor-pointer"
                          >
                            I've Verified
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Admin Panel Link: ONLY visible after verified admin check */}
                    {isUserAdmin && (
                      <button
                        onClick={() => {
                          navigateTo('admin');
                          setPanelOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-bold text-[#005C6E] hover:bg-teal-50 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5 text-[#005C6E]" />
                        <span>Admin Panel</span>
                      </button>
                    )}

                    {/* Sign Out Button */}
                    <button
                      onClick={() => {
                        signOutUser();
                        setPanelOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setPanelOpen(false);
                      }}
                      className="w-full py-2.5 px-3 bg-[#005C6E] hover:bg-[#004b5a] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Log In / Sign Up</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
