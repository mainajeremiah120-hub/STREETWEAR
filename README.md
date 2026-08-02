# STREETWEAR — Streetwear Store (MERN)

A full-stack streetwear e-commerce site: **M**ongoDB, **E**xpress, **R**eact, **N**ode.
Drop-culture theme, live countdown, cart, checkout, and a real order/stock system.

```
streetwear/
├── backend/     Express + MongoDB API
└── frontend/    React (Vite) storefront
```

## What's inside

**Frontend (React + Vite + React Router)**
- Flashy landing page — giant poster type, hazard-orange accents, caution-tape marquee, live drop countdown
- Shop page with category filters
- Product detail pages with size selection
- Slide-in cart drawer with quantity controls
- Checkout with order summary + M-Pesa / cash-on-delivery options
- Order confirmation screen with a real order number
- Fully responsive, keyboard-focusable, respects reduced-motion

**Backend (Express + Mongoose)**
- `Product` and `Order` models
- Product listing with `?category=`, `?featured=`, `?search=` filters
- Order creation that **re-prices on the server** (clients can't fake prices) and **decrements stock**
- Auto-generated order numbers (e.g. `STREETWEAR-X7K2P`)
- Free shipping over KES 5,000, else KES 300
- CORS, error handling, health check

---

## 1. Prerequisites

- **Node.js** 18+ ([nodejs.org](https://nodejs.org))
- **MongoDB** — either:
  - Local install ([mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)), or
  - Free cloud cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) (recommended, no local install)

---

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set your `MONGO_URI`:
- Local Mongo:  `mongodb://127.0.0.1:27017/streetwear`
- Atlas:        `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/streetwear`

Seed the catalog (loads the 12 starter products), then start the API:

```bash
npm run seed
npm run dev
```

API runs at **http://localhost:5000**. Test it: open http://localhost:5000/api/products

---

## 3. Frontend setup

Open a **second terminal**:

```bash
cd frontend
npm install
cp .env.example .env    # default points at http://localhost:5000/api
npm run dev
```

Store runs at **http://localhost:5173**. Open it and you'll see the drop.

---

## 4. API reference

| Method | Route                        | What it does                          |
|--------|------------------------------|---------------------------------------|
| GET    | `/api/products`              | List products (`?category=`, `?featured=true`, `?search=`) |
| GET    | `/api/products/:slug`        | Single product by slug                |
| POST   | `/api/products`              | Create a product (admin)              |
| PUT    | `/api/products/:id`          | Update a product                      |
| DELETE | `/api/products/:id`          | Delete a product                      |
| POST   | `/api/orders`                | Place an order                        |
| GET    | `/api/orders/:orderNumber`   | Look up an order                      |
| GET    | `/api/orders`                | List all orders (admin)               |

---

## 5. Making it yours

- **Brand name / copy:** edit `frontend/src/components/Chrome.jsx` (logo + marquee) and `frontend/src/pages/Landing.jsx`.
- **Colors:** all theming lives in CSS variables at the top of `frontend/src/index.css` (`--hazard`, `--concrete`, etc.).
- **Products & photos:** edit `backend/seed/products.js`, then re-run `npm run seed`. Each product ships with a keyword-matched placeholder photo from loremflickr.com. Swap the `image` field to your own product photo URLs (Cloudinary, S3, etc.) when you shoot the real drop. If an image ever fails to load, the card falls back to a solid tile automatically.
- **Real payments:** the checkout records the order and payment method but doesn't charge yet. To go live, integrate **M-Pesa Daraja STK Push** (Safaricom) or a card processor in `backend/controllers/orderController.js`.

## 6. Before going to production

This is a solid starter, not a hardened production app. Add before launch:
- Authentication + admin protection on the product/order write routes
- Input validation (e.g. `zod` or `express-validator`)
- Rate limiting and `helmet`
- Real payment integration + webhook confirmation
- Image hosting (Cloudinary / S3)

---

Built for STREETWEAR. Wear the streets.
