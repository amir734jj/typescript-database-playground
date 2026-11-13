import get from "lodash/get.js";
import { DateTime } from "luxon";
import store from "store2";
import { z } from "zod";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { TokenResponse, UserResponse } from "../api/generated.ts";

interface Session {
  token: TokenResponse;
  user: UserResponse | null;
}

interface AuthState {
  session: Session | null;
  setSession: (session: Session | null) => void;
}

const storageKey = "api-playground-session";
const tokenSchema = z
  .object({
    accessToken: z.string().min(1),
    tokenType: z.literal("Bearer"),
    expiresAt: z.string().refine((value) => DateTime.fromISO(value).isValid),
  })
  .nullable();

function getSessionStorage() {
  if (store.session.isFake()) {
    throw new Error("Browser session storage is unavailable.");
  }
  return store.session;
}

export function readStoredToken() {
  const storage = getSessionStorage();
  const saved: unknown = storage.get(storageKey);
  // Accept tokens saved by the previous Zustand persistence format.
  const result = tokenSchema.safeParse(get(saved, "state.token", saved));
  if (!result.success) {
    storage.remove(storageKey);
    throw new Error("Stored session token is invalid. Please sign in again.");
  }
  return result.data;
}

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    session: null,
    setSession: (session) => {
      const storage = getSessionStorage();
      if (session) storage.set(storageKey, session.token);
      else storage.remove(storageKey);
      set((state) => {
        state.session = session;
      });
    },
  })),
);

export const selectIsAdmin = (state: AuthState) =>
  state.session?.user?.roles.includes("admin") ?? false;
