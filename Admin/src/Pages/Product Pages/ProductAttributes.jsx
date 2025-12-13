import React, { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const ProductAttributes = () => {
    // This would typically fetch from backend: /api/attributes
    const [attributes, setAttributes] = useState([
        { id: 1, name: "Size", values: ["S", "M", "L", "XL"] },
        { id: 2, name: "Color", values: ["Red", "Blue", "Black"] },
        { id: 3, name: "Flavor", values: ["Chocolate", "Vanilla"] }
    ]);

    const [newAttr, setNewAttr] = useState("");

    const addAttribute = () => {
        if(!newAttr) return;
        setAttributes([...attributes, { id: Date.now(), name: newAttr, values: [] }]);
        setNewAttr("");
    }

    return (
        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 mt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Attributes</h2>
            
            {/* Add New Attribute */}
            <div className="flex gap-4 mb-8 bg-gray-50 p-4 rounded-lg">
                <input 
                    type="text" 
                    placeholder="e.g. Material, Occasion..." 
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newAttr}
                    onChange={(e) => setNewAttr(e.target.value)}
                />
                <button 
                    onClick={addAttribute}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-indigo-700 flex items-center gap-2"
                >
                    <FiPlus /> Add Attribute
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {attributes.map((attr) => (
                    <div key={attr.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-lg text-gray-700">{attr.name}</h3>
                            <button className="text-red-400 hover:text-red-600"><FiTrash2 /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {attr.values.map((val, idx) => (
                                <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100">
                                    {val}
                                </span>
                            ))}
                            <button className="text-xs text-gray-500 border border-dashed border-gray-300 rounded-full px-3 py-1 hover:border-gray-500">
                                + Add Value
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductAttributes;