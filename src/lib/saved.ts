import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./api";
import { useMe } from "./auth";

/**
 * The seeker's shortlist. The API keeps ids on the profile and nothing else: the cards
 * come from the marketplace browse, filtered by those ids, so one endpoint does the
 * public gating and the card shaping for both the grid and the Saved page.
 *
 * Every heart in the app reads the same cache entry, so a page of cards costs one
 * request rather than one per card.
 */

interface SavedResponse {
  status: string;
  message?: string;
  data: { ids: string[] };
}

export const SAVED_KEY = ["saved"];

/**
 * The saved ids, or an empty list for a visitor. It never fires without a session,
 * because the route is protected and a guaranteed 401 is not worth a request.
 */
export function useSavedIds() {
  const { data: user } = useMe();

  const query = useQuery({
    queryKey: SAVED_KEY,
    queryFn: async () => {
      const res = await api.get<SavedResponse>("/profile/me/saved");
      return res.data.data.ids;
    },
    enabled: Boolean(user),
    staleTime: 5 * 60 * 1000,
  });

  const ids = query.data ?? [];

  return { ...query, ids, isSaved: (id: string) => ids.includes(id) };
}

/** Save or unsave one listing. The API answers with the whole list, so the cache is
 *  replaced rather than guessed at. */
export function useToggleSaved() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; saved: boolean }) => {
      const path = `/profile/me/saved/${input.id}`;
      // `saved` is the state it is in now, so saved means remove.
      const res = input.saved
        ? await api.delete<SavedResponse>(path)
        : await api.post<SavedResponse>(path);

      return { ids: res.data.data.ids, message: res.data.message };
    },
    onSuccess: ({ ids }) => {
      queryClient.setQueryData<string[]>(SAVED_KEY, ids);
    },
  });
}
