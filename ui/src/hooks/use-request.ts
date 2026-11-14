import { isAxiosError, isCancel } from "axios";
import { useCallback, useLayoutEffect, useMemo, useState } from "preact/hooks";
import { useAuthStore } from "../state/auth";
import _ from 'lodash';

function errorMessage(failure: unknown): string {
  if (isAxiosError<{ error?: unknown }>(failure)) {
    const message = failure.response?.data?.error;
    if (_.isString(message)) return message;
    if (!failure.response)
      return "Cannot reach the API. Check that the server is running.";
    return `Request failed (${failure.response.status}).`;
  }
  return failure instanceof Error
    ? failure.message
    : "An unexpected error occurred.";
}

export function useRequest() {
  const [pending, setPending] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const controller = useMemo(() => new AbortController(), []);

  useLayoutEffect(() => () => controller.abort(), [controller]);

  const runRequest = useCallback(
    async (
      action: (signal: AbortSignal) => Promise<unknown>,
      success?: string,
    ) => {
      if (controller.signal.aborted) return false;
      const token = useAuthStore.getState().session?.token.accessToken;
      setPending((count) => count + 1);
      setError("");
      setNotice("");
      try {
        await action(controller.signal);
        if (controller.signal.aborted) return false;
        if (success) setNotice(success);
        return true;
      } catch (failure) {
        if (isCancel(failure) || controller.signal.aborted) return false;
        setError(errorMessage(failure));
        if (
          isAxiosError(failure) &&
          failure.response?.status === 401 &&
          useAuthStore.getState().session?.token.accessToken === token
        ) {
          useAuthStore.getState().setSession(null);
        }
        return false;
      } finally {
        if (!controller.signal.aborted) setPending((count) => count - 1);
      }
    },
    [controller],
  );

  return { busy: pending > 0, error, notice, runRequest };
}
