import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateCartQuantity,
    removeFromCart,
    cartCount,
    cartSubtotal,
    navigateTo,
  } = useStore();

  useEffect(() => {
    if (!isCartDrawerOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsCartDrawerOpen(false); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isCartDrawerOpen, setIsCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <button type="button" aria-label="Close shopping bag" onClick={() => setIsCartDrawerOpen(false)} className="absolute inset-0 bg-stone-900/45 backdrop-blur-[2px] transition-opacity duration-300 cursor-default" />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <section role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#006673]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 id="cart-drawer-title" className="font-semibold text-[#202525] font-heading text-base">Your bag</h3>
                <span className="text-xs text-stone-500 font-tabular">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-stone-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-stone-800 text-base mb-1">Your bag is empty</h4>
                <p className="text-xs text-stone-500 mb-6 max-w-xs">
                  Your next creative project starts here.
                </p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigateTo('shop');
                  }}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#006673] hover:bg-[#00545f] rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const effectivePrice = item.product.discountPrice ?? item.product.price;
                return (
                  <div key={item.product.id} className="py-4 flex gap-3.5 items-center">
                    <img
                      src={item.product.images[0] || '/assets/images/product-placeholder.webp'}
                      alt={item.product.name}
                      loading="lazy"
                      onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/assets/images/product-placeholder.webp'; }}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-cover rounded-xl border border-stone-200 shrink-0 bg-stone-50"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer shrink-0"
                          aria-label={`Remove ${item.product.name} from cart`}
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5 font-tabular">
                        ৳{effectivePrice} each
                      </div>

                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 p-0.5">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.product.name}`} className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-7 text-center text-xs font-semibold font-tabular">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            aria-label={`Increase quantity of ${item.product.name}`} className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-stone-900 font-tabular">
                            ৳{effectivePrice * item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer with Subtotal and Checkout actions */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-stone-600 font-medium">Subtotal</span>
                <span className="font-extrabold text-stone-900 text-base font-tabular">৳{cartSubtotal}</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Delivery fees calculated during checkout.
              </p>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigateTo('checkout');
                  }}
                  className="w-full py-3 px-4 bg-[#005C6E] hover:bg-[#004b5a] active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigateTo('cart');
                  }}
                  className="w-full py-2.5 px-4 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  View Full Cart
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
