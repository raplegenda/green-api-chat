import { useCallback, useState } from "react";
import { ChatWindow } from "./components/ChatWindow";
import { LoginScreen } from "./components/LoginScreen";
import { Sidebar } from "./components/Sidebar";
import { ChatProvider, useChatDispatch } from "./context/ChatContext";
import { useNotificationPolling } from "./hooks/useNotificationPolling";
import type { ChatMessage, IncomingNotification, InstanceCredentials } from "./types";

function extractMessageText(notification: IncomingNotification): string | null {
  const data = notification.body.messageData;
  if (!data) return null;
  return data.textMessageData?.textMessage ?? data.extendedTextMessageData?.text ?? null;
}

function ChatApp({ credentials }: { credentials: InstanceCredentials }) {
  const dispatch = useChatDispatch();

  const handleIncoming = useCallback(
    (notification: IncomingNotification) => {
      if (notification.body.typeWebhook !== "incomingMessageReceived") return;

      const text = extractMessageText(notification);
      const chatId = notification.body.senderData?.chatId;
      if (!text || !chatId) return;

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        chatId,
        text,
        direction: "incoming",
        timestamp: (notification.body.timestamp ?? Date.now() / 1000) * 1000,
      };
      dispatch({
        type: "addMessage",
        chatId,
        message,
        title: notification.body.senderData?.senderName,
      });
    },
    [dispatch],
  );

  useNotificationPolling(credentials, handleIncoming);

  return (
    <div className="app-layout">
      <Sidebar />
      <ChatWindow credentials={credentials} />
    </div>
  );
}

export default function App() {
  const [credentials, setCredentials] = useState<InstanceCredentials | null>(null);

  if (!credentials) {
    return <LoginScreen onSuccess={setCredentials} />;
  }

  return (
    <ChatProvider>
      <ChatApp credentials={credentials} />
    </ChatProvider>
  );
}
