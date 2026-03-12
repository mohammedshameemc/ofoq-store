import { useState } from "react";
import {
  AiOutlineArrowDown,
  AiOutlineArrowUp,
  AiOutlineShoppingCart,
  AiOutlineUser,
} from "react-icons/ai";
import { BiPackage, BiTrendingUp } from "react-icons/bi";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("month");

  const stats = [
    {
      title: "Total Revenue",
      value: "₹4,52,890",
      change: "+25.3%",
      trend: "up",
      icon: <BiTrendingUp className="h-6 w-6" />,
    },
    {
      title: "Orders",
      value: "2,341",
      change: "+18.2%",
      trend: "up",
      icon: <AiOutlineShoppingCart className="h-6 w-6" />,
    },
    {
      title: "Products Sold",
      value: "12,834",
      change: "+12.5%",
      trend: "up",
      icon: <BiPackage className="h-6 w-6" />,
    },
    {
      title: "New Customers",
      value: "432",
      change: "-5.2%",
      trend: "down",
      icon: <AiOutlineUser className="h-6 w-6" />,
    },
  ];

  const salesData = [
    { month: "Jan", revenue: 45000, orders: 180 },
    { month: "Feb", revenue: 52000, orders: 210 },
    { month: "Mar", revenue: 48000, orders: 195 },
    { month: "Apr", revenue: 61000, orders: 245 },
    { month: "May", revenue: 55000, orders: 220 },
    { month: "Jun", revenue: 71000, orders: 285 },
  ];

  const topSellingProducts = [
    { name: "Wireless Earbuds", sales: 892, revenue: "₹1,428,800" },
    { name: "Smart Watch", sales: 754, revenue: "₹361,920" },
    { name: "Bluetooth Speaker", sales: 480, revenue: "₹360,000" },
    { name: "4K Monitor", sales: 245, revenue: "₹784,000" },
  ];

  const recentActivity = [
    { action: "New order placed", time: "2 min ago", type: "order" },
    { action: "Product added", time: "15 min ago", type: "product" },
    { action: "Payment received", time: "1 hour ago", type: "payment" },
    { action: "New customer registered", time: "2 hours ago", type: "user" },
    { action: "Order delivered", time: "3 hours ago", type: "order" },
  ];

  const maxRevenue = Math.max(...salesData.map(d => d.revenue));

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-[#2b38d1] px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-sm text-white/70 mt-1">
              Track your business performance and insights
            </p>
          </div>
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="px-4 py-2.5 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none bg-white/10 text-white [&>option]:text-gray-900 [&>option]:bg-white">
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-14">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg shadow-gray-200/60 p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-[#2b38d1]/10 rounded-lg text-[#2b38d1]">
                  {stat.icon}
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {stat.trend === "up" ? (
                    <AiOutlineArrowUp className="h-4 w-4" />
                  ) : (
                    <AiOutlineArrowDown className="h-4 w-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-[#2b38d1] px-6 py-4">
              <h2 className="text-base font-semibold text-white">
                Revenue Overview
              </h2>
              <p className="text-sm text-white/70">
                Monthly revenue and order trends
              </p>
            </div>

            <div className="p-6 space-y-4">
              {salesData.map((data, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {data.month}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">
                        {data.orders} orders
                      </span>
                      <span className="font-semibold text-gray-900">
                        ₹{(data.revenue / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#2b38d1] to-[#8B6F47] h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${(data.revenue / maxRevenue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-[#2b38d1] px-6 py-4">
              <h2 className="text-base font-semibold text-white">
                Top Selling
              </h2>
              <p className="text-sm text-white/70">Best performing products</p>
            </div>

            <div className="p-6 space-y-4">
              {topSellingProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#2b38d1] text-white rounded-lg flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.sales} sales
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {product.revenue}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-[#2b38d1] px-6 py-4">
            <h2 className="text-base font-semibold text-white">
              Recent Activity
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.type === "order"
                      ? "bg-blue-500"
                      : activity.type === "product"
                        ? "bg-green-500"
                        : activity.type === "payment"
                          ? "bg-purple-500"
                          : "bg-orange-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                </div>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
