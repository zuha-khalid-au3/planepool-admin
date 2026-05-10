import { useAuth } from "@/_core/hooks/useAuth";
import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  AlertTriangle,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useLocation } from "wouter";

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <AdminDashboardLayout currentPage="dashboard">
        <div className="flex items-center justify-center h-96">
          <p className="text-slate-600">Loading...</p>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <AdminDashboardLayout currentPage="dashboard">
        <div className="flex items-center justify-center h-96">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-600 mb-4">You do not have permission to access the admin panel.</p>
            <Button onClick={() => setLocation("/")} variant="default">
              Return Home
            </Button>
          </Card>
        </div>
      </AdminDashboardLayout>
    );
  }

  const stats: StatCard[] = [
    {
      label: "Total Users",
      value: "12,453",
      icon: <Users className="w-6 h-6" />,
      trend: "+5.2% this month",
      color: "bg-blue-500",
    },
    {
      label: "Pending KYC",
      value: "342",
      icon: <FileText className="w-6 h-6" />,
      trend: "Requires review",
      color: "bg-yellow-500",
    },
    {
      label: "Active Incidents",
      value: "18",
      icon: <AlertTriangle className="w-6 h-6" />,
      trend: "2 critical",
      color: "bg-red-500",
    },
    {
      label: "Revenue (30d)",
      value: "$45,230",
      icon: <TrendingUp className="w-6 h-6" />,
      trend: "+12.5% vs last month",
      color: "bg-green-500",
    },
  ];

  return (
    <AdminDashboardLayout currentPage="dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name || "Admin"}!</h1>
          <p className="text-blue-100">
            Here's your platform overview. Monitor key metrics and manage your operations efficiently.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-2">{stat.trend}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-white`}>{stat.icon}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { action: "User banned", user: "john_doe", time: "2 hours ago", icon: XCircle },
                { action: "KYC approved", user: "jane_smith", time: "4 hours ago", icon: CheckCircle },
                { action: "Incident resolved", user: "support_team", time: "6 hours ago", icon: CheckCircle },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center gap-3 pb-3 border-b border-slate-200 last:border-0">
                    <Icon className="w-5 h-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.action}</p>
                      <p className="text-xs text-slate-500">{item.user}</p>
                    </div>
                    <p className="text-xs text-slate-500">{item.time}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Quick Links */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setLocation("/admin/kyc")}
                variant="outline"
                className="justify-start"
              >
                <FileText className="w-4 h-4 mr-2" />
                Review KYC
              </Button>
              <Button
                onClick={() => setLocation("/admin/security")}
                variant="outline"
                className="justify-start"
              >
                <Shield className="w-4 h-4 mr-2" />
                Security
              </Button>
              <Button
                onClick={() => setLocation("/admin/users")}
                variant="outline"
                className="justify-start"
              >
                <Users className="w-4 h-4 mr-2" />
                Users
              </Button>
              <Button
                onClick={() => setLocation("/admin/analytics")}
                variant="outline"
                className="justify-start"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </div>
          </Card>
        </div>

        {/* System Status */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "API Server", status: "operational", uptime: "99.9%" },
              { name: "Database", status: "operational", uptime: "99.95%" },
              { name: "File Storage", status: "operational", uptime: "99.8%" },
            ].map((system, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-900">{system.name}</p>
                  <p className="text-xs text-slate-500">Uptime: {system.uptime}</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
