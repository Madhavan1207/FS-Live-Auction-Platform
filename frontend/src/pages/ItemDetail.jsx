import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useCountdown from "../hooks/useCountdown.js";
import { useAuth } from "../context/AuthContext.jsx";
import { loadListings, placeBid } from "../store/listingsSlice.js";

// Bid box content depends on who's looking (via useContext) and whether
// the auction has closed (via useCountdown). The bid itself is now a real
// dispatch into the Redux store (Experiment 3) instead of only local
// component state — so as soon as it's placed, Browse's cards and this
// page both reflect the new highest bid, since they read the same store.
// Actually sending the bid to a server, and pushing it to OTHER users'
// browsers live, are Experiments 4/5 and 8 respectively — this experiment
// only centralizes the state within a single running app.
function BidBox({ item, isClosed }) {
  const { isAuthenticated, user } = useAuth();
  const dispatch = useDispatch();
  const [bidAmount, setBidAmount] = useState("");
  const [formError, setFormError] = useState(null);

  if (isClosed) {
    return (
      <p className="mt-4 text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded-md px-4 py-3">
        This auction has closed. No further bids can be placed.
      </p>
    );
  }

  if (!isAuthenticated) {
    return (
      <p className="mt-4 text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded-md px-4 py-3">
        <Link to="/login" className="text-auction-light font-medium hover:underline">
          Log in
        </Link>{" "}
        to place a bid on this item.
      </p>
    );
  }

  if (user.role === "seller") {
    return (
      <p className="mt-4 text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded-md px-4 py-3">
        You&apos;re signed in as a seller. Switch to a buyer account to bid.
      </p>
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    const amount = Number(bidAmount);

    if (!amount || amount <= item.currentBid) {
      setFormError(`Bid must be higher than $${item.currentBid}.`);
      return;
    }

    dispatch(placeBid({ itemId: item.id, amount, bidderName: user.name }));
    setFormError(null);
    setBidAmount("");
  }

  return (
    <>
      <form className="mt-4 flex gap-3" onSubmit={handleSubmit}>
        <input
          type="number"
          min={item.currentBid + 1}
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          placeholder={`Enter more than $${item.currentBid}`}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-auction-light"
        />
        <button
          type="submit"
          className="px-5 py-2 rounded-md bg-auction-accent text-auction font-semibold hover:bg-amber-400 transition-colors"
        >
          Place Bid
        </button>
      </form>
      {formError && <p className="text-xs text-wax mt-2">{formError}</p>}
      <p className="text-xs text-gray-400 mt-2">
        Bidding as {user.name}. This updates the shared Redux store instantly
        — try opening Browse in another tab. Real server-side validation
        arrives in Experiment 5; live push to other viewers' screens in
        Experiment 8.
      </p>
    </>
  );
}

// Small, reusable "who bid what, when" list — reads straight from the
// item's bidHistory array in the store.
function BidHistory({ bidHistory }) {
  if (!bidHistory || bidHistory.length === 0) {
    return <p className="text-xs text-gray-400 mt-4">No bids placed yet.</p>;
  }

  return (
    <div className="mt-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
        Recent Bids
      </p>
      <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
        {[...bidHistory].reverse().map((bid, i) => (
          <li
            key={i}
            className="flex justify-between text-sm text-gray-600 border-b border-gray-100 pb-1"
          >
            <span>{bid.bidderName}</span>
            <span className="font-medium text-gray-800">${bid.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ItemDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();

  // Experiment 2 fetched this one item directly by id from the mock API
  // into local state. Experiment 3 instead selects it out of the shared
  // Redux store — the same store Browse populates — and only triggers a
  // fetch if the store is still empty (e.g. a direct link straight to an
  // item, skipping Browse).
  const status = useSelector((state) => state.listings.status);
  const error = useSelector((state) => state.listings.error);
  const item = useSelector((state) =>
    state.listings.items.find((i) => i.id === id)
  );

  useEffect(() => {
    if (status === "idle") {
      dispatch(loadListings());
    }
  }, [status, dispatch]);

  const isLoading = status === "loading" || status === "idle";

  // Countdown always needs to be called (rules of hooks), so fall back to
  // "now" until the real closingAt has loaded.
  const { label: timeLeftLabel, isClosed } = useCountdown(
    item ? item.closingAt : Date.now()
  );

  if (isLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-gray-500 font-mono text-sm">
        Loading listing…
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-wax font-mono text-sm">
          {error || "Listing not found."}
        </p>
        <Link to="/browse" className="text-auction-light text-sm hover:underline mt-2 inline-block">
          ← Back to catalogue
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        </div>

        <div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
            {isClosed ? "Closed" : timeLeftLabel}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">{item.title}</h1>
          <p className="text-sm text-gray-500">
            {item.category} · Listing #{id} · Sold by {item.seller}
          </p>

          <p className="text-gray-600 mt-4 leading-relaxed">{item.description}</p>

          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs text-gray-400">Current Highest Bid</p>
                <p className="text-3xl font-bold text-auction">${item.currentBid}</p>
              </div>
              <p className="text-sm text-gray-400">{item.bidCount} bids so far</p>
            </div>

            <BidBox item={item} isClosed={isClosed} />
            <BidHistory bidHistory={item.bidHistory} />
          </div>
        </div>
      </div>
    </main>
  );
}
