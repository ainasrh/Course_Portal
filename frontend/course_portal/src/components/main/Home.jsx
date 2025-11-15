import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";
import { Link } from "react-router-dom";
export default function Home(){
    const [courses,setCourses] = useState([])
    const navigate = useNavigate();
    const [accessToken, setAccessToken] = useState(
        localStorage.getItem("access")
      );

    useEffect(()=>{
        const fetchCourses = async () => {
            try {
                const response = await api.get("courses/");
                setCourses(response.data);
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        };
        fetchCourses()
    },[])

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

    const handleCourseClick = (courseId) => {
        navigate(`/course/${courseId}`);
    }

    const handleLogout = () => {
        localStorage.removeItem("access")
        setAccessToken(null);
    }


    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            {/* navbar */}
            <div className="w-full bg-purple-300  py-4 px-6 shadow-md flex items-center justify-between rounded-md  ">
                <h1 className="text-2xl font-semibold">NavBar</h1>
                <div>

                <Link
                        to="/orders"
                        className="bg-white text-purple-700 mr-1 px-4 py-2 rounded-lg font-semibold hover:bg-purple-100 "
                    >
                        orders
                    </Link>
                    <Link
                        to="/cart"
                        className="bg-white text-purple-700 mx-4 px-4 py-2 rounded-lg font-semibold hover:bg-purple-100 "
                    >
                        Cart
                    </Link>

                {accessToken ? (
                    <button
                    onClick={handleLogout}
                    className="bg-white text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-100 "
                    >
                        Logout
                    </button>
                    ) : (
                        <Link
                        to="/login"
                        className="bg-white text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-100"
                        >
                        Login
                      </Link>
                    )}
                   
                    </div>
                    
                
                
            </div>

            <div className="max-w-7xl mx-auto my-10" >
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    Available Courses
                </h1>
                
                {courses.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No courses available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                onClick={() => handleCourseClick(course.id)}
                                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 flex flex-col"
                            >
                                {course.image ? (
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-48 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                        <span className="text-white text-4xl font-bold">
                                            {course.title.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                
                                <div className="p-6 flex-grow flex flex-col">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                        {course.title}
                                    </h2>
                                    <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
                                        {course.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-2xl font-bold text-blue-600">
                                            ${course.price}
                                        </span>
                                        <button
                                            onClick={(e) => handleAddToCart(e, course.id)}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}