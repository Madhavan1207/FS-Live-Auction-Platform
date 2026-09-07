import { ITEMS } from "../data/items.js";

// This file simulates the REST endpoints that Experiment 4 will build for
// real (GET /api/items, GET /api/items/:id) against MongoDB/Mongoose.
// Keeping the async + delay + reject shape here means the components that
// call these functions (Browse, ItemDetail) will not need to change at all
// when mockApi.js is swapped for real fetch() calls later — only this file
// changes.

const NETWORK_DELAY_MS = 600;

export function fetchItems() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(ITEMS), NETWORK_DELAY_MS);
  });
}

export function fetchItemById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const item = ITEMS.find((i) => i.id === Number(id));
      if (item) {
        resolve(item);
      } else {
        reject(new Error(`No listing found with id ${id}`));
      }
    }, NETWORK_DELAY_MS);
  });
}
