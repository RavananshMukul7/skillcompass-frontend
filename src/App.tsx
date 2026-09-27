import AppLayout from './components/layout/AppLayout';

import { useAppPath, navigate } from './router/appRouter';

import { useAuth } from './context/AuthContext';

import Dashboard from './pages/dashboard/Dashboard';

import GithubWorkspace from './pages/github/GithubWorkspace';

import Skills from './pages/skills/Skills';

import AnalysisHistory from './pages/analysis/AnalysisHistory';

import Analysis from './pages/analysis/Analysis';

import JobProfiles from './pages/job-profiles/JobProfiles';

import JobRecommendations from './pages/job-recommendations/JobRecommendations';

import Settings from './pages/settings/Settings';

import Help from './pages/help/Help';

import LandingPage from './pages/landing/LandingPage';

import LoginPage from './pages/login/LoginPage';

import RegisterPage from './pages/register/RegisterPage';

import ForgotPasswordPage from './pages/login/ForgotPasswordPage';


function RouteView() {
  const path = useAppPath();

  if (path === '/github') {
    return <GithubWorkspace />;
  }

  if (path === '/skills' || path.startsWith('/skills/')) {
    return <Skills />;
  }

  if (path === '/analysis') {
    return <AnalysisHistory />;
  }

  if (path.startsWith('/analysis/')) {
    const analysisRunId = decodeURIComponent(
      path.slice('/analysis/'.length),
    );

    return <Analysis analysisRunId={analysisRunId} />;
  }

  // ============================================================
  // JOB PROFILES
  // ============================================================

  if (path === '/job-profiles') {
    return <JobProfiles />;
  }

  if (path.startsWith('/job-profiles/')) {
    const profileSlug = decodeURIComponent(
      path.slice('/job-profiles/'.length),
    );

    return <JobProfiles profileSlug={profileSlug} />;
  }

  // ============================================================
  // JOB RECOMMENDATIONS
  // ============================================================

  if (path === '/job-recommendations') {
    return <JobRecommendations />;
  }

  if (path.startsWith('/job-recommendations/')) {
    const slug = decodeURIComponent(
      path.slice('/job-recommendations/'.length),
    );

    return <JobRecommendations jobProfileSlug={slug} />;
  }

  if (path === '/settings' || path.startsWith('/settings/')) {
    return <Settings />;
  }

  if (path === '/help' || path.startsWith('/help/')) {
    return <Help />;
  }

  return <Dashboard />;
}


export default function App() {
  const path = useAppPath();

  const { user, loading } = useAuth();

  /*
   * ============================================================
   * PUBLIC ROUTES
   * ============================================================
   *
   * '/' is intentionally the Landing Page.
   * It must never pass through the authenticated
   * AppLayout / Dashboard routing.
   */

  const isPublicRoute =
    path === '/' ||
    path === '/landing' ||
    path === '/login' ||
    path === '/register' ||
    path === '/forgot-password';

  /*
   * Keep the loading screen away from public pages.
   */

  if (loading && !isPublicRoute) {
    return (
      <div className="sc-page-background">
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            color: '#dcecff',
            fontSize: '16px',
          }}
        >
          Loading SkillCompass…
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * PUBLIC LANDING PAGE
   * ============================================================
   *
   * IMPORTANT:
   * '/' and '/landing' are handled BEFORE the authentication
   * redirect and BEFORE AppLayout.
   */

  if (path === '/' || path === '/landing') {
    return (
      <div className="sc-page-background">
        <LandingPage />
      </div>
    );
  }

  /*
   * Authentication guard for all remaining routes.
   */

  if (!loading && !user && !isPublicRoute) {
    navigate('/login');
    return null;
  }

  /*
   * Authenticated users should not remain on login/register.
   */

  if (
    !loading &&
    user &&
    (path === '/login' || path === '/register')
  ) {
    navigate('/dashboard');
    return null;
  }

  /*
   * ============================================================
   * AUTH ROUTES
   * ============================================================
   */

  if (path === '/login') {
    return <LoginPage />;
  }

  if (path === '/register') {
    return <RegisterPage />;
  }

  if (path === '/forgot-password') {
    return <ForgotPasswordPage />;
  }

  /*
   * ============================================================
   * AUTHENTICATED APPLICATION
   * ============================================================
   */

  return (
    <AppLayout>
      <RouteView />
    </AppLayout>
  );
}