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

const API_BASE_URL = "http://localhost:5000/api";

function mapItem(doc) {
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