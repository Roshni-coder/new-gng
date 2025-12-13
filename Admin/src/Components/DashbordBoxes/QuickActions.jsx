import React from 'react';
import { Link } from 'react-router-dom';
import { FiPlusCircle, FiBox, FiUsers } from 'react-icons/fi';
import { MdOutlineCategory } from 'react-icons/md';

const QuickActions = () => {
    const actions = [
        { title: "Add Product", path: "/products", icon: <FiPlusCircle />, color: "bg-indigo-50 text-indigo-600" },
        { title: "Manage Orders", path: "/orders", icon: <FiBox />, color: "bg-emerald-50 text-emerald-600" },
        { title: "Review Sellers", path: "/sellers", icon: <FiUsers />, color: "bg-amber-50 text-amber-600" },
        { title: "Categories", path: "/categorylist", icon: <MdOutlineCategory />, color: "bg-pink-50 text-pink-600" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {actions.map((action, index) => (
                <Link to={action.path} key={index} className="no-underline">
                    <div className="bg-white hover:bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3 cursor-pointer">
                        <div className={`p-3 rounded-lg text-xl ${action.color}`}>
                            {action.icon}
                        </div>
                        <span className="font-semibold text-gray-700 text-sm">{action.title}</span>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default QuickActions;