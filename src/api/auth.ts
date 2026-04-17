import api from "./axios";

export interface LoginResponse {
  accessToken: string;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
  return data;
}
