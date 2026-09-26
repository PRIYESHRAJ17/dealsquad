-- DealSquad PostgreSQL Schema
-- Can be executed in Supabase, Neon, or standard PostgreSQL

CREATE TABLE IF NOT EXISTS members (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(64) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  pin VARCHAR(10) NOT NULL,
  avatar TEXT,
  color VARCHAR(32),
  role VARCHAR(128),
  bio TEXT,
  items_added INT DEFAULT 0,
  total_savings DECIMAL(12, 2) DEFAULT 0,
  deals_secured INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id VARCHAR(64) PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  image_url TEXT,
  retailer VARCHAR(32) NOT NULL,
  category VARCHAR(64) NOT NULL,
  added_by VARCHAR(64) REFERENCES members(id),
  added_by_name VARCHAR(255),
  current_price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2) NOT NULL,
  target_price DECIMAL(10, 2),
  lowest_price DECIMAL(10, 2) NOT NULL,
  highest_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(32) DEFAULT 'want',
  sale_tag VARCHAR(32) DEFAULT 'none',
  priority VARCHAR(32) DEFAULT 'medium',
  notes TEXT,
  split_with JSONB DEFAULT '[]'::jsonb,
  is_secret_gift_for VARCHAR(64),
  reactions JSONB DEFAULT '{}'::jsonb,
  in_stock BOOLEAN DEFAULT true,
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  item_id VARCHAR(64) REFERENCES wishlist_items(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  note TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(64) PRIMARY KEY,
  item_id VARCHAR(64) REFERENCES wishlist_items(id) ON DELETE CASCADE,
  author_id VARCHAR(64) REFERENCES members(id),
  author_name VARCHAR(255),
  author_avatar TEXT,
  author_color VARCHAR(32),
  content TEXT NOT NULL,
  tag VARCHAR(32),
  target_member_id VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
