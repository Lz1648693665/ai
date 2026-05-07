import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useUserStore } from "../store/userStore";
import { getToken, normalizeToken } from "../utils/token";

interface RouteGuardProps {
  children: ReactNode;
}

function useAuthToken() {
  const storeToken = useUserStore((state) => state.token);
  return normalizeToken(storeToken) || getToken();
}

export function AuthGuard({ children }: RouteGuardProps) {
  const location = useLocation();
  const token = useAuthToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

export function GuestGuard({ children }: RouteGuardProps) {
  const token = useAuthToken();

  if (token) {
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
}
