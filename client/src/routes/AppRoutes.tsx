import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import AnalyzePage from "../pages/AnalyzePage";
import IdeasHistoryPage from "../pages/IdeasHistoryPage";
import IdeaDetailsPage from "../pages/IdeaDetailsPage";
import NotFoundPage from "../pages/NotFoundPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/analyze" element={<AnalyzePage />} />
      <Route path="/ideas" element={<IdeasHistoryPage />} />
      <Route path="/ideas/:id" element={<IdeaDetailsPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;