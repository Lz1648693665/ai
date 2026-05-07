const TOKEN_KEY = "token";

export function normalizeToken(token: string | null | undefined) {
  const value = token?.trim() ?? "";

  if (!value || value === "undefined" || value === "null") {
    return null;
  }

  return value;
}

export function getToken() {
  return normalizeToken(localStorage.getItem(TOKEN_KEY));
}

export function saveToken(token: string) {
  const normalizedToken = normalizeToken(token);

  if (!normalizedToken) {
    clearToken();
    throw new Error("登录接口未返回有效 token");
  }

  localStorage.setItem(TOKEN_KEY, normalizedToken);
  return normalizedToken;
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
