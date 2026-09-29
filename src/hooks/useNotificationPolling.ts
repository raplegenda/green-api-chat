import { useEffect, useRef } from "react";
import { deleteNotification, receiveNotification } from "../api/greenApi";
import type { IncomingNotification, InstanceCredentials } from "../types";

const POLL_INTERVAL_MS = 3000;
const ERROR_BACKOFF_MS = 8000;

/**
 * Continuously polls GREEN-API for incoming webhooks via the HTTP API
 * technology (ReceiveNotification -> handle -> DeleteNotification -> repeat).
 * Stops cleanly on unmount or when credentials are cleared.
 */
export function useNotificationPolling(
  credentials: InstanceCredentials | null,
  onMessage: (notification: IncomingNotification) => void,
) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!credentials) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function pollOnce() {
      try {
        const notification = await receiveNotification(credentials!);
        if (cancelled) return;

        if (notification) {
          onMessageRef.current(notification);
          await deleteNotification(credentials!, notification.receiptId);
          // Immediately check for more queued messages instead of waiting.
          if (!cancelled) timeoutId = setTimeout(pollOnce, 0);
          return;
        }
      } catch {
        // Network hiccups or rate limits: back off rather than hammer the API.
        if (!cancelled) timeoutId = setTimeout(pollOnce, ERROR_BACKOFF_MS);
        return;
      }
      if (!cancelled) timeoutId = setTimeout(pollOnce, POLL_INTERVAL_MS);
    }

    pollOnce();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [credentials]);
}
