import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, Card, CardContent, LinearProgress, Alert, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import { MdTrendingUp, MdShoppingCart, MdAttachMoney, MdShowChart } from "react-icons/md";
import { FiRefreshCw, FiDownload } from "react-icons/fi";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

function RevenueAnalytics() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateRange.start) params.append('startDate', dateRange.start);
            if (dateRange.end) params.append('endDate', dateRange.end);

            const { data: res } = await axios.get(
                `${backendurl}/api/admin/reports/revenue?${params.toString()}`,
                { headers: { token: atoken } }
            );
            if (res.success) {
                setData(res.data || []);
                setSummary(res.summary || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 });
            }
        } catch (e) {
            console.error("Error fetching revenue data:", e);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    };

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg"><MdTrendingUp size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Revenue Analytics</h2>
                        <p className="text-sm text-gray-500">Track your sales and revenue performance.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <TextField type="date" label="Start Date" size="small" InputLabelProps={{ shrink: true }} value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
                    <TextField type="date" label="End Date" size="small" InputLabelProps={{ shrink: true }} value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
                    <Button startIcon={<FiRefreshCw />} onClick={fetchData} disabled={loading}>Refresh</Button>
                    <Button variant="outlined" startIcon={<FiDownload />}>Export</Button>
                </div>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Total Revenue</p>
                                <h3 className="text-3xl font-bold">{formatCurrency(summary.totalRevenue)}</h3>
                            </div>
                            <MdAttachMoney size={40} className="text-blue-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Total Orders</p>
                                <h3 className="text-3xl font-bold">{summary.totalOrders}</h3>
                            </div>
                            <MdShoppingCart size={40} className="text-green-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Average Order Value</p>
                                <h3 className="text-3xl font-bold">{formatCurrency(summary.averageOrderValue)}</h3>
                            </div>
                            <MdShowChart size={40} className="text-purple-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">Avg Daily Revenue</p>
                                <h3 className="text-3xl font-bold">{formatCurrency(data.length > 0 ? summary.totalRevenue / data.length : 0)}</h3>
                            </div>
                            <MdTrendingUp size={40} className="text-orange-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Chart */}
            <Card className="mb-6">
                <CardContent>
                    <h3 className="text-lg font-bold mb-4">Revenue Trend</h3>
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={data.slice().reverse()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="totalRevenue" fill="#3B82F6" name="Revenue" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <MdShowChart size={48} className="mx-auto text-gray-300 mb-3" />
                            <p>No revenue data available</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Orders Chart */}
            <Card>
                <CardContent>
                    <h3 className="text-lg font-bold mb-4">Orders Trend</h3>
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.slice().reverse()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="totalOrders" stroke="#10B981" name="Orders" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="averageOrderValue" stroke="#F59E0B" name="Avg Order Value" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p>No order data available</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default RevenueAnalytics;
