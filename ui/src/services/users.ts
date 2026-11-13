import {
  adminControllerListUsers,
  adminControllerSetRole,
} from "../api/generated.ts";
import type { UpdateRoleRequestRole } from "../api/generated.ts";
import { useAuthStore } from "../state/auth.ts";

export function loadUsers(signal?: AbortSignal) {
  return adminControllerListUsers({ signal });
}

export async function changeRole(
  id: string,
  role: UpdateRoleRequestRole,
  signal?: AbortSignal,
) {
  const user = await adminControllerSetRole(id, { role }, { signal });
  signal?.throwIfAborted();
  const { session, setSession } = useAuthStore.getState();
  if (session?.user?.id === id) setSession({ ...session, user });
  return user;
}
