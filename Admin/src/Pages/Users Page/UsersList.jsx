import React, { useState, useEffect } from "react";
import { FaUnlock, FaBan, FaCheckCircle, FaUserCircle, FaSearch, FaEnvelope, FaPhone } from "react-icons/fa";
import { toast } from 'react-toastify';
import axios from 'axios';
import { CircularProgress } from "@mui/material";

const API_URL = import.meta.env.VITE_BACKEND_URL;

function UsersList({ type }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Determine filtering based on prop 'type'
  const isBlockedPage = type === 'blocked';
  const pageTitle = isBlockedPage ? "Blocked Users" : "Registered Customers";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("atoken"); // Using Admin Token
      // Adjust endpoint if needed (e.g., /api/admin/users)
      const response = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}`, token: token }, // sending both for compatibility
      });

      if (response.data.success) {
        let fetchedUsers = response.data.users || [];
        
        // Filter client-side based on the route type
        if (isBlockedPage) {
            fetchedUsers = fetchedUsers.filter(u => u.isBlocked === true);
        }
        
        setUsers(fetchedUsers);
      } else {
        toast.error("Failed to fetch users.");
      }
    } catch (err) {
      console.error("Fetch Users Error:", err);
      // Fallback for demo purposes if API fails
      setUsers([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [type]);

  const handleToggleBlock = async (userId, currentStatus) => {
    const action = currentStatus ? "Unblock" : "Block";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const token = localStorage.getItem("atoken");
      const response = await axios.put(
        `${API_URL}/api/admin/toggle-user-block/${userId}`, 
        {},
        { headers: { Authorization: `Bearer ${token}`, token: token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Refresh list
        fetchUsers();
      } else {
        toast.error("Action failed");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  // Search Filter
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user._id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden my-4">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
             <div className="p-2 bg-white/20 rounded-lg">
                {isBlockedPage ? <FaBan className="text-xl"/> : <FaUserCircle className="text-xl"/>}
             </div>
             <div>
                 <h2 className="text-xl font-bold">{pageTitle}</h2>
                 <p className="text-xs text-cyan-100">Manage your user database</p>
             </div>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-1/3">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search ID, Name or Email..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-700 focus:outline-none shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b">
                <tr>
                    <th className="px-6 py-4">User Identity</th>
                    <th className="px-6 py-4">User ID</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                    <tr><td colSpan="5" className="py-10 text-center"><CircularProgress /></td></tr>
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-blue-50/50 transition-colors">
                            {/* Identity */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                        {user.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{user.name}</p>
                                        <p className="text-xs text-gray-400">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </td>
                            
                            {/* User ID */}
                            <td className="px-6 py-4">
                                <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200 select-all">
                                    {user._id}
                                </span>
                            </td>

                            {/* Contact */}
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FaEnvelope className="text-xs text-gray-400"/> {user.email}
                                    </div>
                                    {user.phone && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <FaPhone className="text-xs text-gray-400"/> {user.phone}
                                        </div>
                                    )}
                                </div>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                                    user.isBlocked 
                                    ? "bg-red-50 text-red-600 border border-red-100" 
                                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                }`}>
                                    {user.isBlocked ? <FaBan size={10}/> : <FaCheckCircle size={10}/>}
                                    {user.isBlocked ? "Blocked" : "Active"}
                                </span>
                            </td>

                            {/* Action */}
                            <td className="px-6 py-4 text-center">
                                <button 
                                    onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm text-white ${
                                        user.isBlocked 
                                        ? "bg-emerald-500 hover:bg-emerald-600" 
                                        : "bg-red-500 hover:bg-red-600"
                                    }`}
                                >
                                    {user.isBlocked ? "Unblock User" : "Block Access"}
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan="5" className="py-10 text-center text-gray-400">No users found matching your search.</td></tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersList;