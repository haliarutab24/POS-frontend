import React, { useEffect, useState, useRef } from "react";
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
  const [customers, setCustomers] = useState(0);
  const [items, setItems] = useState(0);
  const [booking, setBooking] = useState(0);
  const [users, setUsers] = useState(0);
  const [sales, setSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chart, setCharts] = useState([]);

  const abortRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    const base = import.meta.env.VITE_API_BASE_URL;
    console.log("API Base URL:", base);

    const fetchCustomers = async () => {
      try {
        const res = await axios.get(`${base}/customers/count`, { signal: controller.signal });
        console.log("Customer Response:", res.data);
        setCustomers(res.data?.totalCustomers ?? 0);
      } catch (err) {
        if (axios.isCancel(err)) console.log("Customer fetch cancelled");
        else console.error("Customer fetch failed:", err);
      }
    };

    const fetchItems = async () => {
      try {
        const res = await axios.get(`${base}/item-details/count`, { signal: controller.signal });
        console.log("Items Response:", res.data);
        setItems(res.data?.count ?? 0);
      } catch (err) {
        if (axios.isCancel(err)) console.log("Items fetch cancelled");
        else console.error("Items fetch failed:", err);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${base}/company-users/count`, { signal: controller.signal });
        console.log("Users Response:", res.data);
        setUsers(res.data?.len ?? 0);
      } catch (err) {
        if (axios.isCancel(err)) console.log("Users fetch cancelled");
        else console.error("Users fetch failed:", err);
      }
    };

    const fetchBookings = async () => {
      try {
        const res = await axios.get(`${base}/bookings/count`, { signal: controller.signal });
        console.log("Users Response:", res.data);
        setBooking(res.data?.total ?? 0);
      } catch (err) {
        if (axios.isCancel(err)) console.log("Users fetch cancelled");
        else console.error("Users fetch failed:", err);
      }
    };
    const fetchSales = async () => {
      try {
        const res = await axios.get(`${base}/saleInvoices/count`, { signal: controller.signal });
        console.log("Users Response:", res.data);
        setSales(res.data?.total ?? 0);
      } catch (err) {
        if (axios.isCancel(err)) console.log("Users fetch cancelled");
        else console.error("Users fetch failed:", err);
      }
    };

    const fetchSalesChart = async () => {
      try {
        const res = await axios.get(`${base}/saleInvoices/per-date`, { signal: controller.signal });
        console.log("API Response:", res.data); // [{ _id: "2025-08-18", count: 2 }, ...]

        // Transform API data to chart format
        const transformedData = res.data.map(item => {
          const date = new Date(item._id);
          const month = date.toLocaleString("default", { month: "short" }); // Jan, Feb, ...
          const day = date.toLocaleString("default", { weekday: "short" }); // Sun, Mon, ...

          return {
            name: month, // or day if you want day chart
            calls: item.count
          };
        });

        setChartData(transformedData);
      } catch (err) {
        if (axios.isCancel(err)) console.log("Fetch cancelled");
        else console.error("Fetch failed:", err);
      }
    };


    const fetchAll = async () => {
      setLoading(true);
      await fetchCustomers();
      await fetchItems();
      await fetchUsers();
      await fetchBookings();
      await fetchSales()
      await fetchSalesChart()
      setLoading(false);
    };

    fetchAll();

    return () => {
      console.log("Aborting all fetches...");
      controller.abort();
    };
  }, []);





  const summaryData = [
    { name: "Total Customers", value: customers ?? 0 },
    { name: "Total Items", value: items ?? 0 },
    { name: "Total Staff", value: users ?? 0 },
  ];

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <span className="text-gray-500">Loading…</span>
      </div>
    );
  }

  const pieData = [
    { name: "Success Booking", value: booking, color: "#10b981" },
    { name: "Total Items", value: items, color: "#FFA500" },
    { name: "Total Sales", value: sales, color: "#3b82f6" },
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
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
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
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4 bg-newPrimary/15">
              {index === 0 && <span className="text-2xl ">👤</span>}
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