import React, { useState, useEffect, useContext } from "react";
import { FaStar, FaTrash, FaSearch, FaRegStar, FaQuoteLeft } from "react-icons/fa";
import { MdOutlineRateReview } from "react-icons/md";
import { toast } from "react-toastify";
import axios from "axios";
import { CircularProgress, Pagination } from "@mui/material";
import { Admincontext } from "../../Components/context/admincontext";

function CustomerReviews() {
  const { atoken, backendurl } = useContext(Admincontext);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalReviews: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Reviews from Backend
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${backendurl}/api/admin/reviews?page=${page}&limit=10&search=${searchTerm}`,
        { headers: { Authorization: `Bearer ${atoken}`, token: atoken } }
      );

      if (data.success) {
        setReviews(data.data.reviews);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        toast.error("Failed to load reviews");
      }
    } catch (error) {
      console.error(error);
      // toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search to prevent too many API calls
    const delayDebounceFn = setTimeout(() => {
      fetchReviews();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [page, searchTerm, atoken]); // Reload when page or search changes

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review permanently?")) return;

    try {
      const { data } = await axios.delete(
        `${backendurl}/api/admin/delete-review/${id}`,
        { headers: { Authorization: `Bearer ${atoken}`, token: atoken } }
      );

      if (data.success) {
        toast.success("Review deleted successfully");
        setReviews(reviews.filter((r) => r._id !== id));
        setStats(prev => ({...prev, totalReviews: prev.totalReviews - 1}));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  // Helper to render stars
  const renderStars = (rating) => {
    return (
      <div className="flex text-yellow-400 text-sm">
        {[...Array(5)].map((_, i) => (
          <span key={i}>{i < rating ? <FaStar /> : <FaRegStar className="text-gray-300"/>}</span>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 my-6 min-h-[80vh]">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                <MdOutlineRateReview size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Customer Reviews</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Total: <b>{stats.totalReviews}</b></span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>Avg Rating: <b>{stats.avgRating} / 5</b></span>
                </div>
            </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search reviews, products..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-gray-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* --- Reviews Table --- */}
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-4">Product Info</th>
              <th className="px-6 py-4">Reviewer</th>
              <th className="px-6 py-4">Rating & Review</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
                <tr>
                    <td colSpan="5" className="py-20 text-center">
                        <CircularProgress style={{ color: '#f59e0b' }} />
                    </td>
                </tr>
            ) : reviews.length > 0 ? (
                reviews.map((review) => (
                <tr key={review._id} className="hover:bg-amber-50/30 transition-colors group">
                    
                    {/* Product Info */}
                    <td className="px-6 py-4 align-top w-[25%]">
                        <div className="flex gap-3">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                {review.productId?.images?.[0] ? (
                                    <img src={review.productId.images[0].url} alt="img" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">N/A</div>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 line-clamp-1" title={review.productId?.title}>
                                    {review.productId?.title || "Product Deleted"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Seller: <span className="text-indigo-600 font-medium">{review.productId?.sellerId?.name || "Admin"}</span>
                                </p>
                            </div>
                        </div>
                    </td>

                    {/* Reviewer */}
                    <td className="px-6 py-4 align-top w-[15%]">
                        <p className="font-semibold text-gray-700">{review.userName}</p>
                        <p className="text-xs text-gray-400">Verified Buyer</p>
                    </td>

                    {/* Content */}
                    <td className="px-6 py-4 align-top w-[40%]">
                        <div className="mb-2">{renderStars(review.rating)}</div>
                        {review.title && <p className="font-bold text-gray-800 text-xs mb-1">{review.title}</p>}
                        <div className="relative pl-3">
                            <FaQuoteLeft className="absolute left-0 top-0 text-gray-300 text-[10px]" />
                            <p className="text-gray-600 text-sm italic line-clamp-2 hover:line-clamp-none transition-all cursor-default">
                                {review.comment}
                            </p>
                        </div>
                        {/* Show Seller Response Badge if exists */}
                        {review.sellerResponse && (
                            <span className="inline-block mt-2 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                                Seller Responded
                            </span>
                        )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 align-top text-gray-500 whitespace-nowrap">
                        {new Date(review.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 align-top text-center">
                        <button 
                            onClick={() => handleDelete(review._id)}
                            className="w-8 h-8 rounded-full bg-white border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 flex items-center justify-center shadow-sm transition-all"
                            title="Delete Review"
                        >
                            <FaTrash size={14} />
                        </button>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="5" className="py-16 text-center text-gray-400">
                        No reviews found matching your criteria.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Pagination --- */}
      <div className="flex justify-center mt-6">
        <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(e, val) => setPage(val)} 
            color="primary"
            shape="rounded"
        />
      </div>
    </div>
  );
}

export default CustomerReviews;