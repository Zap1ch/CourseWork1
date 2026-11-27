import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getIdeas } from "../services/ideaService";
import type { IdeaSummary } from "../types/idea";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const [ideas, setIdeas] = useState<IdeaSummary[] | null>(null);

  // Історія оновлюється при кожному переході, тому нова ідея з'являється одразу
  useEffect(() => {
    async function loadIdeas() {
      try {
        const data = await getIdeas();
        setIdeas(data);
      } catch {
        setIdeas([]);
      }
    }

    loadIdeas();
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const email = user?.email || "";
  const initial = email ? email.charAt(0).toUpperCase() : "?";

  return (
    <aside className="sidebar">
      <Link className="brand" to="/analyze">
        <img className="brand-mark" src="/logo.jpg" alt="Startup Validator" />
        <span className="brand-name">Startup Validator</span>
      </Link>

      <Link className="new-idea" to="/analyze">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M8 3v10M3 8h10" />
        </svg>
        Нова ідея
      </Link>
      <Link className="new-idea mobile-only" to="/ideas">
        Історія
      </Link>

      <div className="sidebar-label">Історія</div>

      <nav className="history">
        {ideas === null && <div className="history-empty">Завантаження…</div>}

        {ideas !== null && ideas.length === 0 && (
          <div className="history-empty">Ще немає ідей</div>
        )}

        {ideas !== null &&
          ideas.map((idea) => (
            <NavLink
              key={idea.id}
              className="history-item"
              to={`/ideas/${idea.id}`}
              title={idea.idea_text}
            >
              {idea.idea_text}
            </NavLink>
          ))}
      </nav>

      <Link className="history-all" to="/ideas">
        Усі ідеї
      </Link>

      <div className="sidebar-footer">
        <span className="avatar">{initial}</span>
        <span className="user-email">{email}</span>
        <button className="link-button" type="button" onClick={handleLogout}>
          Вийти
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
