import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from '@getmocha/users-service/react';
import { NotificationProvider } from '@/react-app/hooks/useNotifications';
import ErrorBoundary from '@/react-app/components/ErrorBoundary';
import HomePage from "@/react-app/pages/Home";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import AdminPage from "@/react-app/pages/Admin";
import ModeratorPage from "@/react-app/pages/Moderator";
import ObsOverlay from "@/react-app/pages/ObsOverlay";
import ObsAlerts from "@/react-app/pages/ObsAlerts";
import ObsPanel from "@/react-app/pages/ObsPanel";
import DonationSuccess from "@/react-app/pages/DonationSuccess";
import SubscriptionSuccess from "@/react-app/pages/SubscriptionSuccess";
import Profile from "@/react-app/pages/Profile";
import CommunityGuidelines from "@/react-app/pages/CommunityGuidelines";
import ChatOverlay from "@/react-app/pages/ChatOverlay";
import Referrals from "@/react-app/pages/Referrals";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/moderator" element={<ModeratorPage />} />
          <Route path="/obs-overlay" element={<ObsOverlay />} />
          <Route path="/obs-alerts" element={<ObsAlerts />} />
          <Route path="/obs-panel" element={<ObsPanel />} />
          <Route path="/donation-success" element={<DonationSuccess />} />
          <Route path="/subscription-success" element={<SubscriptionSuccess />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/community-guidelines" element={<CommunityGuidelines />} />
          <Route path="/chat-overlay" element={<ChatOverlay />} />
          <Route path="/referrals" element={<Referrals />} />
        </Routes>
        </Router>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
