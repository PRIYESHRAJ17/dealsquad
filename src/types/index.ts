export type Retailer = 'amazon' | 'flipkart' | 'myntra' | 'croma' | 'other';

export type ItemStatus = 'want' | 'watching' | 'ordered' | 'received';

export type Priority = 'high' | 'medium' | 'low';

export type SaleEventTag = 'bbd' | 'gif' | 'myntra_bff' | 'diwali' | 'none';

export interface Member {
  id: string;
  name: string;
  shortName: string;
  email: string;
  pin: string;
  avatar: string;
  color: string;
  role: string;
  bio: string;
  cardsHeld: string[];
  stats: {
    itemsAdded: number;
    totalSavings: number;
    dealsSecured: number;
  };
}

export interface PricePoint {
  timestamp: string; // ISO string
  price: number;
  originalPrice?: number;
  note?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorColor: string;
  content: string;
  createdAt: string;
  tag?: 'split' | 'gift' | 'bbd_priority' | 'note' | 'alert';
  targetMemberId?: string;
}

export interface StoreComparison {
  retailer: Retailer;
  price: number;
  originalPrice?: number;
  url: string;
  inStock: boolean;
  specialOffer?: string;
  isCheapest?: boolean;
}

export interface FakeDiscountCheck {
  isFake: boolean;
  verdict: 'genuine_steal' | 'fair_discount' | 'inflated_mrp';
  historicalAverage: number;
  actualDiscountVsAverage: number;
  claimedDiscountPercentage: number;
  analysisMessage: string;
}

export interface WishlistItem {
  id: string;
  title: string;
  brand?: string;
  url: string;
  imageUrl: string;
  retailer: Retailer;
  category: string;
  addedBy: string; // member id
  addedByName: string;
  addedAt: string;
  currentPrice: number;
  originalPrice: number;
  targetPrice?: number;
  lowestPrice: number;
  highestPrice: number;
  averagePrice?: number;
  priceHistory: PricePoint[];
  status: ItemStatus;
  saleTag: SaleEventTag;
  notes?: string;
  priority: Priority;
  splitWith: string[]; // member IDs
  isSecretGiftFor?: string;
  comments: Comment[];
  reactions: Record<string, string[]>; // emoji -> array of memberIds
  inStock: boolean;
  isLightningDeal?: boolean;
  lightningDealEndsAt?: string;
  rating?: number;
  reviewsCount?: number;
  selectedVariant?: string;
  availableVariants?: string[];
  lastCheckedAt: string;
  // Multi-Store Comparison
  comparisons?: StoreComparison[];
  betterStoreAvailable?: {
    retailer: Retailer;
    retailerName: string;
    price: number;
    savings: number;
    url: string;
  };
  // Fake Discount Analysis
  fakeDiscountCheck?: FakeDiscountCheck;
  // Common Cart & Splitting
  inCommonCart?: boolean;
  cartQuantity?: number;
  paidBy?: string;
  isSettled?: boolean;
}

export interface SalePhase {
  name: string;
  tagline: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'live' | 'ended';
  isVipOnly?: boolean;
}

export interface SaleEvent {
  id: 'bbd' | 'gif' | 'myntra_bff' | 'diwali';
  name: string;
  retailer: Retailer;
  tagline: string;
  badge: string;
  color: string;
  accentColor: string;
  startDate: string;
  endDate: string;
  bannerImage: string;
  description: string;
  phases?: SalePhase[];
}

export interface ActivityLog {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  action: 'added_item' | 'price_drop' | 'status_change' | 'comment' | 'cart_toggle' | 'deal_hit';
  itemTitle: string;
  itemId: string;
  details: string;
  timestamp: string;
}

export interface GroupData {
  members: Member[];
  items: WishlistItem[];
  saleEvents: SaleEvent[];
  activities: ActivityLog[];
  webhookConfig?: {
    enabled: boolean;
    type: 'telegram' | 'whatsapp' | 'generic';
    webhookUrl?: string;
    telegramBotToken?: string;
    telegramChatId?: string;
  };
  updatedAt: string;
}

export interface ScrapeResult {
  success: boolean;
  title?: string;
  brand?: string;
  price?: number;
  originalPrice?: number;
  imageUrl?: string;
  retailer?: Retailer;
  inStock?: boolean;
  isLightningDeal?: boolean;
  rating?: number;
  reviewsCount?: number;
  variants?: string[];
  selectedVariant?: string;
  error?: string;
  comparisons?: StoreComparison[];
}

export interface CardOfferRecommendation {
  cardName: string;
  memberId: string;
  memberName: string;
  discountPercentage: number;
  maxDiscount?: number;
  discountAmount: number;
  finalPrice: number;
  badge: string;
}
