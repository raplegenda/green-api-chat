import { useEffect, useRef } from "react";
import { sendMessage } from "../api/greenApi";
import { useChatDispatch, useChatState } from "../context/ChatContext";
import type { ChatMessage, InstanceCredentials } from "../types";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";

export function ChatWindow({ credentials }: { credentials: InstanceCredentials }) {
  const { chats, activeChatId } = useChatState();
  const dispatch = useChatDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeChat = activeChatId ? chats[activeChatId] : null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [activeChat?.messages.length]);

  if (!activeChat) {
    return (
      <div className="chat-window chat-window-empty">
        <p>Выберите диалог или добавьте новый по номеру телефона слева.</p>
      </div>
    );
  }

  async function handleSend(text: string) {
    const chatId = activeChat!.chatId;
    const localId = crypto.randomUUID();
    const optimisticMessage: ChatMessage = {
      id: localId,
      chatId,
      text,
      direction: "outgoing",
      timestamp: Date.now(),
      status: "sending",
    };
    dispatch({ type: "addMessage", chatId, message: optimisticMessage });

    try {
      await sendMessage(credentials, chatId, text);
      dispatch({ type: "updateMessageStatus", chatId, messageId: localId, status: "sent" });
    } catch {
      dispatch({ type: "updateMessageStatus", chatId, messageId: localId, status: "failed" });
    }
  }

  return (
    <div className="chat-window">
      <header className="chat-window-header">
        <h2>{activeChat.title}</h2>
      </header>

      <div className="chat-window-messages" ref={scrollRef}>
        {activeChat.messages.length === 0 && (
          <p className="chat-window-empty-hint">Сообщений пока нет — напишите первым.</p>
        )}
        {activeChat.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      <MessageInput onSend={handleSend} />
    </div>
  );
}
