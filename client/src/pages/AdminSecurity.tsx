import { useState } from "react";
import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  User,
  MapPin,
} from "lucide-react";

interface Incident {
  id: number;
  userId: number;
  userName: string;
  incidentType: string;
  description: string;
  location: string;
  status: string;
  severity: string;
  createdAt: string;
}

export default function AdminSecurity() {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");

  const incidents: Incident[] = [
    {
      id: 1,
      userId: 123,
      userName: "John Doe",
      incidentType: "harassment",
      description: "User reported being harassed by another passenger",
      location: "Delhi Airport Terminal 3",
      status: "investigating",
      severity: "high",
      createdAt: "2026-05-10 09:30",
    },
    {
      id: 2,
      userId: 456,
      userName: "Jane Smith",
      incidentType: "unsafe_driver",
      description: "Unsafe driving reported during ride",
      location: "Delhi - City Center Route",
      status: "reported",
      severity: "critical",
      createdAt: "2026-05-10 08:15",
    },
    {
      id: 3,
      userId: 789,
      userName: "Bob Johnson",
      incidentType: "emergency",
      description: "Medical emergency during ride",
      location: "Delhi Airport",
      status: "resolved",
      severity: "critical",
      createdAt: "2026-05-09 18:45",
    },
    {
      id: 4,
      userId: 234,
      userName: "Alice Williams",
      incidentType: "accident",
      description: "Minor accident reported",
      location: "Railway Station Route",
      status: "acknowledged",
      severity: "medium",
      createdAt: "2026-05-09 15:20",
    },
  ];

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    return colors[severity] || colors.medium;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      reported: AlertTriangle,
      acknowledged: Clock,
      investigating: Shield,
      resolved: CheckCircle,
    };
    return icons[status] || AlertTriangle;
  };

  const handleResolveIncident = () => {
    console.log("Resolving incident:", selectedIncident?.id, resolutionNotes);
    setSelectedIncident(null);
    setResolutionNotes("");
  };

  const filteredIncidents =
    filterSeverity === "all"
      ? incidents
      : incidents.filter((i) => i.severity === filterSeverity);

  return (
    <AdminDashboardLayout currentPage="security">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Security & Incidents</h1>
          <p className="text-slate-600 mt-2">
            Monitor and resolve safety incidents and security issues.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-slate-600">Active Incidents</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {incidents.filter((i) => i.status !== "resolved").length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-slate-600">Critical</p>
            <p className="text-3xl font-bold text-red-700 mt-2">
              {incidents.filter((i) => i.severity === "critical").length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-slate-600">Under Investigation</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {incidents.filter((i) => i.status === "investigating").length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-slate-600">Resolved Today</p>
            <p className="text-3xl font-bold text-green-600 mt-2">2</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Incidents List */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Incidents</h2>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredIncidents.map((incident) => {
                  const StatusIcon = getStatusIcon(incident.status);
                  return (
                    <button
                      key={incident.id}
                      onClick={() => setSelectedIncident(incident)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        selectedIncident?.id === incident.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <StatusIcon className="w-4 h-4 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-900 truncate">
                            {incident.incidentType.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {incident.userName}
                          </p>
                          <div className="flex gap-1 mt-1">
                            <Badge className={getSeverityColor(incident.severity)}>
                              {incident.severity}
                            </Badge>
                            <Badge variant="outline">{incident.status}</Badge>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Incident Details */}
          <div className="lg:col-span-2">
            {selectedIncident ? (
              <div className="space-y-4">
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {selectedIncident.incidentType.replace(/_/g, " ")}
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">
                        Incident ID: #{selectedIncident.id}
                      </p>
                    </div>
                    <Badge className={getSeverityColor(selectedIncident.severity)}>
                      {selectedIncident.severity}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900 mb-1">User</p>
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="w-4 h-4" />
                        <span>{selectedIncident.userName}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-900 mb-1">Location</p>
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedIncident.location}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-900 mb-1">
                        Description
                      </p>
                      <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">
                        {selectedIncident.description}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-900 mb-1">
                        Reported At
                      </p>
                      <p className="text-slate-600">{selectedIncident.createdAt}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-900 mb-1">Status</p>
                      <Badge variant="outline">{selectedIncident.status}</Badge>
                    </div>
                  </div>
                </Card>

                {selectedIncident.status !== "resolved" && (
                  <Card className="p-6">
                    <h3 className="font-bold text-lg mb-4">Resolution</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                          Resolution Notes
                        </label>
                        <Textarea
                          placeholder="Add notes about how this incident was resolved..."
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={handleResolveIncident}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark as Resolved
                        </Button>
                        <Button variant="outline">Escalate to Support</Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="p-12 flex items-center justify-center min-h-96">
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600">Select an incident to view details</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
