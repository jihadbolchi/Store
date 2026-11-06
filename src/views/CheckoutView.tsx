import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { DELIVERY_CONFIG } from '../config/delivery';
import { validateBangladeshiPhone } from '../utils/whatsapp';
import { CustomerDetails, DeliveryArea } from '../types';
import {
  MessageCircle,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Phone,
  User,
} from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    confirmWhatsAppOrder,
    navigateTo,
    addToast,
    currentUser,
  } = useStore();

  // Form State
  const [fullName, setFullName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<DeliveryArea>('inside_dhaka');
  const [notes, setNotes] = useState('');

  // Validation State
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Apply the configured free-delivery threshold consistently with order creation.
  const standardDeliveryCharge =
    deliveryArea === 'inside_dhaka'
      ? DELIVERY_CONFIG.insideDhaka.fee
      : DELIVERY_CONFIG.outsideDhaka.fee;
  const qualifiesForFreeDelivery =
    DELIVERY_CONFIG.freeDeliveryThreshold > 0 &&
    cartSubtotal >= DELIVERY_CONFIG.freeDeliveryThreshold;
  const deliveryCharge = qualifiesForFreeDelivery ? 0 : standardDeliveryCharge;

  const grandTotal = cartSubtotal + deliveryCharge;

  // Validate fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = 'Please enter your full name.';
    }

    const phoneCheck = validateBangladeshiPhone(phone);
    if (!phoneCheck.isValid) {
      errors.phone = phoneCheck.error || 'Invalid Bangladeshi mobile number.';
      setPhoneError(phoneCheck.error || 'Invalid number');
    } else {
      setPhoneError(null);
    }

    if (!address.trim() || address.trim().length < 8) {
      errors.address = 'Please provide a detailed delivery address (House, Road, Area, Dhaka/City).';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getCustomerPayload = (): CustomerDetails => {
    const phoneCheck = validateBangladeshiPhone(phone);
    return {
      fullName: fullName.trim(),
      phone: phoneCheck.isValid ? phoneCheck.formatted : phone.trim(),
      address: address.trim(),
      deliveryArea,
      notes: notes.trim() || undefined,
    };
  };

  // 1. WhatsApp Order Confirmation Flow (Core Feature)
  const handleConfirmWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast('Please complete all required fields correctly.', 'error');
      return;
    }

    if (cart.length === 0) {
      addToast('Your cart is empty. Please add items before checking out.', 'error');
      navigateTo('shop');
      return;
    }

    setIsSubmitting(true);
    const customer = getCustomerPayload();
    confirmWhatsAppOrder(customer);
    setIsSubmitting(false);
  };



  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-900 font-heading">
          Your Cart is Empty
        </h2>
        <p className="text-xs text-stone-500">
          Add some art and craft supplies to proceed with checkout.
        </p>
        <button
          onClick={() => navigateTo('shop')}
          className="px-5 py-2.5 bg-[#0B6A75] text-white text-xs font-semibold rounded-xl"
        >
          Browse Supplies
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-stone-200">
        <button
          onClick={() => navigateTo('cart')}
          className="text-xs font-medium text-[#0B6A75] hover:underline flex items-center gap-1.5 mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
          Checkout &amp; Order Placement
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Provide your shipping details below to confirm your order via WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Customer Details & Delivery Area Selection Form */}
        <form className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="text-lg font-bold text-stone-900 font-heading flex items-center gap-2">
              <User className="w-5 h-5 text-[#0B6A75]" />
              <span>Customer Information</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              We require this information for Bangladesh courier dispatch and delivery verification.
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Farhana Yasmin"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (formErrors.fullName) {
                  setFormErrors((prev) => ({ ...prev, fullName: '' }));
                }
              }}
              className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B6A75] transition-all ${
                formErrors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300'
              }`}
            />
            {formErrors.fullName && (
              <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{formErrors.fullName}</span>
              </p>
            )}
          </div>

          {/* Phone Number with Bangladeshi Validation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700">
                Phone Number (BD Mobile) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-stone-400">e.g. 01626523338</span>
            </div>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="tel"
                required
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value;
                  setPhone(val);
                  if (val.length >= 10) {
                    const check = validateBangladeshiPhone(val);
                    setPhoneError(check.isValid ? null : check.error || 'Invalid number');
                  }
                }}
                className={`w-full pl-10 pr-4 py-3 bg-stone-50 border rounded-xl text-xs sm:text-sm text-stone-900 font-tabular focus:outline-none focus:ring-2 focus:ring-[#0B6A75] transition-all ${
                  phoneError ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300'
                }`}
              />
            </div>
            {phoneError && (
              <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{phoneError}</span>
              </p>
            )}
          </div>

          {/* Delivery Area Selection (Radio Tiles) */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-stone-700">
              Delivery Area (Automatic Delivery Rate) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Inside Dhaka */}
              <label
                onClick={() => setDeliveryArea('inside_dhaka')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  deliveryArea === 'inside_dhaka'
                    ? 'border-[#0B6A75] bg-teal-50/50 shadow-xs ring-2 ring-[#0B6A75]/10'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="font-bold text-stone-900 text-xs sm:text-sm">
                    {DELIVERY_CONFIG.insideDhaka.name}
                  </div>
                  <span className="text-xs font-extrabold text-[#0B6A75] font-tabular">
                    ৳{DELIVERY_CONFIG.insideDhaka.fee}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 mt-2">
                  Dhanmondi, Gulshan, Uttara, Mirpur, Old Dhaka (24–48h)
                </div>
              </label>

              {/* Outside Dhaka */}
              <label
                onClick={() => setDeliveryArea('outside_dhaka')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  deliveryArea === 'outside_dhaka'
                    ? 'border-[#0B6A75] bg-teal-50/50 shadow-xs ring-2 ring-[#0B6A75]/10'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="font-bold text-stone-900 text-xs sm:text-sm">
                    {DELIVERY_CONFIG.outsideDhaka.name}
                  </div>
                  <span className="text-xs font-extrabold text-[#0B6A75] font-tabular">
                    ৳{DELIVERY_CONFIG.outsideDhaka.fee}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 mt-2">
                  Chittagong, Sylhet, Rajshahi, Khulna &amp; all 64 districts (2–4 days)
                </div>
              </label>
            </div>
          </div>

          {/* Full Delivery Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">
              Complete Delivery Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
              <textarea
                required
                rows={3}
                placeholder="House no, Flat / Apartment, Road / Sector, Landmark, Area, City"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (formErrors.address) {
                    setFormErrors((prev) => ({ ...prev, address: '' }));
                  }
                }}
                className={`w-full pl-10 pr-4 py-3 bg-stone-50 border rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B6A75] transition-all ${
                  formErrors.address ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300'
                }`}
              />
            </div>
            {formErrors.address && (
              <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{formErrors.address}</span>
              </p>
            )}
          </div>

          {/* Optional Order Note */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-stone-700">
                Order Note / Special Instructions
              </label>
              <span className="text-[11px] text-stone-400">Optional</span>
            </div>
            <textarea
              rows={2}
              placeholder="e.g. Call before delivery, need urgent delivery for an exhibition, preferred delivery time"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B6A75] transition-all"
            />
          </div>
        </form>

        {/* Right Column: Live Order Summary & WhatsApp Confirmation Button */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-base font-heading">
                Order Review
              </h3>
              <span className="text-xs text-stone-500 font-tabular">
                {cart.length} unique {cart.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Line items thumbnail list */}
            <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-stone-50 pr-1">
              {cart.map((item) => {
                const effectivePrice = item.product.discountPrice ?? item.product.price;
                return (
                  <div key={item.product.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.images[0] || '/src/assets/images/hero_art_craft_workspace_1793820211229.jpg'}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 object-cover rounded-lg border border-stone-200 bg-stone-50 shrink-0"
                      />
                      <div className="max-w-[170px] sm:max-w-[210px]">
                        <div className="text-xs font-semibold text-stone-900 truncate">
                          {item.product.name}
                        </div>
                        <div className="text-[11px] text-stone-500 font-tabular">
                          Qty: {item.quantity} × ৳{effectivePrice}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-stone-900 font-tabular">
                      ৳{effectivePrice * item.quantity}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Breakdown calculations */}
            <div className="pt-4 border-t border-stone-200 space-y-2.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-bold text-stone-900 font-tabular">৳{cartSubtotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>
                  Delivery Charge ({deliveryArea === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}):
                </span>
                <span className="font-bold text-[#0B6A75] font-tabular">
                  {deliveryCharge === 0 ? 'Free' : `৳${deliveryCharge}`}
                </span>
              </div>
            </div>

            {/* Live Grand Total */}
            <div className="pt-4 border-t-2 border-dashed border-stone-200 flex justify-between items-baseline">
              <div>
                <span className="font-bold text-stone-900 text-base">Grand Total</span>
                <div className="text-[11px] text-stone-400">Subtotal + Delivery</div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-[#0B6A75] font-tabular">
                  ৳{grandTotal}
                </span>
                <span className="text-xs text-stone-500 block font-normal">BDT</span>
              </div>
            </div>

            {/* Primary Action: Confirm Order on WhatsApp */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmWhatsApp}
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-2xl shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white text-emerald-700" />
                <span>Confirm Order on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
