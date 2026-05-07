import { create } from "zustand";

import type { UserProfile } from "../types/user";
import { clearToken, getToken, normalizeToken } from "../utils/token";

interface UserState {
  token: string | null;
  user: UserProfile | null;
  setAuth: (token: string, user?: UserProfile | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  token: getToken(),
  user: null,
  setAuth: (token, user = null) => set({ token: normalizeToken(token), user }),
  logout: () => {
    clearToken();
    set({ token: null, user: null });
  },
}));
