# Dhaka Art Nook (ঢাকা আর্ট নুক) — E-Commerce Platform

A production-ready, artisanal e-commerce web application for **Dhaka Art Nook**, an online art & craft supplies store based in Dhaka, Bangladesh.

---

## 🎨 1. Brand & Business Overview

- **Business Name:** Dhaka Art Nook
- **Headquarters:** Lalmatia, Dhaka, Bangladesh
- **Core Product Lines:**
  - Crystal Clear Epoxy Resins, Pigment Pastes & Geode Molds
  - Traditional Seasoned Sheesham Hand-Carved Wood Printing Blocks
  - Bengal Studio Artist Gouache & Heavy-Body Oil/Acrylic Pigments
  - 100% Organic Soy Wax Flakes & Sundarban Golden Beeswax
  - SLS-Free Transparent Glycerin Melt-and-Pour Soap Bases & Botanical Additives
  - Triple-Primed Unbleached Cotton Stretched Canvases & Palette Knives
- **WhatsApp Helpline:** `01626523338` (WhatsApp API links use `+8801626523338`)
- **Instagram:** [instagram.com/dhaka_art_nook](https://instagram.com/dhaka_art_nook)
- **Facebook:** [Dhaka Art Nook](https://facebook.com/dhakaartnook)
- **Currency:** BDT, formatted as `৳`
- **Language:** English

---

## 🚀 2. Core Features

### 🛍️ Customer-Facing Storefront
- **Dynamic Homepage:** Hero campaign spotlighting authentic Dhaka creative studio workbench photography, 6 craft category showcases, bestsellers, artisan tips, and customer testimonials.
- **Interactive Shop Catalog:** Live search filtering, multi-category filters, sorting (Price Low-to-High, High-to-Low, Newest, Name), and an "In Stock Only" toggle.
- **Product Detail Page (PDP):**
  - High-resolution image gallery with interactive click-to-zoom.
  - Live stock counter and discount percentage calculation.
  - Quantity selector with inventory limit protection.
  - Multi-tabbed technical specifications and craft guidance tips.
  - Instant direct WhatsApp inquiry button per product.
- **Cart System:**
  - Slide-in Cart Drawer accessible anywhere on the site.
  - Dedicated full cart page (`/cart`) with quantity stepper and line total updates.
  - Persistent storage across reloads via `localStorage`.
- **Checkout & Delivery Calculation:**
  - Bangladeshi mobile number format validation (`01XXXXXXXXX` or `+8801XXXXXXXXX`).
  - Automatic delivery charges: **৳80 Inside Dhaka**, **৳130 Outside Dhaka (Nationwide)**.
  - Live subtotal + delivery = grand total computation.
  - Configured centrally in `src/config/delivery.ts`.

---

## 💬 3. WhatsApp Order System (Core Feature)

When the customer clicks **"Confirm Order on WhatsApp"**, the application generates a URL-encoded message and opens `https://wa.me/8801626523338?text=...`.

### Message Contents:
1. **Order Reference & Timestamp:** (e.g. `DAN-20261104-XXXX`).
2. **Customer Information:** Name, verified phone number, complete delivery address, and delivery zone.
3. **Itemized Order List:**
   - Product name
   - Quantity & unit price (৳)
   - Line total (৳)
   - Direct public image URL (so WhatsApp displays a link preview)
   - Direct product web link
4. **Financial Breakdown:** Subtotal, Delivery Charge, and Grand Total.
5. **Customer Confirmation Note:** Pre-written polite request for payment instructions (bKash/Nagad/COD) and courier dispatch timeline.

> **Note on WhatsApp Link Previews:**
> WhatsApp's `wa.me/?text=` protocol supports UTF-8 text and URL parameters, but cannot attach binary image files directly into the compose field. To provide the best visual experience, each product line item includes its direct public image URL. WhatsApp's crawler retrieves the image link preview automatically.

---

## 🔐 4. Admin Panel (`/admin`)

- **Authentication:** Admin access must use Firebase Authentication with a verified account. Authorization is enforced by Firebase Security Rules; client-side state or local storage is not an authorization mechanism.
- **Credentials:** No admin passwords or demo credentials are stored in this repository. Configure the authorized administrator identity and Firebase Authentication account outside source control. Rotate any credentials that were previously exposed in repository history or deployed client bundles.
- **Dashboard:**
  - Real-time inventory metrics (Total products, categories, stock valuation).
  - Out of stock warnings and low inventory alerts.
  - Recent orders timeline.
- **Product Management (CRUD):**
  - Create, edit, and delete products with confirmation dialogs.
  - Fields: Title, Category, Craft Type, Price, Discount Price, Stock Units, In Stock toggle, Featured toggle, Description, and Images.
  - Automatic client-side canvas image compression on upload.
- **Category Management (CRUD):**
  - Add, edit, and remove categories with images and descriptions.
- **Order Tracking:**
  - View incoming orders from customers, filter by status (Pending, Confirmed, Processing, Shipped, Delivered), and update statuses.
- **Database Schema & SQL Tab:**
  - Embedded viewer for the full PostgreSQL / Supabase migration script with one-click copy.

---

## 🗄️ 5. Supabase & PostgreSQL Schema

The repository contains `supabase/schema.sql` and `src/utils/supabaseSchema.ts` containing:
- `public.categories` table with slug uniqueness and indexes.
- `public.products` table with pg_trgm search indexes and foreign keys.
- `public.product_images` table for multiple gallery images.
- `public.orders` and `public.order_items` tables with constraints.
- Row Level Security (RLS) policies allowing public read and authenticated admin CRUD.

---

## 📦 6. Delivery Configuration

To update delivery rates or contact details, edit `src/config/delivery.ts`:

```typescript
export const DELIVERY_CONFIG = {
  insideDhaka: {
    fee: 80, // in BDT (৳)
    estimatedDelivery: '24 – 48 Hours',
  },
  outsideDhaka: {
    fee: 130, // in BDT (৳)
    estimatedDelivery: '2 – 4 Working Days',
  },
  whatsapp: {
    phoneNumber: '01626523338',
    internationalNumber: '8801626523338',
  },
  ...
};
```

---

## 🛠️ 7. Development & Build

```bash
# Install dependencies
npm install

# Start local development server (port 3000)
npm run dev

# Run TypeScript check
npm run lint

# Compile production bundle
npm run build
```
