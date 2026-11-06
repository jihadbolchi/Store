import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { DELIVERY_CONFIG } from '../config/delivery';
import { buildWhatsAppOrderMessage, getWhatsAppOrderUrl } from '../utils/whatsapp';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  MessageCircle,
  Printer,
  ShoppingBag,
  Truck,
  ArrowRight,
  Sparkles,
  MapPin,
  Phone,
  Calendar,
} from 'lucide-react';

export const OrderSuccessView: React.FC = () => {
  const { lastCompletedOrder, navigateTo } = useStore();

  useEffect(() => {
    // Launch celebratory artisan confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0B6A75', '#14B8A6', '#FFB300', '#FF8F00', '#E11D48'],
      });
    } catch (e) {
      // safe fallback if confetti unavailable
    }
  }, []);

  if (!lastCompletedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900 font-heading">
          No Recent Order Found
        </h2>
        <button
          onClick={() => navigateTo('shop')}
          className="px-5 py-2.5 bg-[#0B6A75] text-white text-xs font-semibold rounded-xl"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const order = lastCompletedOrder;
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleReopenWhatsApp = () => {
    const message = buildWhatsAppOrderMessage(
      {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        customer: order.customer,
        items: order.items,
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        grandTotal: order.grandTotal,
        notes: order.notes,
      },
      window.location.origin
    );
    const waUrl = getWhatsAppOrderUrl(message);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Success Badge & Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#0B6A75]">
          Order Confirmed
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
          Thank You, {order.customer.fullName}!
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
          Your order has been recorded with reference number{' '}
          <strong className="text-stone-900 font-tabular font-bold">#{order.orderNumber}</strong>. 
          Our Dhaka team is preparing your supplies for dispatch.
        </p>
      </div>

      {/* Main Order Receipt Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6 print:border-none print:shadow-none">
        {/* Receipt Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-stone-200">
          <div>
            <div className="text-xs text-stone-500">Order Reference</div>
            <div className="text-lg font-bold text-stone-900 font-tabular">#{order.orderNumber}</div>
          </div>
          <div className="text-left sm:text-right text-xs text-stone-500">
            <div className="flex items-center gap-1.5 sm:justify-end">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
            <div className="mt-0.5">
              Payment:{' '}
              <span className="font-semibold text-stone-800 uppercase">
                {order.paymentMethod === 'whatsapp' ? 'WhatsApp Order / bKash' : 'Cash on Delivery'}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Shipping Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-stone-100 text-xs">
          <div className="space-y-1.5">
            <div className="font-bold text-stone-900">Customer Details</div>
            <div className="text-stone-700 font-medium">{order.customer.fullName}</div>
            <div className="text-stone-500 font-tabular">{order.customer.phone}</div>
          </div>

          <div className="space-y-1.5">
            <div className="font-bold text-stone-900">Delivery Address</div>
            <div className="text-stone-700">{order.customer.address}</div>
            <div className="text-[#0B6A75] font-semibold">
              {order.deliveryCharge === 0
                ? 'Free delivery'
                : order.customer.deliveryArea === 'inside_dhaka'
                  ? `Inside Dhaka Metro (৳${DELIVERY_CONFIG.insideDhaka.fee} delivery fee)`
                  : `Outside Dhaka (৳${DELIVERY_CONFIG.outsideDhaka.fee} courier fee)`}
            </div>
            {order.notes && (
              <div className="text-stone-500 italic mt-1">Note: "{order.notes}"</div>
            )}
          </div>
        </div>

        {/* Order Items Table */}
        <div className="space-y-3">
          <div className="font-bold text-stone-900 text-xs uppercase tracking-wider">
            Items in Order ({order.items.length})
          </div>
          <div className="divide-y divide-stone-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-cover rounded-lg border border-stone-200 bg-stone-50"
                  />
                  <div>
                    <div className="text-xs font-semibold text-stone-900">{item.productName}</div>
                    <div className="text-[11px] text-stone-500 font-tabular">
                      Qty: {item.quantity} × ৳{item.price}
                    </div>
                  </div>
                </div>
                <div className="text-xs font-bold text-stone-900 font-tabular">
                  ৳{item.lineTotal}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-stone-200 space-y-2 text-xs">
          <div className="flex justify-between text-stone-600">
            <span>Items Subtotal:</span>
            <span className="font-semibold text-stone-900 font-tabular">৳{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Delivery Charge:</span>
            <span className="font-semibold text-stone-900 font-tabular">৳{order.deliveryCharge}</span>
          </div>
          <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline text-sm">
            <span className="font-bold text-stone-900">Grand Total:</span>
            <span className="text-xl font-extrabold text-[#0B6A75] font-tabular">
              ৳{order.grandTotal} BDT
            </span>
          </div>
        </div>

        {/* Actions strip */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleReopenWhatsApp}
              className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Open Order on WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
          </div>

          <button
            onClick={() => navigateTo('shop')}
            className="text-xs font-semibold text-[#0B6A75] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
