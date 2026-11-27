import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

// Каркас сторінок після входу: бічна панель зліва, сторінка справа
function Layout() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
