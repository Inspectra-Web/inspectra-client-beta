import axios from "axios";

const baseURL = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api/v1";

export const api = axios.create({ baseURL, withCredentials: true });


interface ApiError {
  status: string;
  message: string;
}

export function apiMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError<ApiError>(error)) return error.response?.data?.message ?? fallback;
  return fallback;
}

export function apiStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

export type SignupRole = "seeker" | "realtor";

interface MessageResponse {
  status: string;
  message: string;
}


export async function registerAccount(body: {
  fullname: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: SignupRole;
}): Promise<string> {
  const res = await api.post<MessageResponse>("/auth/register", body);
  return res.data.message;
}

export async function verifyEmail(token: string): Promise<string> {
  const res = await api.post<MessageResponse>("/auth/verify-email", { token });
  return res.data.message;
}

export async function resendVerification(email: string): Promise<string> {
  const res = await api.post<MessageResponse>("/auth/resend-verification", { email });
  return res.data.message;
}

export async function requestPasswordReset(email: string): Promise<string> {
  const res = await api.post<MessageResponse>("/auth/forgot-password", { email });
  return res.data.message;
}

export async function resetPassword(body: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<string> {
  const res = await api.patch<MessageResponse>("/auth/reset-password", body);
  return res.data.message;
}
