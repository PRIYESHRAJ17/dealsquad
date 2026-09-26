'use client';

import React, { useState, useEffect } from 'react';
import { SaleEvent } from '@/types';
import { Flame, Clock, Sparkles, ShoppingBag, ArrowRight, Tag, Zap } from 'lucide-react';

interface SaleCountdownProps {
  saleEvents: SaleEvent[];
  activeSaleFilter: string;
  onSelectSaleFilter: (saleId: string) => void;
  bbdItemsCount: number;
  gifItemsCount: number;
  myntraItemsCount: number;
  totalSavings: number;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isStarted: boolean;
}

function calculateTimeLeft(targetDateStr: string): TimeRemaining {
  const difference = +new Date(targetDateStr) - +new Date();
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isStarted: true };
  }
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isStarted: false,
  };
}

export function SaleCountdown({
  saleEvents,
  activeSaleFilter,
  onSelectSaleFilter,
  bbdItemsCount,
  gifItemsCount,
  myntraItemsCount,
  totalSavings,
}: SaleCountdownProps) {
  const bbdEvent = saleEvents.find((s) => s.id === 'bbd');
  const gifEvent = saleEvents.find((s) => s.id === 'gif');
  const myntraEvent = saleEvents.find((s) => s.id === 'myntra_bff');

  const [bbdTime, setBbdTime] = useState<TimeRemaining>({ days: 1, hours: 8, minutes: 30, seconds: 45, isStarted: false });
  const [gifTime, setGifTime] = useState<TimeRemaining>({ days: 1, hours: 20, minutes: 15, seconds: 10, isStarted: false });
  const [myntraTime, setMyntraTime] = useState<TimeRemaining>({ days: 0, hours: 19, minutes: 45, seconds: 20, isStarted: false });

  useEffect(() => {
    const updateTimes = () => {
      if (bbdEvent) setBbdTime(calculateTimeLeft(bbdEvent.startDate));
      if (gifEvent) setGifTime(calculateTimeLeft(gifEvent.startDate));
      if (myntraEvent) setMyntraTime(calculateTimeLeft(myntraEvent.startDate));
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [bbdEvent, gifEvent, myntraEvent]);

  return (
    <div className="relative mb-8">
      {/* 3 Major Festival Sales: BBD, GIF, Myntra BFF */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Flipkart BBD Card */}
        <div
          onClick={() => onSelectSaleFilter(activeSaleFilter === 'bbd' ? 'all' : 'bbd')}
          className={`relative overflow-hidden rounded-3xl p-5 transition-all duration-300 cursor-pointer border ${
            activeSaleFilter === 'bbd'
              ? 'ring-2 ring-blue-500 shadow-xl shadow-blue-500/20 border-blue-500'
              : 'hover:border-blue-400/60 border-slate-200 dark:border-slate-800'
          } bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 text-white`}
        >
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-400 text-blue-950 shadow-xs">
                  <Flame className="w-3 h-3 text-orange-600 fill-orange-600" />
                  Flipkart BBD
                </span>
                <span className="text-[10px] font-medium text-blue-200 bg-blue-900/60 px-2 py-0.5 rounded-full border border-blue-500/30">
                  {bbdItemsCount} Wishlisted
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black tracking-tight text-white mb-0.5">
                Big Billion Days
              </h3>
              <p className="text-xs text-blue-100/80 mb-4 line-clamp-1">
                Axis & ICICI 10% instant discount + exchange boosters.
              </p>
            </div>

            {/* Countdown Blocks */}
            <div className="grid grid-cols-4 gap-1.5 py-1">
              <div className="bg-blue-950/70 border border-blue-400/20 rounded-xl p-1.5 text-center">
                <div className="text-base font-black font-mono text-yellow-300">
                  {String(bbdTime.days).padStart(2, '0')}
                </div>
                <div className="text-[9px] uppercase font-semibold text-blue-300">Days</div>
              </div>
              <div className="bg-blue-950/70 border border-blue-400/20 rounded-xl p-1.5 text-center">
                <div className="text-base font-black font-mono text-yellow-300">
                  {String(bbdTime.hours).padStart(2, '0')}
                </div>
                <div className="text-[9px] uppercase font-semibold text-blue-300">Hours</div>
              </div>
              <div className="bg-blue-950/70 border border-blue-400/20 rounded-xl p-1.5 text-center">
                <div className="text-base font-black font-mono text-yellow-300">
                  {String(bbdTime.minutes).padStart(2, '0')}
                </div>
                <div className="text-[9px] uppercase font-semibold text-blue-300">Mins</div>
              </div>
              <div className="bg-blue-950/70 border border-blue-400/20 rounded-xl p-1.5 text-center">
                <div className="text-base font-black font-mono text-yellow-300 animate-pulse">
                  {String(bbdTime.seconds).padStart(2, '0')}
                </div>
                <div className="text-[9px] uppercase font-semibold text-blue-300">Secs</div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-blue-400/20 flex items-center justify-between text-[11px] text-blue-200">
              <span>{activeSaleFilter === 'bbd' ? 'Active filter' : 'Filter BBD Deals'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* 2. Amazon GIF Card */}
        <div
          onClick={() => onSelectSaleFilter(activeSaleFilter === 'gif' ? 'all' : 'gif')}
          className={`relative overflow-hidden rounded-3xl p-5 transition-all duration-300 cursor-pointer border ${
            activeSaleFilter === 'gif'
              ? 'ring-2 ring-orange-500 shadow-xl shadow-orange-500/20 border-orange-500'
              : 'hover:border-orange-400/60 border-slate-200 dark:border-slate-800'
          } bg-gradient-to-br from-amber-600 via-orange-700 to-rose-950 text-white`}
        >
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white text-orange-950 shadow-xs">
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                  Amazon GIF
                </span>
                <span className="text-[10px] font-medium text-orange-100 bg-orange-950/60 px-2 py-0.5 rounded-full border border-orange-400/30">
                  {gifItemsCount} Wishlisted
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black tracking-tight text-white mb-0.5">
                Great Indian Festival
              </h3>
              <p className="text-xs text-orange-100/80 mb-4 line-clamp-1">
                Prime Early Access + SBI Card 10% instant savings.
              </p>
            </div>

            {/* Countdown Blocks */}
            <div className="grid grid-cols-4 gap-1.5 py-1">
              <div className="bg-orange-950/70 border border-orange-400/20 rounded-xl p-1.5 text-center">
                <div className="text-base font-black font-mono text-amber-200">
                  {String(gifTime.days).padStart(2, '0')}
                </div>
                <div className="text-[9px] uppercase font-semibold text-orange-200">Days</div>
              </div>
              <div className="bg-orange-950/70 border border-orange-400/20 rounded-xl p-1.5 text-center">
                <div className="text-base font-black font-mono text-amber-200">
                  {String(gifTime.hours).padStart(2, '0')}
                </div>
                <div className="text-[9px] uppercase font-semibold text-orange-200">Hours</div>
              </div>
              <div className="bg-orange-950/70 border border-orange-400/20 rounded-xl p-1.5 text-center">
                <div className="text-base font-black font-mono text-amber-200">
                  {String(gifTime.minutes).padStart(2, '0')}
                </div>
                <div className="text-[9px] uppercase font-semibold text-orange-200">Mins</div>
              </div>
              <div className="bg-orange-950/70 border border-orange-400/20 rounded-xl p-1.5 text-center">
                <div className="text-base font-black font-mono text-amber-200 animate-pulse">
                  {String(gifTime.seconds).padStart(2, '0')}
                </div>
                <div className="text-[9px] uppercase font-semibold text-orange-200">Secs</div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-orange-400/20 flex items-center justify-between text-[11px] text-orange-100">
              <span>{activeSaleFilter === 'gif' ? 'Active filter' : 'Filter GIF Deals'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* 3. Myntra Big Fashion Festival (BFF) Card */}
        <div
          onClick={() => onSelectSaleFilter(activeSaleFilter === 'myntra_bff' ? 'all' : 'myntra_bff')}
          className={`relative overflow-hidden rounded-3xl p-5 transition-all duration-300 cursor-pointer border ${
            activeSaleFilter === 'myntra_bff'
              ? 'ring-2 ring-pink-500 shadow-xl shadow-pink-500/20 border-pink-500'
              : 'hover:border-pink-400/60 border-slate-200 dark:border-slate-800'
          } bg-gradient-to-br from-pink-600 via-rose-700 to-purple-950 text-white`}
        >
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white text-pink-950 shadow-xs">
                  <Sparkles className="w-3 h-3 text-pink-500 fill-pink-500" />
                  Myntra BFF
                </span>
                <span className="text-[10px] font-medium text-pink-100 bg-pink-950/60 px-2 py-0.5 rounded-full border border-pink-400/30">
                  {myntraItemsCount} Wishlisted
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black tracking-tight text-white mb-0.5">
                Big Fashion Festival
              </h3>
              <p className="text-xs text-pink-100/80 mb-4 line-clamp-1">
                50-80% off sneakers, apparel + Kotak & ICICI 10% instant off.
              </p>
            </div>

            {/* Countdown Blocks */}
            <div className="grid grid-cols-4 gap-1.5 py-1">
              <div className="bg-pink-950/70 border border-pink-400/20 rounded-xl p-1.5 text-center">
                <div className="text-base font-black font-mono text-pink-200">
                  {String(myntraTime.days).padStart(2, '0')}
                </div>
                <div className="text-[9px] uppercase font-semibold text-pink-200">Days</div>
              </div>
              <div className="bg-pink-950/70 border border-pink-400/20 rounded-xl p-1.5 text-center">
                <div className="text-base font-black font-mono text-pink-200">
                  {String(myntraTime.hours).padStart(2, '0')}
                </div>
                <div className="text-[9px] uppercase font-semibold text-pink-200">Hours</div>
              </div>
              <div className="bg-pink-950/70 border border-pink-400/20 rounded-xl p-1.5 text-center">
                <div className="text-base font-black font-mono text-pink-200">
                  {String(myntraTime.minutes).padStart(2, '0')}
                </div>
                <div className="text-[9px] uppercase font-semibold text-pink-200">Mins</div>
              </div>
              <div className="bg-pink-950/70 border border-pink-400/20 rounded-xl p-1.5 text-center">
                <div className="text-base font-black font-mono text-pink-200 animate-pulse">
                  {String(myntraTime.seconds).padStart(2, '0')}
                </div>
                <div className="text-[9px] uppercase font-semibold text-pink-200">Secs</div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-pink-400/20 flex items-center justify-between text-[11px] text-pink-100">
              <span>{activeSaleFilter === 'myntra_bff' ? 'Active filter' : 'Filter Myntra BFF Deals'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
