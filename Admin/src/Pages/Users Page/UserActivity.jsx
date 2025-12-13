import React, { useEffect, useState, useContext } from 'react';
import { LuActivity, LuRefreshCw } from "react-icons/lu";
import axios from 'axios';
import { Admincontext } from '../../Components/context/admincontext'; // Correct import based on your file structure
import { CircularProgress } from '@mui/material';

function UserActivity() {
  const { backendurl, atoken } = useContext(Admincontext);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to calculate "Time Ago"
  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendurl}/api/admin/user-activity`, {
        headers: { Authorization: `Bearer ${atoken}`, token: atoken }
      });

      if (data.success) {
        setActivities(data.activities);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (atoken) {
        fetchActivities();
    }
  }, [atoken, backendurl]);

  const getColor = (type) => {
    switch(type) {
      case 'error': return 'bg-red-50 text-red-600 border-red-100';
      case 'success': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'warning': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 my-6 max-w-5xl mx-auto min-h-[500px]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
            <LuActivity size={24} />
          </div>
          <div>
              <h2 className="text-2xl font-bold text-gray-800">User Activity Log</h2>
              <p className="text-sm text-gray-500">Real-time monitoring of platform actions</p>
          </div>
        </div>
        <button 
            onClick={fetchActivities} 
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
            title="Refresh Logs"
        >
            <LuRefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
            <div className="flex justify-center py-20">
                <CircularProgress size={30} />
            </div>
        ) : activities.length > 0 ? (
            activities.map((act) => (
            <div key={act._id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md hover:border-indigo-100 transition-all bg-white">
                <div className="flex items-start gap-4">
                {/* Status Dot */}
                <div className="mt-1.5">
                    <span className={`block w-2.5 h-2.5 rounded-full ${
                        act.type === 'error' ? 'bg-red-500 shadow-red-200 shadow-sm' : 
                        act.type === 'success' ? 'bg-emerald-500 shadow-emerald-200 shadow-sm' : 
                        act.type === 'warning' ? 'bg-amber-500 shadow-amber-200 shadow-sm' : 
                        'bg-blue-500 shadow-blue-200 shadow-sm'
                    }`}></span>
                </div>
                
                <div>
                    <p className="text-sm font-medium text-gray-800">
                        <span className="font-bold text-indigo-900">{act.user}</span> 
                        <span className="text-gray-400 mx-2 text-xs uppercase tracking-wider font-bold border px-1 rounded">{act.role}</span>
                        <span className="text-gray-600">{act.action}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {new Date(act.createdAt).toLocaleString()} 
                        {act.ip && <span className="ml-2 border-l pl-2 text-gray-300">IP: {act.ip}</span>}
                    </p>
                </div>
                </div>
                
                <div className="ml-6 sm:ml-0 mt-2 sm:mt-0">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getColor(act.type)}`}>
                        {timeAgo(act.createdAt)}
                    </span>
                </div>
            </div>
            ))
        ) : (
            <div className="text-center py-20 text-gray-400">
                <p>No activity logs found.</p>
            </div>
        )}
      </div>
    </div>
  );
}

export default UserActivity;