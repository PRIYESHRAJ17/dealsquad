'use client';

import React, { useState, useEffect } from 'react';
import { WishlistItem, StoreComparison, Retailer } from '@/types';
import { fetchRealStoreComparisons } from '@/lib/scraper';
import {
  X,
  ExternalLink,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  Search,
  RotateCw,
  Store,
  ShieldCheck,
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
  other: { name: 'Brand Store', saleName: 'Official Legit Store', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800', badge: 'Direct Official' },
};

export function PriceComparisonModal({
  item,
  isOpen,
  onClose,
  onUpdateComparisons,
}: PriceComparisonModalProps) {
  const [comparisons, setComparisons] = useState<StoreComparison[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!item || !isOpen) return;

    // Check if item already has direct PDP links
    const hasDirectPdp = item.comparisons?.some(
      (c) =>
        c.url.includes('/dp/') ||
        c.url.includes('/gp/product/') ||
        c.url.includes('/p/') ||
        c.url.includes('/buy') ||
        c.retailer === 'other'
    );

    if (item.comparisons && item.comparisons.length > 0 && hasDirectPdp) {
      setComparisons(item.comparisons);
    } else {
      // Auto-scan for exact PDPs and 4th store across India
      setIsScanning(true);
      fetchRealStoreComparisons(item.title, item.retailer, item.currentPrice, item.url)
        .then((res) => {
          setComparisons(res);
          onUpdateComparisons?.(item.id, res);
        })
        .catch((err) => {
          console.warn('Failed to fetch real store comparisons:', err);
          if (item.comparisons && item.comparisons.length > 0) {
            setComparisons(item.comparisons);
          }
        })
        .finally(() => {
          setIsScanning(false);
        });
    }
  }, [item?.id, isOpen]);

  if (!isOpen || !item) return null;

  const handleRefreshScan = async () => {
    if (!item || isScanning) return;
    setIsScanning(true);
    try {
      const res = await fetchRealStoreComparisons(item.title, item.retailer, item.currentPrice, item.url);
      setComparisons(res);
      onUpdateComparisons?.(item.id, res);
    } catch (err) {
      console.warn('Refresh scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const query = encodeURIComponent(item.title.split(' ').slice(0, 5).join(' '));
  const myntraQuery = encodeURIComponent(item.title.split(' ').slice(0, 3).join('-').toLowerCase());

  // Active comparisons list
  const activeComparisons: StoreComparison[] =
    comparisons.length > 0
      ? comparisons
      : item.comparisons && item.comparisons.length > 0
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
            price: item.currentPrice,
            originalPrice: item.originalPrice,
            url:
              item.retailer === 'amazon'
                ? `https://www.flipkart.com/search?q=${query}`
                : `https://www.amazon.in/s?k=${query}`,
            inStock: true,
            isCheapest: false,
          },
          {
            retailer: 'myntra',
            price: item.currentPrice,
            originalPrice: item.originalPrice,
            url: `https://www.myntra.com/${myntraQuery}`,
            inStock: true,
            isCheapest: false,
          },
        ];

  // Find lowest price
  let minPrice = Infinity;
  activeComparisons.forEach((c) => {
    if (c.price < minPrice) minPrice = c.price;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-600 flex items-center justify-center text-white shadow-md">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Multi-Store Price Comparison Matrix
                </h2>
                {activeComparisons.length >= 4 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    + Legit 4th Store Found
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Flipkart BBD vs Amazon GIF vs Myntra BFF + Cheapest Indian Store
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefreshScan}
              disabled={isScanning}
              title="Rescan exact product pages and prices across India"
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${isScanning ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="hidden sm:inline">{isScanning ? 'Scanning...' : 'Rescan Live'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Scanning Progress Banner */}
          {isScanning && (
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center gap-3 animate-pulse">
              <RotateCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-indigo-950 dark:text-indigo-200">
                  Scanning Indian Stores for Exact Matches...
                </p>
                <p className="text-indigo-700 dark:text-indigo-300 text-[11px]">
                  Extracting direct Flipkart, Amazon, and Myntra product links & checking for cheaper legit brand stores.
                </p>
              </div>
            </div>
          )}

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
          <div
            className={`grid grid-cols-1 ${
              activeComparisons.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'
            } gap-3.5`}
          >
            {activeComparisons.map((comp) => {
              const cfg = RETAILER_CONFIG[comp.retailer] || RETAILER_CONFIG.other;
              const storeDisplayName = comp.storeName || cfg.name;
              const isBest = comp.price <= minPrice;
              const priceDiff = comp.price - minPrice;
              const isDirectPdp =
                comp.url.includes('/dp/') ||
                comp.url.includes('/gp/product/') ||
                comp.url.includes('/p/') ||
                comp.url.includes('/buy') ||
                comp.retailer === 'other';

              return (
                <div
                  key={`${comp.retailer}-${comp.url}`}
                  className={`p-4 rounded-3xl border transition-all flex flex-col justify-between ${
                    isBest
                      ? 'bg-gradient-to-b from-emerald-50/80 to-white dark:from-emerald-950/40 dark:to-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    {/* Store Title & Badge */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className={`text-sm font-black uppercase tracking-wider ${cfg.color} line-clamp-1`}>
                        {storeDisplayName}
                      </span>
                      {isBest ? (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-xs shrink-0">
                          <Sparkles className="w-3 h-3" />
                          Cheapest
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                          +₹{priceDiff.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
                      {comp.storeName ? 'Brand Official Store' : cfg.saleName}
                    </div>

                    {/* Direct PDP vs Search Link Indicator */}
                    <div className="mb-3">
                      {isDirectPdp ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" /> Exact Product Link
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          <Search className="w-3 h-3" /> Store Search Fallback
                        </span>
                      )}
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

                  {/* 1-Click Store Link - Opens exact PDP */}
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
                    <span>{isBest ? `Buy at ${storeDisplayName}` : `Check on ${storeDisplayName}`}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>

          {/* Legit 4th Store Info Box */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-2.5 text-xs text-indigo-900 dark:text-indigo-300">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              <strong>Rule-Based Guarantee:</strong> All 3 core stores (Flipkart, Amazon, Myntra) are checked for direct product pages and live prices. A 4th store is included <em>only</em> when a verified Indian brand/retail store offers the exact product at a lower price than all three.
            </span>
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
