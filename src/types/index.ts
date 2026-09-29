/** Credentials that identify a GREEN-API instance. */
export interface InstanceCredentials {
  idInstance: string;
  apiTokenInstance: string;
}

/** A single text message rendered in a chat window. */
export interface ChatMessage {
  id: string;
  chatId: string;
  text: string;
  direction: "outgoing" | "incoming";
  timestamp: number;
  status?: "sending" | "sent" | "failed";
}

/** A conversation with one contact, keyed by its GREEN-API chatId. */
export interface Chat {
  chatId: string;
  title: string;
  messages: ChatMessage[];
}

/** Shape of an incoming webhook as returned by ReceiveNotification. */
export interface IncomingNotification {
  receiptId: number;
  body: {
    typeWebhook: string;
    instanceData?: { idInstance: number };
    timestamp?: number;
    senderData?: { chatId: string; sender: string; senderName?: string };
    messageData?: {
      typeMessage: string;
      textMessageData?: { textMessage: string };
      extendedTextMessageData?: { text: string };
    };
  };
}
