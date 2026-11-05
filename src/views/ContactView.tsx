import React, { useState } from 'react';
import { DELIVERY_CONFIG } from '../config/delivery';
import { useStore } from '../context/StoreContext';
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Truck,
  HelpCircle,
  Send,
  Clock,
  Instagram,
  Facebook,
} from 'lucide-react';

export const ContactView: React.FC = () => {
  const { addToast } = useStore();
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryMessage.trim()) return;

    // Send directly to WhatsApp
    const text = encodeURIComponent(
      `💬 *INQUIRY FROM DHAKA ART NOOK WEBSITE*\n` +
      `• *Name:* ${inquiryName}\n` +
      `• *Phone:* ${inquiryPhone || 'Not provided'}\n` +
      `• *Message:* ${inquiryMessage}`
    );
    window.open(`${DELIVERY_CONFIG.whatsapp.waUrlBase}?text=${text}`, '_blank', 'noopener,noreferrer');

    setSubmitted(true);
    addToast('Opening WhatsApp with your inquiry!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Heading */}
      <div className="max-w-2xl space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-[#0B6A75]">
          Get in Touch
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-heading">
          We're Here for Your Creative Inquiries
        </h1>
        <p className="text-sm text-stone-600">
          Have a question about resin cure times, custom block print sizes, or wholesale workshop packages? Chat with our Dhaka support team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Inquiries Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-stone-900 font-heading flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#25D366]" />
            <span>Send Direct Message to WhatsApp</span>
          </h2>

          <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-stone-700">Your Full Name *</label>
              <input
                type="text"
                required
                value={inquiryName}
                onChange={(e) => setInquiryName(e.target.value)}
                placeholder="e.g. Asif Mahmud"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-700">Phone / WhatsApp Number</label>
              <input
                type="tel"
                value={inquiryPhone}
                onChange={(e) => setInquiryPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-tabular"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-700">Your Inquiry / Question *</label>
              <textarea
                required
                rows={4}
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                placeholder="Ask about product availability, craft advice, bulk orders, or shipping timeline..."
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send via WhatsApp (01626523338)</span>
            </button>
          </form>
        </div>

        {/* Right Column: Contact Details & Delivery FAQ */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-stone-900 text-sm font-heading">
              Store Information
            </h3>
            <div className="space-y-3 text-xs text-stone-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#0B6A75] shrink-0 mt-0.5" />
                <span>{DELIVERY_CONFIG.store.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#FFB300] shrink-0" />
                <span>01626523338 (WhatsApp &amp; Calls)</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Business Hours: 10:00 AM – 10:00 PM (Daily)</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                <span>{DELIVERY_CONFIG.socials.email}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center gap-3">
              <a
                href={DELIVERY_CONFIG.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>@dhaka_art_nook</span>
              </a>
              <a
                href={DELIVERY_CONFIG.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Facebook className="w-3.5 h-3.5 text-blue-600" />
                <span>Dhaka Art Nook</span>
              </a>
            </div>
          </div>

          {/* Delivery Rates Reference */}
          <div className="bg-stone-50 rounded-3xl border border-stone-200 p-6 space-y-3 text-xs text-stone-700">
            <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#0B6A75]" />
              <span>Delivery Charges FAQ</span>
            </div>
            <p className="text-[11px] text-stone-500">
              We deliver to every corner of Bangladesh via Steadfast Courier and Pathao Express.
            </p>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="font-medium">Inside Dhaka City:</span>
                <span className="font-bold font-tabular text-[#0B6A75]">৳80 flat rate (24h)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-medium">Outside Dhaka (All 64 districts):</span>
                <span className="font-bold font-tabular text-[#0B6A75]">৳130 flat rate (48–72h)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
