// Single shared source of "listing" data for the whole app.
// This stands in for the MongoDB `Item` collection until Experiment 4
// (REST API + MongoDB/Mongoose) gives us a real database and endpoints.
//
// `closingAt` is a real timestamp (ms since epoch) so the countdown hook
// can compute time-remaining live, instead of a hardcoded "2h 14m left" string.

const now = Date.now();

export const ITEMS = [
  {
    id: 1,
    title: "Vintage Leather Armchair",
    category: "Furniture",
    description:
      "A well-preserved mid-century leather armchair, original stitching, minor wear on the armrests. Local pickup preferred.",
    currentBid: 120,
    bidCount: 8,
    seller: "Rohan M.",
    image:
      "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=900",
    closingAt: now + (2 * 60 + 14) * 60 * 1000, // 2h 14m from load
  },
  {
    id: 2,
    title: "Canon AE-1 Film Camera",
    category: "Electronics",
    description:
      "Classic 35mm SLR from the late 70s, fully functional, comes with a 50mm f/1.8 lens and original strap.",
    currentBid: 85,
    bidCount: 5,
    seller: "Ayesha K.",
    image:
      "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=900",
    closingAt: now + 45 * 60 * 1000, // 45m from load
  },
  {
    id: 3,
    title: "Handmade Ceramic Vase Set",
    category: "Home Decor",
    description:
      "Set of three hand-thrown stoneware vases, matte glaze finish. Sold as a set only.",
    currentBid: 40,
    bidCount: 2,
    seller: "Meera S.",
    image:
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=900",
    closingAt: now + (5 * 60 + 2) * 60 * 1000, // 5h 02m from load
  },
  {
    id: 4,
    title: "Mountain Bike - Trek 820",
    category: "Sports",
    description:
      "Steel-frame hardtail, recently tuned, new brake pads. Great commuter or trail starter bike.",
    currentBid: 210,
    bidCount: 11,
    seller: "Dev P.",
    image:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=900",
    closingAt: now + (27 * 60 + 3) * 60 * 1000, // 1d 3h from load
  },
];
