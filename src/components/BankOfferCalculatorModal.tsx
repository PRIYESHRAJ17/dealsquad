'use client';

import React, { useState } from 'react';
import { WishlistItem, Member, FakeDiscountCheck } from '@/types';
import {
  X,
  CreditCard,
  Sparkles,
  Smartphone,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Percent,
  RefreshCw,
  Coins,
} from 'lucide-react';

interface BankOfferCalculatorModalProps {
  item: WishlistItem | null;
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
}

export function BankOfferCalculatorModal({
  item,
  isOpen,
  onClose,
  members,
}: BankOfferCalculatorModalProps) {
  if (!isOpen || !item) return null;

  // State
  const [selectedCard, setSelectedCard] = useState<'sbi_10' | 'axis_10' | 'icici_10' | 'fk_axis_5' | 'ap_icici_5' | 'custom'>('sbi_10');
  const [customDiscountPct, setCustomDiscountPct] = useState<number>(10);
  const [hasExchange, setHasExchange] = useState<boolean>(false);
  const [exchangeValue, setExchangeValue] = useState<number>(7000);
  const [festiveExchangeBonus, setFestiveExchangeBonus] = useState<number>(3000);

  // Calculations
  let cardDiscount = 0;
  let cardName = 'Bank Instant Discount';

  if (selectedCard === 'sbi_10') {
    cardDiscount = Math.min(1500, Math.round(item.currentPrice * 0.1));
    cardName = 'SBI Credit Card 10% Instant Off (Max ₹1,500)';
  } else if (selectedCard === 'axis_10') {
    cardDiscount = Math.min(1750, Math.round(item.currentPrice * 0.1));
    cardName = 'Axis Bank 10% Instant Discount (Max ₹1,750)';
  } else if (selectedCard === 'icici_10') {
    cardDiscount = Math.min(1500, Math.round(item.currentPrice * 0.1));
    cardName = 'ICICI Bank 10% Instant Discount (Max ₹1,500)';
  } else if (selectedCard === 'fk_axis_5') {
    cardDiscount = Math.round(item.currentPrice * 0.05);
    cardName = 'Flipkart Axis Bank 5% Unlimited Cashback';
  } else if (selectedCard === 'ap_icici_5') {
    cardDiscount = Math.round(item.currentPrice * 0.05);
    cardName = 'Amazon Pay ICICI 5% Unlimited Cashback';
  } else {
    cardDiscount = Math.round(item.currentPrice * (customDiscountPct / 100));
    cardName = `Custom Bank Card (${customDiscountPct}%)`;
  }

  const totalExchange = hasExchange ? exchangeValue + festiveExchangeBonus : 0;
  const netEffectivePrice = Math.max(0, item.currentPrice - cardDiscount - totalExchange);
  const totalSavings = Math.max(0, item.originalPrice - netEffectivePrice);

  const fakeCheck: FakeDiscountCheck = item.fakeDiscountCheck || {
    isFake: false,
    verdict: 'fair_discount',
    historicalAverage: item.currentPrice,
    actualDiscountVsAverage: 0,
    claimedDiscountPercentage: Math.round(((item.originalPrice - item.currentPrice) / item.originalPrice) * 100),
    analysisMessage: 'Verified festive price.',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Festive Bank Offer & True Price Calculator
              </h2>
              <p className="text-xs text-slate-500">
                Simulate card discounts, exchange bumpers, and verify fake discounts
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

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Product Snapshot */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <img src={item.imageUrl} alt={item.title} className="w-14 h-14 rounded-xl object-cover shrink-0 bg-white" />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">{item.title}</h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs">
                <span>Sale Price: <strong className="text-slate-900 dark:text-white">₹{item.currentPrice.toLocaleString('en-IN')}</strong></span>
                <span className="text-slate-400 line-through">MRP: ₹{item.originalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Fake Discount Detector Card */}
          <div
            className={`p-4 rounded-2xl border ${
              fakeCheck.verdict === 'inflated_mrp'
                ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                : fakeCheck.verdict === 'genuine_steal'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                : 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              {fakeCheck.verdict === 'inflated_mrp' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              ) : (
                <Sparkles className="w-4 h-4 text-emerald-600" />
              )}
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {fakeCheck.verdict === 'inflated_mrp'
                  ? '⚠️ Fake Discount Flagged'
                  : fakeCheck.verdict === 'genuine_steal'
                  ? '🔥 Verified Genuine Steal'
                  : 'Fair Sale Pricing'}
              </h4>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {fakeCheck.analysisMessage}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
              <div>Claimed MRP Discount: <strong>{fakeCheck.claimedDiscountPercentage}%</strong></div>
              <div>Real Savings vs 30-Day Avg: <strong>{fakeCheck.actualDiscountVsAverage}%</strong></div>
            </div>
          </div>

          {/* Bank Offer Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Select Festive Bank Card Offer
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'sbi_10', label: 'SBI Card 10% Instant', desc: 'Amazon GIF (Max ₹1,500)', tag: 'Priyesh holds' },
                { id: 'axis_10', label: 'Axis Bank 10% Instant', desc: 'Flipkart BBD (Max ₹1,750)', tag: 'Pravin holds' },
                { id: 'icici_10', label: 'ICICI Bank 10% Instant', desc: 'BBD & Myntra (Max ₹1,500)', tag: 'Sweta holds' },
                { id: 'fk_axis_5', label: 'Flipkart Axis 5% Cashback', desc: 'Unlimited Cashback', tag: 'Pravin holds' },
              ].map((card) => {
                const isSelected = selectedCard === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setSelectedCard(card.id as any)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{card.label}</span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">{card.tag}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{card.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Device Exchange Bonus Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="exchangeToggle" className="flex items-center gap-2 cursor-pointer">
                <Smartphone className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Add Old Device Exchange + Festive Bump
                </span>
              </label>
              <input
                type="checkbox"
                id="exchangeToggle"
                checked={hasExchange}
                onChange={(e) => setHasExchange(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            {hasExchange && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Old Device Value (₹)</label>
                  <input
                    type="number"
                    value={exchangeValue}
                    onChange={(e) => setExchangeValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Festive Exchange Bump (₹)</label>
                  <input
                    type="number"
                    value={festiveExchangeBonus}
                    onChange={(e) => setFestiveExchangeBonus(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Final Effective Calculation Summary */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-xl">
            <div className="flex items-center justify-between mb-3 text-xs text-indigo-200">
              <span>Original Listed Price:</span>
              <span className="line-through">₹{item.currentPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between mb-1.5 text-xs text-emerald-400">
              <span>Card Discount ({cardName}):</span>
              <span>-₹{cardDiscount.toLocaleString('en-IN')}</span>
            </div>
            {hasExchange && (
              <div className="flex items-center justify-between mb-1.5 text-xs text-blue-300">
                <span>Exchange + Festive Bump:</span>
                <span>-₹{totalExchange.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="pt-3 border-t border-indigo-800/60 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-indigo-300 uppercase font-bold tracking-wider">
                  Net Effective Out-Of-Pocket Price
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  ₹{netEffectivePrice.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-500 text-white">
                  Total Saved: ₹{totalSavings.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end bg-slate-50/50 dark:bg-slate-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
}
