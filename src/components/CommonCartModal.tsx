'use client';

import React from 'react';
import { WishlistItem, Member, CardOfferRecommendation } from '@/types';
import {
  X,
  ShoppingBag,
  Trash2,
  CreditCard,
  ExternalLink,
  MessageCircle,
  Plus,
  Minus,
} from 'lucide-react';

interface CommonCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: WishlistItem[];
  members: Member[];
  currentMember: Member | null;
  onRemoveFromCart: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, qty: number) => void;
  onOpenDetail: (item: WishlistItem) => void;
  onOpenManageCards?: () => void;
}

export function CommonCartModal({
  isOpen,
  onClose,
  cartItems,
  members,
  onRemoveFromCart,
  onUpdateQuantity,
  onOpenDetail,
  onOpenManageCards,
}: CommonCartModalProps) {
  if (!isOpen) return null;

  // Exact Totals (User req #7)
  const subtotal = cartItems.reduce((acc, i) => acc + i.currentPrice * (i.cartQuantity || 1), 0);
  const totalMrp = cartItems.reduce((acc, i) => acc + i.originalPrice * (i.cartQuantity || 1), 0);
  const rawSavings = Math.max(0, totalMrp - subtotal);

  // Compute Card Discounts ONLY from cards actually saved by squad members (User req #8)
  const userCardOffers: CardOfferRecommendation[] = [];

  members.forEach((m) => {
    if (m.cardsHeld && m.cardsHeld.length > 0) {
      m.cardsHeld.forEach((card) => {
        const lower = card.toLowerCase();
        let pct = 5;
        let cap: number | undefined = undefined;

        if (lower.includes('10%') || lower.includes('regalia') || lower.includes('sbi')) {
          pct = 10;
          cap = 1500;
        } else if (lower.includes('7.5%')) {
          pct = 7.5;
          cap = 1000;
        } else if (lower.includes('5%') || lower.includes('axis') || lower.includes('icici') || lower.includes('millennia') || lower.includes('cashback')) {
          pct = 5;
        }

        const rawDisc = Math.round(subtotal * (pct / 100));
        const discountAmount = cap ? Math.min(cap, rawDisc) : rawDisc;

        userCardOffers.push({
          cardName: `${m.name}’s ${card}`,
          memberId: m.id,
          memberName: m.name,
          discountPercentage: pct,
          maxDiscount: cap,
          discountAmount,
          finalPrice: Math.max(0, subtotal - discountAmount),
          badge: `${pct}% Instant Discount`,
        });
      });
    }
  });

  userCardOffers.sort((a, b) => b.discountAmount - a.discountAmount);
  const bestCard = userCardOffers.length > 0 ? userCardOffers[0] : null;

  // WhatsApp Group Share (User req #4)
  const handleWhatsAppShare = () => {
    let msg = `🛒 *DealSquad Common Cart Summary*\n\n`;
    cartItems.forEach((i, idx) => {
      const owner = members.find((m) => m.id === i.addedBy);
      msg += `${idx + 1}. *${i.title}* (${i.retailer.toUpperCase()})\n`;
      msg += `   • Price: ₹${i.currentPrice.toLocaleString('en-IN')} x ${i.cartQuantity || 1}\n`;
      msg += `   • Added by: ${owner ? owner.name : i.addedByName}\n`;
      msg += `   • Link: ${i.url}\n\n`;
    });
    msg += `📦 *Total Items:* ${cartItems.length}\n`;
    msg += `💰 *Cart Subtotal:* ₹${subtotal.toLocaleString('en-IN')}\n`;
    if (bestCard) {
      msg += `💳 *Best Card:* ${bestCard.cardName} (Save extra ₹${bestCard.discountAmount.toLocaleString('en-IN')})\n`;
      msg += `🔥 *Final Effective Total:* ₹${bestCard.finalPrice.toLocaleString('en-IN')}\n`;
    }
    const text = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Common Squad Cart</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {cartItems.length} items pooled together for squad checkout
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Exact Cart Items (User req #7) */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {cartItems.length > 0 ? (
            cartItems.map((item) => {
              const owner = members.find((m) => m.id === item.addedBy);
              const qty = item.cartQuantity || 1;
              const lineTotal = item.currentPrice * qty;

              return (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 bg-white"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] uppercase font-bold text-indigo-500">
                        {item.retailer}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        Added by {owner ? owner.name : item.addedByName}
                      </span>
                    </div>

                    <h4
                      onClick={() => onOpenDetail(item)}
                      className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      {item.title}
                    </h4>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          ₹{lineTotal.toLocaleString('en-IN')}
                        </span>
                        {qty > 1 && (
                          <span className="text-[10px] text-slate-400">
                            (₹{item.currentPrice.toLocaleString('en-IN')} ea)
                          </span>
                        )}
                      </div>

                      {/* Quantity Selector & Link */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-1.5 py-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, qty - 1))}
                            className="p-0.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1.5">{qty}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, qty + 1)}
                            className="p-0.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Open in store"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => onRemoveFromCart(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Remove from cart"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <span>Common cart is empty. Click "+ Cart" on any deal to add!</span>
            </div>
          )}
        </div>

        {/* Modal Footer: Totals, Best Card, & WhatsApp Group Share */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 space-y-3">
            {/* Card Offer Bar (Based only on user cards - User req #8) */}
            {bestCard ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-900 dark:text-emerald-200">
                      Best Card: {bestCard.cardName}
                    </span>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Instant discount: ₹{bestCard.discountAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <span className="font-black text-sm text-emerald-700 dark:text-emerald-300">
                  ₹{bestCard.finalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            ) : onOpenManageCards ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenManageCards();
                }}
                className="w-full p-2.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:border-indigo-400 flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                <span>No bank cards entered yet. Click to add your cards ➔</span>
              </button>
            ) : null}

            {/* Subtotal Row */}
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500 uppercase font-bold">Total Cart Value</span>
                {rawSavings > 0 && (
                  <span className="ml-2 text-xs font-bold text-emerald-600">
                    (₹{rawSavings.toLocaleString('en-IN')} off MRP)
                  </span>
                )}
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                ₹{subtotal.toLocaleString('en-IN')}
              </div>
            </div>

            {/* WhatsApp Group Share Button (User req #4) */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Share Cart to WhatsApp Group</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
