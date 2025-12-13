import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, Card, CardContent, LinearProgress, TextField } from "@mui/material";
import { MdShowChart, MdDevices, MdPublic, MdTimer } from "react-icons/md";
import { FiRefreshCw, FiDownload, FiMonitor, FiSmartphone, FiTablet } from "react-icons/fi";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';

function TrafficReports() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [traffic, setTraffic] = useState([]);
    const [summary, setSummary] = useState({
        totalPageViews: 0,
        totalVisitors: 0,
        avgBounceRate: 0,
        avgSessionDuration: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/reports/traffic`, { headers: { token: atoken } });
            if (data.success) {
                setTraffic(data.traffic || []);
                setSummary(data.summary || summary);
            }
        } catch (e) {
            console.error("Error fetching traffic data:", e);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}m ${secs}s`;
    };

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    // Prepare chart data
    const chartData = traffic.slice(0, 14).map(t => ({
        date: new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        pageViews: t.pageViews || 0,
        visitors: t.uniqueVisitors || 0
    })).reverse();

    // Aggregate sources and devices
    const sourceData = traffic.length > 0 ? [
        { name: 'Direct', value: traffic.reduce((sum, t) => sum + (t.sources?.direct || 0), 0) },
        { name: 'Organic', value: traffic.reduce((sum, t) => sum + (t.sources?.organic || 0), 0) },
        { name: 'Social', value: traffic.reduce((sum, t) => sum + (t.sources?.social || 0), 0) },
        { name: 'Referral', value: traffic.reduce((sum, t) => sum + (t.sources?.referral || 0), 0) },
        { name: 'Paid', value: traffic.reduce((sum, t) => sum + (t.sources?.paid || 0), 0) }
    ] : [];

    const deviceData = traffic.length > 0 ? [
        { name: 'Desktop', value: traffic.reduce((sum, t) => sum + (t.devices?.desktop || 0), 0), icon: <FiMonitor /> },
        { name: 'Mobile', value: traffic.reduce((sum, t) => sum + (t.devices?.mobile || 0), 0), icon: <FiSmartphone /> },
        { name: 'Tablet', value: traffic.reduce((sum, t) => sum + (t.devices?.tablet || 0), 0), icon: <FiTablet /> }
    ] : [];

    const totalDevices = deviceData.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-cyan-50 text-cyan-600 rounded-lg"><MdShowChart size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Traffic Reports</h2>
                        <p className="text-sm text-gray-500">Monitor website traffic and user engagement.</p>
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
                            <p className="text-blue-100 text-sm">Total Page Views</p>
                            <h3 className="text-3xl font-bold">{summary.totalPageViews.toLocaleString()}</h3>
                        </div>
                        <MdShowChart size={40} className="text-blue-200" />
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Unique Visitors</p>
                            <h3 className="text-3xl font-bold">{summary.totalVisitors.toLocaleString()}</h3>
                        </div>
                        <MdPublic size={40} className="text-green-200" />
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm">Avg Bounce Rate</p>
                            <h3 className="text-3xl font-bold">{summary.avgBounceRate.toFixed(1)}%</h3>
                        </div>
                        <MdDevices size={40} className="text-orange-200" />
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Avg Session</p>
                            <h3 className="text-2xl font-bold">{formatDuration(summary.avgSessionDuration)}</h3>
                        </div>
                        <MdTimer size={40} className="text-purple-200" />
                    </CardContent>
                </Card>
            </div>

            {/* Traffic Trend Chart */}
            <Card className="mb-6">
                <CardContent>
                    <h3 className="text-lg font-bold mb-4">Traffic Trend (Last 14 Days)</h3>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="pageViews" stroke="#3B82F6" fill="#93C5FD" name="Page Views" />
                                <Area type="monotone" dataKey="visitors" stroke="#10B981" fill="#6EE7B7" name="Visitors" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-12 text-gray-500">No traffic data available</div>
                    )}
                </CardContent>
            </Card>

            {/* Sources & Devices Row */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Traffic Sources */}
                <Card>
                    <CardContent>
                        <h3 className="text-lg font-bold mb-4">Traffic Sources</h3>
                        {sourceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie data={sourceData} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label>
                                        {sourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-12 text-gray-500">No source data available</div>
                        )}
                    </CardContent>
                </Card>

                {/* Devices */}
                <Card>
                    <CardContent>
                        <h3 className="text-lg font-bold mb-4">Device Breakdown</h3>
                        <div className="space-y-4">
                            {deviceData.map((device, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-green-500' : 'bg-purple-500'}`}>
                                        {device.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium">{device.name}</span>
                                            <span className="text-gray-600">{device.value.toLocaleString()} ({totalDevices > 0 ? ((device.value / totalDevices) * 100).toFixed(1) : 0}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-green-500' : 'bg-purple-500'}`}
                                                style={{ width: `${totalDevices > 0 ? (device.value / totalDevices) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default TrafficReports;
