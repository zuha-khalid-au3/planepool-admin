import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminKYC from "./pages/AdminKYC";
import AdminCMS from "./pages/AdminCMS";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminNotifications from "./pages/AdminNotifications";
import AdminSecurity from "./pages/AdminSecurity";
import AdminLLMAssistant from "./pages/AdminLLMAssistant";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="" component={Home} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/kyc" component={AdminKYC} />
      <Route path="/admin/cms" component={AdminCMS} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/notifications" component={AdminNotifications} />
      <Route path="/admin/security" component={AdminSecurity} />
      <Route path="/admin/llm" component={AdminLLMAssistant} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
