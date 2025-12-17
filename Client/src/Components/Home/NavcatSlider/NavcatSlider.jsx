import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
// Import Swiper modules
import { Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import axios from "axios";

const NavCatSlider = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/getcategories`
      );

      // Robustly handle response structure (e.g., if the data is wrapped)
      const categoryArray = Array.isArray(response.data)
        ? response.data
        : response.data.categories || [];

      setCategories(categoryArray);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching categories", err);
      setError("Failed to load categories. Please try again later.");
      setCategories([]); // Ensure categories is empty on error
    } finally {
      setIsLoading(false);
    }
  };

  // ⭐ FIX: Smart URL Handler handles Array, String, Localhost, and Cloudinary
  const getCategoryImageUrl = (category) => {
    let imageUrl = "";

    // 1. Check for new schema (images array)
    if (category.images && category.images.length > 0) {
      imageUrl = category.images[0].url;
    }
    // 2. Check for old schema (image string)
    else if (category.image) {
      imageUrl = category.image;
    } else {
      return "/fallback-category.png"; // Return placeholder if no image
    }

    // 3. If it's a Cloudinary/External URL (starts with http), return as is
    if (imageUrl.startsWith("http") || imageUrl.startsWith("https")) {
      return imageUrl;
    }

    // 4. If it's a local file, prepend backend URL
    const base = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") || "";
    const cleanPath = imageUrl.replace(/^\/+/, ""); // Remove leading slash
    return `${base}/${cleanPath}`;
  };

  if (isLoading) {
    // Simple loading state
    return <div className="text-center py-10">Loading Categories...</div>;
  }

  if (error) {
    // Simple error state
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  if (categories.length === 0) {
    // Render nothing or a message if no categories are found
    return <div className="text-center py-10 text-gray-500">No categories available.</div>;
  }

  return (
    <div className="NavcatSlider bg-gray-100">
      <div className="container py-6 md:py-10 m-auto px-1">
        <Swiper
          slidesPerView={4}
          spaceBetween={10}
          modules={[Autoplay]}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            350: { slidesPerView: 5 },
            550: { slidesPerView: 6 },
            768: { slidesPerView: 7 },
            900: { slidesPerView: 8 },
            1200: { slidesPerView: 9 }, // Added an extra breakpoint for large screens
          }}
        >
          {categories.map((category, index) => (
            <SwiperSlide key={index}>
              <Link
                to="/productlist"
                // Pass category name to the product list page
                state={{ category: category.categoryname }}
              >
                <div className="text-center mt-2 cursor-pointer transition-transform hover:scale-105 duration-300">
                  <img
                    src={getCategoryImageUrl(category)} // ✅ Use smart helper
                    alt={category.categoryname}
                    // ✅ FIXED: Malformed CSS classes in the original snippet (w-18, h-18 etc are not standard Tailwind, using standard Tailwind values)
                    className="mx-auto w-16 h-16 sm:w-20 sm:h-20 md:w-26 md:h-26 rounded shadow-lg object-cover"
                    loading="lazy" // Good practice for images not immediately in view
                  />
                  <h3 className="mt-2 text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2">
                    {category.categoryname}
                  </h3>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default NavCatSlider;