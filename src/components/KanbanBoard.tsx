'use client';

import React from 'react';
import { WishlistItem, Member, ItemStatus } from '@/types';
import {
  ExternalLink,
  Flame,
  Zap,
  Sparkles,
  ShoppingBag,
  TrendingDown,
  ArrowRight,
  ArrowLeft,
  Tag,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface KanbanBoardProps {
  items: WishlistItem[];
  members: Member[];
  currentMember: Member | null;
  onOpenDetail: (item: WishlistItem) => void;
  onOpenCompare: (item: WishlistItem) => void;
  onUpdateStatus: (itemId: string, status: ItemStatus) => void;
  onToggleCart: (itemId: string) => void;
}

const COLUMNS: { id: ItemStatus; title: string; icon: string; color: string; bg: string; border: string }[] = [
  { id: 'want', title: 'Wishlist & Want', icon: '📌', color: 'text-amber-500', bg: 'bg-amber-50/50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-900/40' },
  { id: 'watching', title: 'Watching & Active Drops', icon: '📉', color: 'text-blue-500', bg: 'bg-blue-50/50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-900/40' },
  { id: 'ordered', title: 'Ordered & Secured', icon: '🛍️', color: 'text-purple-500', bg: 'bg-purple-50/50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-900/40' },
  { id: 'received', title: 'Received & Delivered', icon: '✅', color: 'text-emerald-500', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-900/40' },
];

export function KanbanBoard({
  items,
  members,
  currentMember,
  onOpenDetail,
  onOpenCompare,
  onUpdateStatus,
  onToggleCart,
}: KanbanBoardProps) {
  const getNextStatus = (current: ItemStatus): ItemStatus | null => {
    if (current === 'want') return 'watching';
    if (current === 'watching') return 'ordered';
    if (current === 'ordered') return 'received';
    return null;
  };

  const getPrevStatus = (current: ItemStatus): ItemStatus | null => {
    if (current === 'received') return 'ordered';
    if (current === 'ordered') return 'watching';
    if (current === 'watching') return 'want';
    return null;
  };

  const handleAdvance = (e: React.MouseEvent, item: WishlistItem) => {
    e.stopPropagation();
    const next = getNextStatus(item.status);
    if (next) {
      if (next === 'ordered') {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
      onUpdateStatus(item.id, next);
    }
  };

  const handleRevert = (e: React.MouseEvent, item: WishlistItem) => {
    e.stopPropagation();
    const prev = getPrevStatus(item.status);
    if (prev) onUpdateStatus(item.id, prev);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {COLUMNS.map((col) => {
        const colItems = items.filter((i) => i.status === col.id);
        const colTotal = colItems.reduce((acc, i) => acc + i.currentPrice, 0);

        return (
          <div
            key={col.id}
            className={`rounded-3xl p-4 border flex flex-col min-h-[500px] ${col.bg} ${col.border}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-base">{col.icon}</span>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {col.title}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center">
                  {colItems.length}
                </span>
              </div>
            </div>

            {/* Column Subtotal Ticker */}
            <div className="text-[11px] text-slate-500 mb-3 px-1">
              Column Total: <strong>₹{colTotal.toLocaleString('en-IN')}</strong>
            </div>

            {/* Column Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {colItems.map((item) => {
                const owner = members.find((m) => m.id === item.addedBy);
                const nextSt = getNextStatus(item.status);
                const prevSt = getPrevStatus(item.status);

                return (
                  <div
                    key={item.id}
                    onClick={() => onOpenDetail(item)}
                    className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      {/* Top Row: Store Badge + Added By Member */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.retailer}
                        </span>

                        {/* Clean Added By Member Tag (No DP) */}
                        {owner && (
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                            style={{
                              backgroundColor: `${owner.color || '#6366f1'}15`,
                              borderColor: `${owner.color || '#6366f1'}40`,
                              color: owner.color || '#6366f1',
                            }}
                          >
                            {owner.name}
                          </span>
                        )}
                      </div>

                      {/* Image + Title */}
                      <div className="flex gap-2.5 items-start mb-2">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-100"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                            {item.title}
                          </h4>
                          {item.selectedVariant && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              Variant: {item.selectedVariant}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* BETTER PRICE AVAILABLE SOMEWHERE ELSE CALLOUT */}
                      {item.betterStoreAvailable && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenCompare(item);
                          }}
                          className="mb-2 p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[11px] text-rose-700 dark:text-rose-300 font-bold flex items-center justify-between cursor-pointer hover:bg-rose-100"
                        >
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                            Cheaper on {item.betterStoreAvailable.retailerName}!
                          </span>
                          <span className="text-emerald-600 font-extrabold">
                            Save ₹{item.betterStoreAvailable.savings.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}

                      {/* Price Row: Current Price & 30-Day Average */}
                      <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          ₹{item.currentPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          Avg: ₹{(item.averagePrice || item.currentPrice).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Column Shift Action Controls */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                      {prevSt ? (
                        <button
                          type="button"
                          onClick={(e) => handleRevert(e, item)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[10px] flex items-center gap-0.5"
                          title="Move to previous column"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          <span className="hidden sm:inline">Back</span>
                        </button>
                      ) : <div />}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCompare(item);
                        }}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Compare
                      </button>

                      {nextSt ? (
                        <button
                          type="button"
                          onClick={(e) => handleAdvance(e, item)}
                          className="px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[10px] font-bold flex items-center gap-0.5 hover:opacity-90"
                          title="Advance to next status"
                        >
                          <span>Move</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-500 font-bold">Done ✅</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {colItems.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  No items in {col.title}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
