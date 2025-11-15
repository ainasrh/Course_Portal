import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../axios";

export default function CourseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true)
    const access = localStorage.getItem("access")

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const response = await api.get(`courses/${id}/`);
                setCourse(response.data);
            } catch (error) {
                console.error("Error fetching course details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseDetails();
    }, [id]);

    const handleAddToCart = async (e, courseId) => {
        e.stopPropagation();
      
        const accessToken = localStorage.getItem("access");
      
        if (!accessToken) {
          window.alert("You need to log in first to add items to the cart.");
          return;
        }
      
        try {
          const response = await api.post(
            "cart/add/",
            { course: courseId },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
      
          console.log("Added to cart:", response.data);
          window.alert("Item added to cart successfully!");
        } catch (err) {
          console.log("Add to cart error:", err.response?.data);
          window.alert("Something went wrong while adding to cart.");
        }
      };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading course details...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
                    <button
                        onClick={() => navigate("/")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate("/")}
                    className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Courses
                </button>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {course.image ? (
                        <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-96 object-cover"
                        />
                    ) : (
                        <div className="w-full h-96 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-8xl font-bold">
                                {course.title.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}

                    <div className="p-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {course.title}
                        </h1>
                        
                        <div className="mb-6">
                            <span className="text-3xl font-bold text-blue-600">
                                ${course.price}
                            </span>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                Course Description
                            </h2>
                            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                                {course.description}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={(e)=>handleAddToCart(e,course.id)}
                                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out text-lg font-semibold"
                            >
                                Add to Cart
                            </button>
                            <button
                                onClick={() => navigate("/")}
                                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-150 ease-in-out text-lg font-semibold"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

