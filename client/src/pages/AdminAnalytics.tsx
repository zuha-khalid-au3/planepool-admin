import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Plane, MapPin, DollarSign } from "lucide-react";

export default function AdminAnalytics() {
  // Mock data for charts
  const dailyActiveUsers = [
    { date: "May 1", users: 1200 },
    { date: "May 2", users: 1900 },
    { date: "May 3", users: 1600 },
    { date: "May 4", users: 2100 },
    { date: "May 5", users: 2400 },
    { date: "May 6", users: 2800 },
    { date: "May 7", users: 3200 },
  ];

  const rideGroupMetrics = [
    { date: "May 1", groups: 45, revenue: 2400 },
    { date: "May 2", groups: 62, revenue: 2210 },
    { date: "May 3", groups: 58, revenue: 2290 },
    { date: "May 4", groups: 78, revenue: 2000 },
    { date: "May 5", groups: 92, revenue: 2181 },
    { date: "May 6", groups: 105, revenue: 2500 },
    { date: "May 7", groups: 118, revenue: 2100 },
  ];

  const topDestinations = [
    { destination: "City Center", rides: 245, revenue: 12450 },
    { destination: "Railway Station", rides: 198, revenue: 9900 },
    { destination: "Bus Stand", rides: 156, revenue: 7800 },
    { destination: "Hotel District", rides: 134, revenue: 6700 },
    { destination: "Airport Hotel", rides: 98, revenue: 4900 },
  ];

  const keyMetrics = [
    {
      label: "Active Users (7d)",
      value: "12,453",
      change: "+5.2%",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Flights Tracked",
      value: "342",
      change: "+12.1%",
      icon: Plane,
      color: "bg-purple-500",
    },
    {
      label: "Ride Groups Formed",
      value: "1,248",
      change: "+8.3%",
      icon: MapPin,
      color: "bg-green-500",
    },
    {
      label: "Revenue (7d)",
      value: "$45,230",
      change: "+15.6%",
      icon: DollarSign,
      color: "bg-orange-500",
    },
  ];

  return (
    <AdminDashboardLayout currentPage="analytics">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600 mt-2">Real-time platform metrics and insights.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {keyMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">{metric.label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      {metric.value}
                    </p>
                    <p className="text-sm text-green-600 font-medium mt-2">
                      {metric.change}
                    </p>
                  </div>
                  <div className={`${metric.color} p-3 rounded-lg text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Active Users */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Daily Active Users (7 days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyActiveUsers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Ride Groups & Revenue */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Ride Groups & Revenue (7 days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rideGroupMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="groups" fill="#8b5cf6" name="Ride Groups" />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Top Destinations */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Top Destinations</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-900">
                    Destination
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-slate-900">
                    Rides
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-slate-900">
                    Revenue
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-slate-900">
                    Avg Revenue/Ride
                  </th>
                </tr>
              </thead>
              <tbody>
                {topDestinations.map((item, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {item.destination}
                    </td>
                    <td className="text-right py-3 px-4 text-slate-600">
                      {item.rides}
                    </td>
                    <td className="text-right py-3 px-4 text-slate-600">
                      ${item.revenue.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-slate-600">
                      ${Math.round(item.revenue / item.rides)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Conversion Funnel */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Conversion Funnel</h2>
          <div className="space-y-3">
            {[
              { stage: "App Opens", count: 45230, percentage: 100 },
              { stage: "Flight Selected", count: 38920, percentage: 86 },
              { stage: "Destination Selected", count: 32450, percentage: 72 },
              { stage: "Group Joined", count: 24580, percentage: 54 },
              { stage: "Ride Completed", count: 18920, percentage: 42 },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900">
                    {item.stage}
                  </span>
                  <span className="text-sm text-slate-600">
                    {item.count.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
