'use client';

import React from 'react';
import { WishlistItem, Member, ItemStatus } from '@/types';
import {
  ExternalLink,
  TrendingDown,
  ShoppingBag,
  Check,
  AlertTriangle,
  Star,
  MessageCircle,
  History,
  Scale,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ItemCardProps {
  item: WishlistItem;
  members: Member[];
  currentMember: Member | null;
  onOpenDetail: (item: WishlistItem) => void;
  onOpenCompare: (item: WishlistItem) => void;
  onOpenCalculator?: (item: WishlistItem) => void;
  onToggleCart: (itemId: string) => void;
  onUpdateStatus: (itemId: string, newStatus: ItemStatus) => void;
  onToggleReaction?: (itemId: string, emoji: string) => void;
  onSimulateDrop?: (itemId: string, percentage: number) => void;
}

const RETAILER_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  amazon: { label: 'Amazon', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800' },
  flipkart: { label: 'Flipkart', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-950/80 border-blue-300 dark:border-blue-800' },
  myntra: { label: 'Myntra', color: 'text-pink-700 dark:text-pink-400', bg: 'bg-pink-100 dark:bg-pink-950/80 border-pink-300 dark:border-pink-800' },
  croma: { label: 'Croma', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800' },
  other: { label: 'Store', color: 'text-slate-700 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700' },
};

const STATUS_CONFIG: Record<ItemStatus, { label: string; bg: string; text: string; icon: string }> = {
  want: { label: 'Want', bg: 'bg-yellow-50 dark:bg-yellow-950/50', text: 'text-yellow-700 dark:text-yellow-400', icon: '📌' },
  watching: { label: 'Watching', bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-400', icon: '📉' },
  ordered: { label: 'Ordered', bg: 'bg-purple-50 dark:bg-purple-950/50', text: 'text-purple-700 dark:text-purple-400', icon: '🛍️' },
  received: { label: 'Received', bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-400', icon: '✅' },
};

export function ItemCard({
  item,
  members,
  currentMember,
  onOpenDetail,
  onOpenCompare,
  onToggleCart,
  onUpdateStatus,
}: ItemCardProps) {
  const retailerInfo = RETAILER_BADGES[item.retailer] || RETAILER_BADGES.other;
  const statusInfo = STATUS_CONFIG[item.status];

  const discountPercent =
    item.originalPrice > item.currentPrice
      ? Math.round(((item.originalPrice - item.currentPrice) / item.originalPrice) * 100)
      : 0;

  // Average Price Calculation (User req #1: "live it should show average price and current price")
  const avgPrice =
    item.averagePrice && item.averagePrice > 0
      ? item.averagePrice
      : item.priceHistory && item.priceHistory.length > 0
      ? Math.round(item.priceHistory.reduce((a, b) => a + b.price, 0) / item.priceHistory.length)
      : item.currentPrice;

  // Owner Name (Clean name tag, NO DP - User req #2)
  const owner = members.find((m) => m.id === item.addedBy);
  const ownerName = owner ? owner.name : item.addedByName || 'Member';

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cycle: ItemStatus[] = ['want', 'watching', 'ordered', 'received'];
    const nextIndex = (cycle.indexOf(item.status) + 1) % cycle.length;
    const nextStatus = cycle[nextIndex];

    if (nextStatus === 'ordered') {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }

    onUpdateStatus(item.id, nextStatus);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCart(item.id);
  };

  // WhatsApp Share Deal Drop (User req #4)
  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      `🔥 *DealSquad Alert!*\n\n` +
      `*${item.title}*\n` +
      `💰 Current Price: *₹${item.currentPrice.toLocaleString('en-IN')}*\n` +
      (item.originalPrice > item.currentPrice ? `🏷️ MRP: ~₹${item.originalPrice.toLocaleString('en-IN')}~ (${discountPercent}% OFF)\n` : '') +
      `📊 30-Day Avg: *₹${avgPrice.toLocaleString('en-IN')}*\n` +
      `👤 Added by: ${ownerName}\n` +
      `🔗 Store Link: ${item.url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div
      onClick={() => onOpenDetail(item)}
      className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Top Media & Badges */}
      <div className="relative aspect-4/3 sm:aspect-16/10 w-full overflow-hidden bg-slate-100 dark:bg-slate-800/60">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

        {/* Top Badges (Store & Status) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1 z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-lg border backdrop-blur-md shadow-xs ${retailerInfo.bg} ${retailerInfo.color}`}
            >
              {retailerInfo.label}
            </span>
          </div>

          {/* Interactive Status Pill */}
          <button
            type="button"
            onClick={handleStatusClick}
            title="Cycle status: Want -> Watching -> Ordered -> Received"
            className={`px-2.5 py-1 text-xs font-bold rounded-xl border backdrop-blur-md transition-transform active:scale-90 cursor-pointer shadow-xs ${statusInfo.bg} ${statusInfo.text} border-slate-200/50 dark:border-slate-700/50 flex items-center gap-1`}
          >
            <span>{statusInfo.icon}</span>
            <span>{statusInfo.label}</span>
          </button>
        </div>

        {/* Bottom overlay: Current Price & MRP */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 z-10">
          <div>
            <div className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
              ₹{item.currentPrice.toLocaleString('en-IN')}
            </div>
            {item.originalPrice > item.currentPrice && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-300 line-through">
                  ₹{item.originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="px-1.5 py-0.2 rounded-md font-bold text-[10px] bg-emerald-500 text-white">
                  {discountPercent}% OFF
                </span>
              </div>
            )}
          </div>

          {item.rating && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-black/40 text-amber-300 backdrop-blur-md flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {item.rating}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* BETTER PRICE AVAILABLE BANNER */}
          {item.betterStoreAvailable && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onOpenCompare(item);
              }}
              className="mb-2.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center justify-between hover:bg-rose-100 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Cheaper on {item.betterStoreAvailable.retailerName}!</span>
              </span>
              <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-md font-extrabold">
                Save ₹{item.betterStoreAvailable.savings.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          {/* ADDED BY & 30-DAY AVERAGE BAR (User req #1 & #2: No DP, live average price) */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
              style={{
                backgroundColor: `${owner?.color || '#6366f1'}15`,
                borderColor: `${owner?.color || '#6366f1'}40`,
                color: owner?.color || '#6366f1',
              }}
            >
              Added by {ownerName}
            </span>

            {/* LIVE AVERAGE PRICE */}
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-indigo-500" />
              <span>Avg: ₹{avgPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {item.title}
          </h3>
        </div>

        {/* Action Toolbar: Compare, WhatsApp, In Cart, History */}
        <div className="space-y-2 mt-2">
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCompare(item);
              }}
              className="py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 transition-all"
              title="Compare Flipkart, Amazon & Myntra"
            >
              <Scale className="w-3 h-3 text-indigo-500" />
              <span>Compare</span>
            </button>

            {/* WhatsApp Share Button (User req #4) */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="py-1.5 px-2 rounded-xl border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1 transition-all"
              title="Share to WhatsApp Group"
            >
              <MessageCircle className="w-3 h-3 text-emerald-500" />
              <span>WhatsApp</span>
            </button>

            {/* Common Cart Toggle (User req #7) */}
            <button
              type="button"
              onClick={handleCartClick}
              className={`py-1.5 px-2 rounded-xl border text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                item.inCommonCart
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
              }`}
            >
              {item.inCommonCart ? <Check className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
              <span>{item.inCommonCart ? 'In Cart' : '+ Cart'}</span>
            </button>
          </div>

          {/* Footer: Price History link & Direct store link */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(item);
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <History className="w-3 h-3" />
              <span>{item.priceHistory?.length || 1} price points</span>
            </span>

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1 text-[11px] font-semibold"
            >
              <span>Store Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
