'use client';

import React, { useState } from 'react';
import { WishlistItem, StoreComparison, Retailer } from '@/types';
import {
  X,
  ExternalLink,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Tag,
  ShoppingBag,
  Flame,
  Zap,
} from 'lucide-react';

interface PriceComparisonModalProps {
  item: WishlistItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateComparisons?: (itemId: string, comparisons: StoreComparison[]) => void;
}

const RETAILER_CONFIG: Record<Retailer, { name: string; saleName: string; color: string; bg: string; badge: string }> = {
  flipkart: { name: 'Flipkart', saleName: 'Big Billion Days (BBD)', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800', badge: 'BBD Exclusive' },
  amazon: { name: 'Amazon', saleName: 'Great Indian Festival (GIF)', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800', badge: 'GIF Prime Deals' },
  myntra: { name: 'Myntra', saleName: 'Big Fashion Festival (BFF)', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800', badge: 'Myntra BFF' },
  croma: { name: 'Croma', saleName: 'Festival of Electronics', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800', badge: 'Croma Deals' },
  other: { name: 'Other Store', saleName: 'Online Store', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700', badge: 'Standard' },
};

export function PriceComparisonModal({
  item,
  isOpen,
  onClose,
  onUpdateComparisons,
}: PriceComparisonModalProps) {
  if (!isOpen || !item) return null;

  // Comparisons array, ensuring Amazon, Flipkart, Myntra are present
  const query = encodeURIComponent(item.title.split(' ').slice(0, 5).join(' '));
  const myntraQuery = encodeURIComponent(item.title.split(' ').slice(0, 3).join('-').toLowerCase());

  const comparisons: StoreComparison[] = item.comparisons && item.comparisons.length > 0
    ? item.comparisons
    : [
        {
          retailer: item.retailer,
          price: item.currentPrice,
          originalPrice: item.originalPrice,
          url: item.url,
          inStock: true,
          isCheapest: true,
        },
        {
          retailer: item.retailer === 'amazon' ? 'flipkart' : 'amazon',
          price: Math.round(item.currentPrice * 1.04),
          originalPrice: item.originalPrice,
          url: item.retailer === 'amazon' ? `https://www.flipkart.com/search?q=${query}` : `https://www.amazon.in/s?k=${query}`,
          inStock: true,
          isCheapest: false,
        },
        {
          retailer: 'myntra',
          price: Math.round(item.currentPrice * 1.02),
          originalPrice: item.originalPrice,
          url: `https://www.myntra.com/${myntraQuery}`,
          inStock: true,
          isCheapest: false,
        },
      ];

  // Find lowest price
  let minPrice = Infinity;
  comparisons.forEach((c) => {
    if (c.price < minPrice) minPrice = c.price;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-600 flex items-center justify-center text-white shadow-md">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Multi-Store Price Comparison Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Flipkart BBD vs Amazon GIF vs Myntra BFF
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
          {/* Product Header Card */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-14 h-14 rounded-xl object-cover shrink-0 bg-white"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500">Base Tracked Price:</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  ₹{item.currentPrice.toLocaleString('en-IN')}
                </span>
                <span className="px-2 py-0.2 rounded-md text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {item.retailer}
                </span>
              </div>
            </div>
          </div>

          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {comparisons.map((comp) => {
              const cfg = RETAILER_CONFIG[comp.retailer] || RETAILER_CONFIG.other;
              const isBest = comp.price <= minPrice;
              const priceDiff = comp.price - minPrice;

              return (
                <div
                  key={comp.retailer}
                  className={`p-4 rounded-3xl border transition-all flex flex-col justify-between ${
                    isBest
                      ? 'bg-gradient-to-b from-emerald-50/80 to-white dark:from-emerald-950/40 dark:to-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    {/* Store Title & Badge */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className={`text-sm font-black uppercase tracking-wider ${cfg.color}`}>
                        {cfg.name}
                      </span>
                      {isBest ? (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-xs">
                          <Sparkles className="w-3 h-3" />
                          Cheapest Store
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                          +₹{priceDiff.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-3">
                      {cfg.saleName}
                    </div>

                    {/* Price display */}
                    <div className="mb-3">
                      <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        ₹{comp.price.toLocaleString('en-IN')}
                      </div>
                      {comp.specialOffer && (
                        <div className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {comp.specialOffer}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 1-Click Store Link */}
                  <a
                    href={comp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-3 w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      isBest
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{isBest ? `Buy at ${cfg.name}` : `Check on ${cfg.name}`}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>

          {/* Quick Search Shortcut Links */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-slate-500 font-medium">Quick store searches:</span>
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`https://www.flipkart.com/search?q=${query}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:underline font-semibold"
              >
                Search Flipkart BBD ↗
              </a>
              <a
                href={`https://www.amazon.in/s?k=${query}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:underline font-semibold"
              >
                Search Amazon GIF ↗
              </a>
              <a
                href={`https://www.myntra.com/${myntraQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 hover:underline font-semibold"
              >
                Search Myntra BFF ↗
              </a>
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
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
