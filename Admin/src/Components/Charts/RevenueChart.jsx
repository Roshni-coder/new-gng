import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RevenueChart = ({ monthlyData }) => {
  // Map backend data (month numbers) to labels
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Create empty arrays filled with 0
  const dataPoints = Array(12).fill(0);
  
  // Fill data if available
  if (monthlyData) {
     monthlyData.forEach(item => {
        // item._id is 1-12, array index is 0-11
        if(item._id) dataPoints[item._id - 1] = item.total;
     });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end' },
      title: { display: false },
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: { color: '#f3f4f6' },
            ticks: { callback: (value) => '₹' + value }
        },
        x: {
            grid: { display: false }
        }
    }
  };

  const data = {
    labels: monthNames,
    datasets: [
      {
        label: 'Monthly Revenue',
        data: dataPoints,
        borderColor: '#4f46e5', // Indigo-600
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4, // Smooth curve
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#4f46e5',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-[400px]">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Revenue Analytics</h3>
            <select className="bg-gray-50 border border-gray-200 text-xs rounded-lg px-2 py-1 outline-none text-gray-600">
                <option>This Year</option>
            </select>
        </div>
        <div className="h-[300px] w-full">
             <Line options={options} data={data} />
        </div>
    </div>
  );
};

export default RevenueChart;