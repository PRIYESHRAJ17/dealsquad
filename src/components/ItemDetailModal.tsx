'use client';

import React, { useState } from 'react';
import { WishlistItem, Member, ItemStatus, Comment } from '@/types';
import { PriceChart } from './PriceChart';
import {
  X,
  ExternalLink,
  Trash2,
  Send,
  Users,
  Bell,
  Sparkles,
  TrendingDown,
  ShoppingBag,
  CheckCircle2,
  Flame,
  Zap,
  Tag,
  Share2,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ItemDetailModalProps {
  item: WishlistItem | null;
  members: Member[];
  currentMember: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCompare: (item: WishlistItem) => void;
  onToggleCart: (itemId: string) => void;
  onUpdateStatus: (itemId: string, status: ItemStatus) => void;
  onUpdateTargetPrice: (itemId: string, targetPrice?: number) => void;
  onAddComment: (itemId: string, content: string, tag?: Comment['tag'], targetMemberId?: string) => void;
  onToggleReaction: (itemId: string, emoji: string) => void;
  onSimulatePriceDrop: (itemId: string, percentage: number) => void;
  onAddPricePoint: (itemId: string, price: number, note?: string) => void;
  onDeleteItem: (itemId: string) => void;
}

export function ItemDetailModal({
  item,
  members,
  currentMember,
  isOpen,
  onClose,
  onOpenCompare,
  onToggleCart,
  onUpdateStatus,
  onUpdateTargetPrice,
  onAddComment,
  onToggleReaction,
  onSimulatePriceDrop,
  onAddPricePoint,
  onDeleteItem,
}: ItemDetailModalProps) {
  if (!isOpen || !item) return null;

  const [newComment, setNewComment] = useState('');
  const [commentTag, setCommentTag] = useState<Comment['tag']>('note');
  const [mentionMemberId, setMentionMemberId] = useState<string>('');
  const [targetPriceInput, setTargetPriceInput] = useState(item.targetPrice ? String(item.targetPrice) : '');
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [customPriceInput, setCustomPriceInput] = useState('');
  const [customPriceNote, setCustomPriceNote] = useState('');
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Split calculation
  const splitMembers = members.filter((m) => item.splitWith?.includes(m.id));
  const splitCount = splitMembers.length;
  const splitShare = splitCount > 0 ? Math.round(item.currentPrice / splitCount) : null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentMember) return;
    onAddComment(item.id, newComment.trim(), commentTag, mentionMemberId || undefined);
    setNewComment('');
  };

  const handleSaveTargetPrice = () => {
    const val = targetPriceInput ? parseFloat(targetPriceInput) : undefined;
    onUpdateTargetPrice(item.id, val);
    setIsEditingTarget(false);
  };

  const handleAddCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(customPriceInput);
    if (!isNaN(p) && p > 0) {
      onAddPricePoint(item.id, p, customPriceNote || undefined);
      setCustomPriceInput('');
      setCustomPriceNote('');
      setShowPriceForm(false);
    }
  };

  const handleStatusChange = (status: ItemStatus) => {
    if (status === 'ordered') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    onUpdateStatus(item.id, status);
  };

  const discountPercent =
    item.originalPrice > item.currentPrice
      ? Math.round(((item.originalPrice - item.currentPrice) / item.originalPrice) * 100)
      : 0;

  const emojis = ['🔥', '💎', '👀', '🛒', '❤️'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {item.retailer}
            </span>
            {item.saleTag === 'bbd' && (
              <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase bg-yellow-400 text-blue-950 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-orange-600 text-orange-600" />
                Flipkart BBD
              </span>
            )}
            {item.saleTag === 'gif' && (
              <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase bg-orange-500 text-white flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-yellow-200 text-yellow-200" />
                Amazon GIF
              </span>
            )}
            {item.saleTag === 'myntra_bff' && (
              <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase bg-pink-500 text-white flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
                Myntra BFF
              </span>
            )}
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Added by <strong className="text-slate-700 dark:text-slate-300">{item.addedByName}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenCompare(item)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold transition-all cursor-pointer"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Compare Stores</span>
            </button>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold transition-all"
            >
              <span>Store Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Top Product Snapshot */}
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="w-full sm:w-48 h-48 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                }}
              />
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {item.title}
                </h2>

                <div className="flex flex-wrap items-baseline gap-3 mb-3">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    ₹{item.currentPrice.toLocaleString('en-IN')}
                  </span>
                  {item.originalPrice > item.currentPrice && (
                    <>
                      <span className="text-sm text-slate-400 line-through">
                        MRP: ₹{item.originalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                        {discountPercent}% OFF (Save ₹{(item.originalPrice - item.currentPrice).toLocaleString('en-IN')})
                      </span>
                    </>
                  )}
                </div>

                {/* 30-Day Historical Average Price Box (User req #1) */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      30-Day Historical Average:
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    ₹{(item.averagePrice || item.currentPrice).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Status Selector Pills & Common Cart Toggle */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status:</span>
                  <div className="flex items-center gap-1.5">
                    {(['want', 'watching', 'ordered', 'received'] as ItemStatus[]).map((st) => {
                      const isCurrent = item.status === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleStatusChange(st)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${
                            isCurrent
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Common Cart Toggle */}
                <button
                  type="button"
                  onClick={() => onToggleCart(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    item.inCommonCart
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                      : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
                  }`}
                >
                  {item.inCommonCart ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                  <span>{item.inCommonCart ? 'In Common Cart' : '+ Add to Common Cart'}</span>
                </button>
              </div>
            </div>
          </div>



          {/* Price Fluctuation & Drop Chart */}
          <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Price History & Sale Tracking</h3>
                <span className="text-xs text-slate-500">({item.priceHistory.length} logs)</span>
              </div>

              {/* Price simulation drop buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSimulatePriceDrop(item.id, 15)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-yellow-400 text-blue-950 hover:bg-yellow-300 transition-colors cursor-pointer"
                >
                  ⚡ Simulate BBD -15%
                </button>
                <button
                  type="button"
                  onClick={() => onSimulatePriceDrop(item.id, 25)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer"
                >
                  🔥 Simulate GIF -25%
                </button>
                <button
                  type="button"
                  onClick={() => setShowPriceForm(!showPriceForm)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  + Log Price
                </button>
              </div>
            </div>

            {/* Custom Price Point Input Drawer */}
            {showPriceForm && (
              <form onSubmit={handleAddCustomPrice} className="p-3 mb-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  placeholder="New price in ₹"
                  value={customPriceInput}
                  onChange={(e) => setCustomPriceInput(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white w-32"
                  required
                />
                <input
                  type="text"
                  placeholder="Note (e.g. Flash deal, Bank offer)"
                  value={customPriceNote}
                  onChange={(e) => setCustomPriceNote(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white flex-1 min-w-[150px]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg"
                >
                  Add Record
                </button>
              </form>
            )}

            <PriceChart
              priceHistory={item.priceHistory}
              currentPrice={item.currentPrice}
              originalPrice={item.originalPrice}
              lowestPrice={item.lowestPrice}
              highestPrice={item.highestPrice}
              targetPrice={item.targetPrice}
            />
          </div>

          {/* Reactions Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500">React:</span>
            {emojis.map((emoji) => {
              const voters = item.reactions?.[emoji] || [];
              const hasVoted = currentMember && voters.includes(currentMember.id);
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onToggleReaction(item.id, emoji)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    hasVoted
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/30'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span>{emoji}</span>
                  {voters.length > 0 && <span>{voters.length}</span>}
                </button>
              );
            })}
          </div>

          {/* Collaboration Notes & Comments Section */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Member Notes & Sale Coordination</span>
              <span className="text-xs text-slate-500">({item.comments?.length || 0})</span>
            </h3>

            {/* Comments List */}
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {item.comments && item.comments.length > 0 ? (
                item.comments.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex gap-3 text-xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {comm.authorName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">{comm.authorName}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(comm.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{comm.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-400">
                  No notes yet. Coordinate with Pravin, Sweta, Priyesh, or Shreyash below!
                </div>
              )}
            </div>

            {/* Comment Form */}
            {currentMember && (
              <form onSubmit={handleCommentSubmit} className="space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    value={commentTag}
                    onChange={(e) => setCommentTag(e.target.value as Comment['tag'])}
                    className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    <option value="note">💬 General Note</option>
                    <option value="bbd_priority">🔥 Sale Priority</option>
                    <option value="gift">🎁 Secret Gift</option>
                  </select>

                  <select
                    value={mentionMemberId}
                    onChange={(e) => setMentionMemberId(e.target.value)}
                    className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    <option value="">Tag Member (optional)</option>
                    {members
                      .filter((m) => m.id !== currentMember.id)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          @{m.shortName}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={`Leave a note as ${currentMember.shortName}...`}
                    className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/60">
          <div>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-500 font-semibold">Confirm remove?</span>
                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="px-2.5 py-1 text-xs bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-500"
                >
                  Yes, Remove
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 text-xs text-slate-500"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Item</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close
            </button>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-indigo-500/20"
            >
              <span>Go to Store</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
