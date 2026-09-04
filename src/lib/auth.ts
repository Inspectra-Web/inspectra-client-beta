import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, apiStatus } from "./api";

export type AuthRole = "seeker" | "realtor" | "admin";
export type AuthStatus = "active" | "suspended" | "pending";

export interface AuthUser {
  id: string;
  fullname: string;
  email: string;
  role: AuthRole;
  status: AuthStatus;
  avatar: string;
  phone?: string;
  emailVerified: boolean;
  createdAt: string;
}

interface UserResponse {
  status: string;
  data: { user: AuthUser };
}

export const ME_KEY = ["me"];

/** Where each role's app lives. The single source of truth for post-login routing. */
export function homeFor(role: AuthRole): string {
  if (role === "admin") return "/admin";
  if (role === "realtor") return "/realtor";
  return "/dashboard";
}

async function fetchMe(): Promise<AuthUser | null> {
  try {
    const res = await api.get<UserResponse>("/auth/me");
    return res.data.data.user;
  } catch (error) {
    const status = apiStatus(error);
    if (status === 401 || status === 403) return null;
    throw error;
  }
}

export function useMe() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: fetchMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useAuthUser(): AuthUser {
  const { data } = useMe();
  if (!data) throw new Error("useAuthUser must be used inside a guarded route");
  return data;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const res = await api.post<UserResponse>("/auth/login", values);
      return res.data.data.user;
    },
    onSuccess: (user) => queryClient.setQueryData(ME_KEY, user),
  });
}

/** The console has its own door: /auth/login refuses admins outright. */
export function useAdminLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const res = await api.post<UserResponse>("/admin/login", values);
      return res.data.data.user;
    },
    onSuccess: (user) => queryClient.setQueryData(ME_KEY, user),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await api.post("/auth/logout");
      } catch {
        // The cookie may already be gone, or the server unreachable. Sign out
        // locally regardless: refusing to clear on a network blip is worse.
      }
    },
    onSuccess: () => {
      queryClient.removeQueries();
      queryClient.setQueryData(ME_KEY, null);
    },
  });
}

export function useUpdatePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: {
      currentPassword: string;
      password: string;
      confirmPassword: string;
    }) => {
      const res = await api.patch<UserResponse>("/auth/update-password", values);
      return res.data.data.user;
    },
    // The server reissued the cookie, so the session survives the change.
    onSuccess: (user) => queryClient.setQueryData(ME_KEY, user),
  });
}
