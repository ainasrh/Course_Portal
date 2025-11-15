import React, { useEffect, useState } from "react";
import api from "../../axios";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(""); // Add error state
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const access = localStorage.getItem("access");

    if (!access) {
      setError("You need to log in to view your orders.");
      return;
    }

    try {
      const res = await api.get("orders/", {
        headers: { Authorization: `Bearer ${access}` },
      });

      const allItems = res.data.flatMap((order) => order.items);
      setItems(allItems);
    } catch (err) {
      console.error("Failed to load orders", err);
      if (err.response && err.response.status === 401) {
        setError("You are not authenticated. Please log in.");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-10 px-4">
        <p className="text-red-600 font-semibold text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="mb-6 text-purple-700 hover:text-purple-900 font-medium flex items-center"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Courses
      </button>

      {/* Heading */}
      <h1 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Your Orders
      </h1>

      {items.length === 0 ? (
        <p className="text-gray-600 text-lg">No items ordered yet.</p>
      ) : (
        <div className="space-y-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-5 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* IMAGE */}
              <img
                src={item.course_image}
                alt={item.course_title}
                className="w-28 h-28 rounded-xl object-cover shadow"
              />

              {/* DETAILS */}
              <div className="flex flex-col flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {item.course_title}
                </h2>

                <p className="text-gray-700 mt-1 text-lg font-medium">
                  ₹{item.price}{" "}
                  <span className="text-sm text-gray-500 font-normal">
                    × {item.quantity}
                  </span>
                </p>

                <span className="mt-2 inline-block text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full w-fit font-medium">
                  Will arrive within a week
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
