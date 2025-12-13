import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import Tooltip from "@mui/material/Tooltip";
import { LuTrash2, LuSettings, LuLayers, LuTag, LuImage, LuPercent } from "react-icons/lu";
import { Button, TextField, IconButton, Tabs, Tab, Box } from "@mui/material";
import { MyContext } from "../../App.jsx";
import { FiPlus } from "react-icons/fi";
import { MdOutlineEdit, MdSaveAlt, MdClose } from "react-icons/md";
import { useLocation } from "react-router-dom";

function CategoryList() {
  const { setIsOpenAddProductPanel } = useContext(MyContext);
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const fileInputRefs = useRef({});
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) setTabValue(parseInt(tabParam));
    fetchCategories();
  }, [location.search]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getcategories`);
      setCategories(response.data);
    } catch (error) { console.error(error); }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure?")) {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/deletecategory/${id}`);
      fetchCategories();
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditData({ ...cat });
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/updatecategory/${id}`, editData);
      setEditingId(null);
      fetchCategories();
    } catch (e) { alert("Failed to save"); }
  };

  const handleImageChange = async (e, id) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/updatecategory/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      fetchCategories();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="shadow-md rounded-md py-4 px-5 bg-white min-h-[80vh]">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div>
          <h4 className="text-xl font-bold text-gray-800">Catalog Management</h4>
          <p className="text-sm text-gray-500">Manage categories, attributes, and global settings.</p>
        </div>
        <Button className="btn-blue" onClick={() => setIsOpenAddProductPanel({ open: true, model: "Add New Category" })}>
          <FiPlus className="pr-1 text-xl" /> Add Category
        </Button>
      </div>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="All Categories" icon={<LuLayers size={18} />} iconPosition="start" />
          <Tab label="Attributes" icon={<LuSettings size={18} />} iconPosition="start" />
          <Tab label="Commissions" icon={<LuPercent size={18} />} iconPosition="start" />
          <Tab label="Images" icon={<LuImage size={18} />} iconPosition="start" />
          <Tab label="Bulk Management" icon={<LuTag size={18} />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* --- ALL CATEGORIES (Tab 0) --- */}
      {tabValue === 0 && (
        <div className="overflow-auto">
          <table className="w-full border-collapse text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 w-[80px]">
                    <img src={cat.images?.[0]?.url || ""} className="w-10 h-10 rounded-md object-cover bg-gray-100" />
                  </td>
                  <td className="px-6 py-3 font-semibold text-gray-800">
                    {editingId === cat._id ? <TextField size="small" value={editData.categoryname} onChange={e => setEditData({ ...editData, categoryname: e.target.value })} /> : cat.categoryname}
                  </td>
                  <td className="px-6 py-3 text-gray-500 italic">/{cat.categoryname.toLowerCase().replace(/ /g, '-')}</td>
                  <td className="px-6 py-3 text-center">
                    {editingId === cat._id ?
                      <div className="flex justify-center gap-2"><IconButton onClick={() => saveEdit(cat._id)} color="primary"><MdSaveAlt /></IconButton><IconButton onClick={() => setEditingId(null)}><MdClose /></IconButton></div> :
                      <div className="flex justify-center gap-2"><IconButton onClick={() => startEdit(cat)}><MdOutlineEdit /></IconButton><IconButton onClick={() => handleDeleteCategory(cat._id)} color="error"><LuTrash2 /></IconButton></div>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- ATTRIBUTES (Tab 1) --- */}
      {tabValue === 1 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map(cat => (
            <div key={cat._id} className="border p-4 rounded-lg hover:shadow-md transition bg-gray-50">
              <h5 className="font-bold text-gray-800 mb-2 border-b pb-2 flex justify-between">
                {cat.categoryname}
                <LuSettings className="text-gray-400" />
              </h5>
              {/* Mock UI for attributes - In real app, this would be a dynamic list input */}
              <div className="text-sm text-gray-500 mb-2">Attributes: Color, Size, Material</div>
              <Button size="small" variant="outlined">Manage Attributes</Button>
            </div>
          ))}
        </div>
      )}

      {/* --- COMMISSIONS (Tab 2) --- */}
      {tabValue === 2 && (
        <div className="overflow-auto max-w-2xl">
          <table className="w-full border text-sm text-left">
            <thead className="bg-gray-100 font-bold uppercase text-xs">
              <tr><th className="px-4 py-3">Category</th><th className="px-4 py-3">Commission Rate (%)</th><th className="px-4 py-3">Update</th></tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className="border-b">
                  <td className="px-4 py-3 font-medium">{cat.categoryname}</td>
                  <td className="px-4 py-3">
                    {editingId === cat._id ?
                      <input type="number" className="border rounded p-1 w-20" value={editData.commissionRate || 0} onChange={e => setEditData({ ...editData, commissionRate: e.target.value })} /> :
                      <span>{cat.commissionRate || 0}%</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    {editingId === cat._id ?
                      <Button size="small" variant="contained" onClick={() => saveEdit(cat._id)}>Save</Button> :
                      <Button size="small" variant="outlined" onClick={() => startEdit(cat)}>Edit</Button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- IMAGES (Tab 3) --- */}
      {tabValue === 3 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map(cat => (
            <div key={cat._id} className="group relative border rounded-xl overflow-hidden aspect-square">
              <img src={cat.images?.[0]?.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Button variant="contained" size="small" onClick={() => fileInputRefs.current[cat._id].click()}>Change Image</Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="text-white font-bold text-center">{cat.categoryname}</p>
              </div>
              <input type="file" hidden ref={el => fileInputRefs.current[cat._id] = el} onChange={e => handleImageChange(e, cat._id)} />
            </div>
          ))}
        </div>
      )}

      {/* --- BULK MANAGEMENT (Tab 4) --- */}
      {tabValue === 4 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
          <LuLayers size={48} className="mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold">Bulk Operations</h3>
          <p className="max-w-md text-center mb-6">Import/Export categories via CSV. Update commissions in bulk.</p>
          <div className="flex gap-4">
            <Button variant="outlined" color="primary">Export CSV</Button>
            <Button variant="contained" color="primary">Import CSV</Button>
          </div>
        </div>
      )}

    </div>
  );
}

export default CategoryList;
