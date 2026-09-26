'use client';

import React, { useState } from 'react';
import { Member, WishlistItem } from '@/types';
import { X, Link, Sparkles, Loader2, Plus, ArrowRight, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddItemModalProps {
  members: Member[];
  currentMember: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: (item: WishlistItem) => void;
}

export function AddItemModal({
  members,
  currentMember,
  isOpen,
  onClose,
  onItemAdded,
}: AddItemModalProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback price input ONLY if store anti-bot blocks automatic price reading
  const [needsPriceConfirmation, setNeedsPriceConfirmation] = useState(false);
  const [scrapedData, setScrapedData] = useState<{
    title: string;
    imageUrl: string;
    retailer: string;
    originalPrice?: number;
    brand?: string;
  } | null>(null);
  const [manualPrice, setManualPrice] = useState('');

  if (!isOpen) return null;

  const handleReset = () => {
    setUrl('');
    setError(null);
    setLoading(false);
    setNeedsPriceConfirmation(false);
    setScrapedData(null);
    setManualPrice('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Add Item Function
  const saveItemToDatabase = async (itemPayload: {
    title: string;
    url: string;
    imageUrl: string;
    retailer: string;
    currentPrice: number;
    originalPrice: number;
    brand?: string;
  }) => {
    const activeMember = currentMember || members[0];
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...itemPayload,
        addedBy: activeMember.id,
        addedByName: activeMember.name,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save deal');

    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    onItemAdded(data.item);
    handleClose();
  };

  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Scrape URL
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const data = await scrapeRes.json();
      if (!scrapeRes.ok) throw new Error(data.error || 'Could not fetch page');

      const title = data.title || 'Product Deal';
      const retailer = data.retailer || 'other';
      const imageUrl = data.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
      const price = data.price || 0;
      const originalPrice = data.originalPrice || price;

      // If price was auto-detected > 0, instantly add to wishlist!
      if (price > 0) {
        await saveItemToDatabase({
          title,
          url: cleanUrl,
          imageUrl,
          retailer,
          currentPrice: price,
          originalPrice,
          brand: data.brand,
        });
      } else {
        // If anti-bot blocked the price, prompt ONLY for price (no extra fields!)
        setScrapedData({
          title,
          imageUrl,
          retailer,
          originalPrice,
          brand: data.brand,
        });
        setNeedsPriceConfirmation(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error processing link';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapedData) return;
    const priceNum = parseFloat(manualPrice.replace(/[,₹\s]/g, ''));
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await saveItemToDatabase({
        title: scrapedData.title,
        url: url.trim(),
        imageUrl: scrapedData.imageUrl,
        retailer: scrapedData.retailer,
        currentPrice: Math.round(priceNum),
        originalPrice: scrapedData.originalPrice || Math.round(priceNum * 1.2),
        brand: scrapedData.brand,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save deal';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Add Deal Link</h2>
              <p className="text-[11px] text-slate-500">Paste Flipkart, Amazon, or Myntra product URL</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!needsPriceConfirmation ? (
          /* Simple 1-Step URL Input */
          <form onSubmit={handleSubmitUrl} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Product URL
              </label>
              <div className="relative">
                <Link className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.flipkart.com/... or amazon.in/..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-500 font-semibold">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting price & average...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add Deal</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Clean Single Price Confirmation ONLY if live retailer price was protected */
          <form onSubmit={handleConfirmPrice} className="space-y-4 animate-fade-in">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
              <img
                src={scrapedData?.imageUrl}
                alt="Product"
                className="w-12 h-12 rounded-xl object-cover bg-white"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                  {scrapedData?.title}
                </h4>
                <span className="text-[10px] uppercase font-bold text-indigo-500">
                  {scrapedData?.retailer}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Current Selling Price (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  required
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  placeholder="e.g. 1399"
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Average price and store comparison will be tracked automatically.
              </p>
            </div>

            {error && (
              <p className="text-xs text-rose-500 font-semibold">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !manualPrice}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Track</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
