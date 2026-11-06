import React from 'react';
import { useStore } from '../context/StoreContext';
import { DELIVERY_CONFIG } from '../config/delivery';
import { Facebook, Instagram, MapPin, Phone, MessageCircle, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, setActiveCategoryFilter } = useStore();
  const goCategory = (id: string) => { setActiveCategoryFilter(id); navigateTo('shop'); };
  return (
    <footer className="mt-8 bg-[#173d40] text-white">
      <div className="page-shell py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-9 sm:gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <img src="/assets/aistudio/IMG-20261105-WA0000_cdc70869.jpg" alt="Dhaka Art Nook" className="h-12 w-12 rounded-xl bg-white object-contain p-1"/>
              <span className="font-heading text-2xl font-bold tracking-tight"><span className="text-white">Dhaka Art</span> <span className="text-[#ffbd43]">Nook</span></span>
            </div>
            <p className="max-w-sm text-sm leading-7 text-white/70">Art and craft materials for curious minds, thoughtful makers and creative projects.</p>
            <div className="mt-6 flex gap-2">
              <a href={DELIVERY_CONFIG.socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-full border border-white/20 p-2.5 text-white/80 hover:bg-white/10"><Facebook size={17}/></a>
              <a href={DELIVERY_CONFIG.socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full border border-white/20 p-2.5 text-white/80 hover:bg-white/10"><Instagram size={17}/></a>
              <a href={DELIVERY_CONFIG.whatsapp.waUrlBase} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp orders" className="rounded-full border border-white/20 p-2.5 text-white/80 hover:bg-white/10"><MessageCircle size={17}/></a>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[.16em] text-[#ffbd43] mb-5">Explore</h3>
            <ul className="space-y-3 text-sm text-white/75">
              <li><button onClick={() => navigateTo('home')} className="hover:text-white">Home</button></li>
              <li><button onClick={() => navigateTo('shop')} className="hover:text-white">Shop all</button></li>
              <li><button onClick={() => goCategory('cat-resin')} className="hover:text-white">Resin art</button></li>
              <li><button onClick={() => navigateTo('about')} className="hover:text-white">About the brand</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[.16em] text-[#ffbd43] mb-5">Customer care</h3>
            <ul className="space-y-4 text-sm text-white/75">
              <li className="flex gap-3"><Phone size={16} className="mt-0.5 text-[#ffbd43]"/><a href="tel:01626523338" className="hover:text-white">01626523338</a></li>
              <li className="flex gap-3"><MessageCircle size={16} className="mt-0.5 text-[#ffbd43]"/><a href={DELIVERY_CONFIG.whatsapp.waUrlBase} target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp ordering <ArrowUpRight className="inline" size={13}/></a></li>
              <li className="flex gap-3"><MapPin size={16} className="mt-0.5 text-[#ffbd43]"/><span>{DELIVERY_CONFIG.store.address}</span></li>
              <li><button onClick={() => navigateTo('contact')} className="hover:text-white">Contact & delivery information</button></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10"><div className="page-shell py-5 flex flex-col sm:flex-row gap-2 justify-between text-xs text-white/55"><span>© {new Date().getFullYear()} Dhaka Art Nook. All rights reserved.</span><span>Made for creative minds in Bangladesh.</span></div></div>
    </footer>
  );
};
