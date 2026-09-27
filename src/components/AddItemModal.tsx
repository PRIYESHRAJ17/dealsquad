'use client';

import React, { useState } from 'react';
import { Member, WishlistItem } from '@/types';
import { X, Link as LinkIcon, Sparkles, Loader2, Plus, Check, ArrowLeft, Image as ImageIcon, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddItemModalProps {
  members: Member[];
  currentMember: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: (item: WishlistItem) => void;
}

interface ExtractedDeal {
  title: string;
  url: string;
  imageUrl: string;
  retailer: string;
  currentPrice: string | number;
  originalPrice: string | number;
  brand?: string;
  rating?: number;
  reviewsCount?: number;
}

export function AddItemModal({
  members,
  currentMember,
  isOpen,
  onClose,
  onItemAdded,
}: AddItemModalProps) {
  const [urlInput, setUrlInput] = useState('');
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deal, setDeal] = useState<ExtractedDeal | null>(null);
  const [showImageInput, setShowImageInput] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setUrlInput('');
    setStep('input');
    setDeal(null);
    setError(null);
    setLoading(false);
    setSaving(false);
    setShowImageInput(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const extractCleanUrl = (text: string): string => {
    const match = text.match(/https?:\/\/[^\s"'<>]+/i);
    return match ? match[0].trim() : text.trim();
  };

  const deriveSlugTitle = (urlStr: string): string => {
    try {
      const u = new URL(urlStr);
      const parts = u.pathname.split('/').filter(Boolean);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (!/^\d+$/.test(p) && p !== 'buy' && p !== 'p' && p !== 'dp' && p !== 'product') {
          return p
            .replace(/-+/g, ' ')
            .split(' ')
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')
            .trim();
        }
      }
    } catch {}
    return '';
  };

  const detectRetailer = (urlStr: string): string => {
    const low = urlStr.toLowerCase();
    if (low.includes('myntra')) return 'myntra';
    if (low.includes('amazon') || low.includes('amzn') || low.includes('a.co')) return 'amazon';
    if (low.includes('flipkart') || low.includes('fkrt')) return 'flipkart';
    if (low.includes('croma')) return 'croma';
    return 'other';
  };

  const handleFetchDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = extractCleanUrl(urlInput);
    if (!cleanUrl || !cleanUrl.startsWith('http')) {
      setError('Please paste a valid product link (starting with http:// or https://)');
      return;
    }

    setLoading(true);
    setError(null);

    const retailer = detectRetailer(cleanUrl);
    const slugTitle = deriveSlugTitle(cleanUrl);

    try {
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const data = await scrapeRes.json();

      let title = data.title && !data.title.includes('Site Maintenance') && !data.title.includes('Access Denied')
        ? data.title
        : slugTitle || (retailer === 'myntra' ? 'Myntra Fashion Item' : retailer === 'flipkart' ? 'Flipkart Deal' : 'Amazon Deal');

      let priceVal: string | number = '';
      if (data.price && Number(data.price) > 0) {
        priceVal = Number(data.price);
      }

      let origVal: string | number = '';
      if (data.originalPrice && Number(data.originalPrice) > 0) {
        origVal = Number(data.originalPrice);
      } else if (priceVal) {
        origVal = Math.round(Number(priceVal) * 1.25);
      }

      let imageUrl = data.imageUrl || '';
      // If image is an invalid stock unsplash photo, prefer empty so user sees placeholder or can add image
      if (imageUrl.includes('photo-1523275335684') || imageUrl.includes('photo-1553062407-98eeb64c6a62')) {
        imageUrl = '';
      }

      setDeal({
        title,
        url: cleanUrl,
        imageUrl,
        retailer: data.retailer || retailer,
        currentPrice: priceVal,
        originalPrice: origVal,
        brand: data.brand,
        rating: data.rating,
        reviewsCount: data.reviewsCount,
      });

      setStep('preview');
    } catch {
      // Even if network or scraper threw, gracefully show preview with derived slug so user is not blocked
      setDeal({
        title: slugTitle || (retailer === 'myntra' ? 'Myntra Fashion Deal' : 'Product Deal'),
        url: cleanUrl,
        imageUrl: '',
        retailer,
        currentPrice: '',
        originalPrice: '',
      });
      setStep('preview');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDeal = async () => {
    if (!deal) return;

    const priceNum = Number(deal.currentPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price (greater than ₹0)');
      return;
    }

    const origNum = deal.originalPrice && Number(deal.originalPrice) > 0
      ? Number(deal.originalPrice)
      : Math.round(priceNum * 1.25);

    const activeMember = currentMember || members[0];
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: deal.title.trim() || 'Tracked Product',
          url: deal.url,
          imageUrl: deal.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
          retailer: deal.retailer,
          currentPrice: priceNum,
          originalPrice: origNum,
          brand: deal.brand,
          addedBy: activeMember.id,
          addedByName: activeMember.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save deal');

      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      onItemAdded(data.item);
      handleClose();
    } catch (saveErr) {
      setError(saveErr instanceof Error ? saveErr.message : 'Failed to save deal');
    } finally {
      setSaving(false);
    }
  };

  const getRetailerBadge = (ret: string) => {
    switch (ret) {
      case 'myntra':
        return { name: 'Myntra', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' };
      case 'flipkart':
        return { name: 'Flipkart', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
      case 'amazon':
        return { name: 'Amazon', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      case 'croma':
        return { name: 'Croma', bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' };
      default:
        return { name: 'Online Store', bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 transition-all my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {step === 'preview' ? 'Verify & Confirm Deal' : 'Add Deal to Wishlist'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {step === 'preview' ? 'Check real image and price before saving' : 'Paste any Amazon, Flipkart, or Myntra link'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* STEP 1: Paste Link */}
        {step === 'input' && (
          <form onSubmit={handleFetchDeal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Product URL or Shared Text
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste link from browser or share text from app..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                Works with Myntra, Flipkart, Amazon, and mobile app share messages.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !urlInput.trim()}
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Fetching real image & live rates...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Check Deal Details</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Preview & Confirm */}
        {step === 'preview' && deal && (
          <div className="space-y-4 overflow-y-auto pr-1">
            {/* Visual Product Card */}
            <div className="flex gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 items-center">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center">
                {deal.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={deal.imageUrl}
                    alt={deal.title}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 text-[10px] p-2 text-center">
                    <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                    <span>No image</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {(() => {
                    const badge = getRetailerBadge(deal.retailer);
                    return (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                        {badge.name}
                      </span>
                    );
                  })()}
                  <button
                    type="button"
                    onClick={() => setShowImageInput(!showImageInput)}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {showImageInput ? 'Hide Image Link' : 'Change photo link'}
                  </button>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                  {deal.title}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
                    {deal.currentPrice ? `₹${Number(deal.currentPrice).toLocaleString('en-IN')}` : 'Enter price'}
                  </span>
                  {deal.originalPrice && Number(deal.originalPrice) > Number(deal.currentPrice) && (
                    <span className="text-[11px] text-slate-400 line-through">
                      ₹{Number(deal.originalPrice).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Optional Image URL field */}
            {showImageInput && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product Image URL
                </label>
                <input
                  type="text"
                  value={deal.imageUrl}
                  onChange={(e) => setDeal({ ...deal, imageUrl: e.target.value })}
                  placeholder="Paste direct image link..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Editable Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Product Title
              </label>
              <input
                type="text"
                required
                value={deal.title}
                onChange={(e) => setDeal({ ...deal, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            {/* Price & MRP Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Current Price (₹)*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={deal.currentPrice}
                    onChange={(e) => setDeal({ ...deal, currentPrice: e.target.value })}
                    placeholder="e.g. 180"
                    className="w-full pl-8 pr-3 py-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-500/40 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus={!deal.currentPrice}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Original MRP (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={deal.originalPrice}
                    onChange={(e) => setDeal({ ...deal, originalPrice: e.target.value })}
                    placeholder="e.g. 189"
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStep('input')}
                disabled={saving}
                className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleSaveDeal}
                disabled={saving || !deal.currentPrice || Number(deal.currentPrice) <= 0}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding to Wishlist...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Add to Wishlist</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
