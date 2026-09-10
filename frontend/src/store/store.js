import { configureStore } from "@reduxjs/toolkit";
import listingsReducer from "./listingsSlice.js";

export const store = configureStore({
  reducer: {
    listings: listingsReducer,
  },
});