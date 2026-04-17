const TOKEN_KEY = "admin_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export interface JwtPayload {
  sub: string;
  email?: string;
  name?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenValid(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return false;
  if (payload.exp && payload.exp * 1000 < Date.now()) return false;
  return true;
}
