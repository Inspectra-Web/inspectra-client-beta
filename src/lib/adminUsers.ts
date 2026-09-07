import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./api";
import type { AuthRole, AuthStatus, AuthUser } from "./auth";
import type { Profile } from "./profile";

/** A directory row: the account, plus the city that lives on its profile. */
export interface DirectoryUser {
  id: string;
  /** Stored lowercased by the API. Run it through displayName() to render. */
  fullname: string;
  email: string;
  role: AuthRole;
  status: AuthStatus;
  avatar: string;
  city: string;
  createdAt: string;
}

export interface UserDirectory {
  users: DirectoryUser[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/** "all" is a real value, not an omitted param: it is the filters' resting state. */
export interface DirectoryQuery {
  q: string;
  role: AuthRole | "all";
  status: AuthStatus | "all";
  page: number;
}

export interface UserDetail {
  user: AuthUser;
  /** Null for an account that has never had a profile written. */
  profile: Profile | null;
}

interface DirectoryResponse {
  status: string;
  data: UserDirectory;
}

interface UserDetailResponse {
  status: string;
  data: UserDetail;
}

export const ADMIN_USERS_KEY = ["admin", "users"];

// Mirrors the default in server/src/validators/admin.validator.ts.
export const PAGE_SIZE = 20;

export function useAdminUsers(query: DirectoryQuery) {
  return useQuery({
    queryKey: [...ADMIN_USERS_KEY, query],
    queryFn: async () => {
      const res = await api.get<DirectoryResponse>("/admin/users", {
        params: { ...query, limit: PAGE_SIZE },
      });
      return res.data.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: [...ADMIN_USERS_KEY, id],
    queryFn: async () => {
      const res = await api.get<UserDetailResponse>(`/admin/users/${id}`);
      return res.data.data;
    },
  });
}

/** The two states the console toggles between. Mirrors userStatusSchema on the server. */
export type SettableStatus = Extract<AuthStatus, "active" | "suspended">;

interface StatusResponse {
  status: string;
  message?: string;
  data: { user: AuthUser };
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; status: SettableStatus }) => {
      const res = await api.patch<StatusResponse>(`/admin/users/${input.id}/status`, {
        status: input.status,
      });
      return res.data;
    },
    onSuccess: ({ data }, { id }) => {
      queryClient.setQueryData<UserDetail>([...ADMIN_USERS_KEY, id], (prev) =>
        prev ? { ...prev, user: data.user } : prev,
      );
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
}
