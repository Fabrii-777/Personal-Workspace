import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Notes } from './pages/Notes';
import { Goals } from './pages/Goals';
import { Projects } from './pages/Projects';
import { Wishlist } from './pages/Wishlist';
import { Explore } from './pages/Explore';
import { Profile } from './pages/Profile';
import { PublicProfile } from './pages/PublicProfile';
import { Auth } from './pages/Auth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/login" element={<Auth />} />
            <Route path="/p/:username" element={<PublicProfile />} />

            {/* Rutas Protegidas */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="notes" element={<Notes />} />
              <Route path="goals" element={<Goals />} />
              <Route path="projects" element={<Projects />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="explore" element={<Explore />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;