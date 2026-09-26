# 🎯 DealSquad — Private 4-Member Wishlist, Common Cart & Deal Tracker

A private, collaborative wishlist and price-drop tracking web application built exclusively for **Pravin, Sweta, Priyesh, and Shreyash** to monitor, compare, and conquer the major Indian festive sales:
- **Flipkart Big Billion Days (BBD)**
- **Amazon Great Indian Festival (GIF)**
- **Myntra Big Fashion Festival (BFF)**

---

## 👥 The 4 Squad Members & Generated Security PINs

Each member has a personal PIN and their cards are pre-registered for the **Bank Card Optimizer**:

| Member | Role | Cards Held | Generated PIN |
|---|---|---|:---:|
| **Pravin** | Tech & Gadget Hunter 💻 | Flipkart Axis 5% Cashback, OneCard Metal | `1984` |
| **Sweta** | BBD & Fashion Curator 🛍️ | Amazon Pay ICICI 5%, Myntra Kotak 7.5% | `2468` |
| **Priyesh** | Card Offer & Deal Strategist 🎯 | SBI Cashback 5%, HDFC Regalia Gold 10%, Axis Atlas | `7711` |
| **Shreyash** | Prime & Flash Drop Scout ⚡ | HDFC Millennia 5%, Tata Neu Infinity 5% | `9021` |

> 📱 **Permanent Device Remembering:** Once any member unlocks the app with their PIN on their smartphone or laptop, DealSquad stores a secure long-lived credential (`dealsquad_device_auth_member` and a 1-year persistent cookie). They will **never have to log in again** from that device.

---

## 🚀 Key Features

### 1. 🛒 Shared Common Cart & Automated Bill Split Ledger
- **Pooled Group Cart:** Squad members can tap `+ Common Cart` on any item to pool orders together to hit festive cart thresholds (e.g. ₹50,000 for maximum bank discount).
- **Group Bank Card Offer Optimizer:** DealSquad automatically evaluates which squad member's card (Priyesh's HDFC Regalia / SBI, Pravin's Flipkart Axis, Sweta's Amazon Pay ICICI, or Shreyash's Millennia) saves the most money on the collective cart.
- **Bill Split Ledger:**
  - Automatically calculates each member's individual share of the pooled cart.
  - Designates who swiped the card and generates an exact debt settlement breakdown (e.g. *"Pravin reimburses Priyesh ₹15,996"*).
- **1-Click WhatsApp Export:** Exports the formatted shopping list, savings breakdown, and split debts directly into your squad's WhatsApp group.

### 2. ⚡ Multi-Store Price Comparison Matrix (Flipkart vs Amazon vs Myntra)
- For every item on the wishlist, tap **Compare 3 Stores** to open a side-by-side comparison matrix across:
  - **Flipkart (BBD)**
  - **Amazon (GIF)**
  - **Myntra (BFF)**
- Visual **👑 Cheapest Store** badge highlighting the lowest price, price differences, and 1-click links to buy directly from the cheapest retailer.
- Quick store search shortcuts to cross-reference prices on all 3 platforms in seconds.

### 3. 📉 Interactive Price Fluctuation & Drop Charts
- Timestamped price history curves with interactive SVG Bezier smoothing.
- **Badges:** All-Time Low (ATL), Lowest in 30 Days, % dropped since tracked.
- **Target Price Alert Radar:** Set an alert threshold (e.g. `Alert when price ≤ ₹22,999`). When reached, the card illuminates with a gold deal glow.
- **Flash Sale Simulator:** Test simulated -15% or -25% drops with celebratory confetti and real-time history logging.

### 4. 🛍️ Smart Link Scraping
- Paste any link from **Flipkart**, **Amazon.in**, **Myntra**, or **Croma**.
- Automatically cleans tracking parameters, extracts product title, live price, original MRP, discount %, and image.

---

## 🌐 Multi-Device Access (How All 4 Members Connect)

### Option A: Local Wi-Fi Sharing (Same Network)
Since the server is bound to `0.0.0.0:3000`, any member on the same Wi-Fi can open:
```
http://192.168.29.82:3000
```
- Pravin opens on his phone ➔ chooses **Pravin** (PIN: `1984`)
- Sweta opens on her phone ➔ chooses **Sweta** (PIN: `2468`)
- Priyesh opens on his laptop/phone ➔ chooses **Priyesh** (PIN: `7711`)
- Shreyash opens on his phone ➔ chooses **Shreyash** (PIN: `9021`)
*(All devices remain permanently logged in!)*

### Option B: Instant Public Live Link (Works on Mobile Data / Anywhere)
Run the share command from the project folder:
```bash
npm run share
```
This generates an instant public HTTPS URL (e.g. `https://dealsquad-xxxx.loca.lt`) that anyone can open from any network.

### Option C: Permanent 24/7 Cloud Hosting (Vercel + Supabase)
1. Push code to GitHub.
2. Import project into [Vercel](https://vercel.com) (free).
3. Create a free PostgreSQL database on [Supabase](https://supabase.com) or [Neon](https://neon.tech) and execute `data/schema.sql`.
4. Add `DATABASE_URL` in Vercel environment variables.

---

## 💻 Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4, Glassmorphism, Dark/Light mode
- **Charts:** Custom responsive SVG curves with Bezier interpolation
- **Icons & Animation:** Lucide React, Canvas Confetti
- **Scraper:** Cheerio, OpenGraph, JSON-LD Schema.org parser
