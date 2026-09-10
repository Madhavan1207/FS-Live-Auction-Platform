import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchItems } from "../api/mockApi.js";


// This slice is the single source of truth for every listing and its bid
// history — replacing the per-page useState in Browse/ItemDetail from
// Experiment 2. Because both pages now read from the same store, a bid
// placed on the Item Detail page is instantly visible on the Browse page's
// cards too, with no props passed between them and no re-fetch needed.

export const loadListings = createAsyncThunk("listings/load", async () => {
  // Same mock API from Experiment 2 — this thunk is the only place that
  // calls it, so Experiment 4 only has to change fetchItems() itself.
  const items = await fetchItems();
  return items;
});

const listingsSlice = createSlice({
  name: "listings",
  initialState: {
    items: [],
    status: "idle", // "idle" | "loading" | "succeeded" | "failed"
    error: null,
  },
  reducers: {
    // Centralized bid logic: validates against the CURRENT store value
    // (not whatever the component last rendered), then updates the item's
    // highest bid, bid count, and appends to that item's bid history.
    placeBid: (state, action) => {
      const { itemId, amount, bidderName } = action.payload;
      const item = state.items.find((i) => i.id === itemId);
      if (!item) return;
      if (amount <= item.currentBid) return; // stale/invalid bid, ignore

      item.currentBid = amount;
      item.bidCount += 1;
      item.bidHistory.push({
        amount,
        bidderName,
        timestamp: Date.now(),
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadListings.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadListings.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Seed an empty bid history array per item the first time they load.
        state.items = action.payload.map((item) => ({
          ...item,
          bidHistory: item.bidHistory ?? [],
        }));
      })
      .addCase(loadListings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { placeBid } = listingsSlice.actions;
export default listingsSlice.reducer;
