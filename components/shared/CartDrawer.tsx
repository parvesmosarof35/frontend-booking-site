'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import {
  setCartDrawerOpen,
  toggleCartDrawer,
} from '@/store/slices/uiSlice';
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  applyPromo,
  removePromo,
} from '@/store/slices/cartSlice';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  CreditCard,
  Building,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.ui.cartDrawerOpen);
  const cart = useSelector((state: RootState) => state.cart);

  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedMethod, setSelectedMethod] = useState<'COD' | 'bKash' | 'Nagad' | 'Rocket' | 'Bank'>('COD');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [promoInput, setPromoInput] = useState('');

  // Fetch payment settings
  useEffect(() => {
    if (isOpen) {
      api.get('/payment-settings').then((res) => {
        setPaymentSettings(res.data);
        if (res.data?.codOnlyMode) {
          setSelectedMethod('COD');
        } else if (selectedMethod === 'COD') {
          setSelectedMethod('bKash');
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  const isCodOnly = paymentSettings?.codOnlyMode ?? false;
  const deliveryFee = orderType === 'pickup' ? 0 : (isCodOnly ? 0 : (paymentSettings?.deliveryCharge ?? 60));

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);

  let discount = 0;
  if (cart.appliedPromo) {
    if (cart.appliedPromo.discountType === 'percentage') {
      discount = (subtotal * cart.appliedPromo.value) / 100;
    } else {
      discount = Math.min(cart.appliedPromo.value, subtotal);
    }
  }

  const grandTotal = Math.max(0, subtotal - discount + deliveryFee);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    try {
      const { data } = await api.get('/offers?activeOnly=true');
      const match = data.find(
        (o: any) => o.promoCode?.toUpperCase() === promoInput.trim().toUpperCase(),
      );
      if (match) {
        dispatch(
          applyPromo({
            code: match.promoCode,
            discountType: match.discountType,
            value: match.value,
          }),
        );
        toast.success(`Promo code "${match.promoCode}" applied!`);
        setPromoInput('');
      } else {
        toast.error('Invalid or expired promo code');
      }
    } catch {
      toast.error('Could not validate promo code');
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !whatsapp || !address) {
      toast.error('Please fill in Name, WhatsApp number, and Delivery Address');
      return;
    }

    if (!isCodOnly && selectedMethod !== 'COD' && !transactionId.trim()) {
      toast.error(`Please enter your ${selectedMethod} Transaction ID`);
      return;
    }

    setLoadingOrder(true);
    try {
      const payload = {
        items: cart.items.map((i) => ({ menuItemId: i.menuItemId, qty: i.qty })),
        customerName,
        whatsapp,
        address,
        orderType,
        paymentMethod: isCodOnly ? 'COD' : selectedMethod,
        transactionId: isCodOnly ? '' : transactionId,
        promoCode: cart.appliedPromo?.code,
        notes,
      };

      const { data } = await api.post('/orders', payload);
      setConfirmedOrder(data);
      dispatch(clearCart());
      setCheckoutStep('success');
      toast.success('Order placed successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoadingOrder(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              {checkoutStep === 'cart'
                ? `Your Order Cart (${cart.items.length})`
                : checkoutStep === 'checkout'
                ? 'Complete Your Order'
                : 'Order Confirmed!'}
            </h2>
          </div>
          <button
            onClick={() => {
              dispatch(setCartDrawerOpen(false));
              if (checkoutStep === 'success') setCheckoutStep('cart');
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* STEP 1: CART LIST */}
          {checkoutStep === 'cart' && (
            <>
              {cart.items.length === 0 ? (
                <div className="py-20 text-center text-slate-400 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-amber-400">
                    <ShoppingBag className="w-8 h-8 opacity-40" />
                  </div>
                  <p className="text-base font-medium">Your cart is currently empty.</p>
                  <p className="text-xs text-slate-500">Add delicious gourmet items from our menu to begin.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div
                      key={item.menuItemId}
                      className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl"
                    >
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200'}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover bg-slate-800"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">{item.name}</h4>
                        <div className="text-amber-400 font-bold text-sm mt-0.5">
                          {formatPrice(item.price * item.qty)}
                        </div>
                        <div className="text-[11px] text-slate-400">{formatPrice(item.price)} each</div>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                        <button
                          onClick={() => dispatch(updateQuantity({ menuItemId: item.menuItemId, qty: item.qty - 1 }))}
                          className="p-1 hover:text-amber-400 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-white px-1">{item.qty}</span>
                        <button
                          onClick={() => dispatch(updateQuantity({ menuItemId: item.menuItemId, qty: item.qty + 1 }))}
                          className="p-1 hover:text-amber-400 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => dispatch(removeFromCart(item.menuItemId))}
                        className="p-2 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Promo Code Input */}
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Have a voucher code?
                      </span>
                      {cart.appliedPromo && (
                        <button
                          onClick={() => dispatch(removePromo())}
                          className="text-rose-400 hover:underline text-[11px]"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {cart.appliedPromo ? (
                      <div className="text-xs text-emerald-400 bg-emerald-950/50 p-2 rounded-lg border border-emerald-800/40 font-medium flex justify-between">
                        <span>Code &quot;{cart.appliedPromo.code}&quot; active</span>
                        <span>-{cart.appliedPromo.discountType === 'percentage' ? `${cart.appliedPromo.value}%` : `৳${cart.appliedPromo.value}`}</span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. ROYAL20"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-amber-400"
                        />
                        <button
                          onClick={handleApplyPromo}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 2: CHECKOUT FORM */}
          {checkoutStep === 'checkout' && (
            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              {/* Order Type */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    orderType === 'delivery'
                      ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Home Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('pickup')}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    orderType === 'pickup'
                      ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Restaurant Pickup
                </button>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Parves Mosarof"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +8801712345678"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Delivery Address *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House, Flat, Road, Area (e.g. House 14, Road 11, Banani, Dhaka)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Special Instructions (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Less spicy, call before delivery"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* PAYMENT SECTION - Governed by PaymentSettings (§2.2.E) */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  Payment Method
                </label>

                {isCodOnly ? (
                  /* COD ONLY MODE */
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-emerald-200/80">Pay with cash when your food arrives. Free delivery applied!</p>
                    </div>
                  </div>
                ) : (
                  /* MANUAL MOBILE BANKING & BANK TRANSFER MODE */
                  <div className="space-y-3">
                    {/* Method Selector Tabs */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['bKash', 'Nagad', 'Rocket', 'Bank'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setSelectedMethod(method)}
                          className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition ${
                            selectedMethod === method
                              ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>

                    {/* Instructions Card for selected method */}
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1 text-slate-300">
                      {selectedMethod === 'bKash' && (
                        <div>
                          <span className="font-semibold text-white">bKash Send Money / Payment:</span>
                          <p className="text-amber-400 font-mono font-bold text-sm mt-0.5">{paymentSettings?.bkashNumber || '+8801700000001'}</p>
                        </div>
                      )}
                      {selectedMethod === 'Nagad' && (
                        <div>
                          <span className="font-semibold text-white">Nagad Number:</span>
                          <p className="text-amber-400 font-mono font-bold text-sm mt-0.5">{paymentSettings?.nagadNumber || '+8801800000002'}</p>
                        </div>
                      )}
                      {selectedMethod === 'Rocket' && (
                        <div>
                          <span className="font-semibold text-white">Rocket Number:</span>
                          <p className="text-amber-400 font-mono font-bold text-sm mt-0.5">{paymentSettings?.rocketNumber || '+8801900000003'}</p>
                        </div>
                      )}
                      {selectedMethod === 'Bank' && (
                        <div className="space-y-1">
                          <p className="font-semibold text-white flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-amber-400" />
                            {paymentSettings?.bankDetails?.bankName || 'City Bank'}
                          </p>
                          <p className="text-[11px]">A/C: <strong className="text-amber-400">{paymentSettings?.bankDetails?.accountNumber || '123456789'}</strong></p>
                          <p className="text-[11px]">Name: {paymentSettings?.bankDetails?.accountName || 'The Royal Grand Bistro'}</p>
                          <p className="text-[11px]">Branch: {paymentSettings?.bankDetails?.branch || 'Banani'}</p>
                        </div>
                      )}
                    </div>

                    {/* Transaction ID Input */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {selectedMethod} Transaction / Reference ID *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 9B872KJ3"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white uppercase focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition"
                >
                  Back to Cart
                </button>
                <button
                  type="submit"
                  disabled={loadingOrder}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg disabled:opacity-50"
                >
                  {loadingOrder ? 'Processing...' : `Confirm (${formatPrice(grandTotal)})`}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {checkoutStep === 'success' && confirmedOrder && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Order Confirmed!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Order Number: <strong className="text-amber-400 font-mono text-sm">{confirmedOrder.orderNumber}</strong>
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left text-xs space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <strong className="text-white">{confirmedOrder.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>WhatsApp:</span>
                  <strong className="text-white">{confirmedOrder.whatsapp}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <strong className="text-amber-400">{confirmedOrder.paymentMethod}</strong>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm text-white">
                  <span>Total Payable:</span>
                  <span className="text-amber-400">{formatPrice(confirmedOrder.total)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href={`https://wa.me/8801712345678?text=Hello%20The%20Royal%20Grand%20Bistro,%20I%20just%20placed%20order%20${confirmedOrder.orderNumber}%20for%20BDT%20${confirmedOrder.total}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow"
                >
                  <MessageSquare className="w-4 h-4" /> Notify Restaurant on WhatsApp
                </a>
                <button
                  onClick={() => {
                    dispatch(setCartDrawerOpen(false));
                    setCheckoutStep('cart');
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
                >
                  Close & Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Pricing Summary (Only for Cart step) */}
        {checkoutStep === 'cart' && cart.items.length > 0 && (
          <div className="p-5 border-t border-slate-800 bg-slate-950 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="text-slate-200 font-semibold">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount:</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Delivery Fee:</span>
                <span className="text-slate-200">{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                <span>Total:</span>
                <span className="text-amber-400 text-base">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => setCheckoutStep('checkout')}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
