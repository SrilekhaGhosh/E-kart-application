// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useParams, useNavigate } from "react-router-dom";
// import { fetchProductById } from "../slices/productsSlice";
// import { addToCart } from "../slices/cartSlice";
// import toast from "react-hot-toast";

// const ProductDetails = () => {
//   const { id } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { selectedProduct, status, error } = useSelector(
//     (state) => state.products
//   );

//   const token = localStorage.getItem("accessToken");

//   useEffect(() => {
//     if (id) {
//       dispatch(fetchProductById(id));
//     }
//   }, [dispatch, id]);

//   // ✅ YOUR ORIGINAL SIMPLE LOGIC
//   const handleAddToCart = async () => {
//     if (!token) {
//       toast.error("Please login to add to cart");
//       return;
//     }

//     try {
//       await dispatch(
//         addToCart({
//           productId: selectedProduct._id,
//           quantity: 1, // always 1 (no quantity selector)
//           token,
//         })
//       ).unwrap();

//       toast.success("Added to cart");
//     } catch (error) {
//       toast.error("Failed to add to cart");
//     }
//   };

//   if (status === "loading") {
//     return <div className="text-center mt-10">Loading...</div>;
//   }

//   if (status === "failed") {
//     return <div className="text-center mt-10 text-red-500">{error}</div>;
//   }

//   if (!selectedProduct) {
//     return <div className="text-center mt-10">Product not found</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 py-10">
//       <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8">

//         {/* Back Button */}
//         <button
//           onClick={() => navigate("/products")}
//           className="mb-6 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
//         >
//           ← Back
//         </button>

//         <div className="grid md:grid-cols-2 gap-10">
          
//           {/* Image */}
//           <img
//             src={
//               selectedProduct.images && selectedProduct.images[0]
//                 ? selectedProduct.images[0]
//                 : "/placeholder.png"
//             }
//             alt={selectedProduct.name}
//             className="w-full h-96 object-cover rounded-xl"
//           />

//           {/* Details */}
//           <div>
//             <h2 className="text-3xl font-bold mb-4">
//               {selectedProduct.name}
//             </h2>

//             <p className="text-gray-600 mb-6">
//               {selectedProduct.description}
//             </p>

//             <p className="text-2xl font-semibold mb-4">
//               ₹ {selectedProduct.price}
//             </p>

//             {/* ✅ STOCK ADDED */}
//             {selectedProduct.stock > 0 ? (
//               <p className="text-green-600 font-medium text-lg mb-6">
//                 In Stock: {selectedProduct.stock} available
//               </p>
//             ) : (
//               <p className="text-red-600 font-bold text-lg mb-6">
//                 Out of Stock
//               </p>
//             )}

//             {/* ✅ ADD TO CART (WORKING LIKE BEFORE) */}
//             <button
//               onClick={handleAddToCart}
//               disabled={selectedProduct.stock === 0}
//               className={`px-6 py-3 rounded-lg text-white font-medium transition ${
//                 selectedProduct.stock === 0
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-blue-600 hover:bg-blue-700"
//               }`}
//             >
//               {selectedProduct.stock === 0
//                 ? "Out of Stock"
//                 : "Add To Cart"}
//             </button>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductDetails;



import React, { useEffect } from "react";
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

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  // ✅ CHECK IF PRODUCT ALREADY IN CART
  const isInCart = cartItems.some(
    (item) => item.productId?._id === id
  );

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
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8">

        <button
          onClick={() => navigate("/products")}
          className="mb-6 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          ← Back
        </button>

        <div className="grid md:grid-cols-2 gap-10">
          
          <img
            src={
              selectedProduct.images && selectedProduct.images[0]
                ? selectedProduct.images[0]
                : "/placeholder.png"
            }
            alt={selectedProduct.name}
            className="w-full h-96 object-cover rounded-xl"
          />

          <div>
            <h2 className="text-3xl font-bold mb-4">
              {selectedProduct.name}
            </h2>

            <p className="text-gray-600 mb-6">
              {selectedProduct.description}
            </p>

            <p className="text-2xl font-semibold mb-4">
              ₹ {selectedProduct.price}
            </p>

            {/* STOCK */}
            {selectedProduct.stock > 0 ? (
              <p className="text-green-600 font-medium text-lg mb-6">
                In Stock: {selectedProduct.stock} available
              </p>
            ) : (
              <p className="text-red-600 font-bold text-lg mb-6">
                Out of Stock
              </p>
            )}

            {/* ✅ CONDITIONAL BUTTON */}
            {selectedProduct.stock > 0 && (
              <>
                {isInCart ? (
                  <button
                    onClick={() => navigate("/cart")}
                    className="px-6 py-3 rounded-lg text-white font-medium bg-green-600 hover:bg-green-700 transition"
                  >
                    Go To Cart
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="px-6 py-3 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 transition"
                  >
                    Add To Cart
                  </button>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;