import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-mark">AI</div>

        <div>
          <strong>Startup Validator</strong>
          <span>AI product assistant</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-item nav-active" : "nav-item"
          }
        >
          <span>▣</span>
          Dashboard
        </NavLink>

        <NavLink
          to="/analyze"
          className={({ isActive }) =>
            isActive ? "nav-item nav-active" : "nav-item"
          }
        >
          <span>✦</span>
          Analyze idea
        </NavLink>

        <NavLink
          to="/ideas"
          className={({ isActive }) =>
            isActive ? "nav-item nav-active" : "nav-item"
          }
        >
          <span>☰</span>
          Ideas history
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-mini-card">
          <span className="user-avatar">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </span>

          <div>
            <strong>{user?.email || "User"}</strong>
            <small>Logged in</small>
          </div>
        </div>

        <button className="logout-button" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;