import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ItemCard from "../components/ItemCard.jsx";
import useReveal from "../hooks/useReveal.js";
import useCountdown from "../hooks/useCountdown.js";
import { loadListings } from "../store/listingsSlice.js";

// Card wrapper: keeps the Experiment 1 scroll-reveal animation (useReveal)
// and layers on a live "time left" badge via the useCountdown custom hook,
// so each card ticks down independently.
function CatalogueCard({ item, index }) {
  const [ref, inView] = useReveal();
  const { label, isClosed } = useCountdown(item.closingAt);

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "in-view" : ""}`}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <ItemCard item={{ ...item, timeLeft: isClosed ? "Closed" : label }} />
    </div>
  );
}

export default function Browse() {
  // Experiment 2 kept the fetched listings in local useState, scoped to
  // this page only. Experiment 3 moves that same data into a Redux store
  // instead: `items` now lives in one place the whole app shares, so a bid
  // placed on ItemDetail shows up here too, without this component ever
  // being told about it directly.
  const dispatch = useDispatch();
  const items = useSelector((state) => state.listings.items);
  const status = useSelector((state) => state.listings.status);
  const error = useSelector((state) => state.listings.error);
  const isLoading = status === "loading" || status === "idle";

  useEffect(() => {
    // Only fetch if nobody has loaded the catalogue into the store yet —
    // e.g. if the user lands on ItemDetail first, this avoids a duplicate
    // fetch when they then visit Browse.
    if (status === "idle") {
      dispatch(loadListings());
    }
  }, [status, dispatch]);

  return (
    <section className="bg-parchment min-h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-14">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-wax text-xs font-mono tracking-[0.2em] uppercase mb-1">
              The Catalogue
            </p>
            <h2 className="font-display italic text-3xl sm:text-4xl text-ink">
              Open lots this week
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {["All", "Furniture", "Electronics", "Home Decor", "Sports"].map(
              (cat) => (
                <button
                  key={cat}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-full border border-ink/20 text-ink/70 hover:bg-felt hover:text-parchment hover:border-felt transition-colors"
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        {isLoading && (
          <p className="text-ink/50 font-mono text-sm">Loading listings…</p>
        )}

        {error && !isLoading && (
          <p className="text-wax font-mono text-sm">
            Couldn&apos;t load listings: {error}
          </p>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, i) => (
              <CatalogueCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
