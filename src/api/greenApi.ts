import type { IncomingNotification, InstanceCredentials } from "../types";

const DEFAULT_API_URL = "https://api.green-api.com";

/** Base URL can be overridden per environment via VITE_GREEN_API_URL. */
const apiUrl = (import.meta.env.VITE_GREEN_API_URL as string | undefined) ?? DEFAULT_API_URL;

function endpoint(method: string, { idInstance, apiTokenInstance }: InstanceCredentials): string {
  return `${apiUrl}/waInstance${idInstance}/${method}/${apiTokenInstance}`;
}

export class GreenApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "GreenApiError";
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new GreenApiError(
      `GREEN-API request failed (${response.status}): ${body || response.statusText}`,
      response.status,
    );
  }
  return response.json() as Promise<T>;
}

/**
 * Confirms the instance credentials are valid and authorized by checking
 * the account state. Used right after login so bad credentials fail fast
 * with a clear message instead of silently breaking the polling loop later.
 */
export async function getInstanceState(
  credentials: InstanceCredentials,
): Promise<{ stateInstance: string }> {
  return request(endpoint("getStateInstance", credentials));
}

/** Sends a plain text message to a chat. Returns the id GREEN-API assigned it. */
export async function sendMessage(
  credentials: InstanceCredentials,
  chatId: string,
  message: string,
): Promise<{ idMessage: string }> {
  return request(endpoint("sendMessage", credentials), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, message }),
  });
}

/**
 * Pulls the next queued notification (incoming message, status update, etc.),
 * or null when the queue is empty. Callers must follow up with
 * deleteNotification once they've handled the result, or it will be
 * redelivered.
 */
export async function receiveNotification(
  credentials: InstanceCredentials,
): Promise<IncomingNotification | null> {
  const result = await request<IncomingNotification | Record<string, never> | null>(
    endpoint("receiveNotification", credentials),
  );
  return result && "receiptId" in result ? (result as IncomingNotification) : null;
}

/** Confirms a notification was processed so it is removed from the queue. */
export async function deleteNotification(
  credentials: InstanceCredentials,
  receiptId: number,
): Promise<{ result: boolean }> {
  return request(`${endpoint("deleteNotification", credentials)}/${receiptId}`, {
    method: "DELETE",
  });
}

/** Builds a personal-chat id from a plain phone number, e.g. "77071234567" -> "77071234567@c.us". */
export function phoneToChatId(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, "");
  return `${digitsOnly}@c.us`;
}
