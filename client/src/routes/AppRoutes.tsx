import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AnalyzePage from "../pages/AnalyzePage";
import DashboardPage from "../pages/DashboardPage";
import IdeaDetailsPage from "../pages/IdeaDetailsPage";
import IdeasHistoryPage from "../pages/IdeasHistoryPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import RegisterPage from "../pages/RegisterPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analyze"
        element={
          <ProtectedRoute>
            <AnalyzePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ideas"
        element={
          <ProtectedRoute>
            <IdeasHistoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ideas/:id"
        element={
          <ProtectedRoute>
            <IdeaDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;