# KIRIJO PHARMACY (MERN)

A full-stack pharmacy e-commerce site: **M**ongoDB, **E**xpress, **R**eact, **N**ode.
Clean, trustworthy storefront for medicines, vitamins, skincare and personal care —
cart, checkout, order confirmation emails, and a real order/stock system.

```
streetwear/
├── backend/     Express + MongoDB API
└── frontend/    React (Vite) storefront
```

## What's inside

**Frontend (React + Vite + React Router)**
- Clean, light medical-themed landing page with a licensed-pharmacy trust message
- Shop page with category filters (Medicines, Vitamins, Skincare, Personal Care)
- Product detail pages with pack-size selection
- Slide-in cart drawer with quantity controls
- Checkout with order summary + M-Pesa / cash-on-delivery options
- Order confirmation screen with a real order number, plus HTML confirmation emails
- Floating WhatsApp button to chat with a pharmacist
- Fully responsive, keyboard-focusable, respects reduced-motion

**Backend (Express + Mongoose)**
- `Product` and `Order` models
- Product listing with `?category=`, `?featured=`, `?search=` filters
- Products automatically disappear from the shop once stock hits 0
- Order creation that **re-prices on the server** (clients can't fake prices) and **decrements stock**
- Auto-generated order numbers (e.g. `SW-X7K2P`)
- Free delivery over KES 1,500, else KES 100
- Order confirmation + new-order owner-alert emails via Gmail SMTP
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
- Local Mongo:  `mongodb://127.0.0.1:27017/kirijo-pharmacy`
- Atlas:        `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/kirijo-pharmacy`

Seed the catalog (loads the starter products), then start the API:

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

Store runs at **http://localhost:5173**.

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

- **Brand name / copy:** edit `frontend/src/components/Chrome.jsx` (logo + ticker) and `frontend/src/pages/Landing.jsx`.
- **Colors:** all theming lives in CSS variables at the top of `frontend/src/index.css` (`--primary`, `--secondary`, `--bg`, etc.).
- **Categories:** the allowed set lives in `backend/models/Product.js` (`category` enum) — keep `frontend/src/pages/Shop.jsx` and `frontend/src/components/Chrome.jsx` in sync when you change it.
- **Products & photos:** edit `backend/seed/products.js`, then re-run `npm run seed`. Each product ships with a keyword-matched placeholder photo from loremflickr.com. Swap the `image` field to your own real product photo URLs (drop files in `backend/uploads/`, or use Cloudinary/S3) once you're ready to go live. If an image ever fails to load, the card falls back to a solid tile automatically.
- **Real payments:** the checkout records the order and payment method but doesn't charge yet. To go live, integrate **M-Pesa Daraja STK Push** (Safaricom) or a card processor in `backend/controllers/orderController.js`.

## 6. Before going to production

This is a solid starter, not a hardened production app — and a **real pharmacy business also has real regulatory requirements** on top of the usual engineering ones. Before launch:
- Confirm your pharmacy licensing and dispensing regulations with the relevant authority (e.g. Pharmacy and Poisons Board in Kenya) — prescription-only medicines generally cannot be sold through a self-serve checkout like this without proper pharmacist verification built in.
- Authentication + admin protection on the product/order write routes
- Input validation (e.g. `zod` or `express-validator`)
- Rate limiting and `helmet`
- Real payment integration + webhook confirmation
- Image hosting (Cloudinary / S3)

---

Built for KIRIJO PHARMACY. Your health, delivered.
