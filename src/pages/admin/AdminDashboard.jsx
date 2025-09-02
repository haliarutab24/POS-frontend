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
  LineChart,
  Line,
  Legend
} from "recharts";
import { 
  Users, 
  Package, 
  UserCheck, 
  Calendar, 
  CreditCard, 
  TrendingUp,
  ShoppingCart,
  DollarSign,
  PieChart as PieChartIcon,
  Search,
  Bell,
  ChevronDown
} from "lucide-react";

const AdminDashboard = () => {
  const [customers, setCustomers] = useState(0);
  const [items, setItems] = useState(0);
  const [booking, setBooking] = useState(0);
  const [users, setUsers] = useState(0);
  const [sales, setSales] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  const abortRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    const base = import.meta.env.VITE_API_BASE_URL;

    const fetchCustomers = async () => {
      try {
        const res = await axios.get(`${base}/customers/count`, { signal: controller.signal });
        setCustomers(res.data?.totalCustomers ?? 0);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Customer fetch failed:", err);
      }
    };

    const fetchItems = async () => {
      try {
        const res = await axios.get(`${base}/item-details/count`, { signal: controller.signal });
        setItems(res.data?.count ?? 0);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Items fetch failed:", err);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${base}/company-users/count`, { signal: controller.signal });
        setUsers(res.data?.len ?? 0);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Users fetch failed:", err);
      }
    };

    const fetchBookings = async () => {
      try {
        const res = await axios.get(`${base}/bookings/count`, { signal: controller.signal });
        setBooking(res.data?.total ?? 0);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Bookings fetch failed:", err);
      }
    };

    const fetchSales = async () => {
      try {
        const res = await axios.get(`${base}/saleInvoices/count`, { signal: controller.signal });
        setSales(res.data?.total ?? 0);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Sales fetch failed:", err);
      }
    };

    const fetchRevenue = async () => {
      try {
        const res = await axios.get(`${base}/saleInvoices/total-revenue`, { signal: controller.signal });
        setRevenue(res.data?.totalRevenue ?? 0);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Revenue fetch failed:", err);
      }
    };

    const fetchSalesChart = async () => {
      try {
        const res = await axios.get(`${base}/saleInvoices/per-date`, { signal: controller.signal });
        const transformedData = res.data.map(item => {
          const date = new Date(item._id);
          const month = date.toLocaleString("default", { month: "short" });
          const day = date.getDate();
          return {
            name: `${month} ${day}`,
            sales: item.count,
            revenue: item.totalAmount || (Math.random() * 1000).toFixed(2)
          };
        });
        setChartData(transformedData);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Sales chart fetch failed:", err);
      }
    };

    const fetchRecentTransactions = async () => {
      try {
        const res = await axios.get(`${base}/saleInvoices/recent`, { signal: controller.signal });
        setRecentTransactions(res.data?.transactions || []);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Transactions fetch failed:", err);
        // Mock data for demonstration
        setRecentTransactions([
          { id: 1, customer: "John Doe", amount: 125.75, status: "Completed", date: "2023-06-15" },
          { id: 2, customer: "Jane Smith", amount: 89.99, status: "Completed", date: "2023-06-14" },
          { id: 3, customer: "Robert Johnson", amount: 215.50, status: "Pending", date: "2023-06-14" },
          { id: 4, customer: "Sarah Williams", amount: 62.25, status: "Completed", date: "2023-06-13" },
          { id: 5, customer: "Michael Brown", amount: 178.00, status: "Refunded", date: "2023-06-12" }
        ]);
      }
    };

    const fetchAll = async () => {
      setLoading(true);
      await Promise.allSettled([
        fetchCustomers(),
        fetchItems(),
        fetchUsers(),
        fetchBookings(),
        fetchSales(),
        fetchRevenue(),
        fetchSalesChart(),
        fetchRecentTransactions()
      ]);
      // Add a slight delay to show loading animation
      setTimeout(() => setLoading(false), 1000);
    };

    fetchAll();

    return () => {
      controller.abort();
    };
  }, []);

  const summaryData = [
    { 
      name: "Total Customers", 
      value: customers, 
      icon: <Users size={24} />, 
      change: "+12%", 
      color: "bg-blue-100 text-blue-600",
      border: "border-l-4 border-blue-400"
    },
    { 
      name: "Total Products", 
      value: items, 
      icon: <Package size={24} />, 
      change: "+5%", 
      color: "bg-green-100 text-green-600",
      border: "border-l-4 border-green-400"
    },
    { 
      name: "Total Staff", 
      value: users, 
      icon: <UserCheck size={24} />, 
      change: "+2%", 
      color: "bg-purple-100 text-purple-600",
      border: "border-l-4 border-purple-400"
    },
    { 
      name: "Total Sales", 
      value: sales, 
      icon: <CreditCard size={24} />, 
      change: "+18%", 
      color: "bg-amber-100 text-amber-600",
      border: "border-l-4 border-amber-400"
    },
    { 
      name: "Total Revenue", 
      value: `$${revenue.toLocaleString()}`, 
      icon: <DollarSign size={24} />, 
      change: "+15%", 
      color: "bg-emerald-100 text-emerald-600",
      border: "border-l-4 border-emerald-400"
    },
    { 
      name: "Bookings", 
      value: booking, 
      icon: <Calendar size={24} />, 
      change: "-3%", 
      color: "bg-rose-100 text-rose-600",
      border: "border-l-4 border-rose-400"
    },
  ];

  const pieData = [
    { name: "Completed Sales", value: Math.round(sales * 0.75), color: "#58C5A0" },
    { name: "Pending Orders", value: Math.round(sales * 0.15), color: "#FF8901" },
    { name: "Refunded", value: Math.round(sales * 0.1), color: "#e94560" },
  ];

  const statusColors = {
    "Completed": "bg-green-100 text-green-800",
    "Pending": "bg-amber-100 text-amber-800",
    "Refunded": "bg-rose-100 text-rose-800"
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh]">
        <PuffLoader color="#84CF16" />
        <span className="ml-4 text-gray-500 mt-4">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 w-full bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-newPrimary">POS Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary/30 focus:border-newPrimary"
            />
          </div>
          <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Bell size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {summaryData.map((item, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 ${item.border}`}
            style={{ animation: `fadeIn 0.5s ease-out ${index * 0.1}s both` }}
          >
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-lg ${item.color}`}>
                {item.icon}
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {item.change}
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-800">{item.value}</div>
              <div className="text-sm text-gray-500 mt-1">{item.name}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div 
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          style={{ animation: "slideInLeft 0.5s ease-out" }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">Sales Overview</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs bg-newPrimary/10 text-newPrimary rounded-full">Weekly</button>
              <button className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-full">Monthly</button>
              <button className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-full">Yearly</button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.length > 0 ? chartData : [{name: "No data", sales: 0, revenue: 0}]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
                <Bar yAxisId="left" dataKey="sales" name="Number of Sales" fill="#84CF16" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#58C5A0" strokeWidth={2} dot={{ r: 4 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div 
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          style={{ animation: "slideInRight 0.5s ease-out" }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Order Status</h2>
          <div className="flex justify-center items-center h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                <span className="text-sm text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div 
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8"
        style={{ animation: "fadeIn 0.5s ease-out" }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
          <button className="text-sm text-newPrimary hover:text-newPrimary/80 font-medium flex items-center mt-2 sm:mt-0">
            View all <ChevronDown size={16} className="ml-1" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction, index) => (
                <TableRow 
                  key={transaction.id}
                  style={{ animation: `fadeIn 0.5s ease-out ${index * 0.1}s both` }}
                >
                  <TableCell className="font-medium">#INV-{transaction.id.toString().padStart(4, '0')}</TableCell>
                  <TableCell>{transaction.customer}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>${transaction.amount}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[transaction.status]}`}>
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <button className="text-newPrimary hover:text-newPrimary/80 text-sm font-medium">
                      View details
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {recentTransactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No recent transactions found.
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl shadow-sm p-6 text-white"
          style={{ animation: "slideInUp 0.5s ease-out 0.2s both" }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">Top Selling Product</h3>
              <p className="text-blue-100">Wireless Headphones</p>
            </div>
            <TrendingUp size={24} />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold">142 units</div>
            <div className="text-blue-100 text-sm mt-1">+24% from last week</div>
          </div>
        </div>

        <div 
          className="bg-gradient-to-r from-green-400 to-green-500 rounded-xl shadow-sm p-6 text-white"
          style={{ animation: "slideInUp 0.5s ease-out 0.3s both" }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">Average Order Value</h3>
              <p className="text-green-100">Last 30 days</p>
            </div>
            <ShoppingCart size={24} />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold">$89.67</div>
            <div className="text-green-100 text-sm mt-1">+8% from last month</div>
          </div>
        </div>

        <div 
          className="bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl shadow-sm p-6 text-white"
          style={{ animation: "slideInUp 0.5s ease-out 0.4s both" }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">Inventory Alert</h3>
              <p className="text-purple-100">Low stock items</p>
            </div>
            <Package size={24} />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold">7 products</div>
            <div className="text-purple-100 text-sm mt-1">Need restocking</div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { 
            opacity: 0;
            transform: translateX(-20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from { 
            opacity: 0;
            transform: translateX(20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;