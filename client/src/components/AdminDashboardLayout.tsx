import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BarChart3,
  Users,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Lock,
  Sparkles,
} from "lucide-react";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

export default function AdminDashboardLayout({
  children,
  currentPage = "dashboard",
}: AdminDashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/admin" },
    { id: "users", label: "Users", icon: Users, href: "/admin/users" },
    { id: "kyc", label: "KYC Verification", icon: Lock, href: "/admin/kyc" },
    { id: "security", label: "Security", icon: Shield, href: "/admin/security" },
    { id: "cms", label: "CMS", icon: FileText, href: "/admin/cms" },
    { id: "partners", label: "B2B Partners", icon: TrendingUp, href: "/admin/partners" },
    { id: "notifications", label: "Notifications", icon: MessageSquare, href: "/admin/notifications" },
    { id: "analytics", label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
    { id: "llm", label: "AI Assistant", icon: Sparkles, href: "/admin/llm" },
  ];

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">
              PP
            </div>
            {sidebarOpen && <span className="font-bold text-lg">PlanePool</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setLocation(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
                title={!sidebarOpen ? item.label : ""}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-700 space-y-3">
          {sidebarOpen && (
            <div className="px-4 py-2 bg-slate-800 rounded-lg">
              <p className="text-xs text-slate-400">Logged in as</p>
              <p className="text-sm font-medium text-white truncate">{user?.name || user?.email}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="ml-2">Logout</span>}
          </Button>
        </div>

        {/* Toggle Sidebar */}
        <div className="p-4 border-t border-slate-700">
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            variant="ghost"
            size="sm"
            className="w-full text-slate-300 hover:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            {menuItems.find((item) => item.id === currentPage)?.label || "Admin Panel"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
