'use client';

import React, { useState } from 'react';
import { PricePoint } from '@/types';
import { TrendingDown, TrendingUp, AlertCircle, ShieldAlert, CheckCircle, Sparkles, Clock } from 'lucide-react';

interface PriceChartProps {
  priceHistory: PricePoint[];
  currentPrice: number;
  originalPrice: number;
  lowestPrice: number;
  highestPrice: number;
  targetPrice?: number;
  averagePrice?: number;
}

export function PriceChart({
  priceHistory,
  currentPrice,
  originalPrice,
  lowestPrice,
  highestPrice,
  targetPrice,
  averagePrice,
}: PriceChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ point: PricePoint; x: number; y: number } | null>(null);

  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
        No price history recorded yet.
      </div>
    );
  }

  // Ensure points are sorted by date
  const sortedPoints = [...priceHistory].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // If only 1 point, duplicate with slight offset for visual curve
  const points =
    sortedPoints.length === 1
      ? [
          {
            ...sortedPoints[0],
            timestamp: new Date(new Date(sortedPoints[0].timestamp).getTime() - 86400000).toISOString(),
          },
          sortedPoints[0],
        ]
      : sortedPoints;

  // Chart dimensions
  const width = 560;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  // Calculate scales
  const allPrices = points.map((p) => p.price);
  if (targetPrice) allPrices.push(targetPrice);
  const minVal = Math.min(...allPrices, lowestPrice);
  const maxVal = Math.max(...allPrices, highestPrice, originalPrice);
  const priceRange = maxVal - minVal === 0 ? 100 : maxVal - minVal;

  const minTime = new Date(points[0].timestamp).getTime();
  const maxTime = new Date(points[points.length - 1].timestamp).getTime();
  const timeRange = maxTime - minTime === 0 ? 1 : maxTime - minTime;

  // Coordinates
  const getCoords = (p: PricePoint) => {
    const t = new Date(p.timestamp).getTime();
    const x = paddingX + ((t - minTime) / timeRange) * (width - paddingX * 2);
    const y = height - paddingY - ((p.price - minVal) / priceRange) * (height - paddingY * 2);
    return { x, y };
  };

  const coords = points.map(getCoords);

  // Build SVG path
  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    // Smooth bezier curve
    const prev = coords[i - 1];
    const curr = coords[i];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }

  // Area under curve
  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${height - paddingY} Z`;

  // Target price line Y coordinate
  const targetY =
    targetPrice !== undefined
      ? height - paddingY - ((targetPrice - minVal) / priceRange) * (height - paddingY * 2)
      : null;

  // Lowest price line Y coordinate
  const lowestY = height - paddingY - ((lowestPrice - minVal) / priceRange) * (height - paddingY * 2);

  // Calculations
  const hasMultipleChecks = sortedPoints.length > 1;
  const initialPrice = sortedPoints[0].price;
  const droppedFromFirst = initialPrice > currentPrice ? Math.round(((initialPrice - currentPrice) / initialPrice) * 100) : 0;

  // Real All-Time Low logic:
  // Genuine ATL ONLY if multiple checks exist AND current price dropped below initial price,
  // OR if a true historical low was reached from a higher price.
  const isGenuineAllTimeLow = hasMultipleChecks && droppedFromFirst > 0 && currentPrice <= lowestPrice;
  const isAboveLowest = currentPrice > lowestPrice;
  const diffAboveLowest = currentPrice - lowestPrice;
  const discountFromMrp = originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const isTargetMet = targetPrice && currentPrice <= targetPrice;

  // Resolved average price (User req: show lowest & average & current price all 3)
  const displayAverage = averagePrice && averagePrice > 0
    ? averagePrice
    : Math.round(allPrices.reduce((sum, val) => sum + val, 0) / allPrices.length);

  return (
    <div className="w-full">
      {/* Top Indicators / Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {isGenuineAllTimeLow && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            🔥 Genuine All-Time Low (ATL)
          </span>
        )}

        {!hasMultipleChecks && !isAboveLowest && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            📍 Initial Tracked Price
          </span>
        )}

        {isAboveLowest && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            +₹{diffAboveLowest.toLocaleString('en-IN')} above lowest (₹{lowestPrice.toLocaleString('en-IN')})
          </span>
        )}

        {discountFromMrp > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <TrendingDown className="w-3.5 h-3.5" />
            {discountFromMrp}% off MRP
          </span>
        )}

        {droppedFromFirst > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            Dropped {droppedFromFirst}% since tracked
          </span>
        )}

        {isTargetMet && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800 animate-pulse">
            <CheckCircle className="w-3.5 h-3.5 text-amber-500" />
            Target Price Met! (≤ ₹{targetPrice?.toLocaleString('en-IN')})
          </span>
        )}
      </div>

      {/* SVG Chart Box */}
      <div className="relative bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-200 dark:border-slate-800/80 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Lowest Price Reference Line */}
          {lowestY !== null && lowestY >= paddingY && lowestY <= height - paddingY && (
            <g>
              <line
                x1={paddingX}
                y1={lowestY}
                x2={width - paddingX}
                y2={lowestY}
                stroke="#10b981"
                strokeDasharray="3 3"
                strokeWidth="1.2"
                opacity="0.8"
              />
              <text
                x={width - paddingX - 4}
                y={lowestY - 4}
                fill="#10b981"
                fontSize="9"
                fontWeight="600"
                textAnchor="end"
              >
                ATL: ₹{lowestPrice.toLocaleString('en-IN')}
              </text>
            </g>
          )}

          {/* Target Price Reference Line */}
          {targetY !== null && targetY >= paddingY && targetY <= height - paddingY && (
            <g>
              <line
                x1={paddingX}
                y1={targetY}
                x2={width - paddingX}
                y2={targetY}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth="1.5"
                opacity="0.9"
              />
              <text
                x={paddingX + 4}
                y={targetY - 4}
                fill="#f59e0b"
                fontSize="9"
                fontWeight="bold"
              >
                Target: ₹{targetPrice?.toLocaleString('en-IN')}
              </text>
            </g>
          )}

          {/* Area Fill */}
          <path d={areaD} fill="url(#priceGradient)" />

          {/* Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#strokeGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Points */}
          {coords.map((c, i) => {
            const pt = points[i];
            const isLatest = i === coords.length - 1;
            const isHovered = hoveredPoint?.point.timestamp === pt.timestamp;

            return (
              <g
                key={i}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredPoint({ point: pt, x: c.x, y: c.y })}
              >
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isLatest || isHovered ? '6' : '4'}
                  fill={isLatest ? '#2563eb' : '#3b82f6'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-150 drop-shadow-sm"
                />
                {/* Hit area for mobile / easy hovering */}
                <circle cx={c.x} cy={c.y} r="14" fill="transparent" />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-xl shadow-xl border border-slate-700 whitespace-nowrap"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
            }}
          >
            <div className="font-bold text-sm text-yellow-300">
              ₹{hoveredPoint.point.price.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-300">
              {new Date(hoveredPoint.point.timestamp).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            {hoveredPoint.point.note && (
              <div className="text-[10px] text-emerald-400 mt-0.5">{hoveredPoint.point.note}</div>
            )}
          </div>
        )}
      </div>

      {/* 3 Price Metrics: Current, 30-Day Average, and Lowest / ATL (User Req: Show all 3) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mt-3 text-center">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] sm:text-xs uppercase font-extrabold text-slate-500 dark:text-slate-400">
            Current Price
          </div>
          <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
            ₹{currentPrice.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/60 shadow-2xs">
          <div className="text-[10px] sm:text-xs uppercase font-extrabold text-indigo-600 dark:text-indigo-400">
            30-Day Average
          </div>
          <div className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
            ₹{displayAverage.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 shadow-2xs">
          <div className="text-[10px] sm:text-xs uppercase font-extrabold text-emerald-600 dark:text-emerald-400">
            Lowest / ATL
          </div>
          <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            ₹{lowestPrice.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 mt-2">
        <span>📊 Tracked Records: {priceHistory.length} checks</span>
        {currentPrice > lowestPrice && (
          <span className="text-amber-500 font-semibold">+₹{(currentPrice - lowestPrice).toLocaleString('en-IN')} above lowest</span>
        )}
      </div>
    </div>
  );
}
