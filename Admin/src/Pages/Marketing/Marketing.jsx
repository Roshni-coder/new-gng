import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, TextField, Tab, Tabs, Box } from "@mui/material";

function Marketing() {
  const { backendurl, atoken } = useContext(Admincontext);
  const [tabValue, setTabValue] = useState(0);
  const [coupons, setCoupons] = useState([]);
  
  // Form State
  const [newCoupon, setNewCoupon] = useState({ code: "", value: "", expiryDate: "", discountType: "fixed" });

  const fetchMarketing = async () => {
    const { data } = await axios.get(`${backendurl}/api/admin/marketing`, { headers: { token: atoken } });
    if(data.success) setCoupons(data.coupons);
  };

  const createCoupon = async () => {
    try {
        await axios.post(`${backendurl}/api/admin/marketing/coupon`, newCoupon, { headers: { token: atoken } });
        alert("Coupon Created!");
        fetchMarketing();
    } catch (error) {
        alert("Error creating coupon");
    }
  };

  useEffect(() => { fetchMarketing(); }, []);

  return (
    <div className="p-5 bg-white rounded-lg shadow m-4">
      <h2 className="text-2xl font-bold mb-4">Marketing & Promotions</h2>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
            <Tab label="Coupons" />
            <Tab label="Flash Sales" />
            <Tab label="Banners" />
        </Tabs>
      </Box>

      {/* --- COUPONS TAB --- */}
      {tabValue === 0 && (
        <div className="mt-5">
            <div className="flex gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                <TextField label="Coupon Code" size="small" onChange={(e)=>setNewCoupon({...newCoupon, code: e.target.value})} />
                <TextField label="Discount Value" type="number" size="small" onChange={(e)=>setNewCoupon({...newCoupon, value: e.target.value})} />
                <input type="date" className="border p-2 rounded" onChange={(e)=>setNewCoupon({...newCoupon, expiryDate: e.target.value})} />
                <Button variant="contained" onClick={createCoupon}>Create Coupon</Button>
            </div>

            <h3 className="font-bold mb-2">Active Coupons</h3>
            <ul className="space-y-2">
                {coupons.map(c => (
                    <li key={c._id} className="flex justify-between border p-3 rounded">
                        <span className="font-mono font-bold text-blue-600">{c.code}</span>
                        <span>{c.discountType === 'fixed' ? '₹' : ''}{c.value}{c.discountType === 'percentage' ? '%' : ''} Off</span>
                        <span className="text-gray-500">Expires: {new Date(c.expiryDate).toLocaleDateString()}</span>
                    </li>
                ))}
            </ul>
        </div>
      )}

      {/* --- FLASH SALES TAB (Placeholder) --- */}
      {tabValue === 1 && (
        <div className="mt-5 text-center text-gray-500">
            <p>Flash Sale module allows you to set a timer on specific categories.</p>
            {/* Implementation would involve selecting a category and a time limit */}
        </div>
      )}
    </div>
  );
}

export default Marketing;