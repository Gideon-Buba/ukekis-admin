import { getToken, decodeToken, isTokenValid } from "@/lib/token";

export function useAuth() {
  const token = getToken();
  const isAuthenticated = token ? isTokenValid(token) : false;
  const payload = token ? decodeToken(token) : null;

  return {
    isAuthenticated,
    token,
    user: payload,
  };
}
