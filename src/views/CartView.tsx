import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export const CartView: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    cartSubtotal,
    navigateTo,
  } = useStore();

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 font-heading">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          Explore our collection of authentic resin kits, seasoned Sheesham block prints, organic wax, and artist paints.
        </p>
        <button
          onClick={() => navigateTo('shop')}
          className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-[#005C6E] hover:bg-[#004b5a] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <span>Explore Art Supplies</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <button
            onClick={() => navigateTo('shop')}
            className="text-xs font-semibold text-[#005C6E] hover:underline flex items-center gap-1.5 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
            Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-800 font-medium self-start sm:self-auto cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200 divide-y divide-stone-100 overflow-hidden shadow-xs">
          {cart.map((item) => {
            const effectivePrice = item.product.discountPrice ?? item.product.price;
            return (
              <div key={item.product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center justify-between">
                <div className="flex gap-4 items-center flex-1 min-w-0">
                  <img
                    src={item.product.images[0] || '/src/assets/images/hero_art_craft_workspace_1793820211229.jpg'}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-2xl border border-stone-200 bg-stone-50 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#005C6E]">
                      {item.product.categoryName}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug truncate">
                      {item.product.name}
                    </h3>
                    <div className="text-xs text-stone-500 mt-0.5 font-tabular">
                      ৳{effectivePrice} each
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Line Total */}
                <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 p-1">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 sm:w-10 text-center text-xs sm:text-sm font-bold font-tabular">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <div className="text-sm sm:text-base font-bold text-stone-900 font-tabular">
                      ৳{effectivePrice * item.quantity}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-stone-200 p-6 space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-stone-900 font-heading">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs sm:text-sm text-stone-600">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-bold text-stone-900 font-tabular">৳{cartSubtotal}</span>
            </div>
            <div className="flex justify-between text-stone-500 text-xs">
              <span>Delivery</span>
              <span className="text-right">Calculated at checkout (৳80 / ৳130)</span>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex justify-between items-baseline">
            <span className="font-bold text-stone-900 text-base">Estimated Total</span>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-[#005C6E] font-tabular">
                ৳{cartSubtotal}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigateTo('checkout')}
            className="w-full py-3.5 px-6 bg-[#005C6E] hover:bg-[#004b5a] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
