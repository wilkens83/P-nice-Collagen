# P-Nice Collagen E-commerce Store - PRD

## Project Overview
Premium Shopify Dawn-style e-commerce website for P-Nice collagen brand, combining Bloom's beauty-lifestyle appeal, AG1's trust-and-subscription system, and Snap's conversion discipline.

## Original Problem Statement
Build a premium collagen e-commerce store with:
- Dawn theme aesthetic (minimalist, elegant, warm ivory palette)
- 5 products + 4 bundles
- Stripe checkout with subscription support
- Newsletter signup, FAQ, reviews, and all supporting pages

## User Personas
1. **Primary**: Wellness-conscious women (25-45) who value aesthetics and routine
2. **Secondary**: Active individuals seeking joint and skin support
3. **Tertiary**: Gift buyers looking for premium wellness products

## Core Requirements (Static)
- React frontend + FastAPI backend + MongoDB
- Stripe payment integration
- Subscribe & Save pricing (20% off)
- Mobile-responsive design
- Dawn theme aesthetic

---

## What's Been Implemented

### Date: January 2026 - MVP Complete

#### Backend (FastAPI)
- [x] Products API (5 products with full details)
- [x] Bundles API (4 bundles with savings calculations)
- [x] Reviews API (sample reviews)
- [x] Cart API (create, add items, update quantities, remove, totals)
- [x] Newsletter subscription API
- [x] Stripe checkout session creation
- [x] Stripe payment status polling
- [x] Stripe webhook handler
- [x] MongoDB collections: carts, newsletter, payment_transactions

#### Frontend (React)
- [x] Homepage with 10 sections:
  - Hero with CTA buttons
  - Trust bar (Grass-Fed, USA Made, Third-Party Tested, etc.)
  - Shop by Ritual (Morning Glow, Daily Beauty, Night Repair)
  - Best Sellers (4 products)
  - Brand Story section
  - Why Collagen section
  - Bundles showcase
  - Reviews/Social Proof
  - FAQ accordion
  - Newsletter signup
  - Guarantee bar
- [x] Product pages with:
  - Image gallery placeholder
  - Rating and reviews
  - Subscribe & Save option
  - Quantity selector
  - Add to Cart
  - Trust badges
  - Benefits, Ingredients, How-to-Use, Reviews tabs
  - Product FAQs
  - "Pairs With" recommendations
- [x] Collection pages (all, daily rituals, night repair, by ritual)
- [x] Bundles page with detailed bundle info
- [x] Cart page with full summary
- [x] Cart drawer (slide-over)
- [x] Checkout success page with status polling
- [x] About/Our Story page
- [x] FAQ page (categorized)
- [x] Science/Why Collagen page
- [x] Header with navigation dropdown
- [x] Footer with links

#### Products
1. Grass-Fed Collagen Peptides (Unflavored) - $39.99 / $31.99 sub
2. Vanilla Collagen Creamer - $44.99 / $35.99 sub
3. Chocolate Collagen Peptides - $44.99 / $35.99 sub
4. Retinol + Peptide Night Serum - $54.99 / $43.99 sub
5. Sleep Plus Collagen Cream - $49.99 / $39.99 sub

#### Bundles
1. Morning Glow Stack - $74.99 (Save $19.99)
2. Beauty Sleep Duo - $89.99 (Save $44.99)
3. Daily Collagen Starter Kit - $69.99 (Save $29.99)
4. Glow From Within Bundle - $79.99 (Save $29.99)

#### Design System
- Typography: Playfair Display (headings) + DM Sans (body)
- Colors: Warm ivory (#FFFCF8), Stone (#292524), Champagne Gold (#D4AF37), Sage (#7A8B69)
- Dawn theme aesthetic with minimalist, sharp corners

---

## Prioritized Backlog

### P0 - Critical (Next Phase)
- [ ] Add real product images (user to provide)
- [ ] User authentication system
- [ ] Order history / My Account page
- [ ] Email confirmation after purchase

### P1 - High Priority
- [ ] Product search functionality
- [ ] Filtering/sorting on collections
- [ ] Subscription management portal
- [ ] Inventory management
- [ ] Email marketing integration (SendGrid/Resend)

### P2 - Medium Priority
- [ ] Customer reviews submission
- [ ] Wishlist functionality
- [ ] Product quiz/recommendation
- [ ] Loyalty/rewards program
- [ ] Gift cards
- [ ] Referral program

### P3 - Nice to Have
- [ ] Live chat support
- [ ] Blog/content section
- [ ] Before/after gallery
- [ ] Influencer/affiliate tracking
- [ ] Advanced analytics dashboard

---

## Technical Architecture

```
/app
├── backend/
│   ├── server.py          # FastAPI with all routes
│   ├── .env               # MONGO_URL, DB_NAME, STRIPE_API_KEY
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main app with cart context
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   ├── CartDrawer.js
│   │   │   └── ProductCard.js
│   │   └── pages/
│   │       ├── HomePage.js
│   │       ├── ProductPage.js
│   │       ├── CollectionPage.js
│   │       ├── BundlesPage.js
│   │       ├── CartPage.js
│   │       ├── CheckoutSuccess.js
│   │       ├── AboutPage.js
│   │       ├── FAQPage.js
│   │       └── SciencePage.js
│   ├── .env
│   └── package.json
└── design_guidelines.json
```

---

## Testing Status
- Backend: 100% (12/12 endpoints)
- Frontend: 95% (placeholder images as expected)
- All core e-commerce flows working
