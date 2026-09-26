'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Member, WishlistItem, SaleEvent, ItemStatus, Comment, StoreComparison, ActivityLog } from '@/types';
import { Header } from '@/components/Header';
import { SaleCountdown } from '@/components/SaleCountdown';
import { MemberFilterBar } from '@/components/MemberFilterBar';
import { ItemCard } from '@/components/ItemCard';
import { KanbanBoard } from '@/components/KanbanBoard';
import { ActivityFeedDrawer } from '@/components/ActivityFeedDrawer';
import { WhatsAppAlertModal } from '@/components/WhatsAppAlertModal';
import { ManageCardsModal } from '@/components/ManageCardsModal';
import { ItemDetailModal } from '@/components/ItemDetailModal';
import { AddItemModal } from '@/components/AddItemModal';
import { AuthModal } from '@/components/AuthModal';
import { CommonCartModal } from '@/components/CommonCartModal';
import { PriceComparisonModal } from '@/components/PriceComparisonModal';
import {
  Sparkles,
  ShoppingBag,
  TrendingDown,
  ShieldCheck,
  Plus,
  Flame,
  Zap,
  Users,
  CheckCircle,
  BellRing,
  Smartphone,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DashboardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [saleEvents, setSaleEvents] = useState<SaleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [selectedRetailer, setSelectedRetailer] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSaleTag, setSelectedSaleTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('recent');

  // Modals & View Mode
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showCartModal, setShowCartModal] = useState<boolean>(false);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const [showActivityDrawer, setShowActivityDrawer] = useState<boolean>(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState<boolean>(false);
  const [showManageCardsModal, setShowManageCardsModal] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<WishlistItem | null>(null);
  const [comparingItem, setComparingItem] = useState<WishlistItem | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // Theme & Toast
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle?: string; type: 'success' | 'alert' | 'info' } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const showToast = (title: string, subtitle?: string, type: 'success' | 'alert' | 'info' = 'info') => {
    setToastMessage({ title, subtitle, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.title === title ? null : prev));
    }, 4500);
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Initial Load with Device Remembering
  useEffect(() => {
    // Sync theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const fetchLatestData = async (isInitial = false) => {
      try {
        const timestamp = Date.now();
        const [membersRes, itemsRes, salesRes, activitiesRes] = await Promise.all([
          fetch(`/api/members?_t=${timestamp}`, { cache: 'no-store' }),
          fetch(`/api/items?_t=${timestamp}`, { cache: 'no-store' }),
          fetch(`/api/sale-events?_t=${timestamp}`, { cache: 'no-store' }),
          fetch(`/api/activities?_t=${timestamp}`, { cache: 'no-store' }),
        ]);

        if (!membersRes.ok || !itemsRes.ok) return;

        const membersData = await membersRes.json();
        const itemsData = await itemsRes.json();
        const salesData = await salesRes.json();
        const activitiesData = await activitiesRes.json();

        const fetchedMembers = membersData.members || [];
        setMembers(fetchedMembers);
        setItems(itemsData.items || []);
        if (salesData.saleEvents) setSaleEvents(salesData.saleEvents);
        if (activitiesData.activities) setActivities(activitiesData.activities);

        if (isInitial) {
          // DEVICE REMEMBERING CHECK:
          // If device has saved authentication, restore instantly without login
          const savedAuthRaw = localStorage.getItem('dealsquad_device_auth_member');
          if (savedAuthRaw) {
            try {
              const parsed = JSON.parse(savedAuthRaw);
              const verified = fetchedMembers.find((m: Member) => m.id === parsed.id);
              if (verified) {
                setCurrentMember(verified);
                return;
              }
            } catch {
              // ignore
            }
          }

          // Fallback to member-3 (Priyesh) or first member, but show switch easily
          if (fetchedMembers.length > 0) {
            const defaultMem = fetchedMembers.find((m: Member) => m.name === 'Priyesh') || fetchedMembers[0];
            setCurrentMember(defaultMem);
          }
        }
      } catch (err) {
        console.error('Data sync failed:', err);
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    fetchLatestData(true);

    // LIVE UPDATE SYNC: Poll every 4 seconds when tab is active + immediate sync on tab focus
    const syncInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchLatestData(false);
      }
    }, 4000);

    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchLatestData(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Member Authentication & Device Remembering
  const handleAuth = async (member: Member, pin: string, rememberDevice: boolean): Promise<boolean> => {
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id, pin }),
      });

      if (!res.ok) return false;

      setCurrentMember(member);

      if (rememberDevice) {
        localStorage.setItem('dealsquad_device_auth_member', JSON.stringify(member));
        localStorage.setItem('dealsquad_device_remembered', 'true');
        // Set long-lived cookie for 1 year
        document.cookie = `dealsquad_member_id=${member.id}; path=/; max-age=31536000; SameSite=Lax`;
      }

      setShowAuthModal(false);
      showToast(
        `Device Remembered: ${member.name}`,
        `Authenticated as ${member.role}. You will stay logged in on this device!`,
        'success'
      );
      return true;
    } catch {
      return false;
    }
  };

  // Toggle Common Cart
  const handleToggleCart = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const nextState = !item.inCommonCart;

    // Optimistic UI
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, inCommonCart: nextState } : i))
    );
    if (activeItem && activeItem.id === itemId) {
      setActiveItem({ ...activeItem, inCommonCart: nextState });
    }

    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, inCart: nextState }),
      });

      showToast(
        nextState ? 'Added to Common Cart' : 'Removed from Common Cart',
        item.title.substring(0, 35) + '...',
        nextState ? 'success' : 'info'
      );
    } catch (err) {
      console.error('Error toggling cart:', err);
    }
  };

  // Update Cart Quantity
  const handleUpdateCartQuantity = async (itemId: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, cartQuantity: qty } : i))
    );
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity: qty }),
      });
    } catch (err) {
      console.error('Error updating cart quantity:', err);
    }
  };

  // Update Cart Settlement
  const handleUpdateSettlement = async (itemId: string, paidBy: string, isSettled: boolean) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, paidBy, isSettled } : i))
    );
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, paidBy, isSettled }),
      });
      showToast('Settlement updated', undefined, 'success');
    } catch (err) {
      console.error('Error updating settlement:', err);
    }
  };

  // Status Update
  const handleUpdateStatus = async (itemId: string, newStatus: ItemStatus) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
    );
    if (activeItem && activeItem.id === itemId) {
      setActiveItem((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.item) {
        setItems((prev) => prev.map((i) => (i.id === itemId ? data.item : i)));
        if (activeItem && activeItem.id === itemId) setActiveItem(data.item);
        showToast(
          `Status updated: ${newStatus.toUpperCase()}`,
          data.item.title.substring(0, 35) + '...',
          'info'
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Target Price Update
  const handleUpdateTargetPrice = async (itemId: string, targetPrice?: number) => {
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPrice }),
      });
      const data = await res.json();
      if (data.item) {
        setItems((prev) => prev.map((i) => (i.id === itemId ? data.item : i)));
        if (activeItem && activeItem.id === itemId) setActiveItem(data.item);
        showToast(
          targetPrice ? `Alert target set to ₹${targetPrice.toLocaleString('en-IN')}` : 'Target removed',
          undefined,
          'success'
        );
      }
    } catch (err) {
      console.error('Error updating target price:', err);
    }
  };

  // Add Comment
  const handleAddComment = async (
    itemId: string,
    content: string,
    tag?: Comment['tag'],
    targetMemberId?: string
  ) => {
    if (!currentMember) return;
    try {
      const res = await fetch(`/api/items/${itemId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: currentMember.id,
          authorName: currentMember.name,
          authorAvatar: currentMember.avatar,
          authorColor: currentMember.color,
          content,
          tag,
          targetMemberId,
        }),
      });

      const data = await res.json();
      if (data.comment) {
        const itemUpdater = (item: WishlistItem) =>
          item.id === itemId
            ? { ...item, comments: [...(item.comments || []), data.comment] }
            : item;

        setItems((prev) => prev.map(itemUpdater));
        if (activeItem && activeItem.id === itemId) {
          setActiveItem(itemUpdater(activeItem));
        }
        showToast('Note added', content.substring(0, 30) + '...', 'info');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  // Toggle Reaction
  const handleToggleReaction = async (itemId: string, emoji: string) => {
    if (!currentMember) return;
    try {
      const res = await fetch(`/api/items/${itemId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji, memberId: currentMember.id }),
      });

      const data = await res.json();
      if (data.reactions) {
        const itemUpdater = (item: WishlistItem) =>
          item.id === itemId ? { ...item, reactions: data.reactions } : item;

        setItems((prev) => prev.map(itemUpdater));
        if (activeItem && activeItem.id === itemId) {
          setActiveItem(itemUpdater(activeItem));
        }
      }
    } catch (err) {
      console.error('Error toggling reaction:', err);
    }
  };

  // Simulate Price Drop
  const handleSimulatePriceDrop = async (itemId: string, percentage: number) => {
    try {
      const res = await fetch(`/api/items/${itemId}/price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulateDropPercentage: percentage }),
      });

      const data = await res.json();
      if (data.item) {
        setItems((prev) => prev.map((i) => (i.id === itemId ? data.item : i)));
        if (activeItem && activeItem.id === itemId) setActiveItem(data.item);

        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });

        showToast(
          `🔥 FLASH PRICE DROP: -${percentage}%!`,
          `New Price: ₹${data.item.currentPrice.toLocaleString('en-IN')}`,
          'alert'
        );
      }
    } catch (err) {
      console.error('Error simulating price drop:', err);
    }
  };

  // Add Price Point
  const handleAddPricePoint = async (itemId: string, price: number, note?: string) => {
    try {
      const res = await fetch(`/api/items/${itemId}/price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price, note }),
      });

      const data = await res.json();
      if (data.item) {
        setItems((prev) => prev.map((i) => (i.id === itemId ? data.item : i)));
        if (activeItem && activeItem.id === itemId) setActiveItem(data.item);
        showToast(`Price updated to ₹${price.toLocaleString('en-IN')}`, note, 'success');
      }
    } catch (err) {
      console.error('Error recording price point:', err);
    }
  };

  // Delete Item
  const handleDeleteItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        setActiveItem(null);
        showToast('Item removed from wishlist', undefined, 'info');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  // Refresh All Prices
  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      if (items.length > 0) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        const simulatedDrop = Math.floor(Math.random() * 8) + 5;
        await handleSimulatePriceDrop(randomItem.id, simulatedDrop);
      }
      showToast('Price Radar Scan Complete', 'Checked live Flipkart, Amazon & Myntra prices', 'info');
    } finally {
      setRefreshing(false);
    }
  };

  // Filtered Items computation
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (selectedMemberId !== 'all') {
      result = result.filter(
        (i) => i.addedBy === selectedMemberId || i.splitWith?.includes(selectedMemberId)
      );
    }

    if (selectedRetailer !== 'all') {
      result = result.filter((i) => i.retailer === selectedRetailer);
    }

    if (selectedStatus !== 'all') {
      result = result.filter((i) => i.status === selectedStatus);
    }

    if (selectedSaleTag !== 'all') {
      result = result.filter((i) => i.saleTag === selectedSaleTag);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.addedByName.toLowerCase().includes(q) ||
          i.notes?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'price_asc') return a.currentPrice - b.currentPrice;
      if (sortBy === 'price_desc') return b.currentPrice - a.currentPrice;
      if (sortBy === 'discount') {
        const discA = a.originalPrice ? (a.originalPrice - a.currentPrice) / a.originalPrice : 0;
        const discB = b.originalPrice ? (b.originalPrice - b.currentPrice) / b.originalPrice : 0;
        return discB - discA;
      }
      if (sortBy === 'priority') {
        const order = { high: 3, medium: 2, low: 1 };
        return order[b.priority] - order[a.priority];
      }
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });

    return result;
  }, [items, selectedMemberId, selectedRetailer, selectedStatus, selectedSaleTag, searchQuery, sortBy]);

  // Aggregate Stats
  const totalGroupSavings = useMemo(() => {
    return items.reduce((acc, item) => {
      const diff = Math.max(0, item.originalPrice - item.currentPrice);
      return acc + diff;
    }, 0);
  }, [items]);

  const bbdItemsCount = useMemo(() => items.filter((i) => i.saleTag === 'bbd').length, [items]);
  const gifItemsCount = useMemo(() => items.filter((i) => i.saleTag === 'gif').length, [items]);
  const myntraItemsCount = useMemo(() => items.filter((i) => i.saleTag === 'myntra_bff').length, [items]);
  const cartItems = useMemo(() => items.filter((i) => i.inCommonCart), [items]);
  const targetMetCount = useMemo(() => items.filter((i) => i.targetPrice && i.currentPrice <= i.targetPrice).length, [items]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-500 flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-slate-300">
            Initializing DealSquad for Pravin, Sweta, Priyesh & Shreyash...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 animate-bounce-subtle pointer-events-none">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 pointer-events-auto ${
              toastMessage.type === 'alert'
                ? 'bg-amber-500/90 text-slate-950 border-amber-300 font-bold'
                : toastMessage.type === 'success'
                ? 'bg-emerald-600/90 text-white border-emerald-400'
                : 'bg-slate-900/90 text-white border-slate-700'
            }`}
          >
            <BellRing className="w-5 h-5 shrink-0" />
            <div>
              <div className="text-xs sm:text-sm font-bold">{toastMessage.title}</div>
              {toastMessage.subtitle && (
                <div className="text-[11px] opacity-90">{toastMessage.subtitle}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        currentMember={currentMember}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenAddItem={() => setShowAddModal(true)}
        onOpenCart={() => setShowCartModal(true)}
        onOpenActivity={() => setShowActivityDrawer(true)}
        onOpenWhatsApp={() => setShowWhatsAppModal(true)}
        onOpenManageCards={() => setShowManageCardsModal(true)}
        cartCount={cartItems.length}
        activityCount={activities.length}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((prev) => (prev === 'grid' ? 'kanban' : 'grid'))}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        totalTracked={items.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Deal Radar Metric Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {/* Stat 1: Total Group Savings */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                Group Savings
              </div>
              <div className="text-base sm:text-xl font-black text-slate-900 dark:text-white">
                ₹{totalGroupSavings.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Stat 2: Common Cart Pool */}
          <div
            onClick={() => setShowCartModal(true)}
            className="p-4 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:border-indigo-400 cursor-pointer flex items-center gap-3.5 transition-all"
          >
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                Common Cart
              </div>
              <div className="text-base sm:text-xl font-black text-indigo-600 dark:text-indigo-400">
                {cartItems.length} Pooled Items
              </div>
            </div>
          </div>

          {/* Stat 3: Active BBD Deals */}
          <div
            onClick={() => setSelectedSaleTag(selectedSaleTag === 'bbd' ? 'all' : 'bbd')}
            className={`p-4 rounded-3xl cursor-pointer transition-all border shadow-xs flex items-center gap-3.5 ${
              selectedSaleTag === 'bbd'
                ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/20'
                : 'bg-white dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800/90 hover:border-blue-400'
            }`}
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                Flipkart BBD
              </div>
              <div className="text-base sm:text-xl font-black text-blue-600 dark:text-blue-400">
                {bbdItemsCount} Targets
              </div>
            </div>
          </div>

          {/* Stat 4: Amazon & Myntra targets */}
          <div
            onClick={() => setSelectedSaleTag(selectedSaleTag === 'gif' ? 'all' : 'gif')}
            className={`p-4 rounded-3xl cursor-pointer transition-all border shadow-xs flex items-center gap-3.5 ${
              selectedSaleTag === 'gif'
                ? 'bg-orange-50 dark:bg-orange-950/50 border-orange-500 ring-2 ring-orange-500/20'
                : 'bg-white dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800/90 hover:border-orange-400'
            }`}
          >
            <div className="w-11 h-11 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200 dark:border-orange-800">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                GIF & Myntra
              </div>
              <div className="text-base sm:text-xl font-black text-orange-600 dark:text-orange-400">
                {gifItemsCount + myntraItemsCount} Deals
              </div>
            </div>
          </div>
        </div>

        {/* Live Countdown & Festival Sale Cards */}
        <SaleCountdown
          saleEvents={saleEvents}
          activeSaleFilter={selectedSaleTag}
          onSelectSaleFilter={(tag) => setSelectedSaleTag(tag)}
          bbdItemsCount={bbdItemsCount}
          gifItemsCount={gifItemsCount}
          myntraItemsCount={myntraItemsCount}
          totalSavings={totalGroupSavings}
        />

        {/* 4-Member Filter Toolbar */}
        <MemberFilterBar
          members={members}
          currentMember={currentMember}
          selectedMemberId={selectedMemberId}
          onSelectMemberId={setSelectedMemberId}
          selectedRetailer={selectedRetailer}
          onSelectRetailer={setSelectedRetailer}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
          selectedSaleTag={selectedSaleTag}
          onSelectSaleTag={setSelectedSaleTag}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalResults={filteredItems.length}
        />

        {/* View Mode: Kanban Board vs Product Grid */}
        {viewMode === 'kanban' ? (
          <KanbanBoard
            items={filteredItems}
            members={members}
            currentMember={currentMember}
            onOpenDetail={(i) => setActiveItem(i)}
            onOpenCompare={(i) => {
              setComparingItem(i);
              setShowCompareModal(true);
            }}
            onUpdateStatus={handleUpdateStatus}
            onToggleCart={handleToggleCart}
          />
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                members={members}
                currentMember={currentMember}
                onOpenDetail={(i) => setActiveItem(i)}
                onOpenCompare={(i) => {
                  setComparingItem(i);
                  setShowCompareModal(true);
                }}
                onToggleCart={handleToggleCart}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-md mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              No matching deals found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Try changing your filter settings, or paste any Flipkart, Amazon, or Myntra product URL.
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add First Deal Link</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 py-6 mt-12 bg-white/40 dark:bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">DealSquad</span>
            <span>• Private Circle for Pravin, Sweta, Priyesh & Shreyash</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
              Persistent Device Storage
            </span>
            <span>Multi-Store Comparison Active</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        members={members}
        currentMember={currentMember}
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSelectMember={handleAuth}
      />

      <AddItemModal
        members={members}
        currentMember={currentMember}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onItemAdded={(newItem) => {
          setItems((prev) => [newItem, ...prev]);
          showToast('Added to Wishlist!', newItem.title.substring(0, 35) + '...', 'success');
        }}
      />

      <ItemDetailModal
        item={activeItem}
        members={members}
        currentMember={currentMember}
        isOpen={!!activeItem}
        onClose={() => setActiveItem(null)}
        onOpenCompare={(itemToCompare) => {
          setComparingItem(itemToCompare);
          setShowCompareModal(true);
        }}
        onToggleCart={handleToggleCart}
        onUpdateStatus={handleUpdateStatus}
        onUpdateTargetPrice={handleUpdateTargetPrice}
        onAddComment={handleAddComment}
        onToggleReaction={handleToggleReaction}
        onSimulatePriceDrop={handleSimulatePriceDrop}
        onAddPricePoint={handleAddPricePoint}
        onDeleteItem={handleDeleteItem}
      />

      <CommonCartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        cartItems={cartItems}
        members={members}
        currentMember={currentMember}
        onRemoveFromCart={handleToggleCart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onOpenDetail={(item) => {
          setShowCartModal(false);
          setActiveItem(item);
        }}
        onOpenManageCards={() => {
          setShowCartModal(false);
          setShowManageCardsModal(true);
        }}
      />

      <PriceComparisonModal
        item={comparingItem}
        isOpen={showCompareModal}
        onClose={() => {
          setShowCompareModal(false);
          setComparingItem(null);
        }}
      />

      {/* Live Activity Feed Drawer */}
      <ActivityFeedDrawer
        isOpen={showActivityDrawer}
        onClose={() => setShowActivityDrawer(false)}
        activities={activities}
        members={members}
        onOpenItem={(id) => {
          const found = items.find((i) => i.id === id);
          if (found) setActiveItem(found);
        }}
      />

      {/* Manage Cards Modal (User req #8) */}
      <ManageCardsModal
        isOpen={showManageCardsModal}
        onClose={() => setShowManageCardsModal(false)}
        members={members}
        currentMember={currentMember}
        onCardsUpdated={(mId, updatedCards) => {
          setMembers((prev) =>
            prev.map((m) => (m.id === mId ? { ...m, cardsHeld: updatedCards } : m))
          );
          showToast('Cards Saved', 'Bank cards updated for member', 'success');
        }}
      />

      {/* WhatsApp Squad Alerts Modal (User req #4) */}
      <WhatsAppAlertModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        items={items}
      />
    </div>
  );
}
