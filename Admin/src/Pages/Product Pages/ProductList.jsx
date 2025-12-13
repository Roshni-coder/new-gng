import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Tooltip from "@mui/material/Tooltip";
import { LuTrash2 } from "react-icons/lu";
import { IconButton } from "@mui/material";
import { MyContext } from "../../App.jsx";
import { FiPlus } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import SearchBox from "../../Components/SearchBox/SearchBox.jsx";
import Progress from "../../Components/Progress/Progress.jsx";

// Accept 'type' prop from the router
function ProductList({ type }) {
  const { setIsOpenAddProductPanel } = useContext(MyContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // --- 1. Dynamic Page Title ---
  const pageTitles = {
    'all': 'All Products',
    'pending': 'Pending Approvals',
    'featured': 'Featured Products',
    'out-of-stock': 'Out of Stock Inventory' // ✅ Title for this page
  };

  // --- 2. Fetch Data when 'type' changes ---
  useEffect(() => {
    fetchProducts();
  }, [type]); // ✅ Re-run when type changes

  // --- Search Logic ---
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(products);
    } else {
      const lower = searchTerm.toLowerCase();
      const filtered = products.filter((product) =>
        product.title.toLowerCase().includes(lower) ||
        (product.sellerId?.name?.toLowerCase().includes(lower) || false)
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Fetch Categories/Subcategories for ID lookup
  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // ✅ Pass type to backend
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/products?type=${type || 'all'}`);
      if (response.data.success) {
        setProducts(response.data.products);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getcategories`);
      setCategories(response.data);
    } catch (error) { console.error(error); }
  };
  const fetchSubcategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getsubcategories`);
      setSubcategories(response.data);
    } catch (error) { console.error(error); }
  };

  const getCategoryNameById = (id) => {
    const category = categories.find((cat) => cat._id === id);
    return category ? category.categoryname : "-";
  };
  const getSubCategoryNameById = (id) => {
    const sub = subcategories.find((cat) => cat._id === id);
    return sub ? sub.subcategory : "-";
  };

  // Actions
  const removeproduct = async (_id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/product/deleteproduct/${_id}`);
      if (response.data.success) {
        setProducts(products.filter((product) => product._id !== _id));
      }
    } catch (error) { console.error(error); }
  };

  const toggleApprove = async (_id) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/admin/toggle-product/${_id}`);
      if(res.data.success) fetchProducts();
    } catch (error) { console.error(error); }
  };

  return (
    <div className="products shadow-md rounded-md !mt-2 px-1 md:px-6 bg-white">
      {/* Header */}
      <h2 className="text-xl md:text-2xl font-semibold py-4 sm:text-left text-center text-gray-800">
        {pageTitles[type] || 'Products List'}
      </h2>

      <div className="py-2">
        <div className="w-full">
          <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="Search Products..." />
        </div>
      </div>

      <div className="w-full overflow-x-auto mt-4 max-h-[550px]">
        <table className="min-w-[1000px] w-full text-sm text-center text-gray-600">
          <thead className="text-xs uppercase bg-gray-100 text-black">
            <tr>
              <th className="px-6 py-4">Products</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price / Stock</th>
              <th className="px-6 py-4">Seller</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="py-4 text-center"><Progress /></td></tr>
            ) : filteredProducts.length === 0 ? (
               <tr><td colSpan="7" className="py-10 text-center text-gray-400">No products found for this list.</td></tr>
            ) : (
              filteredProducts.map((product) => {
                // ✅ Use 'stock' first, as per your Mongoose Model
                const stockCount = product.stock ?? product.countInStock ?? 0;

                return (
                  <tr key={product._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-2">
                      <div className="flex items-center gap-4">
                        <div className="w-[60px] h-[60px] rounded-md overflow-hidden relative border border-gray-200">
                          <img src={product.images?.[0]?.url} className="w-full h-full object-cover" alt="Product" />
                        </div>
                        <div className="text-left max-w-[200px]">
                            <h3 className="font-semibold text-sm text-black truncate" title={product.title}>
                                {product.title}
                            </h3>
                            <p className="text-xs text-gray-400">ID: {product._id.slice(-4)}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-2">
                        <div className="flex flex-col text-xs">
                            <span className="font-medium text-gray-700">{getCategoryNameById(product.categoryname)}</span>
                            <span className="text-gray-400">{getSubCategoryNameById(product.subcategory)}</span>
                        </div>
                    </td>

                    <td className="px-6 py-2">
                      <div className="flex flex-col items-center">
                        <span className="text-black font-bold">₹{product.price}</span>
                        {/* ✅ Stock Indicator */}
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                            stockCount > 0 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-600"
                        }`}>
                            {stockCount > 0 ? `${stockCount} in Stock` : "Out of Stock"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-2 text-xs font-semibold text-indigo-600">
                        {product.sellerId?.name || "Admin"}
                    </td>

                    <td className="px-6 py-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${product.approved ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>
                        {product.approved ? "Active" : "Pending"}
                      </span>
                    </td>

                    <td className="px-6 py-2">
                      <div className="flex items-center justify-center gap-2">
                          <Tooltip title="Delete">
                            <IconButton onClick={() => removeproduct(product._id)} color="error">
                                <LuTrash2 size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={product.approved ? "Reject" : "Approve"}>
                              <IconButton onClick={() => toggleApprove(product._id)} 
                                style={{ color: product.approved ? '#ef4444' : '#22c55e' }}>
                                {product.approved ? <MdClose size={20} /> : <FiPlus size={20} />}
                              </IconButton>
                          </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductList;