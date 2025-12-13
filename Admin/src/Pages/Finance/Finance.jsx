import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import {
  Tabs, Tab, Box, Button, TextField, Chip, Card, CardContent,
  Typography, Skeleton, IconButton, Tooltip, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import {
  MdCheckCircle, MdCancel, MdAttachMoney, MdOutlineReceiptLong,
  MdRefresh, MdVisibility, MdVisibilityOff, MdHistory, MdPendingActions
} from "react-icons/md";
import { toast } from "react-toastify";

// --- Utility Functions ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'delivered':
    case 'approved':
    case 'credit':
      return 'success';
    case 'pending':
    case 'processing':
      return 'warning';
    case 'cancelled':
    case 'returned':
    case 'failed':
    case 'debit':
      return 'error';
    default:
      return 'default';
  }
};

// --- Sub-Components ---

const StatCard = ({ title, value, subtext, icon, gradient }) => (
  <Card className={`relative overflow-hidden text-white shadow-lg border-0 ${gradient}`}>
    <CardContent className="p-6 relative z-10">
      <div className="flex justify-between items-start">
        <div>
          <Typography variant="subtitle2" className="opacity-80 font-medium uppercase tracking-wider">
            {title}
          </Typography>
          <Typography variant="h4" className="font-bold mt-2">
            {value}
          </Typography>
          {subtext && <Typography variant="caption" className="opacity-70 mt-1 block">{subtext}</Typography>}
        </div>
        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
          {icon}
        </div>
      </div>
    </CardContent>
    {/* Decorative Circle */}
    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
  </Card>
);

const StatusBadge = ({ status }) => (
  <Chip
    label={status}
    color={getStatusColor(status)}
    size="small"
    variant="filled" // 'filled' pops more than 'outlined'
    sx={{ fontWeight: 600, textTransform: 'capitalize', minWidth: '80px' }}
  />
);

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
    <MdOutlineReceiptLong size={48} className="mb-3 opacity-20" />
    <p>{message}</p>
  </div>
);

// --- Main Component ---

function Finance() {
  const { atoken, backendurl } = useContext(Admincontext);
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false); // For gateway keys

  // Data States
  const [data, setData] = useState({
    transactions: [],
    payouts: { pending: [], history: [] },
    settlements: [],
    commission: {},
    refunds: [],
    stats: {},
    gateway: { key: "", secret: "" }
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
    fetchData(newValue);
  };

  const fetchData = async (tabIndex) => {
    setLoading(true);
    try {
      const config = { headers: { token: atoken } };
      let endpoint = '';

      switch (tabIndex) {
        case 0: endpoint = '/finance/transactions'; break;
        case 1: endpoint = '/finance/payouts'; break;
        case 2: endpoint = '/finance/settlements'; break;
        case 3: endpoint = '/finance/commissions'; break;
        case 4: endpoint = '/finance/refunds'; break;
        case 6: endpoint = '/finance/stats'; break;
        default: break;
      }

      if (endpoint) {
        const res = await axios.get(`${backendurl}/api/admin${endpoint}`, config);
        if (res.data.success) {
          setData(prev => ({
            ...prev,
            transactions: tabIndex === 0 ? res.data.transactions : prev.transactions,
            payouts: tabIndex === 1 ? { pending: res.data.pending, history: res.data.history } : prev.payouts,
            settlements: tabIndex === 2 ? res.data.settlements : prev.settlements,
            commission: tabIndex === 3 ? res.data : prev.commission,
            refunds: tabIndex === 4 ? res.data.refunds : prev.refunds,
            stats: tabIndex === 6 ? res.data.stats : prev.stats,
          }));
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load financial data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(0);
  }, []);

  const handlePayoutAction = async (id, status) => {
    try {
      const res = await axios.post(`${backendurl}/api/admin/finance/payout-action`,
        { payoutId: id, status },
        { headers: { token: atoken } }
      );
      if (res.data.success) {
        toast.success(`Payout ${status} successfully`);
        fetchData(1);
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  // --- Render Helpers ---

  const renderTable = (headers, rows, renderRow) => (
    <TableContainer component={Paper} elevation={0} className="border border-gray-200 rounded-lg">
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead className="bg-gray-50">
          <TableRow>
            {headers.map((head) => (
              <TableCell key={head} sx={{ fontWeight: 600, color: '#4b5563' }}>{head}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            // Loading Skeleton Rows
            [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {headers.map((_, j) => <TableCell key={j}><Skeleton animation="wave" /></TableCell>)}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={headers.length} align="center">
                <EmptyState message="No records found" />
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => renderRow(row, index))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl text-white shadow-lg shadow-indigo-200">
            <MdAttachMoney size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Hub</h1>
            <p className="text-sm text-gray-500">Overview of earnings, payouts, and settlements</p>
          </div>
        </div>
        <Button 
          variant="outlined" 
          startIcon={<MdRefresh />} 
          onClick={() => fetchData(value)}
          disabled={loading}
          sx={{ borderRadius: '8px', textTransform: 'none' }}
        >
          Refresh Data
        </Button>
      </div>

      {/* Tabs */}
      <Paper elevation={0} className="mb-6 border border-gray-200 rounded-xl overflow-hidden">
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: '60px' },
            backgroundColor: '#fff'
          }}
        >
          <Tab label="Transactions" />
          <Tab label="Vendor Payouts" />
          <Tab label="Settlements" />
          <Tab label="Commissions" />
          <Tab label="Refunds" />
          <Tab label="Gateway" />
          <Tab label="Reports" />
        </Tabs>
      </Paper>

      {/* Content Area */}
      <div className="space-y-6">

        {/* 1. Transactions */}
        {value === 0 && renderTable(
          ['Date', 'Txn ID', 'Entity', 'Type', 'Amount', 'Status'],
          data.transactions,
          (txn, i) => (
            <TableRow key={i} hover>
              <TableCell>{formatDate(txn.date)}</TableCell>
              <TableCell><span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{txn.id.slice(-8).toUpperCase()}</span></TableCell>
              <TableCell>{txn.entity}</TableCell>
              <TableCell>
                <span className={`font-semibold ${txn.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {txn.type}
                </span>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(txn.amount)}</TableCell>
              <TableCell><StatusBadge status={txn.status} /></TableCell>
            </TableRow>
          )
        )}

        {/* 2. Payouts */}
        {value === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Requests Column */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MdPendingActions className="text-orange-500" size={24} />
                <h3 className="font-bold text-gray-800">Pending Requests</h3>
              </div>
              
              {loading ? <Skeleton height={200} variant="rectangular" className="rounded-xl"/> : 
               data.payouts.pending.length === 0 ? (
                <Card variant="outlined" className="bg-gray-50 border-dashed">
                    <CardContent className="text-center py-8 text-gray-400">
                        <MdCheckCircle size={40} className="mx-auto mb-2 opacity-50 text-green-500" />
                        No pending requests
                    </CardContent>
                </Card>
               ) : (
                data.payouts.pending.map((p) => (
                  <Card key={p._id} elevation={3} className="border border-orange-100">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <Typography variant="h6" className="font-bold text-gray-900">{formatCurrency(p.amount)}</Typography>
                          <Typography variant="body2" className="text-gray-600 font-medium">{p.sellerId?.name}</Typography>
                        </div>
                        <Chip label="Pending" color="warning" size="small" />
                      </div>
                      <Typography variant="caption" className="text-gray-400 block mb-4">
                        Requested: {formatDate(p.requestedAt)}
                      </Typography>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="contained" color="success" size="small" onClick={() => handlePayoutAction(p._id, 'Completed')}>Approve</Button>
                        <Button variant="outlined" color="error" size="small" onClick={() => handlePayoutAction(p._id, 'Cancelled')}>Reject</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* History Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <MdHistory className="text-blue-500" size={24} />
                <h3 className="font-bold text-gray-800">Payout History</h3>
              </div>
              {renderTable(
                ['Vendor', 'Amount', 'Processed Date', 'Status'],
                data.payouts.history,
                (h) => (
                  <TableRow key={h._id} hover>
                    <TableCell>{h.sellerId?.name}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(h.amount)}</TableCell>
                    <TableCell>{formatDate(h.processedAt)}</TableCell>
                    <TableCell><StatusBadge status={h.status} /></TableCell>
                  </TableRow>
                )
              )}
            </div>
          </div>
        )}

        {/* 3. Settlements */}
        {value === 2 && (
          <>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6 flex items-center justify-between">
              <div>
                <Typography variant="h6" className="text-blue-900 font-bold">Held Funds (Rolling Reserve)</Typography>
                <Typography variant="body2" className="text-blue-700 mt-1">
                  Revenue from orders delivered in the last 7 days is held to manage returns.
                </Typography>
              </div>
              <div className="text-right">
                <Typography variant="caption" className="text-blue-600 font-bold uppercase">Total Held</Typography>
                <Typography variant="h4" className="text-blue-900 font-bold">
                  {formatCurrency(data.settlements.reduce((sum, s) => sum + s.totalAmount, 0))}
                </Typography>
              </div>
            </div>
            {renderTable(
              ['Order ID', 'Vendor', 'Amount', 'Delivery Date', 'Est. Release'],
              data.settlements,
              (s) => {
                const releaseDate = new Date(s.updatedAt);
                releaseDate.setDate(releaseDate.getDate() + 7);
                return (
                  <TableRow key={s._id}>
                    <TableCell className="font-mono">{s._id.slice(-6)}</TableCell>
                    <TableCell>{s.items[0]?.sellerId?.name || "N/A"}</TableCell>
                    <TableCell>{formatCurrency(s.totalAmount)}</TableCell>
                    <TableCell>{formatDate(s.updatedAt)}</TableCell>
                    <TableCell sx={{ color: '#2563eb', fontWeight: 'bold' }}>
                      {formatDate(releaseDate)}
                    </TableCell>
                  </TableRow>
                );
              }
            )}
          </>
        )}

        {/* 4. Commissions */}
        {value === 3 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
              <StatCard 
                title="Total Platform GMV"
                value={formatCurrency(data.commission.totalGMV || 0)}
                subtext="Gross Merchandise Value"
                icon={<MdOutlineReceiptLong size={32} />}
                gradient="bg-gradient-to-br from-gray-800 to-gray-900"
              />
              <StatCard 
                title="Platform Earnings"
                value={formatCurrency(data.commission.totalCommission || 0)}
                subtext={`Based on ${data.commission.rate || '10%'} fee`}
                icon={<MdAttachMoney size={32} />}
                gradient="bg-gradient-to-br from-emerald-600 to-teal-600"
              />
            </div>
          </div>
        )}

        {/* 5. Refunds */}
        {value === 4 && renderTable(
          ['Order ID', 'Customer', 'Refund Amount', 'Processed Date', 'Status'],
          data.refunds,
          (r) => (
            <TableRow key={r._id}>
              <TableCell className="font-mono">{r._id.slice(-6)}</TableCell>
              <TableCell>{r.user?.name || "Guest"}</TableCell>
              <TableCell className="text-red-600 font-bold">- {formatCurrency(r.totalAmount)}</TableCell>
              <TableCell>{formatDate(r.updatedAt)}</TableCell>
              <TableCell><StatusBadge status={r.status} /></TableCell>
            </TableRow>
          )
        )}

        {/* 6. Gateway Settings */}
        {value === 5 && (
          <div className="max-w-2xl mx-auto">
            <Card variant="outlined" className="border-gray-200">
              <CardContent className="p-8">
                <Typography variant="h6" className="font-bold mb-6">Razorpay API Configuration</Typography>
                <div className="space-y-6">
                  <TextField
                    fullWidth
                    label="Key ID"
                    variant="outlined"
                    type={showSecrets ? "text" : "password"}
                    value={data.gateway.key}
                    onChange={(e) => setData({...data, gateway: { ...data.gateway, key: e.target.value }})}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowSecrets(!showSecrets)} edge="end">
                            {showSecrets ? <MdVisibilityOff /> : <MdVisibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Key Secret"
                    variant="outlined"
                    type={showSecrets ? "text" : "password"}
                    value={data.gateway.secret}
                    onChange={(e) => setData({...data, gateway: { ...data.gateway, secret: e.target.value }})}
                  />
                  <div className="flex justify-between items-center pt-4">
                    <Typography variant="caption" color="error">
                      * Never share these keys with unauthorized personnel.
                    </Typography>
                    <Button variant="contained" onClick={() => toast.success("Keys saved (Mock)")}>
                      Save Configuration
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 7. Reports */}
        {value === 6 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                title="Total Revenue" 
                value={formatCurrency(data.stats.totalRevenue || 0)} 
                icon={<MdAttachMoney size={24}/>}
                gradient="bg-blue-600"
              />
              <StatCard 
                title="Total Payouts" 
                value={formatCurrency(data.stats.totalPayouts || 0)} 
                icon={<MdOutlineReceiptLong size={24}/>}
                gradient="bg-orange-500"
              />
              <StatCard 
                title="Net Profit (Est.)" 
                value={formatCurrency(data.stats.netProfit || 0)} 
                icon={<MdCheckCircle size={24}/>}
                gradient="bg-green-600"
              />
            </div>

            <Card variant="outlined">
              <CardContent className="p-0">
                <div className="p-6 border-b border-gray-100">
                  <Typography variant="h6" className="font-bold">Profit & Loss Statement (YTD)</Typography>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    { label: 'Total Sales Revenue', value: data.stats.totalRevenue, color: 'text-gray-900' },
                    { label: 'Cost of Goods Sold (Vendor Payouts)', value: -(data.stats.totalRevenue * 0.9), color: 'text-red-600' },
                    { label: 'Returns & Refunds', value: 0, color: 'text-red-600' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between p-4 hover:bg-gray-50 transition-colors">
                      <span className="text-gray-600">{item.label}</span>
                      <span className={`font-medium ${item.color}`}>{formatCurrency(item.value || 0)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between p-6 bg-gray-50">
                    <span className="font-bold text-gray-900 text-lg">Net Income</span>
                    <span className="font-bold text-green-600 text-lg">{formatCurrency(data.stats.netProfit || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}

export default Finance;