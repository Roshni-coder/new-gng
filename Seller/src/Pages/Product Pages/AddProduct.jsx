import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Button, FormControl, TextField, Autocomplete } from '@mui/material';
import { MdOutlineCloudUpload, MdDescription, MdAttachMoney, MdInfo, MdCategory, MdPublic } from 'react-icons/md';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import AddCategory from '../Category/AddCategory';
import AddSubCategory from '../Category/AddSubCategory';

const MAX_IMAGES = 5;

const getInitialProduct = () => ({
  title: "",
  description: "",
  categoryname: "",
  subcategory: "",
  oldprice: "",
  discount: "",
  stock: "",
  ingredients: "",
  brand: "",
  size: "",
  additional_details: "",
  productDimensions: "",
  itemWeight: "",
  itemDimensionsLxWxH: "",
  netQuantity: "1 Count",
  genericName: "",
  asin: "",
  itemPartNumber: "",
  dateFirstAvailable: "",
  bestSellerRank: "",
  materialComposition: "",
  outerMaterial: "",
  length: "",
  careInstructions: "",
  aboutThisItem: "",
  manufacturer: "",
  packer: "",
  department: "",
  countryOfOrigin: "India"
});

const Req = () => <span className="text-red-500 font-bold ml-1">*</span>;

const FormCard = ({ children, color, title, icon }) => (
  <div className={`bg-white rounded-2xl shadow-lg border-t-4 ${color} overflow-hidden mb-6 transition-all hover:shadow-xl`}>
    <div className="px-6 py-4 bg-opacity-10 flex items-center gap-3 border-b border-gray-100">
      <div className="p-2 rounded-lg bg-gray-50 text-xl">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

function AddProduct() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [images, setImages] = useState([]);
  const [openAddCategoryModal, setOpenAddCategoryModal] = useState(false);
  const [openAddSubCategoryModal, setOpenAddSubCategoryModal] = useState(false);
  const [approved, setApproved] = useState(false);
  const stoken = localStorage.getItem('stoken') || "null";

  // ⭐ ALL FIELDS FROM SCHEMA ADDED HERE
  const [Product, setProduct] = useState(getInitialProduct);
  const [formError, setFormError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellerLoading, setSellerLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
    fetchSeller();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getcategories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setFormError('Unable to load categories. Please refresh the page.');
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getsubcategories`);
      setSubcategories(response.data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setFormError('Unable to load subcategories. Please refresh the page.');
    }
  };

  const fetchSeller = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller/sellerdetails`, { headers: { stoken } });
      if (res.data.success && Array.isArray(res.data.seller) && res.data.seller.length) {
        setApproved(res.data.seller[0].approved);
      } else {
        setFormError(res.data.message || 'Unable to verify seller status.');
      }
    } catch (error) {
      console.error('Error fetching seller status:', error);
      setFormError('Unable to verify seller status. Please try again.');
    } finally {
      setSellerLoading(false);
    }
  };

  // Filter Subcategories logic
  useEffect(() => {
    if (Product.categoryname) {
      const filtered = subcategories.filter(
        (sub) => sub.category?._id === Product.categoryname
      );
      setFilteredSubcategories(filtered);

      const isSubcategoryValid = filtered.some((sub) => sub._id === Product.subcategory);
      if (!isSubcategoryValid && Product.subcategory) {
        setProduct((prev) => ({ ...prev, subcategory: "" }));
      }
    } else {
      setFilteredSubcategories([]);
      if (Product.subcategory) {
        setProduct((prev) => ({ ...prev, subcategory: "" }));
      }
    }
  }, [Product.categoryname, Product.subcategory, subcategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormError("");
    setSubmitMessage("");
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name) => (event) => {
    const { value } = event.target;
    setFormError("");
    setSubmitMessage("");
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (files) => {
    if (!files?.length) return;

    setFormError("");
    const fileList = Array.from(files);
    const availableSlots = MAX_IMAGES - images.length;

    if (availableSlots <= 0) {
      setFormError(`You can upload up to ${MAX_IMAGES} images per product.`);
      return;
    }

    if (fileList.length > availableSlots) {
      setFormError(`Only ${availableSlots} more image${availableSlots > 1 ? "s" : ""} allowed.`);
    }

    const sanitizedFiles = fileList.slice(0, availableSlots);
    setImages((prevImages) => [...prevImages, ...sanitizedFiles]);
  };

  const handleImageRemove = (indexToRemove) => {
    const updated = images.filter((_, i) => i !== indexToRemove);
    setImages(updated);
    setFormError("");
  };

  const finalPrice = useMemo(() => {
    const basePrice = parseFloat(Product.oldprice);
    const discountValue = parseFloat(Product.discount);

    if (isNaN(basePrice) || isNaN(discountValue)) {
      return "";
    }

    const discounted = basePrice - (basePrice * discountValue / 100);
    if (!isFinite(discounted)) {
      return "";
    }

    const normalized = discounted <= 0 ? 0 : discounted;
    return normalized.toFixed(2);
  }, [Product.oldprice, Product.discount]);

  const imagePreviews = useMemo(
    () => images.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [images]
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [imagePreviews]);

  const addproduct = async (event) => {
    event.preventDefault();
    setFormError("");
    setSubmitMessage("");

    const requiredFields = ["title", "description", "stock", "oldprice", "discount", "categoryname", "subcategory"];
    const missingField = requiredFields.find((field) => !String(Product[field] || "").trim());

    if (missingField) {
      setFormError("Please fill all required fields marked with *.");
      return;
    }

    if (!finalPrice) {
      setFormError("Provide seller price and discount to calculate the final price.");
      return;
    }

    if (!images.length) {
      setFormError("Upload at least one product image.");
      return;
    }

    if (Number(Product.stock) <= 0) {
      setFormError("Stock must be at least 1.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(Product).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (typeof value === 'string' && value.trim() === '') return;
        formData.append(key, value);
      });

      formData.append("price", finalPrice);
      images.forEach((img) => formData.append("images", img));

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/seller/addproducts`,
        formData,
        { headers: { stoken } }
      );

      if (response.data.success) {
        setSubmitMessage("Product added successfully!");
        resetForm();
        fetchCategories();
        fetchSubcategories();
      } else {
        setFormError(response.data.message || "Failed to add product.");
      }
    } catch (error) {
      console.error("Error adding product:", error.response || error);
      const message = error.response?.data?.message || "Failed to add product.";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setProduct(getInitialProduct());
    setImages([]);
    setFilteredSubcategories([]);
    setFormError("");
    setSubmitMessage("");
  };

  const handleOpenCategoryModal = () => setOpenAddCategoryModal(true);
  const handleCloseCategoryModal = () => {
    setOpenAddCategoryModal(false);
    fetchCategories();
  };

  const handleOpenSubCategoryModal = () => setOpenAddSubCategoryModal(true);
  const handleCloseSubCategoryModal = () => {
    setOpenAddSubCategoryModal(false);
    fetchSubcategories();
  };

  if (sellerLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-gray-200 text-gray-600 text-center px-10 py-16 rounded-2xl shadow max-w-xl w-full">
          <h2 className="text-2xl font-semibold mb-3">Loading seller status…</h2>
          <p>Please wait while we verify your permissions.</p>
        </div>
      </div>
    );
  }

  if (!approved) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 text-red-700 text-center px-10 py-16 rounded-2xl shadow-xl max-w-xl w-full">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-lg">You are not approved to add products yet.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    Add New Product
                </h1>
                <p className="text-gray-500 mt-1">Fill in the details to publish your product.</p>
            </div>
            <Button 
              variant="outlined" 
              color="secondary"
              type="button"
              onClick={resetForm}
              className="!rounded-full !px-6 !border-gray-300 !text-gray-600 hover:!bg-gray-100"
            >
              Reset Form
            </Button>
        </div>

          <form onSubmit={addproduct} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* ---------------- LEFT COLUMN (Content) ---------------- */}
            <div className="lg:col-span-2 space-y-2">
                
                {/* 1. GENERAL INFORMATION - BLUE THEME */}
                <FormCard color="border-blue-500" title="General Information" icon={<MdDescription className="text-blue-500"/>}>
                    <div className="space-y-5">
                        <TextField 
                            label={<span>Product Title <Req/></span>} 
                            name="title" 
                            fullWidth 
                            variant="outlined"
                            value={Product.title} 
                            onChange={handleChange} 
                            placeholder="e.g. Premium Cotton Shirt"
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <TextField label="Brand" name="brand" fullWidth value={Product.brand} onChange={handleChange} />
                            <TextField label="Generic Name" name="genericName" fullWidth value={Product.genericName} onChange={handleChange} placeholder="e.g. Shirt" />
                        </div>

                        <TextField 
                          label="Key Ingredients / Highlights" 
                          name="ingredients" 
                          fullWidth 
                          value={Product.ingredients} 
                          onChange={handleChange} 
                          placeholder="Organic cotton, hypoallergenic colors"
                        />

                        <TextField 
                            label={<span>Description <Req/></span>}
                            name="description" 
                            multiline 
                            rows={4} 
                            fullWidth 
                            value={Product.description} 
                            onChange={handleChange} 
                            className="bg-gray-50"
                        />
                        
                        <TextField 
                            label="About This Item (Bullet Points)" 
                            name="aboutThisItem" 
                            multiline 
                            rows={3} 
                            fullWidth 
                            value={Product.aboutThisItem} 
                            onChange={handleChange} 
                            placeholder="• Feature 1&#10;• Feature 2"
                            className="bg-gray-50"
                        />
                    </div>
                </FormCard>

                {/* 2. SPECIFICATIONS - PURPLE THEME */}
                <FormCard color="border-purple-500" title="Specifications & Details" icon={<MdInfo className="text-purple-500"/>}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                        <TextField label="ASIN ID" name="asin" value={Product.asin} onChange={handleChange} placeholder="B08..." />
                        <TextField label="Model / Part No." name="itemPartNumber" value={Product.itemPartNumber} onChange={handleChange} />
                        <TextField label="Department" name="department" value={Product.department} onChange={handleChange} placeholder="Men/Women" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                        <TextField label="Material" name="materialComposition" value={Product.materialComposition} onChange={handleChange} placeholder="100% Cotton" />
                        <TextField label="Outer Material" name="outerMaterial" value={Product.outerMaterial} onChange={handleChange} />
                        <TextField label="Size" name="size" value={Product.size} onChange={handleChange} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                        <TextField label="Dimensions" name="productDimensions" value={Product.productDimensions} onChange={handleChange} />
                        <TextField label="Weight" name="itemWeight" value={Product.itemWeight} onChange={handleChange} />
                        <TextField label="L x W x H" name="itemDimensionsLxWxH" value={Product.itemDimensionsLxWxH} onChange={handleChange} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                      <TextField label="Length" name="length" value={Product.length} onChange={handleChange} placeholder="Calf length, short, long" />
                      <TextField label="Best Seller Rank" name="bestSellerRank" value={Product.bestSellerRank} onChange={handleChange} />
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                         <TextField label="Care Instructions" name="careInstructions" fullWidth value={Product.careInstructions} onChange={handleChange} />
                         <TextField label="Additional Details" name="additional_details" fullWidth value={Product.additional_details} onChange={handleChange} />
                    </div>
                </FormCard>

                {/* 3. IMAGES - PINK THEME */}
                <FormCard color="border-pink-500" title="Product Gallery" icon={<MdOutlineCloudUpload className="text-pink-500"/>}>
                    <div className="flex flex-wrap gap-4">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                                <img
                                    className="w-28 h-28 object-cover rounded-xl border-2 border-gray-100 shadow-sm"
                              src={preview.url}
                              alt={`preview-${index}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleImageRemove(index)}
                                    className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1.5 shadow-md hover:bg-pink-600 transition transform hover:scale-110"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <label htmlFor="multi-img" className={`cursor-pointer group ${images.length >= MAX_IMAGES ? 'opacity-60 pointer-events-none' : ''}`}>
                            <div className="w-28 h-28 flex flex-col items-center justify-center border-2 border-dashed border-pink-300 rounded-xl bg-pink-50 group-hover:bg-pink-100 group-hover:border-pink-500 transition-all duration-300">
                                <span className="text-3xl text-pink-400 group-hover:text-pink-600 mb-1">+</span>
                                <span className="text-xs font-semibold text-pink-400 group-hover:text-pink-600">Upload</span>
                            </div>
                        </label>
                        <input 
                          id="multi-img" 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          hidden 
                          disabled={images.length >= MAX_IMAGES}
                          onChange={(e) => {
                            handleImageUpload(e.target.files);
                            e.target.value = '';
                          }} 
                        />
                    </div>
                      <p className="text-xs text-gray-400 mt-3">* First image will be the cover image. ({images.length}/{MAX_IMAGES})</p>
                </FormCard>

            </div>

            {/* ---------------- RIGHT COLUMN (Sidebar) ---------------- */}
            <div className="space-y-6">

                {/* 4. PRICING & STOCK - EMERALD THEME */}
                <FormCard color="border-emerald-500" title="Pricing & Stock" icon={<MdAttachMoney className="text-emerald-500"/>}>
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <TextField 
                                label={<span>Seller Price <Req/></span>} 
                                type="number" 
                                name="oldprice" 
                                value={Product.oldprice} 
                                onChange={handleChange}
                                InputProps={{ startAdornment: <span className="mr-1 text-gray-500">₹</span> }}
                            />
                            <TextField 
                                label={<span>Discount % <Req/></span>} 
                                type="number" 
                                name="discount" 
                                value={Product.discount} 
                                onChange={handleChange} 
                            />
                        </div>

                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Final GnG Price</p>
                            <p className="text-2xl font-bold text-emerald-700">
                              ₹ {finalPrice || "0.00"}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <TextField 
                                label={<span>Stock <Req/></span>} 
                                type="number" 
                                name="stock" 
                                value={Product.stock} 
                                onChange={handleChange} 
                            />
                            <TextField 
                                label="Net Qty" 
                                name="netQuantity" 
                                value={Product.netQuantity} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>
                </FormCard>

                {/* 5. CATEGORIZATION - ORANGE THEME */}
                <FormCard color="border-orange-500" title="Category" icon={<MdCategory className="text-orange-500"/>}>
                    <div className="space-y-5">
                        <div className="relative">
                             <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Category <Req/></label>
                             <div className="flex gap-2">
                                <Autocomplete
                                    fullWidth
                                    options={categories}
                                    getOptionLabel={(option) => option.categoryname}
                                    value={categories.find(cat => cat._id === Product.categoryname) || null}
                                    onChange={(event, newValue) => {
                                        setProduct({ ...Product, categoryname: newValue ? newValue._id : '' });
                                    }}
                                    renderInput={(params) => <TextField {...params} placeholder="Select Category" />}
                                />
                                <Button 
                                    variant="contained" 
                                  type="button"
                                    className="!bg-orange-500 !min-w-[50px] !p-0" 
                                    onClick={handleOpenCategoryModal}
                                >
                                    +
                                </Button>
                             </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Subcategory <Req/></label>
                            <div className="flex gap-2">
                                <FormControl fullWidth>
                                    <Select
                                        value={Product.subcategory}
                                        onChange={handleSelectChange('subcategory')}
                                        disabled={!Product.categoryname}
                                        displayEmpty
                                    >
                                        <MenuItem value="" disabled>Select Subcategory</MenuItem>
                                        {filteredSubcategories.map((sub) => (
                                            <MenuItem key={sub._id} value={sub._id}>{sub.subcategory}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Button 
                                    variant="contained" 
                                  type="button"
                                    className="!bg-orange-500 !min-w-[50px] !p-0" 
                                    onClick={handleOpenSubCategoryModal}
                                >
                                    +
                                </Button>
                            </div>
                        </div>
                    </div>
                </FormCard>

                {/* 6. ORIGIN - CYAN THEME */}
                <FormCard color="border-cyan-500" title="Origin & Manufacturer" icon={<MdPublic className="text-cyan-500"/>}>
                    <div className="space-y-4">
                         <TextField label="Country of Origin" name="countryOfOrigin" fullWidth value={Product.countryOfOrigin} onChange={handleChange} />
                         <TextField label="Manufacturer" name="manufacturer" fullWidth value={Product.manufacturer} onChange={handleChange} />
                         <TextField label="Packer Details" name="packer" fullWidth value={Product.packer} onChange={handleChange} />
                         
                         <TextField
                            label="Date First Available"
                            type="date"
                            name="dateFirstAvailable"
                            value={Product.dateFirstAvailable}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                    </div>
                </FormCard>

                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4" role="alert">
                    {formError}
                  </div>
                )}

                {submitMessage && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 mb-4" role="status">
                    {submitMessage}
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isSubmitting}
                  className="!py-4 !text-lg !font-bold !rounded-2xl !shadow-lg !bg-gradient-to-r from-blue-600 to-purple-600 hover:!from-blue-700 hover:!to-purple-700 hover:!shadow-2xl transition-all transform hover:-translate-y-1 disabled:!opacity-60 disabled:!cursor-not-allowed"
                  startIcon={<MdOutlineCloudUpload />}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Product'}
                </Button>

            </div>
        </form>

        {/* Modals */}
        <Modal open={openAddCategoryModal} onClose={handleCloseCategoryModal}>
            <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-2xl shadow-2xl w-[90%] sm:w-[500px] border-t-8 border-orange-500">
            <AddCategory onClose={handleCloseCategoryModal} />
            </Box>
        </Modal>

        <Modal open={openAddSubCategoryModal} onClose={handleCloseSubCategoryModal}>
            <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-2xl shadow-2xl w-[90%] sm:w-[500px] border-t-8 border-orange-500">
                <AddSubCategory onSubCategoryAdded={handleCloseSubCategoryModal} />
            </Box>
        </Modal>

      </div>
    </section>
  );
}

export default AddProduct;