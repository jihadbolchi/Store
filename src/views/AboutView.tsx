import React from 'react';
import { useStore } from '../context/StoreContext';
import { DELIVERY_CONFIG } from '../config/delivery';
import heroImage from '../assets/images/hero_art_craft_workspace_1793820211229.jpg';
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
    <div className="page-shell py-10 sm:py-14 space-y-12 sm:space-y-16">
      {/* Editorial Hero */}
      <div className="max-w-3xl space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-[#006673]">
          About Dhaka Art Nook
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 font-heading leading-tight [text-wrap:balance]">
          A little space for big creative ideas
        </h1>
        <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
          Dhaka Art Nook brings art and craft materials together in one convenient place. Whether you are exploring a new hobby or working on your next handmade project, we make it easier to find supplies that help you create.
        </p>
      </div>

      {/* Visual Showcase Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="rounded-3xl overflow-hidden border border-stone-200 aspect-16/10 shadow-md">
          <img
            src={heroImage} loading="lazy" decoding="async"
            alt="Dhaka Art Nook workshop with wooden blocks and paints"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-stone-900 font-heading">
            The materials to make it yours
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            From colour and texture to tools and finishing touches, explore supplies for a range of art and DIY projects.
          </p>
          <p className="text-sm text-stone-600 leading-relaxed">
            Browse the collection, compare product details and choose the materials that suit your project.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setActiveCategoryFilter('all');
                navigateTo('shop');
              }}
              className="px-6 py-3 bg-[#0B6A75] hover:bg-[#084f57] text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Explore the shop</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Values Grid */}
      <div className="bg-white rounded-2xl border border-[#e9e7e1] p-6 sm:p-10 space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-[#FF8F00] mb-1">
            Why shop with us
          </div>
          <h3 className="text-2xl font-bold text-stone-900 font-heading">
            A thoughtful shopping experience
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
