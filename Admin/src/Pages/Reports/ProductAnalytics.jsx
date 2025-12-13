import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, Card, CardContent, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Chip } from "@mui/material";
import { MdInventory, MdVisibility, MdShoppingCart, MdTrendingUp } from "react-icons/md";
import { FiRefreshCw, FiDownload } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

function ProductAnalytics() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/reports/product-analytics`, { headers: { token: atoken } });
            if (data.success) setProducts(data.products || []);
        } catch (e) {
            console.error("Error fetching product analytics:", e);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    };

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

    const topByRevenue = products.slice(0, 8).map((p, i) => ({
        name: p.name?.substring(0, 20) || `Product ${i + 1}`,
        revenue: p.revenue || 0
    }));

    const topByViews = products.slice(0, 8).map((p, i) => ({
        name: p.name?.substring(0, 15) || `Product ${i + 1}`,
        views: p.views || 0
    }));

    // Summary stats
    const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalPurchases = products.reduce((sum, p) => sum + (p.purchases || 0), 0);
    const totalRevenue = products.reduce((sum, p) => sum + (p.revenue || 0), 0);
    const avgConversion = products.length > 0
        ? products.reduce((sum, p) => sum + parseFloat(p.conversionRate || 0), 0) / products.length
        : 0;

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><MdInventory size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Product Analytics</h2>
                        <p className="text-sm text-gray-500">Track product views, sales, and conversion rates.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button startIcon={<FiRefreshCw />} onClick={fetchData} disabled={loading}>Refresh</Button>
                    <Button variant="outlined" startIcon={<FiDownload />}>Export</Button>
                </div>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Total Views</p>
                            <h3 className="text-2xl font-bold">{totalViews.toLocaleString()}</h3>
                        </div>
                        <MdVisibility size={36} className="text-blue-200" />
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Total Purchases</p>
                            <h3 className="text-2xl font-bold">{totalPurchases.toLocaleString()}</h3>
                        </div>
                        <MdShoppingCart size={36} className="text-green-200" />
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Product Revenue</p>
                            <h3 className="text-2xl font-bold">{formatCurrency(totalRevenue)}</h3>
                        </div>
                        <MdTrendingUp size={36} className="text-purple-200" />
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm">Avg Conversion</p>
                            <h3 className="text-2xl font-bold">{avgConversion.toFixed(2)}%</h3>
                        </div>
                        <MdInventory size={36} className="text-orange-200" />
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card>
                    <CardContent>
                        <h3 className="text-lg font-bold mb-4">Top Products by Revenue</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={topByRevenue} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <h3 className="text-lg font-bold mb-4">Top Products by Views</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={topByViews} cx="50%" cy="50%" outerRadius={80} dataKey="views" nameKey="name" label>
                                    {topByViews.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Products Table */}
            <TableContainer component={Paper} className="rounded-xl">
                <Table>
                    <TableHead className="bg-gray-50">
                        <TableRow>
                            <TableCell><strong>Product</strong></TableCell>
                            <TableCell align="right"><strong>Price</strong></TableCell>
                            <TableCell align="right"><strong>Stock</strong></TableCell>
                            <TableCell align="right"><strong>Views</strong></TableCell>
                            <TableCell align="right"><strong>Purchases</strong></TableCell>
                            <TableCell align="right"><strong>Revenue</strong></TableCell>
                            <TableCell align="center"><strong>Conversion</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((product, idx) => (
                            <TableRow key={product._id || idx} hover>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar variant="rounded" src={product.image} sx={{ width: 40, height: 40 }}>
                                            <MdInventory />
                                        </Avatar>
                                        <span className="font-medium line-clamp-1">{product.name || 'Unknown Product'}</span>
                                    </div>
                                </TableCell>
                                <TableCell align="right">{formatCurrency(product.price || 0)}</TableCell>
                                <TableCell align="right">
                                    <Chip size="small" label={product.stock || 0} color={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'} variant="outlined" />
                                </TableCell>
                                <TableCell align="right">{(product.views || 0).toLocaleString()}</TableCell>
                                <TableCell align="right">{product.purchases || 0}</TableCell>
                                <TableCell align="right" className="font-bold text-green-600">{formatCurrency(product.revenue || 0)}</TableCell>
                                <TableCell align="center">
                                    <Chip size="small" label={`${product.conversionRate || 0}%`} color={product.conversionRate > 5 ? 'success' : product.conversionRate > 2 ? 'warning' : 'default'} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {products.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                    <MdInventory size={48} className="mx-auto text-gray-300 mb-3" />
                                    <p>No product analytics available</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default ProductAnalytics;
