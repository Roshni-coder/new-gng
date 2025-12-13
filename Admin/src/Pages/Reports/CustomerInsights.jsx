import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, Card, CardContent, LinearProgress } from "@mui/material";
import { MdPeople, MdPersonAdd, MdRepeat, MdLocationOn } from "react-icons/md";
import { FiRefreshCw, FiDownload, FiUsers } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

function CustomerInsights() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [insights, setInsights] = useState({
        totalCustomers: 0,
        newCustomers: 0,
        returningCustomers: 0,
        averageLifetimeValue: 0,
        purchaseFrequency: { oneTime: 0, repeat: 0, frequent: 0 },
        topLocations: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/reports/customer-insights`, { headers: { token: atoken } });
            if (data.success) setInsights(data.insights || insights);
        } catch (e) {
            console.error("Error fetching customer insights:", e);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    };

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    const frequencyData = [
        { name: 'One-Time', value: insights.purchaseFrequency?.oneTime || 0, color: '#3B82F6' },
        { name: 'Repeat (2-4)', value: insights.purchaseFrequency?.repeat || 0, color: '#10B981' },
        { name: 'Frequent (5+)', value: insights.purchaseFrequency?.frequent || 0, color: '#F59E0B' }
    ];

    const locationData = (insights.topLocations || []).slice(0, 8);

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><FiUsers size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Customer Insights</h2>
                        <p className="text-sm text-gray-500">Understand your customer base and behavior.</p>
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
                            <p className="text-blue-100 text-sm">Total Customers</p>
                            <h3 className="text-3xl font-bold">{insights.totalCustomers.toLocaleString()}</h3>
                        </div>
                        <MdPeople size={40} className="text-blue-200" />
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">New Customers (30d)</p>
                            <h3 className="text-3xl font-bold">{insights.newCustomers.toLocaleString()}</h3>
                        </div>
                        <MdPersonAdd size={40} className="text-green-200" />
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Returning Customers</p>
                            <h3 className="text-3xl font-bold">{insights.returningCustomers.toLocaleString()}</h3>
                        </div>
                        <MdRepeat size={40} className="text-purple-200" />
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm">Avg Lifetime Value</p>
                            <h3 className="text-2xl font-bold">{formatCurrency(insights.averageLifetimeValue)}</h3>
                        </div>
                        <MdLocationOn size={40} className="text-orange-200" />
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Purchase Frequency */}
                <Card>
                    <CardContent>
                        <h3 className="text-lg font-bold mb-4">Customer Purchase Frequency</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={frequencyData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" label>
                                    {frequencyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-6 mt-4">
                            {frequencyData.map((item, idx) => (
                                <div key={idx} className="text-center">
                                    <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                                    <p className="text-sm text-gray-500">{item.name}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Locations */}
                <Card>
                    <CardContent>
                        <h3 className="text-lg font-bold mb-4">Top Customer Locations</h3>
                        {locationData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={locationData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="city" type="category" width={100} tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-gray-500">
                                <div className="text-center">
                                    <MdLocationOn size={48} className="mx-auto text-gray-300 mb-3" />
                                    <p>No location data available</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Customer Behavior Insights */}
            <Card className="mt-6">
                <CardContent>
                    <h3 className="text-lg font-bold mb-4">Customer Behavior Summary</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-4 bg-blue-50 rounded-xl">
                            <h4 className="font-medium text-blue-700 mb-2">Customer Retention</h4>
                            <p className="text-3xl font-bold text-blue-600">
                                {insights.totalCustomers > 0 ? ((insights.returningCustomers / insights.totalCustomers) * 100).toFixed(1) : 0}%
                            </p>
                            <p className="text-sm text-blue-500 mt-1">of customers return</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl">
                            <h4 className="font-medium text-green-700 mb-2">Growth Rate (30d)</h4>
                            <p className="text-3xl font-bold text-green-600">
                                {insights.totalCustomers > 0 ? ((insights.newCustomers / insights.totalCustomers) * 100).toFixed(1) : 0}%
                            </p>
                            <p className="text-sm text-green-500 mt-1">new customer growth</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl">
                            <h4 className="font-medium text-purple-700 mb-2">Loyal Customers</h4>
                            <p className="text-3xl font-bold text-purple-600">
                                {insights.purchaseFrequency?.frequent || 0}
                            </p>
                            <p className="text-sm text-purple-500 mt-1">customers with 5+ orders</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default CustomerInsights;
