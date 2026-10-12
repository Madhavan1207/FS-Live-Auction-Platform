import { test } from "node:test";
import assert from "node:assert/strict";
import reducer, { bidReceived, itemUpdated, itemCreatedRemote } from "./listingsSlice.js";

// Runs in CI on every push (Experiment 9). Tests the Redux reducers that
// handle live events: no browser or server is needed, because a reducer is
// just a function from (state, action) to the next state.

const closingIso = () => new Date(Date.now() + 3600 * 1000).toISOString();

function startState() {
  return {
    items: [
      { id: "a1", title: "Chair", currentBid: 100, bidCount: 0, closingAt: Date.now() + 3600 * 1000, bidHistory: [] },
    ],
    status: "succeeded",
    error: null,
  };
}

const bid = { _id: "b1", amount: 150, bidderName: "Bob" };
const serverItem = { _id: "a1", title: "Chair", currentBid: 150, bidCount: 1, closingAt: closingIso() };

test("bidReceived updates the price and appends the bid to the history", () => {
  const state = reducer(startState(), bidReceived({ bid, item: serverItem }));
  assert.equal(state.items[0].currentBid, 150);
  assert.equal(state.items[0].bidHistory.length, 1);
});

test("the same bid arriving twice is not duplicated", () => {
  let state = reducer(startState(), bidReceived({ bid, item: serverItem }));
  state = reducer(state, bidReceived({ bid, item: serverItem }));
  assert.equal(state.items[0].bidHistory.length, 1);
});

test("closingAt is converted to a number so the countdown hook works", () => {
  const state = reducer(startState(), itemUpdated(serverItem));
  assert.equal(typeof state.items[0].closingAt, "number");
});

test("itemUpdated changes the price but keeps the bid history", () => {
  let state = reducer(startState(), bidReceived({ bid, item: serverItem }));
  state = reducer(state, itemUpdated({ ...serverItem, currentBid: 175, bidCount: 2 }));
  assert.equal(state.items[0].currentBid, 175);
  assert.equal(state.items[0].bidHistory.length, 1);
});

test("itemCreatedRemote adds a new listing once and ignores a duplicate", () => {
  const created = { _id: "z9", title: "New", currentBid: 5, bidCount: 0, closingAt: closingIso() };
  let state = reducer(startState(), itemCreatedRemote(created));
  state = reducer(state, itemCreatedRemote(created));
  assert.equal(state.items.length, 2);
  assert.equal(state.items[0].id, "z9");
});