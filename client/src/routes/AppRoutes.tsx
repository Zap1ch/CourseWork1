import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import AnalyzePage from "../pages/AnalyzePage";
import IdeaDetailsPage from "../pages/IdeaDetailsPage";
import IdeasHistoryPage from "../pages/IdeasHistoryPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import RegisterPage from "../pages/RegisterPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/analyze" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Сторінки з бічною панеллю, доступні тільки після входу */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/ideas" element={<IdeasHistoryPage />} />
        <Route path="/ideas/:id" element={<IdeaDetailsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
