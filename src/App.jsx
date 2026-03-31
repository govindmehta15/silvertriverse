import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { CreditsProvider } from './context/CreditsContext';
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
import RelicsPage from './pages/RelicsPage';
import RelicDetailPage from './pages/RelicDetailPage';
import CollectibleUnitsPage from './pages/CollectibleUnitsPage';
import FilmPage from './pages/FilmPage';
import MerchandisePage from './pages/MerchandisePage';
import ProductDetail from './pages/ProductDetail';
import StorySubmissionPage from './pages/StorySubmissionPage';
import TalentPipelinePage from './pages/TalentPipelinePage';
import CommunityGroupPage from './pages/CommunityGroupPage';
import CreatePostPage from './pages/CreatePostPage';
import AIWriterLayout from './layouts/AIWriterLayout';
import AIWriterHubPage from './pages/AIWriterHubPage';
import AIWriterHistoryPage from './pages/AIWriterHistoryPage';
import AIWriterWorkflowPage from './pages/AIWriterWorkflowPage';
import AIProducerLayout from './layouts/AIProducerLayout';
import AIProducerHubPage from './pages/AIProducerHubPage';
import AIProducerTopUpPage from './pages/AIProducerTopUpPage';
import AIProducerWorkflowPage from './pages/AIProducerWorkflowPage';
import LandMarketplacePage from './pages/LandMarketplacePage';
import SplashScreen from './components/SplashScreen';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
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
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <CartProvider>
              <CreditsProvider>
                <AnimatePresence mode="wait">
                  {showSplash && <SplashScreen key="splash" />}
                </AnimatePresence>
                <Router>
                  <Routes>
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/reelity" element={<ReelityLayout />}>
                        <Route index element={<ReelityFeedPage />} />
                        <Route path="stories" element={<ReelityStoriesPage />} />
                        <Route path="people" element={<ReelityPeoplePage />} />
                        <Route path="clubs" element={<ReelityClubsPage />} />
                        <Route path="clubs/:id" element={<CommunityGroupPage />} />
                      </Route>
                      <Route path="/relics" element={<RelicsPage />} />
                      <Route path="/relics/:id" element={<RelicDetailPage />} />
                      <Route path="/collectible-units" element={<CollectibleUnitsPage />} />
                      <Route path="/collectible-units/explore" element={<CollectibleUnitsPage />} />
                      <Route path="/collectible-units/film/:id" element={<FilmPage />} />
                      <Route path="/merchandise" element={<MerchandisePage />} />
                      <Route path="/merchandise/:id" element={<ProductDetail />} />
                      <Route
                        path="/collectible-units/create-post"
                        element={
                          <ProtectedRoute>
                            <RoleGuard allowedRoles={['creator', 'professional', 'fan']} fallbackRoute="/collectible-units">
                              <CreatePostPage />
                            </RoleGuard>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/collectible-units/submit-story"
                        element={
                          <ProtectedRoute>
                            <RoleGuard allowedRoles={['creator', 'professional']} fallbackRoute="/collectible-units">
                              <StorySubmissionPage />
                            </RoleGuard>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/collectible-units/pipeline"
                        element={
                          <ProtectedRoute>
                            <RoleGuard allowedRoles={['professional']} fallbackRoute="/collectible-units">
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
                      <Route path="/land" element={<LandMarketplacePage />} />
                      {/* Legacy FCU URLs -> Collectible Units */}
                      <Route path="/fcu" element={<Navigate to="/collectible-units" replace />} />
                      <Route path="/fcu/explore" element={<Navigate to="/collectible-units/explore" replace />} />
                      <Route path="/fcu/film/:id" element={<Navigate to="/collectible-units/explore" replace />} />
                      <Route path="/fcu/create-post" element={<Navigate to="/collectible-units/create-post" replace />} />
                      <Route path="/fcu/submit-story" element={<Navigate to="/collectible-units/submit-story" replace />} />
                      <Route path="/fcu/pipeline" element={<Navigate to="/collectible-units/pipeline" replace />} />
                      <Route path="/ai-writer" element={<AIWriterLayout />}>
                        <Route index element={<AIWriterHubPage />} />
                        <Route path="history" element={<AIWriterHistoryPage />} />
                        <Route path="tool/:toolId" element={<AIWriterWorkflowPage />} />
                      </Route>
                      <Route path="/ai-producer" element={<AIProducerLayout />}>
                        <Route index element={<AIProducerHubPage />} />
                        <Route
                          path="top-up"
                          element={
                            <ProtectedRoute>
                              <AIProducerTopUpPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="tool/:toolId"
                          element={
                            <ProtectedRoute>
                              <AIProducerWorkflowPage />
                            </ProtectedRoute>
                          }
                        />
                      </Route>
                    </Route>
                  </Routes>
                </Router>
              </CreditsProvider>
            </CartProvider>
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
