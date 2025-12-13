import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { FaStar, FaTrash, FaSearch, FaRegStar, FaQuoteLeft } from "react-icons/fa";
import { MdOutlineRateReview, MdCheckCircle, MdCancel, MdReport, MdAnalytics, MdStore, MdProductionQuantityLimits, MdTrendingUp } from "react-icons/md";
import { toast } from "react-toastify";
import axios from "axios";
import { CircularProgress, Pagination, Tabs, Tab, Box, Button, Chip, LinearProgress, Card, CardContent } from "@mui/material";
import { Admincontext } from "../../Components/context/admincontext";

function CustomerReviews() {
  const { atoken, backendurl } = useContext(Admincontext);
  const location = useLocation();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalReviews: 0, avgRating: 0, pendingCount: 0, reportedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tabValue, setTabValue] = useState(0);

  // New Data States
  const [productRatings, setProductRatings] = useState([]);
  const [vendorRatings, setVendorRatings] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);

  const statusMap = {
    0: 'All',
    1: 'Pending',
    2: 'Reported',
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) setTabValue(parseInt(tabParam));
  }, [location.search]);

  // Main Data Fetcher
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Product Ratings
      if (tabValue === 3) {
        const { data } = await axios.get(`${backendurl}/api/admin/reviews/analytics?type=products`, { headers: { Authorization: `Bearer ${atoken}` } });
        if (data.success) setProductRatings(data.data);
      }
      // 2. Vendor Ratings
      else if (tabValue === 4) {
        const { data } = await axios.get(`${backendurl}/api/admin/reviews/analytics?type=vendors`, { headers: { Authorization: `Bearer ${atoken}` } });
        if (data.success) setVendorRatings(data.data);
      }
      // 3. Analytics
      else if (tabValue === 5) {
        const { data } = await axios.get(`${backendurl}/api/admin/reviews/analytics?type=general`, { headers: { Authorization: `Bearer ${atoken}` } });
        if (data.success) setAnalyticsData(data.data);
      }
      // 4. Review Lists (All, Pending, Reported)
      else {
        const currentStatus = statusMap[tabValue] || 'All';
        const { data } = await axios.get(
          `${backendurl}/api/admin/reviews?page=${page}&limit=10&search=${searchTerm}&status=${currentStatus}`,
          { headers: { Authorization: `Bearer ${atoken}`, token: atoken } }
        );

        if (data.success) {
          setReviews(data.data.reviews);
          setStats(data.data.stats);
          setTotalPages(data.data.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error(error);
      // toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, searchTerm, tabValue, atoken]);

  // Actions
  const handleDelete = async (id) => {
    if (!window.confirm("Delete permanently?")) return;
    try {
      const { data } = await axios.delete(`${backendurl}/api/admin/delete-review/${id}`, { headers: { Authorization: `Bearer ${atoken}` } });
      if (data.success) {
        toast.success("Deleted");
        setReviews(reviews.filter((r) => r._id !== id));
      }
    } catch (error) { toast.error("Delete failed"); }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { data } = await axios.put(`${backendurl}/api/admin/review-status/${id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${atoken}` } });
      if (data.success) {
        toast.success(`Marked as ${newStatus}`);
        fetchData();
      }
    } catch (error) { toast.error("Update failed"); }
  };

  const renderStars = (rating) => (
    <div className="flex text-yellow-400 text-sm">{[...Array(5)].map((_, i) => <span key={i}>{i < rating ? <FaStar /> : <FaRegStar className="text-gray-300" />}</span>)}</div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 my-6 min-h-[80vh]">

      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><MdOutlineRateReview size={24} /></div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Reviews & Ratings</h2>
            {tabValue < 3 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Total: <b>{stats.totalReviews}</b></span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span>Pending: <b>{stats.pendingCount || 0}</b></span>
              </div>
            )}
          </div>
        </div>
        {tabValue < 3 && (
          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search reviews..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-gray-50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        )}
      </div>

      {/* TABS */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => { setTabValue(v); setPage(1); }} variant="scrollable" scrollButtons="auto">
          <Tab label="All Reviews" />
          <Tab label="Pending Reviews" icon={<MdReport size={18} className="text-orange-400" />} iconPosition="start" />
          <Tab label="Reported Reviews" icon={<MdCancel size={18} className="text-red-400" />} iconPosition="start" />
          <Tab label="Product Ratings" icon={<MdProductionQuantityLimits size={18} />} iconPosition="start" />
          <Tab label="Vendor Ratings" icon={<MdStore size={18} />} iconPosition="start" />
          <Tab label="Review Analytics" icon={<MdAnalytics size={18} />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* --- CONTENT AREA --- */}
      {loading ? (
        <div className="py-20 text-center"><CircularProgress style={{ color: '#f59e0b' }} /></div>
      ) : (
        <>
          {/* 1. REVIEW LISTS (Tabs 0, 1, 2) */}
          {tabValue < 3 && (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-4">Product Info</th>
                    <th className="px-6 py-4">Reviewer</th>
                    <th className="px-6 py-4">Rating & Review</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {reviews.length > 0 ? reviews.map((review) => (
                    <tr key={review._id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-6 py-4 align-top w-[25%]">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                            {review.productId?.images?.[0] ? (<img src={review.productId.images[0].url} alt="img" className="w-full h-full object-cover" />) : (<div className="flex items-center justify-center w-full h-full text-xs text-gray-400">N/A</div>)}
                          </div>
                          <div className="max-w-[150px]">
                            <p className="font-semibold text-gray-800 line-clamp-1" title={review.productId?.title}>{review.productId?.title || "Deleted"}</p>
                            <p className="text-xs text-gray-500 mt-1">Seller: {review.productId?.sellerId?.name || "Admin"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top w-[15%]"><p className="font-semibold text-gray-700">{review.userName}</p></td>
                      <td className="px-6 py-4 align-top w-[30%]">
                        <div className="mb-2">{renderStars(review.rating)}</div>
                        <p className="text-gray-600 text-sm italic line-clamp-2">{review.comment}</p>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <Chip label={review.status || 'Approved'} size="small" color={review.status === 'Pending' ? 'warning' : review.status === 'Reported' ? 'error' : 'success'} variant="outlined" />
                      </td>
                      <td className="px-6 py-4 align-top text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 align-top text-center flex gap-2 justify-center">
                        {review.status !== 'Approved' && <button onClick={() => updateStatus(review._id, 'Approved')} className="p-2 text-green-600 hover:bg-green-50 rounded-full"><MdCheckCircle size={18} /></button>}
                        {review.status !== 'Rejected' && <button onClick={() => updateStatus(review._id, 'Rejected')} className="p-2 text-orange-600 hover:bg-orange-50 rounded-full"><MdCancel size={18} /></button>}
                        <button onClick={() => handleDelete(review._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><FaTrash size={14} /></button>
                      </td>
                    </tr>
                  )) : (<tr><td colSpan="6" className="py-16 text-center text-gray-400">No reviews found.</td></tr>)}
                </tbody>
              </table>
              <div className="flex justify-center mt-6">
                <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} color="primary" shape="rounded" />
              </div>
            </div>
          )}

          {/* 2. PRODUCT RATINGS (Tab 3) */}
          {tabValue === 3 && (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Avg Rating</th>
                    <th className="px-6 py-4">Total Reviews</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {productRatings.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 flex gap-4 items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 overflow-hidden">
                          {item.image && <img src={item.image} className="w-full h-full object-cover" alt="" />}
                        </div>
                        <span className="font-semibold text-gray-800">{item.title}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-yellow-500 flex items-center gap-1">
                        {item.avgRating.toFixed(1)} <FaStar />
                      </td>
                      <td className="px-6 py-4">{item.count}</td>
                    </tr>
                  ))}
                  {productRatings.length === 0 && <tr><td colSpan="3" className="py-10 text-center text-gray-400">No data available.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. VENDOR RATINGS (Tab 4) */}
          {tabValue === 4 && (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-4">Vendor</th>
                    <th className="px-6 py-4">Avg Rating</th>
                    <th className="px-6 py-4">Total Reviews</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {vendorRatings.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-yellow-500 flex items-center gap-1">
                        {item.avgRating.toFixed(1)} <FaStar />
                      </td>
                      <td className="px-6 py-4">{item.count}</td>
                    </tr>
                  ))}
                  {vendorRatings.length === 0 && <tr><td colSpan="3" className="py-10 text-center text-gray-400">No data available.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. ANALYTICS (Tab 5) */}
          {tabValue === 5 && analyticsData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-sm border border-gray-100">
                  <CardContent className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><MdOutlineRateReview size={28} /></div>
                    <div>
                      <p className="text-sm text-gray-500">Total Reviews</p>
                      <h3 className="text-2xl font-bold">{analyticsData.totalReviews}</h3>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-sm border border-gray-100">
                  <CardContent className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-50 text-yellow-500 rounded-lg"><FaStar size={28} /></div>
                    <div>
                      <p className="text-sm text-gray-500">Average Rating</p>
                      <h3 className="text-2xl font-bold">{analyticsData.avgRating}</h3>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-sm border border-gray-100 max-w-2xl">
                <CardContent>
                  <h3 className="font-bold text-lg mb-6">Rating Distribution</h3>
                  <div className="space-y-4">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = analyticsData.distribution.find(d => d._id === star)?.count || 0;
                      const percentage = (count / (analyticsData.totalReviews || 1)) * 100;
                      return (
                        <div key={star} className="flex items-center gap-4">
                          <span className="w-4 font-bold text-gray-600">{star}</span>
                          <FaStar className="text-yellow-400" />
                          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                          </div>
                          <span className="w-10 text-sm text-gray-500 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CustomerReviews;