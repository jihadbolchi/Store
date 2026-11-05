import React from 'react';
import { useStore } from '../context/StoreContext';
import { DELIVERY_CONFIG } from '../config/delivery';
import {
  Palette,
  Heart,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Truck,
  Layers,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const { navigateTo, setActiveCategoryFilter } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Editorial Hero */}
      <div className="max-w-3xl space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-[#0B6A75]">
          Our Craft Heritage
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 font-heading leading-tight [text-wrap:balance]">
          Nurturing the Art &amp; DIY Maker Revolution in Bangladesh
        </h1>
        <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
          Founded in Dhaka, Dhaka Art Nook is an artisanal supplies collective. We bridge the gap between traditional Bengali craft techniques and modern DIY artistic movements—from centuries-old hand-carved wood block printing to crystal clear epoxy resin casting and organic candle making.
        </p>
      </div>

      {/* Visual Showcase Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="rounded-3xl overflow-hidden border border-stone-200 aspect-16/10 shadow-md">
          <img
            src="/src/assets/images/hero_art_craft_workspace_1793820211229.jpg"
            alt="Dhaka Art Nook workshop with wooden blocks and paints"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-stone-900 font-heading">
            Authentic, Tested Materials You Can Trust
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Finding reliable, non-yellowing epoxy resin, lightfast artist pigments, or seasoned hardwood stamps in Bangladesh used to require endless searches through cluttered local markets or expensive overseas imports.
          </p>
          <p className="text-sm text-stone-600 leading-relaxed">
            Every material in our catalog is rigorously verified by practicing creators for bubble release, viscosity, color vibrancy, and curing consistency in Dhaka's unique climate.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setActiveCategoryFilter('all');
                navigateTo('shop');
              }}
              className="px-6 py-3 bg-[#0B6A75] hover:bg-[#084f57] text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Supplies Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Values Grid */}
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-[#FF8F00] mb-1">
            Core Values
          </div>
          <h3 className="text-2xl font-bold text-stone-900 font-heading">
            What Sets Dhaka Art Nook Apart
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DELIVERY_CONFIG.brandValues.map((v, i) => (
            <div key={i} className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#0B6A75] flex items-center justify-center font-bold">
                0{i + 1}
              </div>
              <h4 className="font-bold text-stone-900 text-sm">{v.title}</h4>
              <p className="text-xs text-stone-500 leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
