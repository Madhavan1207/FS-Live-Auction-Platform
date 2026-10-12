// Experiment 4 replaced the mock backend with a real one: Node/Express +
// MongoDB via Mongoose, running separately on http://localhost:5000. This
// is the ONLY file that needed to change to plug it in — Browse.jsx and
// ItemDetail.jsx still just call fetchItems()/fetchItemById(), unaware
// whether the data came from mock data or a real database.
//
// One shape difference to handle here: MongoDB documents use `_id`
// (a string) instead of the numeric `id` the old mock data used. Every
// other component (ItemCard, Redux selectors) still reads `item.id`, so
// we map `_id` -> `id` right here rather than touching every component.
//
// Second shape difference: Mongoose's `closingAt` field is a real Date,
// which Express serializes to an ISO string (e.g. "2026-09-09T20:00:00Z")
// when it sends JSON. useCountdown does `closingAt - Date.now()`, which
// needs closingAt to be a plain number (ms since epoch) — subtracting a
// string produces NaN, which is why the timer looked broken/"closed"
// immediately. Converting it back to a timestamp here fixes it for both
// Browse and ItemDetail in one place.

import { API_BASE_URL } from "../config.js";

export function mapItem(doc) {
  return { ...doc, id: doc._id, closingAt: new Date(doc.closingAt).getTime() };
}

export async function fetchItems() {
  const res = await fetch(`${API_BASE_URL}/items`);
  if (!res.ok) throw new Error("Failed to load listings");
  const data = await res.json();
  return data.map(mapItem);
}

export async function fetchItemById(id) {
  const res = await fetch(`${API_BASE_URL}/items/${id}`);
  if (!res.ok) throw new Error(`No listing found with id ${id}`);
  const data = await res.json();
  return mapItem(data);
}

// Experiment 6 connection: previously (Experiment 3) placing a bid only
// updated the local Redux store — nothing was ever sent to the backend.
// Now it's a real POST to the auth-protected bid endpoint. The JWT is
// required: the backend's `protect` + `authorize("buyer")` middleware
// (Experiment 6) will reject this with 401/403 if there's no token or the
// logged-in user isn't a buyer, even before this function is called
// (the UI already hides the bid form in those cases, but the backend is
// the real enforcement, not the UI hiding it).
export async function placeBidRequest(itemId, amount, token) {
  const res = await fetch(`${API_BASE_URL}/items/${itemId}/bids`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to place bid");

  return { bid: data.bid, item: mapItem(data.item) };
}

// Backs the new "Create Listing" page (seller/admin only). The backend's
// `protect` + `authorize("seller", "admin")` middleware is the real
// enforcement — this will fail with 401/403 if the token is missing or
// the account isn't a seller, regardless of what the UI shows.
export async function createItemRequest(itemData, token) {
  const res = await fetch(`${API_BASE_URL}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(itemData),
  });

  const data = await res.json();
  if (!res.ok) {
    const detail = data.details ? data.details.join(" ") : data.message;
    throw new Error(detail || "Failed to create listing");
  }

  return mapItem(data);
}