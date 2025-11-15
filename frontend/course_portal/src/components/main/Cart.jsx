import React, { useEffect, useState, useCallback } from "react";
import api from "../../axios";
import { useNavigate } from "react-router-dom";
import handleCheckout from "../../razorpay/checkout";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const access = localStorage.getItem("access");

  // Fetch cart
  const fetchCart = useCallback(async () => {
    if (!access) {
      setError("You need to log in to view your cart.");
      return;
    }

    try {
      const response = await api.get("cart/", {
        headers: { Authorization: `Bearer ${access}` },
      });
      setCart(response.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setError("You are not authenticated. Please log in.");
      } else {
        setError("Failed to fetch cart. Try again later.");
      }
    }
  }, [access]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Delete item
  const handleDelete = async (itemId) => {
    try {
      await api.delete(`cart/item/${itemId}/remove/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      await fetchCart(); // Refetch cart to sync with backend
    } catch (err) {
      console.log("Delete error:", err.response?.data);
    }
  };

  // Update quantity
  const updateQuantity = async (itemId, currentQty, action) => {
    let newQty = currentQty;
    if (action === "increase") newQty += 1;
    else if (action === "decrease") if (currentQty <= 1) return; else newQty -= 1;

    try {
      const response = await api.patch(
        `cart/item/${itemId}/update/`,
        { quantity: newQty },
        { headers: { Authorization: `Bearer ${access}` } }
      );

      setCart((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId ? { ...item, quantity: response.data.quantity } : item
        ),
      }));
    } catch (err) {
      console.log("Update quantity error:", err.response?.data);
    }
  };

  if (error) return <p className="p-10 text-red-600 font-semibold">{error}</p>;
  if (!cart) return <p className="p-10">Loading...</p>;

  const cartTotal = cart.items.reduce((sum, item) => sum + item.course_price * item.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate("/")}
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Courses
      </button>

      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cart.items.length === 0 ? (
        <p className="text-gray-600 text-lg">Your cart is empty.</p>
      ) : (
        cart.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between bg-white shadow-md rounded-xl p-4 mb-4">
            <img className="w-28 h-28 rounded-lg object-cover" src={item.course_image} alt={item.course_title} />

            <div>
              <h2 className="text-md w-40 font-semibold">{item.course_title}</h2>
              <p className="text-purple-700 font-bold">₹ {item.course_price}</p>
            </div>

            {/* Quantity */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => updateQuantity(item.id, item.quantity, "decrease")}
                className="px-3 py-1 bg-purple-200 rounded-lg font-bold hover:bg-purple-300"
              >
                –
              </button>
              <span className="text-lg font-semibold">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity, "increase")}
                className="px-3 py-1 bg-purple-200 rounded-lg font-bold hover:bg-purple-300"
              >
                +
              </button>
            </div>

            {/* Delete */}
            <button
              onClick={() => handleDelete(item.id)}
              className="text-red-600 bg-red-200 p-2 rounded font-semibold hover:underline"
            >
              Delete
            </button>
          </div>
        ))
      )}

      <div className="flex flex-col items-center gap-3 mt-4">
        <p className="text-lg font-semibold text-gray-700">Total: ₹{cartTotal}</p>
        <button
          onClick={() => handleCheckout(cart, navigate)}
          className="w-64 bg-purple-600 text-white py-3 rounded-xl font-semibold shadow-md hover:bg-purple-700 hover:shadow-lg active:scale-95 transition-all"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
