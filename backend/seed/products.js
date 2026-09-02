// Catalog for KIRIJO PHARMACY — prices in KES.
// `color` is used to render the flat product tile when there's no image.
// `image` currently points at keyword-matched placeholder photos from
// loremflickr.com — swap these for your own real product photos (see
// backend/uploads/ + README) whenever you're ready to go live with real
// stock photography.
//
// After editing this file, run `npm run seed` from backend/ to sync it to
// the database. This WIPES the products collection and reinserts exactly
// what's listed here — so keep every real product you want to keep in this
// file, not just the new ones you're adding.

export const products = [
  {
    name: "Paracetamol 500mg",
    slug: "paracetamol-500mg",
    sku: "KP-MED-001",
    image: "https://loremflickr.com/600/750/pills,medicine?lock=1",
    category: "medicines",
    drop: "VERIFIED",
    price: 150,
    description: "Fast-acting relief from pain and fever. Pharmacist-approved, genuine stock.",
    color: "#e0f2fe",
    sizes: ["10 Tablets", "20 Tablets"],
    stock: 40,
    featured: true,
  },
  {
    name: "Vitamin C 1000mg",
    slug: "vitamin-c-1000mg",
    sku: "KP-VIT-001",
    image: "https://loremflickr.com/600/750/vitamins,supplement?lock=2",
    category: "vitamins",
    drop: "VERIFIED",
    price: 450,
    description: "Daily immune support supplement. Easy-to-swallow tablets, no aftertaste.",
    color: "#fef9c3",
    sizes: ["30 Tablets", "60 Tablets"],
    stock: 35,
    featured: true,
  },
  {
    name: "Hydrating Face Moisturizer",
    slug: "hydrating-face-moisturizer",
    sku: "KP-SKN-001",
    image: "https://loremflickr.com/600/750/skincare,cream?lock=3",
    category: "skincare",
    drop: "VERIFIED",
    price: 850,
    description: "Gentle daily moisturizer for all skin types. Fragrance-free, dermatologist tested.",
    color: "#fce7f3",
    sizes: ["50ml", "100ml"],
    stock: 20,
    featured: true,
  },
  {
    name: "Digital Thermometer",
    slug: "digital-thermometer",
    sku: "KP-PC-001",
    image: "https://loremflickr.com/600/750/thermometer,medical?lock=4",
    category: "personal-care",
    drop: "VERIFIED",
    price: 600,
    description: "Fast, accurate digital body temperature reading in under 60 seconds.",
    color: "#dcfce7",
    sizes: ["1 Unit"],
    stock: 25,
    featured: true,
  },
];
