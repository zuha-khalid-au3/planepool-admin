import { useState } from "react";
import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface Notification {
  id: number;
  title: string;
  content: string;
  notificationType: string;
  targetSegment: string;
  status: string;
  deliveredCount: number;
  failedCount: number;
  scheduledAt: string;
}

export default function AdminNotifications() {
  const [isComposing, setIsComposing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    notificationType: "push",
    targetSegment: "all_users",
    scheduledAt: "",
  });

  const notifications: Notification[] = [
    {
      id: 1,
      title: "New Feature: Offline Mode",
      content: "PlanePool now works without internet while in flight!",
      notificationType: "push",
      targetSegment: "all_users",
      status: "sent",
      deliveredCount: 12453,
      failedCount: 45,
      scheduledAt: "2026-05-08 10:00",
    },
    {
      id: 2,
      title: "Special Offer: 20% Off",
      content: "Get 20% discount on your next ride",
      notificationType: "in_app",
      targetSegment: "verified_users",
      status: "sent",
      deliveredCount: 8920,
      failedCount: 12,
      scheduledAt: "2026-05-07 14:30",
    },
    {
      id: 3,
      title: "Flight Delay Alert",
      content: "Your flight has been delayed by 2 hours",
      notificationType: "push",
      targetSegment: "flight_specific",
      status: "scheduled",
      deliveredCount: 0,
      failedCount: 0,
      scheduledAt: "2026-05-10 18:00",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      sent: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
      scheduled: { bg: "bg-blue-100", text: "text-blue-800", icon: Clock },
      draft: { bg: "bg-gray-100", text: "text-gray-800", icon: AlertCircle },
    };
    const variant = variants[status] || variants.draft;
    const Icon = variant.icon;
    return (
      <Badge className={`${variant.bg} ${variant.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleSendNotification = () => {
    // Handle send logic
    console.log("Sending notification:", formData);
    setIsComposing(false);
    setFormData({
      title: "",
      content: "",
      notificationType: "push",
      targetSegment: "all_users",
      scheduledAt: "",
    });
  };

  return (
    <AdminDashboardLayout currentPage="notifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-600 mt-2">
              Send targeted push notifications and in-app messages.
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsComposing(!isComposing)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Compose Notification
          </Button>
        </div>

        {/* Compose Form */}
        {isComposing && (
          <Card className="p-6 border-2 border-blue-500">
            <h2 className="text-lg font-bold mb-4">Compose Notification</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Title
                </label>
                <Input
                  placeholder="Notification title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Content
                </label>
                <Textarea
                  placeholder="Notification message"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Type
                  </label>
                  <Select
                    value={formData.notificationType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, notificationType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="push">Push Notification</SelectItem>
                      <SelectItem value="in_app">In-App Message</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Target Segment
                  </label>
                  <Select
                    value={formData.targetSegment}
                    onValueChange={(value) =>
                      setFormData({ ...formData, targetSegment: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_users">All Users</SelectItem>
                      <SelectItem value="verified_users">Verified Users</SelectItem>
                      <SelectItem value="flight_specific">Flight Specific</SelectItem>
                      <SelectItem value="destination_based">Destination Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Schedule (Optional)
                </label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledAt: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleSendNotification}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsComposing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-sm text-slate-600">Total Sent</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">24,589</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-slate-600">Scheduled</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">3</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-slate-600">Avg Delivery Rate</p>
            <p className="text-3xl font-bold text-green-600 mt-2">99.8%</p>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-900">
                    Title
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">
                    Target
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-slate-900">
                    Delivered
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-slate-900">
                    Failed
                  </th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notif) => (
                  <tr key={notif.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {notif.title}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {notif.notificationType === "push"
                        ? "Push"
                        : notif.notificationType === "in_app"
                        ? "In-App"
                        : "Email"}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {notif.targetSegment.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(notif.status)}</td>
                    <td className="text-right py-3 px-4 text-slate-600">
                      {notif.deliveredCount.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-red-600">
                      {notif.failedCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
