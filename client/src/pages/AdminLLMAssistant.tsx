import { useState } from "react";
import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, AlertCircle, CheckCircle, Copy } from "lucide-react";
import { Streamdown } from "streamdown";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function AdminLLMAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello! I'm your AI assistant for the PlanePool admin panel. I can help you with:\n\n- **Reviewing flagged content** - Analyze user complaints and flag suspicious activity\n- **Summarizing complaints** - Extract key information from user reports\n- **Ban decision suggestions** - Recommend actions based on incident severity\n- **Appeal response drafting** - Generate professional responses to user appeals\n\nHow can I assist you today?",
      timestamp: "2026-05-10 10:00",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const assistantResponse: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: `I've analyzed your request. Here's my assessment:\n\n**Analysis Summary:**\n- User complaint severity: High\n- Pattern detected: Similar to 3 previous incidents\n- Recommended action: Review user account for verification\n\n**Suggested Response:**\nThank you for reporting this issue. We take all safety concerns seriously and have escalated this to our security team for immediate investigation.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, assistantResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <AdminDashboardLayout currentPage="llm">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Assistant</h1>
          <p className="text-slate-600 mt-2">
            Leverage AI to review content, summarize complaints, and draft responses.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="flex flex-col h-96 lg:h-full">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.role === "user"
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-slate-100 text-slate-900 rounded-bl-none"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <Streamdown>{message.content}</Streamdown>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                        <p
                          className={`text-xs mt-1 ${
                            message.role === "user"
                              ? "text-blue-100"
                              : "text-slate-500"
                          }`}
                        >
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 px-4 py-2 rounded-lg rounded-bl-none">
                        <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t border-slate-200 p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask me anything..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-bold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() =>
                    setInputValue(
                      "Review this user complaint for potential violations..."
                    )
                  }
                >
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">Review Complaint</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() =>
                    setInputValue("Summarize the key issues from this incident...")
                  }
                >
                  <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">Summarize Incident</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() =>
                    setInputValue("Should I ban this user? Here are the details...")
                  }
                >
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">Ban Decision</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() =>
                    setInputValue("Draft a response to this user appeal...")
                  }
                >
                  <Send className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">Draft Response</span>
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-bold mb-3">Capabilities</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-600">Content analysis</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-600">Complaint summarization</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-600">Decision recommendations</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-600">Response drafting</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-600">Pattern detection</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-blue-50 border-blue-200">
              <p className="text-sm text-blue-900">
                💡 <strong>Tip:</strong> Copy assistant responses directly to use in
                your communications.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
