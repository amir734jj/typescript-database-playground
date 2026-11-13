import { DateTime } from "luxon";
import {
  authControllerLogin,
  authControllerLogout,
  authControllerRefresh,
  authControllerRegister,
  usersControllerDelete,
  usersControllerMe,
  usersControllerUpdate,
} from "../api/generated.ts";
import type {
  LoginRequest,
  RegisterRequest,
  UpdateUserRequest,
} from "../api/generated.ts";
import { readStoredToken, useAuthStore } from "../state/auth.ts";

async function login(credentials: LoginRequest, signal?: AbortSignal) {
  const token = await authControllerLogin(credentials, { signal });
  const user = await usersControllerMe({
    headers: { Authorization: `Bearer ${token.accessToken}` },
    signal,
  });
  signal?.throwIfAborted();
  useAuthStore.getState().setSession({ token, user });
}

export async function initializeSession(signal?: AbortSignal) {
  const token = readStoredToken();
  const { setSession } = useAuthStore.getState();
  if (token) {
    if (DateTime.fromISO(token.expiresAt) <= DateTime.now()) {
      setSession(null);
      throw new Error("Your session expired. Please sign in again.");
    }
    const user = await usersControllerMe({
      headers: { Authorization: `Bearer ${token.accessToken}` },
      signal,
    });
    signal?.throwIfAborted();
    setSession({ token, user });
  }
}

export function signIn(credentials: LoginRequest, signal?: AbortSignal) {
  return login(credentials, signal);
}

export async function register(data: RegisterRequest, signal?: AbortSignal) {
  await authControllerRegister(data, { signal });
  await login({ email: data.email, password: data.password }, signal);
}

export async function saveProfile(
  data: UpdateUserRequest,
  signal?: AbortSignal,
) {
  await usersControllerUpdate(data, { signal });
  // PATCH does not hydrate role associations.
  const user = await usersControllerMe({ signal });
  signal?.throwIfAborted();
  const { session, setSession } = useAuthStore.getState();
  if (!session) throw new Error("Your session ended. Please sign in again.");
  setSession({ ...session, user });
}

export async function refreshSession(signal?: AbortSignal) {
  const { session, setSession } = useAuthStore.getState();
  if (!session?.user)
    throw new Error("Your session ended. Please sign in again.");
  const token = await authControllerRefresh({ signal });
  signal?.throwIfAborted();
  if (
    useAuthStore.getState().session?.token.accessToken !==
    session.token.accessToken
  ) {
    throw new Error("Your session changed. Please try again.");
  }
  setSession({ ...session, token });
}

export async function signOut(signal?: AbortSignal) {
  await authControllerLogout({ signal });
  signal?.throwIfAborted();
  useAuthStore.getState().setSession(null);
}

export async function deleteAccount(signal?: AbortSignal) {
  await usersControllerDelete({ signal });
  signal?.throwIfAborted();
  useAuthStore.getState().setSession(null);
}
