import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../slices/productsSlice";
import { fetchCart } from "../slices/cartSlice";
import { apiUrl } from "../config/api";

const ProductList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, status, error, page, totalPages, totalItems, limit } = useSelector((state) => state.products);
  const { items: cartItems } = useSelector((state) => state.cart);

  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const loadMoreRef = useRef(null);
  const requestingRef = useRef(false);

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [draftCategories, setDraftCategories] = useState([]);
  const [appliedCategories, setAppliedCategories] = useState([]);
  const [minPriceText, setMinPriceText] = useState("");
  const [maxPriceText, setMaxPriceText] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const categoryParam = useMemo(() => {
    if (!appliedCategories.length) return "";
    return appliedCategories.join(",");
  }, [appliedCategories]);

  const sortParams = useMemo(() => {
    switch (sortKey) {
      case "priceAsc":
        return { sortBy: "price", sortOrder: "asc" };
      case "priceDesc":
        return { sortBy: "price", sortOrder: "desc" };
      case "nameAsc":
        return { sortBy: "name", sortOrder: "asc" };
      case "nameDesc":
        return { sortBy: "name", sortOrder: "desc" };
      case "newest":
      default:
        return { sortBy: "createdAt", sortOrder: "desc" };
    }
  }, [sortKey]);

  const token = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    // Load categories for multi-select dropdown
    const load = async () => {
      try {
        const res = await fetch(apiUrl("/market/categories"));
        const data = await res.json();
        setCategoryOptions(Array.isArray(data?.items) ? data.items : []);
      } catch {
        setCategoryOptions([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    // Fetch cart only if logged in (don’t refetch on every filter change)
    if (token) {
      dispatch(fetchCart(token));
    }
  }, [dispatch, token]);

  /* ===============================
     ✅ Products Fetch (NO LOOP)
  =============================== */
  useEffect(() => {
    // Fetch products (backend pagination/search/sort)
    dispatch(
      fetchProducts({
        page: currentPage,
        limit: 12,
        search,
        category: categoryParam,
        minPrice,
        maxPrice,
        append: currentPage > 1,
        ...sortParams,
      })
    );
  }, [dispatch, currentPage, search, categoryParam, minPrice, maxPrice, sortParams]);

  useEffect(() => {
    // Keep local currentPage in sync if redux updates from elsewhere
    if (page && page !== currentPage) {
      setCurrentPage(page);
    }
  }, [page, currentPage]);

  useEffect(() => {
    // Allow next "load more" once the fetch completes
    if (status !== "loading") {
      requestingRef.current = false;
    }
  }, [status]);

  useEffect(() => {
    // Infinite scroll: when sentinel is visible, request next page
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (status === "loading") return;
        if (requestingRef.current) return;
        if (currentPage >= totalPages) return;

        requestingRef.current = true;
        setCurrentPage((p) => p + 1);
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [status, currentPage, totalPages]);

  /* ===============================
     🚫 BLOCK SELLER VIEW
  =============================== */
  if (user && user.role === "seller") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">
            Sellers cannot view all products.
          </h2>
          <p className="text-gray-600">
            Please go to your dashboard to manage your products.
          </p>
        </div>
      </div>
    );
  }

  /* ===============================
     🛒 CART COUNT
  =============================== */
  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">All Products</h2>
          <button onClick={() => navigate('/home')} className="text-blue-600 hover:text-blue-800 mb-2">← Back to Home</button>

          {token && (
            <button
              onClick={() => navigate("/cart")}
              className="relative bg-blue-600 text-white px-6 py-3 rounded-lg 
                         hover:bg-blue-700 transition shadow-lg"
            >
              Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white 
                                 text-xs font-bold rounded-full h-6 w-6 
                                 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Search + Sort */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <form
              className="flex flex-1 gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setCurrentPage(1);
                setSearch(searchText.trim());
              }}
            >
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search (name/description/category)"
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort:</span>
              <select
                value={sortKey}
                onChange={(e) => {
                  setSortKey(e.target.value);
                  setCurrentPage(1);
                }}
                className="border rounded-lg px-3 py-2 bg-white"
              >
                <option value="newest">Newest</option>
                <option value="priceAsc">Price: Low → High</option>
                <option value="priceDesc">Price: High → Low</option>
                <option value="nameAsc">Name: A → Z</option>
                <option value="nameDesc">Name: Z → A</option>
              </select>
            </div>
          </div>

          {/* Filters */}
          <form
            className="grid grid-cols-1 md:grid-cols-4 gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              setCurrentPage(1);
              setAppliedCategories(draftCategories);
              setCategoryOpen(false);

              const min = minPriceText.trim();
              const max = maxPriceText.trim();
              setMinPrice(min === "" ? "" : Number(min));
              setMaxPrice(max === "" ? "" : Number(max));
            }}
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoryOpen((v) => !v)}
                className="w-full border rounded-lg px-3 py-2 bg-white text-left"
              >
                {appliedCategories.length
                  ? `Categories (${appliedCategories.length})`
                  : "Category (All)"}
              </button>

              {categoryOpen && (
                <div className="absolute z-20 mt-2 w-full bg-white border rounded-lg shadow p-3 max-h-56 overflow-auto">
                  {categoryOptions.length === 0 ? (
                    <div className="text-sm text-gray-600">No categories found</div>
                  ) : (
                    <div className="space-y-2">
                      {categoryOptions.map((c) => {
                        const checked = draftCategories.includes(c);
                        return (
                          <label key={c} className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setDraftCategories((prev) =>
                                  prev.includes(c)
                                    ? prev.filter((x) => x !== c)
                                    : [...prev, c]
                                );
                              }}
                            />
                            <span>{c}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDraftCategories([])}
                      className="px-3 py-1.5 bg-white border rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCategories(draftCategories);
                        setCurrentPage(1);
                        setCategoryOpen(false);
                      }}
                      className="flex-1 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition"
                    >
                      Apply Categories
                    </button>
                  </div>
                </div>
              )}
            </div>
            <input
              value={minPriceText}
              onChange={(e) => setMinPriceText(e.target.value)}
              placeholder="Min price"
              type="number"
              min="0"
              className="border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            />
            <input
              value={maxPriceText}
              onChange={(e) => setMaxPriceText(e.target.value)}
              placeholder="Max price"
              type="number"
              min="0"
              className="border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-5 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black transition"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchText("");
                  setSearch("");
                  setSortKey("newest");
                  setDraftCategories([]);
                  setAppliedCategories([]);
                  setCategoryOpen(false);
                  setMinPriceText("");
                  setMaxPriceText("");
                  setMinPrice("");
                  setMaxPrice("");
                  setCurrentPage(1);
                }}
                className="px-5 py-2 bg-white border rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Status (reserve space; show only for initial load) */}
        <div className="min-h-[28px] mb-3 text-center">
          {status === "failed" ? (
            <div className="text-red-500">{error}</div>
          ) : status === "loading" && currentPage === 1 ? (
            <div className="text-gray-700">Loading...</div>
          ) : null}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {items.map((product) => (
            <div
              key={product._id}
              onClick={() => navigate(`/product/${product._id}`)}
              className="bg-white rounded-xl shadow-md overflow-hidden 
                         cursor-pointer hover:shadow-xl hover:scale-105 
                         transition duration-300"
            >
              <img
                src={
                  product.images && product.images[0]
                    ? product.images[0]
                    : "/placeholder.png"
                }
                alt={product.name}
                className="h-56 w-full object-cover"
              />

              <div className="p-4">
                <h3 className="text-lg font-semibold text-center text-gray-800">
                  {product.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Infinite scroll footer */}
        <div className="mt-10 flex flex-col items-center justify-center gap-2">
          <div className="text-xs text-gray-600">
            Showing {items.length} of {totalItems} (limit {limit})
          </div>
          {status === "loading" && currentPage > 1 && (
            <div className="text-sm text-gray-700 min-h-[24px]">Loading more...</div>
          )}
          {status !== "loading" && currentPage >= totalPages && totalPages > 1 && (
            <div className="text-sm text-gray-600 min-h-[24px]">You reached the end</div>
          )}

          {/* Sentinel: when it enters view, we load the next page */}
          <div ref={loadMoreRef} className="h-1 w-full" />
        </div>

      </div>
    </div>
  );
};

export default ProductList;