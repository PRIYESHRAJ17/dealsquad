'use client';

import React from 'react';
import { ActivityLog, Member, WishlistItem } from '@/types';
import { X, Sparkles, TrendingDown, ShoppingBag, MessageSquare, Plus, CheckCircle, Bell, Trash2 } from 'lucide-react';

interface ActivityFeedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityLog[];
  members: Member[];
  onOpenItem: (itemId: string) => void;
  onClearActivities?: () => void;
}

export function ActivityFeedDrawer({
  isOpen,
  onClose,
  activities,
  members,
  onOpenItem,
  onClearActivities,
}: ActivityFeedDrawerProps) {
  if (!isOpen) return null;

  const getActionIcon = (action: ActivityLog['action']) => {
    switch (action) {
      case 'added_item':
        return <Plus className="w-3.5 h-3.5 text-blue-500" />;
      case 'price_drop':
        return <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />;
      case 'status_change':
        return <CheckCircle className="w-3.5 h-3.5 text-purple-500" />;
      case 'cart_toggle':
        return <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" />;
      case 'comment':
        return <MessageSquare className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Squad Activity Feed</h2>
              <p className="text-xs text-slate-500">Live actions by Pravin, Sweta, Priyesh & Shreyash</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {activities.length > 0 && onClearActivities && (
              <button
                type="button"
                onClick={onClearActivities}
                title="Clear all activities"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Activities List */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {activities.length > 0 ? (
            activities.map((act) => {
              const member = members.find((m) => m.id === act.memberId);
              return (
                <div
                  key={act.id}
                  onClick={() => {
                    onOpenItem(act.itemId);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 transition-all cursor-pointer flex gap-3 group"
                >
                  <div className="relative shrink-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-2xs"
                      style={{ backgroundColor: member?.color || '#4f46e5' }}
                    >
                      {act.memberName.charAt(0)}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
                      {getActionIcon(act.action)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {act.memberName}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {act.details}
                    </p>

                    <div className="text-[11px] text-slate-400 mt-0.5 truncate italic font-medium">
                      "{act.itemTitle}"
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-xs text-slate-400">
              No squad activity yet. When members add deals or comments, they will stream here!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
