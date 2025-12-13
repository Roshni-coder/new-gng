import React from 'react';
import { LuStore, LuUsers } from "react-icons/lu";

const UserStats = ({ stats }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-full flex flex-col justify-between">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Platform Activity</h3>
      
      {/* Sellers Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl">
            <LuStore />
        </div>
        <div className="flex-1">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">Active Sellers</span>
                <span className="text-sm font-bold text-gray-800">{stats.activeSellers || 0}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${(stats.activeSellers / (stats.totalSellers || 1)) * 100}%` }}
                ></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">{stats.pendingSellers || 0} Pending Approval</p>
        </div>
      </div>

      {/* Users Section */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
            <LuUsers />
        </div>
        <div className="flex-1">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">Total Users</span>
                <span className="text-sm font-bold text-gray-800">{stats.totalUsers || 0}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
             <p className="text-xs text-gray-400 mt-1">Acquisition stable</p>
        </div>
      </div>
    </div>
  );
};

export default UserStats;