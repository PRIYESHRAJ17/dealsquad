'use client';

import React from 'react';
import { Member } from '@/types';
import {
  Sparkles,
  Sun,
  Moon,
  Plus,
  Users,
  ShoppingBag,
  CreditCard,
  Smartphone,
  LayoutGrid,
  Kanban,
  Bell,
  MessageCircle,
  User,
} from 'lucide-react';

interface HeaderProps {
  currentMember: Member | null;
  onOpenAuth: () => void;
  onOpenAddItem: () => void;
  onOpenCart: () => void;
  onOpenActivity: () => void;
  onOpenWhatsApp: () => void;
  onOpenManageCards: () => void;
  cartCount: number;
  activityCount: number;
  viewMode: 'grid' | 'kanban';
  onToggleViewMode: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  totalTracked: number;
}

export function Header({
  currentMember,
  onOpenAuth,
  onOpenAddItem,
  onOpenCart,
  onOpenActivity,
  onOpenWhatsApp,
  onOpenManageCards,
  cartCount,
  activityCount,
  viewMode,
  onToggleViewMode,
  darkMode,
  onToggleDarkMode,
  totalTracked,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-white/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
                DealSquad
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5">
              Flipkart BBD • Amazon GIF • Myntra BFF • {totalTracked} Deals
            </p>
          </div>
        </div>

        {/* Right: Actions, View Mode, Cart, Cards, WhatsApp, Member */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* View Mode Toggle (Grid vs Kanban) */}
          <button
            type="button"
            onClick={onToggleViewMode}
            title={viewMode === 'grid' ? 'Switch to Kanban Board' : 'Switch to Grid'}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          >
            {viewMode === 'grid' ? (
              <>
                <Kanban className="w-4 h-4 text-indigo-500" />
                <span className="hidden md:inline">Kanban</span>
              </>
            ) : (
              <>
                <LayoutGrid className="w-4 h-4 text-indigo-500" />
                <span className="hidden md:inline">Grid</span>
              </>
            )}
          </button>

          {/* Manage Cards Button (User req #8) */}
          <button
            type="button"
            onClick={onOpenManageCards}
            title="Manage My Cards & Bank Offers"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Cards</span>
          </button>

          {/* WhatsApp Group Share & Alert Button (User req #4) */}
          <button
            type="button"
            onClick={onOpenWhatsApp}
            title="Share & Alerts via WhatsApp"
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden lg:inline">WhatsApp</span>
          </button>

          {/* Activity Feed Button */}
          <button
            type="button"
            onClick={onOpenActivity}
            title="Activity Feed"
            className="relative p-2 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {activityCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center">
                {activityCount}
              </span>
            )}
          </button>

          {/* Common Cart Button */}
          <button
            type="button"
            onClick={onOpenCart}
            title="Open Common Cart"
            className="relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all cursor-pointer group"
          >
            <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                {cartCount}
              </span>
            )}
          </button>

          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
            className="p-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Member Name (No DP, just name with device remembered badge - User req #2) */}
          {currentMember ? (
            <button
              type="button"
              onClick={onOpenAuth}
              title="Click to Switch Member"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-white dark:bg-slate-900 shadow-2xs transition-all cursor-pointer"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-2xs"
                style={{ backgroundColor: currentMember.color || '#4f46e5' }}
              >
                {currentMember.shortName.charAt(0)}
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {currentMember.shortName}
              </span>
              <Smartphone className="w-3 h-3 text-emerald-500 hidden sm:inline" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          {/* Add Item Button */}
          <button
            type="button"
            onClick={onOpenAddItem}
            className="flex items-center gap-1 px-3 sm:px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition-all cursor-pointer transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Add Deal</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
}
