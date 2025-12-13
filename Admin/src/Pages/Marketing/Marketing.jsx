import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { useLocation } from "react-router-dom";
import { Button, TextField, Tab, Tabs, Box, Chip, Card, CardContent, Switch, FormControlLabel } from "@mui/material";
import { MdEmail, MdSms, MdNotifications, MdTimer, MdLocalOffer, MdCampaign, MdPeople, MdDelete } from "react-icons/md";
import { IoTicketOutline } from "react-icons/io5";
import { FiPlus } from "react-icons/fi";

function Marketing() {
  const { backendurl, atoken } = useContext(Admincontext);
  const location = useLocation();
  const [tabValue, setTabValue] = useState(0);

  // Data State
  const [coupons, setCoupons] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [flashSales, setFlashSales] = useState([]);

  const [affiliate, setAffiliate] = useState({ isActive: false, commissionRate: 5, terms: "" });

  // Update State
  const [newCoupon, setNewCoupon] = useState({ code: "", value: "", expiryDate: "", discountType: "fixed" });
  const [newFlashSale, setNewFlashSale] = useState({ name: "", discountPercentage: "", startTime: "", endTime: "" });

  const [newCampaign, setNewCampaign] = useState({ title: "", type: "Email", content: "" });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) setTabValue(parseInt(tabParam));
    fetchMarketing();
  }, [location.search]);

  const fetchMarketing = async () => {
    try {
      const { data } = await axios.get(`${backendurl}/api/admin/marketing`, { headers: { token: atoken } });
      if (data.success) {
        setCoupons(data.coupons || []);
        setCampaigns(data.campaigns || []);
        setFlashSales(data.flashSales || []);

        if (data.affiliate) setAffiliate(data.affiliate);
      }
    } catch (e) { console.error(e); }
  };

  const createCoupon = async () => {
    try { await axios.post(`${backendurl}/api/admin/marketing/coupon`, newCoupon); fetchMarketing(); alert("Coupon Created"); } catch (e) { alert(e.message); }
  };
  const createFlashSale = async () => {
    try { await axios.post(`${backendurl}/api/admin/marketing/flash-sale`, newFlashSale); fetchMarketing(); alert("Flash Sale Created"); } catch (e) { alert(e.message); }
  };

  const createCampaign = async () => {
    try { await axios.post(`${backendurl}/api/admin/marketing/campaign`, newCampaign); fetchMarketing(); alert("Campaign Created"); } catch (e) { alert(e.message); }
  };
  const updateAffiliate = async () => {
    try { await axios.post(`${backendurl}/api/admin/marketing/affiliate`, affiliate); alert("Settings Updated"); } catch (e) { alert(e.message); }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><MdCampaign size={28} /></div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Marketing & Promotions</h2>
          <p className="text-sm text-gray-500">Run campaigns, manage coupons, and boost sales.</p>
        </div>
      </div>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} variant="scrollable" scrollButtons="auto">
          <Tab label="Dashboard" />
          <Tab label="Coupons" icon={<IoTicketOutline />} iconPosition="start" />
          <Tab label="Flash Sales" icon={<MdTimer />} iconPosition="start" />
          <Tab label="Campaigns" icon={<MdEmail />} iconPosition="start" />
          <Tab label="Affiliate" icon={<MdPeople />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* --- DASHBOARD (Tab 0) --- */}
      {tabValue === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-bold opacity-90">Total Campaigns</h3>
            <p className="text-3xl font-bold mt-2">{campaigns.length}</p>
          </div>
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="text-gray-500 font-bold text-sm uppercase">Active Coupons</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{coupons.filter(c => c.isActive).length}</p>
          </div>
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="text-gray-500 font-bold text-sm uppercase">Active Flash Sales</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{flashSales.filter(f => f.isActive).length}</p>
          </div>
        </div>
      )}

      {/* --- COUPONS TAB (Tab 1) --- */}
      {tabValue === 1 && (
        <div className="mt-2">
          <div className="flex gap-4 mb-6 bg-gray-50 p-6 rounded-xl border border-gray-100 flex-wrap items-end">
            <TextField label="Code" size="small" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} />
            <TextField label="Value" type="number" size="small" value={newCoupon.value} onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })} />
            <TextField select label="Type" SelectProps={{ native: true }} size="small" value={newCoupon.discountType} onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}>
              <option value="fixed">Fixed Amount</option>
              <option value="percentage">Percentage</option>
            </TextField>
            <input type="date" className="border p-2 rounded h-[40px]" onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })} />
            <Button variant="contained" onClick={createCoupon}>Create</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {coupons.map(c => (
              <div key={c._id} className="border p-4 rounded-lg bg-gray-50">
                <p className="font-bold text-lg">{c.code}</p>
                <p className="text-sm">{c.value} {c.discountType}</p>
                <p className="text-xs text-gray-500">Exp: {new Date(c.expiryDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- FLASH SALES TAB (Tab 2) --- */}
      {tabValue === 2 && (
        <div>
          <div className="flex gap-4 mb-6 bg-gray-50 p-6 rounded-xl items-end flex-wrap">
            <TextField label="Name" size="small" value={newFlashSale.name} onChange={e => setNewFlashSale({ ...newFlashSale, name: e.target.value })} />
            <TextField label="Discount %" type="number" size="small" value={newFlashSale.discountPercentage} onChange={e => setNewFlashSale({ ...newFlashSale, discountPercentage: e.target.value })} />
            <div className="flex flex-col"><label className="text-xs">Start</label><input type="datetime-local" className="border p-1 rounded" onChange={e => setNewFlashSale({ ...newFlashSale, startTime: e.target.value })} /></div>
            <div className="flex flex-col"><label className="text-xs">End</label><input type="datetime-local" className="border p-1 rounded" onChange={e => setNewFlashSale({ ...newFlashSale, endTime: e.target.value })} /></div>
            <Button variant="contained" onClick={createFlashSale}>Create Sale</Button>
          </div>
          <div className="space-y-4">
            {flashSales.map(fs => (
              <div key={fs._id} className="flex justify-between items-center border p-4 rounded bg-orange-50">
                <div>
                  <h4 className="font-bold">{fs.name}</h4>
                  <p className="text-sm">{fs.discountPercentage}% Off</p>
                  <p className="text-xs text-gray-500">{new Date(fs.startTime).toLocaleString()} - {new Date(fs.endTime).toLocaleString()}</p>
                </div>
                <Chip label={fs.isActive ? "Active" : "Inactive"} color={fs.isActive ? "success" : "default"} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- CAMPAIGNS (Tab 3) --- */}
      {tabValue === 3 && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-gray-50 p-6 rounded-xl h-fit">
            <h3 className="font-bold mb-4">Create Campaign</h3>
            <div className="space-y-4">
              <TextField label="Title" size="small" fullWidth value={newCampaign.title} onChange={e => setNewCampaign({ ...newCampaign, title: e.target.value })} />
              <TextField select label="Type" SelectProps={{ native: true }} size="small" fullWidth value={newCampaign.type} onChange={e => setNewCampaign({ ...newCampaign, type: e.target.value })}>
                <option>Email</option><option>SMS</option><option>Push</option>
              </TextField>
              <TextField label="Content/Message" multiline rows={4} size="small" fullWidth value={newCampaign.content} onChange={e => setNewCampaign({ ...newCampaign, content: e.target.value })} />
              <Button variant="contained" fullWidth onClick={createCampaign}>Launch Campaign</Button>
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold">Recent Campaigns</h3>
            {campaigns.map(c => (
              <div key={c._id} className="border p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold">{c.title}</p>
                  <p className="text-sm text-gray-500">{c.type} • {c.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- AFFILIATE (Tab 4) --- */}
      {tabValue === 4 && (
        <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-xl">
          <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><MdPeople /> Affiliate Settings</h3>
            <FormControlLabel control={<Switch checked={affiliate.isActive} onChange={e => setAffiliate({ ...affiliate, isActive: e.target.checked })} />} label="Enable Affiliate Program" />
            <div className="mt-4 space-y-4">
              <TextField label="Commission Rate (%)" type="number" fullWidth size="small" value={affiliate.commissionRate} onChange={e => setAffiliate({ ...affiliate, commissionRate: e.target.value })} />
              <TextField label="Terms & Conditions" multiline rows={3} fullWidth size="small" value={affiliate.terms} onChange={e => setAffiliate({ ...affiliate, terms: e.target.value })} />
              <Button variant="contained" fullWidth onClick={updateAffiliate}>Save Settings</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Marketing;