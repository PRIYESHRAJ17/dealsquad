'use client';

import React from 'react';
import { Member, Retailer, ItemStatus, SaleEventTag } from '@/types';
import { Search, Filter, ArrowUpDown, X, Tag, Sparkles, CheckCircle2 } from 'lucide-react';

interface MemberFilterBarProps {
  members: Member[];
  currentMember: Member | null;
  selectedMemberId: string;
  onSelectMemberId: (id: string) => void;
  selectedRetailer: string;
  onSelectRetailer: (retailer: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  selectedSaleTag: string;
  onSelectSaleTag: (tag: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalResults: number;
}

export function MemberFilterBar({
  members,
  currentMember,
  selectedMemberId,
  onSelectMemberId,
  selectedRetailer,
  onSelectRetailer,
  selectedStatus,
  onSelectStatus,
  selectedSaleTag,
  onSelectSaleTag,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalResults,
}: MemberFilterBarProps) {
  const isAnyFilterActive =
    selectedMemberId !== 'all' ||
    selectedRetailer !== 'all' ||
    selectedStatus !== 'all' ||
    selectedSaleTag !== 'all' ||
    searchQuery.trim() !== '';

  const handleResetFilters = () => {
    onSelectMemberId('all');
    onSelectRetailer('all');
    onSelectStatus('all');
    onSelectSaleTag('all');
    onSearchChange('');
    onSortChange('recent');
  };

  return (
    <div className="space-y-4 mb-6">
      {/* 4-Member Avatar Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectMemberId('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
            selectedMemberId === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md'
              : 'bg-white dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <span>All 4 Squad Members</span>
          <span className="w-5 h-5 rounded-full bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-900 flex items-center justify-center text-[10px]">
            {totalResults}
          </span>
        </button>

        {members.map((m) => {
          const isSelected = selectedMemberId === m.id;
          const isCurrent = currentMember?.id === m.id;

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMemberId(m.id)}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                isSelected
                  ? 'ring-2 shadow-sm border-transparent'
                  : 'bg-white dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
              style={
                isSelected
                  ? { backgroundColor: `${m.color}15`, borderColor: m.color, color: m.color }
                  : {}
              }
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-2xs"
                style={{ backgroundColor: m.color || '#6366f1' }}
              >
                {m.shortName.charAt(0)}
              </div>
              <span className="font-bold">{m.shortName}</span>
              {isCurrent && (
                <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  You
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search & Sub-Filters Toolbar */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search wishlist items, brands, notes..."
            className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Retailer Selector */}
          <select
            value={selectedRetailer}
            onChange={(e) => onSelectRetailer(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Retailers</option>
            <option value="flipkart">Flipkart Only</option>
            <option value="amazon">Amazon Only</option>
            <option value="myntra">Myntra Only</option>
            <option value="croma">Croma</option>
          </select>

          {/* Status Selector */}
          <select
            value={selectedStatus}
            onChange={(e) => onSelectStatus(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="want">Want 📌</option>
            <option value="watching">Watching 👀</option>
            <option value="ordered">Ordered 🛍️</option>
            <option value="received">Received ✅</option>
          </select>

          {/* Sale Event Tag */}
          <select
            value={selectedSaleTag}
            onChange={(e) => onSelectSaleTag(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Festive Sales</option>
            <option value="bbd">Flipkart BBD 🔥</option>
            <option value="gif">Amazon GIF ⚡</option>
            <option value="myntra_bff">Myntra BFF 🛍️</option>
            <option value="diwali">Diwali Dhamaka ✨</option>
          </select>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="recent">Recently Added</option>
              <option value="discount">Highest Discount %</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          {/* Reset Filters button if any active */}
          {isAnyFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-2.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 transition-all flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
