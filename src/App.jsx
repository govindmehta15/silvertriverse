import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { initSimulation } from './services/simulationService';
import RoleGuard from './components/RoleGuard';
import MainLayout from './layouts/MainLayout';
import ReelityLayout from './layouts/ReelityLayout';
import ReelityFeedPage from './pages/ReelityFeedPage';
import ReelityStoriesPage from './pages/ReelityStoriesPage';
import ReelityPeoplePage from './pages/ReelityPeoplePage';
import ReelityClubsPage from './pages/ReelityClubsPage';
import RelicsList from './features/RelicsList';
import RelicDetail from './features/RelicDetail';
import FCUPage from './pages/FCUPage';
import FilmPage from './pages/FilmPage';
import MerchandisePage from './pages/MerchandisePage';
import ProductDetail from './pages/ProductDetail';
import StorySubmissionPage from './pages/StorySubmissionPage';
import TalentPipelinePage from './pages/TalentPipelinePage';
import CommunityGroupPage from './pages/CommunityGroupPage';
import CreatePostPage from './pages/CreatePostPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize fake background activity loop
initSimulation();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <CartProvider>
              <Router>
                <Routes>
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Navigate to="/reelity" replace />} />
                    <Route path="/reelity" element={<ReelityLayout />}>
                      <Route index element={<ReelityFeedPage />} />
                      <Route path="stories" element={<ReelityStoriesPage />} />
                      <Route path="people" element={<ReelityPeoplePage />} />
                      <Route path="clubs" element={<ReelityClubsPage />} />
                      <Route path="clubs/:id" element={<CommunityGroupPage />} />
                    </Route>
                    <Route path="/relics" element={<RelicsList />} />
                    <Route path="/relics/:id" element={<RelicDetail />} />
                    <Route path="/fcu" element={<FCUPage />} />
                    <Route path="/fcu/explore" element={<FCUPage />} />
                    <Route path="/fcu/film/:id" element={<FilmPage />} />
                    <Route path="/merchandise" element={<MerchandisePage />} />
                    <Route path="/merchandise/:id" element={<ProductDetail />} />
                    <Route
                      path="/fcu/create-post"
                      element={
                        <ProtectedRoute>
                          <RoleGuard allowedRoles={['creator', 'professional', 'fan']} fallbackRoute="/fcu">
                            <CreatePostPage />
                          </RoleGuard>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/fcu/submit-story"
                      element={
                        <ProtectedRoute>
                          <RoleGuard allowedRoles={['creator', 'professional']} fallbackRoute="/fcu">
                            <StorySubmissionPage />
                          </RoleGuard>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/fcu/pipeline"
                      element={
                        <ProtectedRoute>
                          <RoleGuard allowedRoles={['professional']} fallbackRoute="/fcu">
                            <TalentPipelinePage />
                          </RoleGuard>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <RoleGuard allowedRoles={['fan', 'creator', 'professional']} fallbackRoute="/">
                            <ProfilePage />
                          </RoleGuard>
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                  </Route>
                </Routes>
              </Router>
            </CartProvider>
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
