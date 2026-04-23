// ============================================================
// Recruitation.AI — root router
// ============================================================

import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/lib/toast';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAgency, RequireCandidate, RequireAdmin } from '@/routes/guards';

// Marketing
import Landing from '@/pages/Landing';
import PendingAgency from '@/pages/PendingAgency';

// Auth
import AgencySignup from '@/pages/auth/AgencySignup';
import AgencyLogin from '@/pages/auth/AgencyLogin';
import CandidateAuth from '@/pages/auth/CandidateAuth';
import AdminLogin from '@/pages/auth/AdminLogin';

// Agency app
import AgencyDashboard from '@/pages/agency/Dashboard';
import Jobs from '@/pages/agency/Jobs';
import JobDetail from '@/pages/agency/JobDetail';
import NewJob from '@/pages/agency/NewJob';
import Pipeline from '@/pages/agency/Pipeline';
import Report from '@/pages/agency/Report';
import Credits from '@/pages/agency/Credits';
import Settings from '@/pages/agency/Settings';
import Compare from '@/pages/agency/Compare';
import SkillsHeatmap from '@/pages/agency/SkillsHeatmap';
import Analytics from '@/pages/agency/Analytics';

// Public shortlink
import ShortlinkRedirect from '@/pages/ShortlinkRedirect';

// Candidate app
import Portal from '@/pages/candidate/Portal';
import BrowseJobs from '@/pages/candidate/BrowseJobs';
import Apply from '@/pages/candidate/Apply';
import Interview from '@/pages/candidate/Interview';
import ThankYou from '@/pages/candidate/ThankYou';
import Profile from '@/pages/candidate/Profile';

// Admin
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminAgencies from '@/pages/admin/Agencies';
import AdminCredits from '@/pages/admin/Credits';
import AdminActivity from '@/pages/admin/Activity';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* ——— Marketing & public ——— */}
          <Route path="/" element={<Landing />} />
          <Route path="/pending" element={<PendingAgency />} />

          {/* ——— Auth ——— */}
          <Route path="/signup/agency" element={<AgencySignup />} />
          <Route path="/login/agency" element={<AgencyLogin />} />
          <Route path="/signup/candidate" element={<CandidateAuth mode="signup" />} />
          <Route path="/login/candidate" element={<CandidateAuth mode="login" />} />
          <Route path="/login/admin" element={<AdminLogin />} />

          {/* ——— Shortlink redirect ——— */}
          <Route path="/s/:code" element={<ShortlinkRedirect />} />

          {/* ——— Candidate public apply (branded) ——— */}
          <Route path="/:agencySlug/:jobSlug" element={<Apply />} />
          <Route path="/jobs-open" element={<BrowseJobs />} />

          {/* ——— Candidate post-interview (auth not strictly required for thanks) ——— */}
          <Route path="/thanks/:id" element={<ThankYou />} />

          {/* ——— Candidate live interview (public — candidates arrive unauthenticated) ——— */}
          <Route path="/interview/:id" element={<Interview />} />

          {/* ——— Candidate app shell ——— */}
          <Route element={<RequireCandidate><AppShell kind="candidate" /></RequireCandidate>}>
            <Route path="/me" element={<Portal />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* ——— Agency app shell ——— */}
          <Route element={<RequireAgency><AppShell kind="agency" /></RequireAgency>}>
            <Route path="/dashboard" element={<AgencyDashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/new" element={<NewJob />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/skills" element={<SkillsHeatmap />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports/:id" element={<Report />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* ——— Admin app shell ——— */}
          <Route element={<RequireAdmin><AppShell kind="admin" /></RequireAdmin>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/agencies" element={<AdminAgencies />} />
            <Route path="/admin/credits" element={<AdminCredits />} />
            <Route path="/admin/activity" element={<AdminActivity />} />
          </Route>

          {/* ——— Fallback ——— */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
