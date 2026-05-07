import { createBrowserRouter, Navigate } from "react-router-dom";

import { MainLayout } from "../components/layout/MainLayout";
import { BugAnalyzerPage } from "../pages/bug-analyzer/BugAnalyzerPage";
import { ChatPage } from "../pages/chat/ChatPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { FavoritesPage } from "../pages/favorites/FavoritesPage";
import { HistoryPage } from "../pages/history/HistoryPage";
import { JsonToTsPage } from "../pages/json-to-ts/JsonToTsPage";
import { LoginPage } from "../pages/login/LoginPage";
import { RegisterPage } from "../pages/register/RegisterPage";
import { SettingsPage } from "../pages/settings/SettingsPage";
import { TemplateEditPage } from "../pages/templates/TemplateEditPage";
import { TemplateListPage } from "../pages/templates/TemplateListPage";
import { TemplateRunPage } from "../pages/templates/TemplateRunPage";
import { AuthGuard, GuestGuard } from "./RouteGuards";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },
  {
    path: "/register",
    element: (
      <GuestGuard>
        <RegisterPage />
      </GuestGuard>
    ),
  },
  {
    path: "/",
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/chat" replace />,
      },
      {
        path: "chat",
        element: <ChatPage />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "templates",
        element: <TemplateListPage />,
      },
      {
        path: "templates/create",
        element: <TemplateEditPage />,
      },
      {
        path: "templates/:id/edit",
        element: <TemplateEditPage />,
      },
      {
        path: "templates/:id/run",
        element: <TemplateRunPage />,
      },
      {
        path: "json-to-ts",
        element: <JsonToTsPage />,
      },
      {
        path: "bug-analyzer",
        element: <BugAnalyzerPage />,
      },
      {
        path: "history",
        element: <HistoryPage />,
      },
      {
        path: "favorites",
        element: <FavoritesPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);
