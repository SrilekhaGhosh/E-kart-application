import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../slices/productsSlice";
import { addToCart } from "../slices/cartSlice";
import toast from "react-hot-toast";

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedProduct, status, error } = useSelector(
    (state) => state.products
  );

  const { items: cartItems } = useSelector((state) => state.cart);

  const token = localStorage.getItem("accessToken");

  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    setActiveIndex(0);
    setViewerOpen(false);
    setViewerIndex(0);
  }, [id]);

  const images = useMemo(() => {
    const list = Array.isArray(selectedProduct?.images)
      ? selectedProduct.images.filter(Boolean)
      : [];
    return list.length ? list : ["/placeholder.png"];
  }, [selectedProduct]);

  useEffect(() => {
    if (!viewerOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setViewerOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewerOpen]);

  // ✅ CHECK IF PRODUCT ALREADY IN CART
  const isInCart = cartItems.some(
    (item) => item.productId?._id === id
  );

  const inStock = Number(selectedProduct?.stock || 0) > 0;
  const priceValue = Number(selectedProduct?.price || 0);

  const openViewer = (idx) => {
    setViewerIndex(idx);
    setViewerOpen(true);
  };

  const handleAddToCart = async () => {
    if (!token) {
      toast.error("Please login to add to cart");
      return;
    }

    try {
      await dispatch(
        addToCart({
          productId: selectedProduct._id,
          quantity: 1,
          token,
        })
      ).unwrap();

      toast.success("Added to cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  if (status === "loading") {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (status === "failed") {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!selectedProduct) {
    return <div className="text-center mt-10">Product not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-6 md:p-8">

        <button
          onClick={() => navigate("/products")}
          className="mb-6 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div className="flex gap-4">
            <div className="hidden sm:flex flex-col gap-3 w-20">
              {images.map((src, idx) => (
                <button
                  key={`${src}-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`border rounded-lg overflow-hidden bg-white ${
                    idx === activeIndex ? "border-blue-600" : "border-gray-200"
                  }`}
                >
                  <img src={src} alt="thumb" className="h-16 w-20 object-cover" />
                </button>
              ))}
            </div>

            <div className="flex-1">
              <button
                type="button"
                onClick={() => openViewer(activeIndex)}
                className="w-full border border-gray-200 rounded-2xl overflow-hidden bg-white"
              >
                <img
                  src={images[activeIndex]}
                  alt={selectedProduct.name}
                  className="w-full h-80 md:h-[420px] object-contain bg-white"
                />
              </button>

              <div className="sm:hidden mt-3 flex gap-2 overflow-auto">
                {images.map((src, idx) => (
                  <button
                    key={`${src}-m-${idx}`}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`border rounded-lg overflow-hidden bg-white shrink-0 ${
                      idx === activeIndex ? "border-blue-600" : "border-gray-200"
                    }`}
                  >
                    <img src={src} alt="thumb" className="h-14 w-14 object-cover" />
                  </button>
                ))}
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Click image to view ({images.length} photos)
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
              {selectedProduct.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">
                Category: {selectedProduct.category}
              </span>
              {inStock ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-semibold">
                  In Stock ({selectedProduct.stock})
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm font-semibold">
                  Out of Stock
                </span>
              )}
            </div>

            <div className="mt-4">
              <div className="text-3xl font-extrabold text-gray-900">
                ₹{Number.isFinite(priceValue) ? priceValue.toFixed(0) : selectedProduct.price}
              </div>
              <div className="text-xs text-gray-500 mt-1">Inclusive of all taxes</div>
            </div>

            <div className="mt-6">
              <div className="text-lg font-bold text-gray-900 mb-2">Description</div>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedProduct.description}
              </div>
            </div>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`px-6 py-3 rounded-xl text-white font-semibold transition ${
                  !inStock
                    ? "bg-gray-400 cursor-not-allowed"
                    : isInCart
                      ? "bg-gray-900 hover:bg-black"
                      : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {!inStock ? "Out of Stock" : isInCart ? "Add Another" : "Add To Cart"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="px-6 py-3 rounded-xl bg-white border border-gray-200 font-semibold text-gray-900 hover:bg-gray-50 transition"
              >
                Go To Cart
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <div className="text-xs text-gray-500">Product ID</div>
                <div className="text-sm font-semibold text-gray-800 break-all">{selectedProduct._id}</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <div className="text-xs text-gray-500">Photos</div>
                <div className="text-sm font-semibold text-gray-800">{images.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {viewerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setViewerOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="text-sm font-semibold text-gray-800 truncate">{selectedProduct.name}</div>
              <button
                type="button"
                onClick={() => setViewerOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold"
                aria-label="Close"
              >
                X
              </button>
            </div>

            <div className="p-4">
              <div className="w-full h-[50vh] md:h-[60vh] bg-white flex items-center justify-center border rounded-xl">
                <img
                  src={images[viewerIndex]}
                  alt="preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {images.map((src, idx) => (
                  <button
                    key={`${src}-v-${idx}`}
                    type="button"
                    onClick={() => setViewerIndex(idx)}
                    className={`border rounded-lg overflow-hidden bg-white ${
                      idx === viewerIndex ? "border-blue-600" : "border-gray-200"
                    }`}
                  >
                    <img src={src} alt="thumb" className="h-14 w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;