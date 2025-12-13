import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, Card, CardContent, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Chip, Rating } from "@mui/material";
import { MdStorefront, MdTrendingUp, MdStar } from "react-icons/md";
import { FiRefreshCw, FiDownload } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function VendorPerformance() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [vendors, setVendors] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/reports/vendor-performance`, { headers: { token: atoken } });
            if (data.success) setVendors(data.vendors || []);
        } catch (e) {
            console.error("Error fetching vendor performance:", e);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    };

    const getFulfillmentColor = (rate) => {
        if (rate >= 95) return 'success';
        if (rate >= 80) return 'warning';
        return 'error';
    };

    const chartData = vendors.slice(0, 10).map(v => ({
        name: v.name?.substring(0, 15) || 'Unknown',
        revenue: v.revenue || 0,
        orders: v.totalOrders || 0
    }));

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><MdStorefront size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Vendor Performance</h2>
                        <p className="text-sm text-gray-500">Analyze vendor sales and fulfillment metrics.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button startIcon={<FiRefreshCw />} onClick={fetchData} disabled={loading}>Refresh</Button>
                    <Button variant="outlined" startIcon={<FiDownload />}>Export</Button>
                </div>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* Top Performers Chart */}
            <Card className="mb-6">
                <CardContent>
                    <h3 className="text-lg font-bold mb-4">Top Vendors by Revenue</h3>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Bar dataKey="revenue" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-12 text-gray-500">No vendor data available</div>
                    )}
                </CardContent>
            </Card>

            {/* Vendors Table */}
            <TableContainer component={Paper} className="rounded-xl">
                <Table>
                    <TableHead className="bg-gray-50">
                        <TableRow>
                            <TableCell><strong>Vendor</strong></TableCell>
                            <TableCell align="right"><strong>Products</strong></TableCell>
                            <TableCell align="right"><strong>Orders</strong></TableCell>
                            <TableCell align="right"><strong>Revenue</strong></TableCell>
                            <TableCell align="center"><strong>Rating</strong></TableCell>
                            <TableCell align="center"><strong>Fulfillment</strong></TableCell>
                            <TableCell align="center"><strong>Return Rate</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {vendors.map((vendor, idx) => (
                            <TableRow key={vendor._id || idx} hover>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar sx={{ bgcolor: `hsl(${idx * 40}, 70%, 50%)` }}>{vendor.name?.[0] || 'V'}</Avatar>
                                        <div>
                                            <p className="font-medium">{vendor.name || 'Unknown Vendor'}</p>
                                            <p className="text-xs text-gray-500">{vendor.email || '-'}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell align="right">{vendor.totalProducts || 0}</TableCell>
                                <TableCell align="right">{vendor.totalOrders || 0}</TableCell>
                                <TableCell align="right" className="font-bold text-green-600">{formatCurrency(vendor.revenue || 0)}</TableCell>
                                <TableCell align="center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Rating value={vendor.rating || 0} size="small" readOnly precision={0.5} />
                                        <span className="text-sm text-gray-600">{(vendor.rating || 0).toFixed(1)}</span>
                                    </div>
                                </TableCell>
                                <TableCell align="center">
                                    <Chip size="small" label={`${(vendor.fulfillmentRate || 0).toFixed(1)}%`} color={getFulfillmentColor(vendor.fulfillmentRate)} />
                                </TableCell>
                                <TableCell align="center">
                                    <span className={vendor.returnRate > 5 ? 'text-red-500' : 'text-gray-600'}>
                                        {(vendor.returnRate || 0).toFixed(1)}%
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                        {vendors.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12">
                                    <MdStorefront size={48} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">No vendor data available</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default VendorPerformance;
