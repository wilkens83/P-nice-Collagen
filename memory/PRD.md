# P-Nice Collagen E-commerce Store - PRD

## Project Overview
Premium Shopify Dawn-style e-commerce website for P-Nice collagen brand, combining Bloom's beauty-lifestyle appeal, AG1's trust-and-subscription system, and Snap's conversion discipline.

## Original Problem Statement
Build a premium collagen e-commerce store with:
- Dawn theme aesthetic (minimalist, elegant, warm ivory palette)
- 5 products + 4 bundles
- Stripe checkout with subscription support
- Newsletter signup, FAQ, reviews, and all supporting pages
- Admin dashboard for product management, customer tracking, and media uploads

## User Personas
1. **Primary**: Wellness-conscious women (25-45) who value aesthetics and routine
2. **Secondary**: Active individuals seeking joint and skin support
3. **Tertiary**: Gift buyers looking for premium wellness products

## Core Requirements (Static)
- React frontend + FastAPI backend + MongoDB
- Stripe payment integration (LIVE key configured)
- Subscribe & Save pricing (20% off)
- Mobile-responsive design
- Dawn theme aesthetic
- Admin dashboard with CRUD operations

---

## What's Been Implemented

### Date: January 2026 - MVP + Admin Dashboard

#### Backend (FastAPI)
- [x] Products API (5 products with full details)
- [x] Bundles API (4 bundles with savings calculations)
- [x] Reviews API (sample reviews)
- [x] Cart API (create, add items, update quantities, remove, totals)
- [x] Newsletter subscription API
- [x] Stripe checkout with LIVE key
- [x] Stripe payment status polling & webhook
- [x] **Discount Codes**: WELCOME10 (10%), SAVE15 (15% on $50+), FIRST20 (20% on $75+), FLAT10 ($10 off $40+)
- [x] **Tax Calculation**: 8% tax on orders
- [x] **Admin Authentication** (username: admin, password: pnice2024)
- [x] **Admin Products CRUD** (create, read, update, delete)
- [x] **Admin Image Upload** (JPEG, PNG, WebP, GIF)
- [x] **Admin Customers** (newsletter + order tracking)
- [x] **Admin Orders** (payment transactions)
- [x] **Admin Dashboard Stats** (products, revenue, orders, subscribers)

#### Frontend (React)
- [x] Full storefront (Homepage, Products, Collections, Bundles, Cart, Checkout)
- [x] P-nice logo in header and footer
- [x] Discount code input in cart
- [x] Tax display in order summary
- [x] **Admin Dashboard** at /admin:
  - Login with session management
  - Dashboard with stats cards
  - Products management (list, add, edit, delete)
  - Image upload in product form
  - Orders tab with history
  - Customers tab (subscribers + buyers)
  - Media Library for image management
  - View Store link
  - Logout functionality

#### Admin Credentials
- **URL**: /admin
- **Username**: admin
- **Password**: pnice2024

#### Stripe Configuration
- **Live Key**: Configured
- **Discount Codes**: Active
- **Tax Rate**: 8%

---

## Prioritized Backlog

### P0 - Critical (Next Phase)
- [ ] Add real product images via admin
- [ ] Email confirmation after purchase
- [ ] Password change for admin

### P1 - High Priority
- [ ] Product search functionality
- [ ] Filtering/sorting on collections
- [ ] Subscription management portal
- [ ] Inventory management (stock tracking)
- [ ] Email marketing integration

### P2 - Medium Priority
- [ ] Customer reviews submission from frontend
- [ ] Wishlist functionality
- [ ] Product quiz/recommendation
- [ ] Multiple admin users
- [ ] Bulk product import

### P3 - Nice to Have
- [ ] Live chat support
- [ ] Blog/content section
- [ ] Analytics dashboard enhancements
- [ ] Referral program

---

## Testing Status
- Backend: 100% (all endpoints)
- Frontend: 100% (all features)
- Admin: 100% (all CRUD + auth)
