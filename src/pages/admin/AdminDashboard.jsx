import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";
import { PuffLoader } from "react-spinners";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const [recentProducts, setRecentProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [allProductsRes, recentProductsRes, usersRes, transactionsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/products`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/products?limit=5&sort=desc`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/users`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/transactions`),
        ]);

        setAllProducts(allProductsRes.data.data);
        setRecentProducts(recentProductsRes.data.data);
        setUsers(usersRes.data.data);
        setTransactions(transactionsRes.data.data);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Sample data for charts
  const summaryData = [
    { name: "Customers", value: 32 },
    { name: "Products", value: 9 },
    { name: "Staff", value: 15 },
  ];

  const pieData = [
    { name: "Success Rate", value: 81, color: "#ef4444" },
    { name: "Pending Calls", value: 22, color: "#10b981" },
    { name: "Follow Ups", value: 62, color: "#3b82f6" },
  ];

  const callData = [
    { name: "Jan", calls: 20 },
    { name: "Feb", calls: 35 },
    { name: "Mar", calls: 50 },
    { name: "Apr", calls: 45 },
    { name: "May", calls: 60 },
    { name: "Jun", calls: 70 },
    { name: "Jul", calls: 80 },
    { name: "Aug", calls: 100 },
    { name: "Sep", calls: 90 },
    { name: "Oct", calls: 75 },
    { name: "Nov", calls: 65 },
    { name: "Dec", calls: 55 },
  ];

  const dayData = [
    { name: "Sun", calls: 15 },
    { name: "Mon", calls: 22 },
    { name: "Tue", calls: 18 },
    { name: "Wed", calls: 25 },
    { name: "Thu", calls: 20 },
    { name: "Fri", calls: 30 },
    { name: "Sat", calls: 12 },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <PuffLoader color="#00c7fc" />
      </div>
    );
  }

  return (
    <div className="p-6 w-full bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Call Logs Dashboard</h1>
        <div className="flex items-center">
          <div className="text-sm text-gray-600 mr-4">
            Hi, Admin. Welcome back to Amir Hameed Admin!
          </div>
          <div className="relative">
            {/* <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
              21
            </span> */}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {summaryData.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 flex items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
              {index === 0 && <span className="text-2xl">👤</span>}
              {index === 1 && <span className="text-2xl">🛒</span>}
              {index === 2 && <span className="text-2xl">📄</span>}
            </div>
            <div className="select-none">
              <div className="text-3xl font-bold text-gray-800">{item.value}</div>
              <div className="text-gray-500">{item.name}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Summary Charts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 select-none">Summary</h2>
          <div className="flex justify-center items-center space-x-6">
            {pieData.map((entry, index) => (
              <div key={index} className="text-center select-none">
                <PieChart width={150} height={150}>
                  <Pie
                    data={[{ value: entry.value }, { value: 100 - entry.value }]}
                    cx={75}
                    cy={75}
                    innerRadius={40}
                    outerRadius={60}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    <Cell key={`cell-${index}`} fill={entry.color} />
                    <Cell key={`cell-bg-${index}`} fill="#e0e0e0" />
                  </Pie>
                </PieChart>
                <div className="text-xl font-bold mt-2" style={{ color: entry.color }}>
                  {entry.value}%
                </div>
                <div className="text-gray-500">{entry.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Order */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 select-none">Chart Order</h2>
          <p className="text-gray-600 select-none">
            Lorem ipsum dolor sit amet, consectetur adip.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calls" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2 select-none">
            {dayData.map((item) => (
              <span key={item.name}>{item.name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Total Calls and Follow up Meetings side by side */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Total Calls */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 select-none">Total Calls</h2>
          <div className="text-3xl font-bold text-gray-800 mb-4 select-none">100</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={callData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calls" fill="#ef4444" />
                <Bar dataKey="calls" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Follow up Meetings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 select-none">Follow up Meetings</h2>
          <div className="text-sm text-gray-500 mb-4 select-none">December 2, 2021</div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
              <div key={day} className="font-medium text-gray-500 select-none">
                {day}
              </div>
            ))}
            {[29, 30, 1, 2, 3, 4, 5].map((date) => (
              <div
                key={`row1-${date}`}
                className={`p-2 rounded-full ${[2, 15, 25].includes(date) ? "bg-blue-100 text-blue-600" : ""} select-none`}
              >
                {date}
              </div>
            ))}
            {[6, 7, 8, 9, 10, 11, 12].map((date) => (
              <div
                key={`row2-${date}`}
                className={`p-2 rounded-full ${[2, 15, 25].includes(date) ? "bg-blue-100 text-blue-600" : ""} select-none`}
              >
                {date}
              </div>
            ))}
            {[13, 14, 15, 16, 17, 18, 19].map((date) => (
              <div
                key={`row3-${date}`}
                className={`p-2 rounded-full ${[2, 15, 25].includes(date) ? "bg-blue-100 text-blue-600" : ""} select-none`}
              >
                {date}
              </div>
            ))}
            {[20, 21, 22, 23, 24, 25, 26].map((date) => (
              <div
                key={`row4-${date}`}
                className={`p-2 rounded-full ${[2, 15, 25].includes(date) ? "bg-blue-100 text-blue-600" : ""} select-none`}
              >
                {date}
              </div>
            ))}
            {[27, 28, 29, 30, 31, 1, 2].map((date) => (
              <div
                key={`row5-${date}`}
                className={`p-2 rounded-full ${[2, 15, 25].includes(date) ? "bg-blue-100 text-blue-600" : ""} select-none`}
              >
                {date}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;