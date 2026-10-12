import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAuth } from "../context/AuthContext.jsx";
import { createListing } from "../store/listingsSlice.js";

// This is the missing piece that made the Seller role real. Experiments
// 4-6 built the backend and its role protection (POST /api/items is
// seller/admin only), but nothing in the UI ever called it — a seller
// could log in and be *labeled* seller, but had no way to actually list
// anything. This page closes that gap.
//
// As with BidBox, the role check below is for a good user experience
// (don't show a form to someone who can't use it) — the real enforcement
// is the backend's `protect` + `authorize("seller", "admin")` middleware,
// which would reject this request regardless of what this page shows.
export default function CreateListing() {
  const { isAuthenticated, user, token } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "General",
    image: "",
    startingPrice: "",
    closingAt: "",
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 bg-gray-100 border border-gray-200 rounded-md px-4 py-3">
          <Link to="/login" className="text-auction-light font-medium hover:underline">
            Log in
          </Link>{" "}
          as a seller to list an item.
        </p>
      </main>
    );
  }

  if (user.role !== "seller" && user.role !== "admin") {
    return (
      <main className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 bg-gray-100 border border-gray-200 rounded-md px-4 py-3">
          You&apos;re signed in as a {user.role}. Only seller accounts can list items.
        </p>
      </main>
    );
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const itemData = {
        title: form.title,
        description: form.description,
        category: form.category,
        image: form.image,
        startingPrice: Number(form.startingPrice),
        // <input type="datetime-local"> gives a local-time string with no
        // timezone — new Date(...).toISOString() converts it to the UTC
        // ISO format the backend's Joi schema (Joi.date()) expects.
        closingAt: new Date(form.closingAt).toISOString(),
      };

      const created = await dispatch(createListing({ itemData, token })).unwrap();
      navigate(`/item/${created.id}`);
    } catch (err) {
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Sensible minimum for the closing-time picker: a few minutes from now,
  // since the backend rejects a closingAt that isn't in the future.
  const minClosingAt = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  return (
    <main className="max-w-lg mx-auto px-4 py-16">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900">List a New Item</h1>
        <p className="text-sm text-gray-500 mt-1">
          Listing as {user.name} (seller).
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              name="title"
              required
              minLength={3}
              value={form.title}
              onChange={handleChange}
              placeholder="Vintage Leather Armchair"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-auction-light"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              required
              minLength={10}
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="Condition, dimensions, pickup details…"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-auction-light"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-auction-light"
              >
                <option>General</option>
                <option>Furniture</option>
                <option>Electronics</option>
                <option>Home Decor</option>
                <option>Sports</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Starting Price ($)
              </label>
              <input
                name="startingPrice"
                type="number"
                min={1}
                required
                value={form.startingPrice}
                onChange={handleChange}
                placeholder="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-auction-light"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              name="image"
              type="url"
              value={form.image}
              onChange={handleChange}
              placeholder="https://…"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-auction-light"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auction Closes At
            </label>
            <input
              name="closingAt"
              type="datetime-local"
              required
              min={minClosingAt}
              value={form.closingAt}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-auction-light"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-md bg-auction text-white font-semibold hover:bg-blue-900 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? "Listing…" : "List Item"}
          </button>
        </form>
      </div>
    </main>
  );
}
