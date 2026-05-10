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
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";

interface CmsItem {
  id: number;
  contentType: string;
  key: string;
  title: string;
  isActive: boolean;
  updatedAt: string;
}

export default function AdminCMS() {
  const [contentType, setContentType] = useState("destination");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    key: "",
  });

  const cmsItems: CmsItem[] = [
    {
      id: 1,
      contentType: "destination",
      key: "delhi_airport",
      title: "Delhi Airport - City Center",
      isActive: true,
      updatedAt: "2026-05-08",
    },
    {
      id: 2,
      contentType: "faq",
      key: "how_to_join",
      title: "How to Join a Ride Group",
      isActive: true,
      updatedAt: "2026-05-07",
    },
    {
      id: 3,
      contentType: "push_template",
      key: "ride_confirmed",
      title: "Ride Confirmed Notification",
      isActive: false,
      updatedAt: "2026-05-06",
    },
  ];

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      destination: "Destination",
      onboarding_copy: "Onboarding Copy",
      faq: "FAQ",
      push_template: "Push Template",
      banner: "Banner",
    };
    return labels[type] || type;
  };

  const handleEdit = (item: CmsItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      content: "",
      key: item.key,
    });
  };

  const handleSave = () => {
    // Handle save logic
    setEditingId(null);
    setFormData({ title: "", content: "", key: "" });
  };

  return (
    <AdminDashboardLayout currentPage="cms">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">CMS Management</h1>
            <p className="text-slate-600 mt-2">Manage app content and messaging.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Content
          </Button>
        </div>

        {/* Content Type Filter */}
        <Card className="p-4">
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="destination">Destinations</SelectItem>
              <SelectItem value="onboarding_copy">Onboarding Copy</SelectItem>
              <SelectItem value="faq">FAQs</SelectItem>
              <SelectItem value="push_template">Push Templates</SelectItem>
              <SelectItem value="banner">Banners</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        {/* Content Items */}
        <div className="space-y-3">
          {cmsItems
            .filter((item) => item.contentType === contentType)
            .map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      {item.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Key: {item.key}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Updated: {item.updatedAt}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Toggle active status
                      }}
                    >
                      {item.isActive ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
        </div>

        {/* Edit Form Modal (simplified) */}
        {editingId && (
          <Card className="p-6 border-2 border-blue-500">
            <h2 className="text-lg font-bold mb-4">Edit Content</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Key
                </label>
                <Input
                  value={formData.key}
                  onChange={(e) =>
                    setFormData({ ...formData, key: e.target.value })
                  }
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Content
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Enter content"
                  rows={6}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ title: "", content: "", key: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
