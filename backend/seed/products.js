// Catalog for STREETWEAR — prices in KES.
// `color` is used to render the flat product tile when there's no image.
// `image` should point at a photo in backend/uploads (served at
// http://localhost:5000/uploads/<filename>) or a real hosted image URL.
//
// After editing this file, run `npm run seed` from backend/ to sync it to
// the database. This WIPES the products collection and reinserts exactly
// what's listed here — so keep every real product you want to keep in this
// file, not just the new ones you're adding.

export const products = [
  {
    name: "Black Hoodie",
    slug: "black-hoodie",
    sku: "SW-HOOD-001",
    image: "http://localhost:5000/uploads/black-hoodie.png",
    category: "hoodies",
    drop: "DROP 01",
    price: 1500,
    description: "Drip kali",
    color: "#0a0a0a",
    sizes: ["M"],
    stock: 3,
    featured: true,
  },
  {
    name: "T-shirt",
    slug: "t-shirt",
    sku: "SW-TSHIRT-001",
    image: "http://localhost:5000/uploads/t-shirt-loyalty.png",
    category: "tshirts",
    drop: "DROP 01",
    price: 300,
    description: "Shirt Noma",
    color: "#0a0a0a",
    sizes: ["M"],
    stock: 3,
    featured: true,
  },
];
