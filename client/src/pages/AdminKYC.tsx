import { useState } from "react";
import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Document {
  id: number;
  userId: number;
  userName: string;
  documentType: string;
  fileUrl: string;
  createdAt: string;
  status: string;
}

export default function AdminKYC() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");

  // Mock data - replace with tRPC query
  const pendingDocuments: Document[] = [
    {
      id: 1,
      userId: 1,
      userName: "John Doe",
      documentType: "government_id",
      fileUrl: "https://example.com/id.jpg",
      createdAt: "2026-05-08",
      status: "pending",
    },
    {
      id: 2,
      userId: 2,
      userName: "Jane Smith",
      documentType: "selfie",
      fileUrl: "https://example.com/selfie.jpg",
      createdAt: "2026-05-07",
      status: "pending",
    },
    {
      id: 3,
      userId: 3,
      userName: "Bob Johnson",
      documentType: "flight_ticket",
      fileUrl: "https://example.com/ticket.pdf",
      createdAt: "2026-05-06",
      status: "pending",
    },
  ];

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      government_id: "Government ID",
      selfie: "Selfie",
      flight_ticket: "Flight Ticket",
    };
    return labels[type] || type;
  };

  const getDocumentTypeIcon = (type: string) => {
    return <FileText className="w-4 h-4" />;
  };

  return (
    <AdminDashboardLayout currentPage="kyc">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">KYC Verification</h1>
          <p className="text-slate-600 mt-2">
            Review and approve user verification documents.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Documents List */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h2 className="font-bold text-lg mb-4">Pending Documents</h2>
              <div className="space-y-2">
                {pendingDocuments.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocument(doc as Document)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                      selectedDocument?.id === doc.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {getDocumentTypeIcon(doc.documentType)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 truncate">
                          {doc.userName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {getDocumentTypeLabel(doc.documentType)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{doc.createdAt}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Document Viewer & Actions */}
          <div className="lg:col-span-2">
            {selectedDocument && selectedDocument !== null ? (
              <div className="space-y-4">
                {/* Document Preview */}
                <Card className="p-6">
                  <h2 className="font-bold text-lg mb-4">Document Preview</h2>
                  <div className="bg-slate-100 rounded-lg p-8 mb-4 flex items-center justify-center min-h-96">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600">
                        {getDocumentTypeLabel(selectedDocument.documentType)}
                      </p>
                      <p className="text-sm text-slate-500 mt-2">
                        {selectedDocument.userName}
                      </p>
                    </div>
                  </div>
                  <a
                    href={selectedDocument.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Full Document →
                  </a>
                </Card>

                {/* Verification Form */}
                <Card className="p-6">
                  <h2 className="font-bold text-lg mb-4">Verification</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Verification Notes
                      </label>
                      <Textarea
                        placeholder="Add notes about this document verification..."
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          // Handle approve
                          setVerificationNotes("");
                          setSelectedDocument(null);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => {
                          // Handle reject
                          setVerificationNotes("");
                          setSelectedDocument(null);
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-12 flex items-center justify-center min-h-96">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600">Select a document to review</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-sm text-slate-600">Pending Review</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {pendingDocuments.length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-slate-600">Approved Today</p>
            <p className="text-3xl font-bold text-green-600 mt-2">12</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-slate-600">Rejected Today</p>
            <p className="text-3xl font-bold text-red-600 mt-2">3</p>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
