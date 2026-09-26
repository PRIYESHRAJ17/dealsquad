import fs from 'fs';
import path from 'path';
import { GroupData, Member, WishlistItem, SaleEvent, PricePoint, Comment, StoreComparison, ActivityLog } from '@/types';
import { analyzeFakeDiscount } from './discountDetector';
import { sendWebhookAlert } from './webhook';
import { getStore } from '@netlify/blobs';
import { Redis } from '@upstash/redis';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'member-1',
    name: 'Pravin',
    shortName: 'Pravin',
    email: 'pravin@dealsquad.private',
    pin: '1984',
    avatar: '',
    color: '#3b82f6',
    role: 'Member',
    bio: '',
    cardsHeld: [],
    stats: {
      itemsAdded: 0,
      totalSavings: 0,
      dealsSecured: 0,
    },
  },
  {
    id: 'member-2',
    name: 'Sweta',
    shortName: 'Sweta',
    email: 'sweta@dealsquad.private',
    pin: '2468',
    avatar: '',
    color: '#ec4899',
    role: 'Member',
    bio: '',
    cardsHeld: [],
    stats: {
      itemsAdded: 0,
      totalSavings: 0,
      dealsSecured: 0,
    },
  },
  {
    id: 'member-3',
    name: 'Priyesh',
    shortName: 'Priyesh',
    email: 'priyesh@dealsquad.private',
    pin: '7711',
    avatar: '',
    color: '#10b981',
    role: 'Member',
    bio: '',
    cardsHeld: [],
    stats: {
      itemsAdded: 0,
      totalSavings: 0,
      dealsSecured: 0,
    },
  },
  {
    id: 'member-4',
    name: 'Shreyash',
    shortName: 'Shreyash',
    email: 'shreyash@dealsquad.private',
    pin: '9021',
    avatar: '',
    color: '#f59e0b',
    role: 'Member',
    bio: '',
    cardsHeld: [],
    stats: {
      itemsAdded: 0,
      totalSavings: 0,
      dealsSecured: 0,
    },
  },
];

const now = new Date();

export const INITIAL_SALE_EVENTS: SaleEvent[] = [
  {
    id: 'bbd',
    name: 'Flipkart Big Billion Days 2026',
    retailer: 'flipkart',
    tagline: 'India’s Biggest Electronic & Gadget Sale',
    badge: 'BBD Mega Drop',
    color: 'from-blue-600 to-indigo-800',
    accentColor: '#2563eb',
    startDate: new Date(now.getTime() + 1000 * 60 * 60 * 32).toISOString(),
    endDate: new Date(now.getTime() + 1000 * 60 * 60 * 180).toISOString(),
    bannerImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
    description: 'Up to 80% off on mobiles, laptops, electronics with Axis & ICICI bank instant 10% discount.',
    phases: [
      { name: 'Phase 1: VIP Plus Early Access', tagline: 'Midnight 12:00 AM unlocks for Plus members', startDate: new Date(now.getTime() + 1000 * 60 * 60 * 32).toISOString(), endDate: new Date(now.getTime() + 1000 * 60 * 60 * 56).toISOString(), status: 'upcoming', isVipOnly: true },
      { name: 'Phase 2: Open Sale & Rush Hours', tagline: 'All deals live + ₹1,750 Axis instant card discount', startDate: new Date(now.getTime() + 1000 * 60 * 60 * 56).toISOString(), endDate: new Date(now.getTime() + 1000 * 60 * 60 * 120).toISOString(), status: 'upcoming' },
      { name: 'Phase 3: Maha Price Drop Flash', tagline: '12 AM, 8 AM, 4 PM limited lightning deals', startDate: new Date(now.getTime() + 1000 * 60 * 60 * 120).toISOString(), endDate: new Date(now.getTime() + 1000 * 60 * 60 * 180).toISOString(), status: 'upcoming' },
    ],
  },
  {
    id: 'gif',
    name: 'Amazon Great Indian Festival 2026',
    retailer: 'amazon',
    tagline: 'Prime Early Access & Festive Deals',
    badge: 'GIF Prime Deals',
    color: 'from-amber-600 to-orange-700',
    accentColor: '#ea580c',
    startDate: new Date(now.getTime() + 1000 * 60 * 60 * 44).toISOString(),
    endDate: new Date(now.getTime() + 1000 * 60 * 60 * 192).toISOString(),
    bannerImage: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&auto=format&fit=crop&q=80',
    description: 'Prime Early Access, SBI card 10% instant discount, exchange bonus, and no-cost EMI.',
    phases: [
      { name: 'Phase 1: Prime Early Access (24 Hours)', tagline: 'Prime members get first dibs on lightning deals', startDate: new Date(now.getTime() + 1000 * 60 * 60 * 44).toISOString(), endDate: new Date(now.getTime() + 1000 * 60 * 60 * 68).toISOString(), status: 'upcoming', isVipOnly: true },
      { name: 'Phase 2: Festival Blockbusters', tagline: 'SBI 10% Instant Off on Electronics & Appliances', startDate: new Date(now.getTime() + 1000 * 60 * 60 * 68).toISOString(), endDate: new Date(now.getTime() + 1000 * 60 * 60 * 140).toISOString(), status: 'upcoming' },
    ],
  },
  {
    id: 'myntra_bff',
    name: 'Myntra Big Fashion Festival (BFF)',
    retailer: 'myntra',
    tagline: '50-80% Off on Top Brands, Shoes & Apparel',
    badge: 'Myntra BFF',
    color: 'from-pink-600 to-rose-700',
    accentColor: '#e11d48',
    startDate: new Date(now.getTime() + 1000 * 60 * 60 * 20).toISOString(),
    endDate: new Date(now.getTime() + 1000 * 60 * 60 * 168).toISOString(),
    bannerImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80',
    description: 'Flat 50-80% off on Nike, Adidas, Puma, Levi’s, Fossil + Kotak & ICICI 10% instant off.',
  },
  {
    id: 'diwali',
    name: 'Mega Diwali Tech & Festive Dhamaka',
    retailer: 'other',
    tagline: 'Post-Sale Deep Festive Clearances',
    badge: 'Diwali Special',
    color: 'from-purple-600 to-pink-700',
    accentColor: '#9333ea',
    startDate: new Date(now.getTime() + 1000 * 60 * 60 * 240).toISOString(),
    endDate: new Date(now.getTime() + 1000 * 60 * 60 * 360).toISOString(),
    bannerImage: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&auto=format&fit=crop&q=80',
    description: 'Diwali lightning deals and flash drops across gadgets and gifting bundles.',
  },
];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    memberId: 'member-3',
    memberName: 'Priyesh',
    memberAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    action: 'added_item',
    itemTitle: 'Apple MacBook Air M3 (16GB RAM)',
    itemId: 'item-5',
    details: 'Added MacBook Air M3 to Wishlist (GIF target)',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'act-2',
    memberId: 'member-1',
    memberName: 'Pravin',
    memberAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    action: 'cart_toggle',
    itemTitle: 'Apple iPhone 16 (128 GB)',
    itemId: 'item-2',
    details: 'Added iPhone 16 into Common Cart for BBD group buy',
    timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  },
  {
    id: 'act-3',
    memberId: 'member-2',
    memberName: 'Sweta',
    memberAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    action: 'comment',
    itemTitle: 'Nike Air Jordan 1 Low Retro',
    itemId: 'item-3',
    details: 'Spotted price ₹1,504 cheaper on Myntra BFF!',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'act-4',
    memberId: 'member-4',
    memberName: 'Shreyash',
    memberAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    action: 'price_drop',
    itemTitle: 'Sony WH-1000XM5 Headphones',
    itemId: 'item-1',
    details: 'Dropped to ₹24,990 (All-Time Low hit!)',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];

export const INITIAL_ITEMS: WishlistItem[] = [
  {
    id: 'item-1',
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones (Silver)',
    brand: 'Sony',
    url: 'https://www.amazon.in/Sony-WH-1000XM5-Wireless-Cancelling-Headphones/dp/B09XS7JWHH',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
    retailer: 'amazon',
    category: 'Electronics',
    addedBy: 'member-4', // Shreyash
    addedByName: 'Shreyash',
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    currentPrice: 24990,
    originalPrice: 34990,
    targetPrice: 22999,
    lowestPrice: 24990,
    highestPrice: 32990,
    priority: 'high',
    status: 'watching',
    saleTag: 'gif',
    splitWith: [],
    inCommonCart: true,
    cartQuantity: 1,
    inStock: true,
    rating: 4.6,
    reviewsCount: 8432,
    selectedVariant: 'Silver Edition',
    availableVariants: ['Silver Edition', 'Midnight Black', 'Smoky White'],
    lastCheckedAt: new Date().toISOString(),
    notes: 'Shreyash tracking for Amazon GIF! Priyesh has SBI Cashback card for additional 10% instant off.',
    reactions: {
      '🔥': ['member-1', 'member-3', 'member-4'],
      '👀': ['member-2'],
    },
    betterStoreAvailable: undefined, // Amazon is cheapest
    fakeDiscountCheck: {
      isFake: false,
      verdict: 'genuine_steal',
      historicalAverage: 29500,
      actualDiscountVsAverage: 15,
      claimedDiscountPercentage: 29,
      analysisMessage: '🔥 Genuine Steal! Down 15% from its 30-day average of ₹29,500. Genuine all-time low price.',
    },
    comparisons: [
      { retailer: 'amazon', price: 24990, originalPrice: 34990, url: 'https://www.amazon.in/dp/B09XS7JWHH', inStock: true, specialOffer: 'SBI 10% Instant Discount', isCheapest: true },
      { retailer: 'flipkart', price: 26990, originalPrice: 34990, url: 'https://www.flipkart.com/search?q=Sony+WH-1000XM5', inStock: true, specialOffer: 'Axis Bank ₹1,500 off', isCheapest: false },
      { retailer: 'croma', price: 27990, originalPrice: 34990, url: 'https://www.croma.com/search/?text=Sony+WH-1000XM5', inStock: true, specialOffer: 'Tata Neu 5% Coins', isCheapest: false },
    ],
    priceHistory: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(), price: 32990, originalPrice: 34990 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(), price: 29990, originalPrice: 34990 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), price: 27490, originalPrice: 34990 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), price: 25990, originalPrice: 34990 },
      { timestamp: new Date().toISOString(), price: 24990, originalPrice: 34990, note: 'Lowest in 30 days' },
    ],
    comments: [
      {
        id: 'c-1',
        authorId: 'member-4',
        authorName: 'Shreyash',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        authorColor: '#f59e0b',
        content: 'This dropped to ₹24,990 on Amazon. @Priyesh can we use your SBI Card for the ₹1,500 instant discount at midnight?',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        tag: 'split',
        targetMemberId: 'member-3',
      },
    ],
  },
  {
    id: 'item-2',
    title: 'Apple iPhone 16 (128 GB) - Ultramarine Blue',
    brand: 'Apple',
    url: 'https://www.flipkart.com/apple-iphone-16-ultramarine-128-gb/p/itmd043423456',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80',
    retailer: 'flipkart',
    category: 'Mobiles',
    addedBy: 'member-1', // Pravin
    addedByName: 'Pravin',
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    currentPrice: 69999,
    originalPrice: 79900,
    targetPrice: 64999,
    lowestPrice: 69999,
    highestPrice: 79900,
    priority: 'high',
    status: 'want',
    saleTag: 'bbd',
    splitWith: [],
    inCommonCart: true,
    cartQuantity: 1,
    inStock: true,
    rating: 4.8,
    reviewsCount: 15420,
    selectedVariant: '128 GB - Ultramarine',
    availableVariants: ['128 GB - Ultramarine', '256 GB - Ultramarine', '128 GB - Teal', '128 GB - Pink'],
    lastCheckedAt: new Date().toISOString(),
    notes: 'Pravin getting this on Flipkart BBD. Pravin has Flipkart Axis Card for flat 5% cashback (saves ₹3,500).',
    reactions: {
      '🔥': ['member-1', 'member-2', 'member-3', 'member-4'],
      '💎': ['member-1'],
    },
    betterStoreAvailable: undefined,
    fakeDiscountCheck: {
      isFake: false,
      verdict: 'fair_discount',
      historicalAverage: 76000,
      actualDiscountVsAverage: 8,
      claimedDiscountPercentage: 12,
      analysisMessage: 'Fair festive discount. Selling ₹6,000 below normal retail with confirmed bank discount stacks.',
    },
    comparisons: [
      { retailer: 'flipkart', price: 69999, originalPrice: 79900, url: 'https://www.flipkart.com/search?q=iPhone+16', inStock: true, specialOffer: 'BBD Deal + 5% Axis Cashback', isCheapest: true },
      { retailer: 'amazon', price: 74900, originalPrice: 79900, url: 'https://www.amazon.in/s?k=iPhone+16', inStock: true, specialOffer: 'SBI Card ₹4,000 off', isCheapest: false },
    ],
    priceHistory: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), price: 79900, originalPrice: 79900 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), price: 74999, originalPrice: 79900 },
      { timestamp: new Date().toISOString(), price: 69999, originalPrice: 79900, note: 'BBD Reveal Price' },
    ],
    comments: [],
  },
  {
    id: 'item-3',
    title: 'Nike Air Jordan 1 Low Retro Sneakers - White/Gym Red',
    brand: 'Nike',
    url: 'https://www.amazon.in/Nike-Jordan-Low-Retro-Sneakers/dp/B08X7Y2Z3W',
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80',
    retailer: 'amazon',
    category: 'Fashion',
    addedBy: 'member-2', // Sweta
    addedByName: 'Sweta',
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    currentPrice: 9499,
    originalPrice: 10295,
    targetPrice: 7499,
    lowestPrice: 9499,
    highestPrice: 10295,
    priority: 'high',
    status: 'want',
    saleTag: 'myntra_bff',
    splitWith: [],
    inCommonCart: true,
    cartQuantity: 1,
    inStock: true,
    rating: 4.7,
    reviewsCount: 3820,
    selectedVariant: 'UK 9 - Gym Red',
    availableVariants: ['UK 8 - Gym Red', 'UK 9 - Gym Red', 'UK 10 - Gym Red', 'UK 9 - Shadow Grey'],
    lastCheckedAt: new Date().toISOString(),
    notes: 'Sweta spotted this on Amazon, but Myntra BFF has it significantly cheaper!',
    reactions: {
      '❤️': ['member-2', 'member-1', 'member-3'],
      '🔥': ['member-4'],
    },
    // BETTER PRICE AVAILABLE CALLOUT ON MYNTRA
    betterStoreAvailable: {
      retailer: 'myntra',
      retailerName: 'Myntra',
      price: 7495,
      savings: 2004,
      url: 'https://www.myntra.com/casual-shoes/nike',
    },
    fakeDiscountCheck: {
      isFake: true,
      verdict: 'inflated_mrp',
      historicalAverage: 9600,
      actualDiscountVsAverage: 1,
      claimedDiscountPercentage: 8,
      analysisMessage: '⚠️ Amazon price is barely discounted (only 1% off normal). Buy from Myntra BFF instead to save ₹2,004!',
    },
    comparisons: [
      { retailer: 'myntra', price: 7495, originalPrice: 10295, url: 'https://www.myntra.com/casual-shoes/nike', inStock: true, specialOffer: 'BFF15 + 10% Bank Discount', isCheapest: true },
      { retailer: 'flipkart', price: 8999, originalPrice: 10295, url: 'https://www.flipkart.com/search?q=Nike+Air+Jordan+1+Low', inStock: true, specialOffer: 'No extra coupon', isCheapest: false },
      { retailer: 'amazon', price: 9499, originalPrice: 10295, url: 'https://www.amazon.in/s?k=Nike+Air+Jordan+1+Low', inStock: true, specialOffer: 'Standard price', isCheapest: false },
    ],
    priceHistory: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), price: 10295, originalPrice: 10295 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), price: 9699, originalPrice: 10295 },
      { timestamp: new Date().toISOString(), price: 9499, originalPrice: 10295 },
    ],
    comments: [
      {
        id: 'c-4',
        authorId: 'member-2',
        authorName: 'Sweta',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
        authorColor: '#ec4899',
        content: 'Check the Myntra comparison link! Myntra is selling this at ₹7,495 instead of ₹9,499. Save ₹2,004.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        tag: 'note',
      },
    ],
  },
  {
    id: 'item-4',
    title: 'Sony PlayStation 5 Slim Console (1TB Disc Edition) + Cricket 24 Bundle',
    brand: 'Sony',
    url: 'https://www.flipkart.com/sony-playstation-5-slim-cfi-2008a01x-1-tb/p/itm5e492b453987',
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80',
    retailer: 'flipkart',
    category: 'Gaming',
    addedBy: 'member-1', // Pravin
    addedByName: 'Pravin',
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    currentPrice: 47990,
    originalPrice: 54990,
    targetPrice: 44990,
    lowestPrice: 47990,
    highestPrice: 54990,
    priority: 'medium',
    status: 'want',
    saleTag: 'bbd',
    splitWith: ['member-1', 'member-3', 'member-4'],
    inCommonCart: true,
    cartQuantity: 1,
    inStock: true,
    rating: 4.9,
    reviewsCount: 6510,
    selectedVariant: '1TB Disc + Cricket 24',
    availableVariants: ['1TB Disc + Cricket 24', '1TB Digital Edition'],
    lastCheckedAt: new Date().toISOString(),
    notes: 'Living room console! Pravin, Priyesh & Shreyash 3-way split: ₹15,996 each.',
    reactions: {
      '🎮': ['member-1', 'member-3', 'member-4'],
      '🔥': ['member-2'],
    },
    fakeDiscountCheck: {
      isFake: false,
      verdict: 'genuine_steal',
      historicalAverage: 53990,
      actualDiscountVsAverage: 11,
      claimedDiscountPercentage: 13,
      analysisMessage: '🔥 Genuine Drop: ₹6,000 drop from regular pricing. Lowest recorded price for Disc Bundle.',
    },
    comparisons: [
      { retailer: 'flipkart', price: 47990, originalPrice: 54990, url: 'https://www.flipkart.com/search?q=PS5+Slim', inStock: true, specialOffer: 'BBD Game Pass Bundle', isCheapest: true },
      { retailer: 'amazon', price: 49490, originalPrice: 54990, url: 'https://www.amazon.in/s?k=PS5+Slim', inStock: true, specialOffer: 'Standard Disc Model', isCheapest: false },
    ],
    priceHistory: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(), price: 54990, originalPrice: 54990 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(), price: 49990, originalPrice: 54990 },
      { timestamp: new Date().toISOString(), price: 47990, originalPrice: 54990 },
    ],
    comments: [],
  },
  {
    id: 'item-5',
    title: 'Apple MacBook Air M3 (13.6-inch Liquid Retina, 16GB Unified Memory, 256GB SSD) - Starlight',
    brand: 'Apple',
    url: 'https://www.amazon.in/Apple-MacBook-Laptop-Built-Intelligence/dp/B0CX21C2BC',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    retailer: 'amazon',
    category: 'Laptops & Gadgets',
    addedBy: 'member-3', // Priyesh
    addedByName: 'Priyesh',
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 16).toISOString(),
    currentPrice: 94990,
    originalPrice: 114900,
    targetPrice: 89990,
    lowestPrice: 94990,
    highestPrice: 114900,
    priority: 'high',
    status: 'watching',
    saleTag: 'gif',
    splitWith: [],
    inCommonCart: false,
    inStock: true,
    rating: 4.8,
    reviewsCount: 2190,
    selectedVariant: '16GB RAM / 256GB SSD - Starlight',
    availableVariants: ['16GB / 256GB - Starlight', '16GB / 512GB - Space Grey', '8GB / 256GB - Midnight'],
    lastCheckedAt: new Date().toISOString(),
    notes: 'Priyesh tracking for coding. Amazon GIF exchange bonus gives extra ₹10k.',
    reactions: {
      '💎': ['member-3', 'member-1'],
      '🔥': ['member-4'],
    },
    fakeDiscountCheck: {
      isFake: false,
      verdict: 'genuine_steal',
      historicalAverage: 104000,
      actualDiscountVsAverage: 9,
      claimedDiscountPercentage: 17,
      analysisMessage: 'Verified Amazon GIF Deal. Lowest price seen on the 16GB RAM model.',
    },
    comparisons: [
      { retailer: 'amazon', price: 94990, originalPrice: 114900, url: 'https://www.amazon.in/dp/B0CX21C2BC', inStock: true, specialOffer: 'SBI Instant Discount ₹5,000', isCheapest: true },
      { retailer: 'flipkart', price: 96990, originalPrice: 114900, url: 'https://www.flipkart.com/search?q=MacBook+Air+M3+16GB', inStock: true, specialOffer: 'Axis Bank Offer', isCheapest: false },
    ],
    priceHistory: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(), price: 114900, originalPrice: 114900 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(), price: 104990, originalPrice: 114900 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), price: 97990, originalPrice: 114900 },
      { timestamp: new Date().toISOString(), price: 94990, originalPrice: 114900 },
    ],
    comments: [],
  },
];

class Database {
  private inMemoryData: GroupData | null = null;
  private upstashClient: Redis | null = null;

  constructor() {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        this.upstashClient = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
      } catch (e) {
        console.warn('Failed to initialize Upstash Redis client:', e);
      }
    }
  }

  private getNetlifyStore() {
    try {
      if (process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT) {
        return getStore({ name: 'dealsquad-store', consistency: 'strong' });
      }
    } catch {
      // not on Netlify
    }
    return null;
  }

  private ensureDirectory() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch {
      // ignore on read-only environments
    }
  }

  private getInitialData(): GroupData {
    return {
      members: INITIAL_MEMBERS,
      items: INITIAL_ITEMS,
      saleEvents: INITIAL_SALE_EVENTS,
      activities: INITIAL_ACTIVITIES,
      webhookConfig: {
        enabled: true,
        type: 'whatsapp',
        webhookUrl: '',
      },
      updatedAt: new Date().toISOString(),
    };
  }

  public async getData(): Promise<GroupData> {
    // 1. Try Upstash Redis if configured
    if (this.upstashClient) {
      try {
        const cloudData = await this.upstashClient.get<GroupData>('dealsquad_db');
        if (cloudData && cloudData.members && cloudData.members.length > 0) {
          this.inMemoryData = cloudData;
          return cloudData;
        }
        const initialData = this.getInitialData();
        await this.upstashClient.set('dealsquad_db', initialData);
        this.inMemoryData = initialData;
        return initialData;
      } catch (err) {
        console.warn('Error reading from Upstash Redis, falling back:', err);
      }
    }

    // 2. Try Netlify Blobs if on Netlify
    const netlifyStore = this.getNetlifyStore();
    if (netlifyStore) {
      try {
        const blobData = await netlifyStore.get('dealsquad_db', { type: 'json' });
        if (blobData && (blobData as GroupData).members) {
          this.inMemoryData = blobData as GroupData;
          return blobData as GroupData;
        }
        const initialData = this.getInitialData();
        await netlifyStore.setJSON('dealsquad_db', initialData);
        this.inMemoryData = initialData;
        return initialData;
      } catch (err) {
        console.warn('Error reading from Netlify Blobs, falling back:', err);
      }
    }

    // 3. Fallback to local fs db.json
    try {
      this.ensureDirectory();
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        const hasCorrectMembers = parsed.members?.some((m: Member) => m.name === 'Pravin');
        if (hasCorrectMembers && parsed.activities) {
          this.inMemoryData = parsed;
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Error reading db.json, recreating defaults:', err);
    }

    if (this.inMemoryData) return this.inMemoryData;

    const initialData = this.getInitialData();
    try {
      this.ensureDirectory();
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    } catch {
      // In-memory fallback
    }

    this.inMemoryData = initialData;
    return initialData;
  }

  public async saveData(data: GroupData): Promise<void> {
    data.updatedAt = new Date().toISOString();
    this.inMemoryData = data;

    // 1. Save to Upstash Redis if configured
    if (this.upstashClient) {
      try {
        await this.upstashClient.set('dealsquad_db', data);
      } catch (err) {
        console.error('Failed to write to Upstash Redis:', err);
      }
    }

    // 2. Save to Netlify Blobs if on Netlify
    const netlifyStore = this.getNetlifyStore();
    if (netlifyStore) {
      try {
        await netlifyStore.setJSON('dealsquad_db', data);
      } catch (err) {
        console.error('Failed to write to Netlify Blobs:', err);
      }
    }

    // 3. Save to local disk if writable
    try {
      this.ensureDirectory();
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      // Safe to ignore on serverless lambdas
    }
  }

  // --- Activity Log Operations ---
  public async getActivities(): Promise<ActivityLog[]> {
    const data = await this.getData();
    return data.activities || [];
  }

  public async logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> {
    const data = await this.getData();
    const newAct: ActivityLog = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    if (!data.activities) data.activities = [];
    data.activities.unshift(newAct);
    if (data.activities.length > 50) data.activities = data.activities.slice(0, 50);

    await this.saveData(data);
    return newAct;
  }

  // --- Member Operations ---
  public async getMembers(): Promise<Member[]> {
    const data = await this.getData();
    return data.members;
  }

  public async getMemberById(id: string): Promise<Member | undefined> {
    const members = await this.getMembers();
    return members.find((m) => m.id === id);
  }

  public async authenticate(memberId: string, pin: string): Promise<Member | null> {
    const member = await this.getMemberById(memberId);
    if (!member) return null;
    return member.pin === pin ? member : null;
  }

  // --- Items Operations ---
  public async getItems(): Promise<WishlistItem[]> {
    const data = await this.getData();
    const items = data.items;
    return items.map((item) => {
      let avg = item.averagePrice;
      if (!avg || avg <= 0) {
        if (item.priceHistory && item.priceHistory.length > 0) {
          const sum = item.priceHistory.reduce((acc, p) => acc + p.price, 0);
          avg = Math.round(sum / item.priceHistory.length);
        } else {
          avg = item.currentPrice;
        }
      }
      return {
        ...item,
        averagePrice: avg,
      };
    });
  }

  public async getItemById(id: string): Promise<WishlistItem | undefined> {
    const items = await this.getItems();
    return items.find((i) => i.id === id);
  }

  public async addItem(item: Omit<WishlistItem, 'id' | 'addedAt' | 'lastCheckedAt' | 'priceHistory' | 'comments' | 'reactions'> & { initialPricePoint?: PricePoint }): Promise<WishlistItem> {
    const data = await this.getData();
    const id = `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const initialHistory: PricePoint[] = item.initialPricePoint
      ? [item.initialPricePoint]
      : [
          {
            timestamp: nowIso,
            price: item.currentPrice,
            originalPrice: item.originalPrice,
            note: 'Added to wishlist',
          },
        ];

    const histSum = initialHistory.reduce((acc, p) => acc + p.price, 0);
    const calculatedAvg = Math.round(histSum / initialHistory.length);

    const newItem: WishlistItem = {
      ...item,
      id,
      addedAt: nowIso,
      lastCheckedAt: nowIso,
      lowestPrice: Math.min(item.currentPrice, item.lowestPrice || item.currentPrice),
      highestPrice: Math.max(item.currentPrice, item.highestPrice || item.currentPrice),
      averagePrice: item.averagePrice || calculatedAvg,
      priceHistory: initialHistory,
      comments: [],
      reactions: {},
      inCommonCart: item.inCommonCart || false,
      cartQuantity: item.cartQuantity || 1,
    };

    data.items.unshift(newItem);

    const member = data.members.find((m) => m.id === item.addedBy);
    if (member) member.stats.itemsAdded += 1;

    // Log Activity
    await this.logActivity({
      memberId: item.addedBy,
      memberName: item.addedByName,
      memberAvatar: member?.avatar || '',
      action: 'added_item',
      itemTitle: item.title,
      itemId: id,
      details: `Added new deal (₹${item.currentPrice.toLocaleString('en-IN')})`,
    });

    await this.saveData(data);
    return newItem;
  }

  public async updateItem(id: string, updates: Partial<WishlistItem>): Promise<WishlistItem | null> {
    const data = await this.getData();
    const index = data.items.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const currentItem = data.items[index];

    let updatedHistory = currentItem.priceHistory;
    let newLowest = currentItem.lowestPrice;
    let newHighest = currentItem.highestPrice;

    if (updates.currentPrice !== undefined && updates.currentPrice !== currentItem.currentPrice) {
      newLowest = Math.min(newLowest, updates.currentPrice);
      newHighest = Math.max(newHighest, updates.currentPrice);
      updatedHistory = [
        ...currentItem.priceHistory,
        {
          timestamp: new Date().toISOString(),
          price: updates.currentPrice,
          originalPrice: updates.originalPrice || currentItem.originalPrice,
          note: updates.currentPrice < currentItem.currentPrice ? 'Price Drop!' : 'Price Update',
        },
      ];
    }

    if (updates.status === 'ordered' && currentItem.status !== 'ordered') {
      const savings = Math.max(0, currentItem.originalPrice - currentItem.currentPrice);
      const member = data.members.find((m) => m.id === currentItem.addedBy);
      if (member) {
        member.stats.dealsSecured += 1;
        member.stats.totalSavings += savings;
      }
      await this.logActivity({
        memberId: currentItem.addedBy,
        memberName: currentItem.addedByName,
        memberAvatar: '',
        action: 'status_change',
        itemTitle: currentItem.title,
        itemId: id,
        details: 'Secured & Ordered item! 🎉',
      });
    }

    const fakeCheck = analyzeFakeDiscount(
      updates.currentPrice ?? currentItem.currentPrice,
      updates.originalPrice ?? currentItem.originalPrice,
      updatedHistory,
      newLowest
    );

    const updatedItem: WishlistItem = {
      ...currentItem,
      ...updates,
      lowestPrice: newLowest,
      highestPrice: newHighest,
      priceHistory: updatedHistory,
      fakeDiscountCheck: fakeCheck,
      lastCheckedAt: new Date().toISOString(),
    };

    data.items[index] = updatedItem;
    await this.saveData(data);
    return updatedItem;
  }

  public async toggleCommonCart(itemId: string, inCart?: boolean, quantity?: number): Promise<WishlistItem | null> {
    const data = await this.getData();
    const item = data.items.find((i) => i.id === itemId);
    if (!item) return null;

    item.inCommonCart = inCart !== undefined ? inCart : !item.inCommonCart;
    if (quantity !== undefined) item.cartQuantity = Math.max(1, quantity);
    else if (!item.cartQuantity) item.cartQuantity = 1;

    await this.logActivity({
      memberId: item.addedBy,
      memberName: item.addedByName,
      memberAvatar: '',
      action: 'cart_toggle',
      itemTitle: item.title,
      itemId,
      details: item.inCommonCart ? 'Placed into Common Cart' : 'Removed from Common Cart',
    });

    await this.saveData(data);
    return item;
  }

  public async updateMemberCards(memberId: string, cards: string[]): Promise<Member | null> {
    const data = await this.getData();
    const member = data.members.find((m) => m.id === memberId);
    if (!member) return null;
    member.cardsHeld = cards;
    await this.saveData(data);
    return member;
  }

  public async updateSettlement(itemId: string, paidBy?: string, isSettled?: boolean): Promise<WishlistItem | null> {
    const data = await this.getData();
    const item = data.items.find((i) => i.id === itemId);
    if (!item) return null;

    if (paidBy !== undefined) item.paidBy = paidBy;
    if (isSettled !== undefined) item.isSettled = isSettled;

    await this.saveData(data);
    return item;
  }

  public async deleteItem(id: string): Promise<boolean> {
    const data = await this.getData();
    const index = data.items.findIndex((i) => i.id === id);
    if (index === -1) return false;
    data.items.splice(index, 1);
    await this.saveData(data);
    return true;
  }

  public async addPricePoint(itemId: string, price: number, note?: string): Promise<WishlistItem | null> {
    const data = await this.getData();
    const item = data.items.find((i) => i.id === itemId);
    if (!item) return null;

    const nowIso = new Date().toISOString();
    item.priceHistory.push({
      timestamp: nowIso,
      price,
      originalPrice: item.originalPrice,
      note: note || (price < item.currentPrice ? 'Price dropped!' : 'Refreshed price'),
    });

    const isAtl = price < item.lowestPrice;
    item.currentPrice = price;
    item.lowestPrice = Math.min(item.lowestPrice, price);
    item.highestPrice = Math.max(item.highestPrice, price);
    item.lastCheckedAt = nowIso;
    item.fakeDiscountCheck = analyzeFakeDiscount(item.currentPrice, item.originalPrice, item.priceHistory, item.lowestPrice);

    // Activity Log
    await this.logActivity({
      memberId: item.addedBy,
      memberName: item.addedByName,
      memberAvatar: '',
      action: 'price_drop',
      itemTitle: item.title,
      itemId,
      details: `Price drop: ₹${price.toLocaleString('en-IN')} (${note || 'Flash Sale'})`,
    });

    // Check Webhook Dispatch
    if (isAtl || (item.targetPrice && price <= item.targetPrice)) {
      sendWebhookAlert({
        itemTitle: item.title,
        price,
        originalPrice: item.originalPrice,
        lowestPrice: item.lowestPrice,
        url: item.url,
        retailer: item.retailer,
        alertType: isAtl ? 'all_time_low' : 'target_met',
        addedBy: item.addedByName,
      }, data.webhookConfig);
    }

    await this.saveData(data);
    return item;
  }

  public async addComment(itemId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment | null> {
    const data = await this.getData();
    const item = data.items.find((i) => i.id === itemId);
    if (!item) return null;

    const newComment: Comment = {
      ...commentData,
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    if (!item.comments) item.comments = [];
    item.comments.push(newComment);

    await this.logActivity({
      memberId: commentData.authorId,
      memberName: commentData.authorName,
      memberAvatar: commentData.authorAvatar,
      action: 'comment',
      itemTitle: item.title,
      itemId,
      details: `Note: "${commentData.content.substring(0, 35)}..."`,
    });

    await this.saveData(data);
    return newComment;
  }

  public async toggleReaction(itemId: string, emoji: string, memberId: string): Promise<Record<string, string[]> | null> {
    const data = await this.getData();
    const item = data.items.find((i) => i.id === itemId);
    if (!item) return null;

    if (!item.reactions) item.reactions = {};
    const existing = item.reactions[emoji] || [];

    if (existing.includes(memberId)) {
      item.reactions[emoji] = existing.filter((id) => id !== memberId);
      if (item.reactions[emoji].length === 0) delete item.reactions[emoji];
    } else {
      item.reactions[emoji] = [...existing, memberId];
    }

    await this.saveData(data);
    return item.reactions;
  }

  public async getSaleEvents(): Promise<SaleEvent[]> {
    const data = await this.getData();
    return data.saleEvents;
  }
}

export const db = new Database();
