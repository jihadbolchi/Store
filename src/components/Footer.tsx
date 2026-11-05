import React from 'react';
import { useStore } from '../context/StoreContext';
import { DELIVERY_CONFIG } from '../config/delivery';
import {
  Palette,
  MessageCircle,
  Instagram,
  Facebook,
  Phone,
  Mail,
  MapPin,
  Truck,
  ShieldCheck,
  Heart,
  Sparkles,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, setActiveCategoryFilter } = useStore();

  const handleCategoryClick = (catId: string) => {
    setActiveCategoryFilter(catId);
    navigateTo('shop');
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      {/* Artisanal Trust Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-stone-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#0B6A75]/20 border border-[#0B6A75]/40 flex items-center justify-center shrink-0 text-[#14B8A6]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Dhaka &amp; Nationwide Delivery</h4>
              <p className="text-xs text-stone-400 mt-0.5">৳80 Dhaka metro · ৳130 outside Dhaka to all 64 districts.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-[#FFB300]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Artisan-Tested Quality</h4>
              <p className="text-xs text-stone-400 mt-0.5">Crystal resins, non-toxic dyes, lightfast pigments &amp; hard woods.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Made with Passion</h4>
              <p className="text-xs text-stone-400 mt-0.5">Handpicked craft essentials tested by practicing Dhaka creators.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Direct WhatsApp Assistance</h4>
              <p className="text-xs text-stone-400 mt-0.5">Chat with us on 01626523338 for recommendations &amp; orders.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/assets/aistudio/IMG-20261105-WA0000_cdc70869.jpg"
                alt="Dhaka Art Nook Logo"
                className="h-12 w-auto object-contain bg-white p-1 rounded-xl shadow-xs"
              />
              <span className="text-2xl font-black tracking-tight text-white font-heading">
                <span className="text-[#00B4D8]">Dhaka</span>{' '}
                <span className="text-[#14B8A6]">Art</span>{' '}
                <span className="text-[#FFA000]">Nook</span>
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed max-w-sm mb-6">
              Dhaka Art Nook is Bangladesh's premier online store for handcrafted art and DIY supplies. 
              We curate crystal epoxy resin, seasoned Sheesham block prints, pure organic beeswax, melt-and-pour soap bases, and fine artist media.
            </p>

            {/* Social media links */}
            <div className="flex items-center gap-3">
              <a
                href={DELIVERY_CONFIG.whatsapp.waUrlBase}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-all text-stone-300"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={DELIVERY_CONFIG.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-[#E4405F] hover:text-white flex items-center justify-center transition-all text-stone-300"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={DELIVERY_CONFIG.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-[#1877F2] hover:text-white flex items-center justify-center transition-all text-stone-300"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Art & Craft Categories */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Craft Supplies
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => handleCategoryClick('cat-resin')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Resin Art &amp; Molds
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('cat-block')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Wooden Block Printing
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('cat-paints')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Paints &amp; Pigment Pastes
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('cat-wax')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Soy &amp; Beeswax Supplies
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('cat-soap')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Soap Making Bases
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('cat-canvases')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Primed Canvases &amp; Boards
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Help &amp; Ordering
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => navigateTo('cart')} className="hover:text-white transition-colors cursor-pointer">
                  Shopping Bag
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('checkout')} className="hover:text-white transition-colors cursor-pointer">
                  Checkout Form
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-white transition-colors cursor-pointer">
                  About Our Brand
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact')} className="hover:text-white transition-colors cursor-pointer">
                  Delivery &amp; Courier FAQs
                </button>
              </li>

            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Dhaka Store Hub
            </h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" />
                <span>{DELIVERY_CONFIG.store.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FFB300] shrink-0" />
                <a href="tel:01626523338" className="hover:text-white transition-colors">
                  01626523338
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                <a
                  href={DELIVERY_CONFIG.whatsapp.waUrlBase}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors font-medium text-emerald-400"
                >
                  WhatsApp Ordering
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                <span>{DELIVERY_CONFIG.socials.email}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Payment Methods */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-stone-800 text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <p>
          &copy; {new Date().getFullYear()} Dhaka Art Nook. All rights reserved. Made for Bangladesh's Creative Community.
        </p>
        <div className="flex items-center gap-3 text-stone-400 font-medium">
          <span>Payment via:</span>
          <span className="text-stone-300">bKash</span>
          <span>·</span>
          <span className="text-stone-300">Nagad</span>
          <span>·</span>
          <span className="text-stone-300">Cash on Delivery</span>
        </div>
      </div>
    </footer>
  );
};
