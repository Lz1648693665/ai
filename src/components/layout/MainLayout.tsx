import { Outlet, useLocation } from "react-router-dom";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function MainLayout() {
  const location = useLocation();
  const isChatPage = location.pathname === "/chat";

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className={isChatPage ? "page-container chat-page-container" : "page-container"}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
