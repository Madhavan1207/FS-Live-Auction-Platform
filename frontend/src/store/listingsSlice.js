import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchItems, placeBidRequest, createItemRequest, mapItem } from "../api/mockApi.js";

// A bid can reach the store twice: once from the bidder's own HTTP response
// and once from the real-time socket event. Matching on the bid's _id keeps
// the history from showing it twice, whichever arrives first.
function addBidIfMissing(history = [], bid) {
  return history.some((b) => b._id === bid._id) ? history : [...history, bid];
}

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

// Experiment 6 connection: this used to be a plain synchronous reducer
// (see git history) that only updated the LOCAL Redux store — nothing was
// ever sent to a server, so a "placed" bid vanished on refresh and was
// invisible to anyone else. It's now a real async thunk that POSTs to the
// backend's auth-protected bid endpoint; the store is only updated once
// the backend confirms the bid was actually saved to MongoDB.
export const submitBid = createAsyncThunk(
  "listings/submitBid",
  async ({ itemId, amount, token }, { rejectWithValue }) => {
    try {
      return await placeBidRequest(itemId, amount, token);
    } catch (err) {
      // rejectWithValue lets the component read a clean error message via
      // dispatch(submitBid(...)).unwrap().catch(message => ...) instead of
      // a generic "Rejected" action with no useful detail.
      return rejectWithValue(err.message);
    }
  }
);

// Backs the new seller "Create Listing" page. Same pattern as submitBid:
// the store is only updated once the backend confirms the item was
// actually created (and returns it with a real MongoDB _id).
export const createListing = createAsyncThunk(
  "listings/create",
  async ({ itemData, token }, { rejectWithValue }) => {
    try {
      return await createItemRequest(itemData, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const listingsSlice = createSlice({
  name: "listings",
  initialState: {
    items: [],
    status: "idle", // "idle" | "loading" | "succeeded" | "failed"
    error: null,
  },
  reducers: {
    // Experiment 8: reducers driven by server-pushed events (see
    // hooks/useLiveUpdates.js). Same store, new source of changes.
    bidReceived(state, action) {
      const { bid, item } = action.payload;
      const updated = mapItem(item);
      state.items = state.items.map((i) =>
        i.id === updated.id
          ? { ...i, ...updated, bidHistory: addBidIfMissing(i.bidHistory, bid) }
          : i
      );
    },
    itemUpdated(state, action) {
      const updated = mapItem(action.payload);
      state.items = state.items.map((i) =>
        i.id === updated.id ? { ...i, ...updated, bidHistory: i.bidHistory ?? [] } : i
      );
    },
    itemCreatedRemote(state, action) {
      const created = mapItem(action.payload);
      if (state.items.some((i) => i.id === created.id)) return; // seller already has it
      state.items = [{ ...created, bidHistory: [] }, ...state.items];
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
      })
      .addCase(createListing.fulfilled, (state, action) => {
        // Prepend so it shows up first on Browse, same as a fresh
        // fetchItems() would (sorted by createdAt: -1 on the backend).
        state.items = [{ ...action.payload, bidHistory: [] }, ...state.items];
      })
      .addCase(submitBid.fulfilled, (state, action) => {
        // The backend already validated and saved the bid — just replace
        // this one item in the store with the fresh, authoritative
        // version it returned (updated currentBid/bidCount), and append
        // the new bid to that item's local history list.
        const { item: updatedItem, bid } = action.payload;
        state.items = state.items.map((item) =>
          item.id === updatedItem.id
            ? { ...updatedItem, bidHistory: addBidIfMissing(item.bidHistory, bid) }
            : item
        );
      });
  },
});

export const { bidReceived, itemUpdated, itemCreatedRemote } = listingsSlice.actions;
export default listingsSlice.reducer;
