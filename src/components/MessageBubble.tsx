import type { ChatMessage } from "../types";

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isOutgoing = message.direction === "outgoing";
  return (
    <div className={isOutgoing ? "bubble bubble-outgoing" : "bubble bubble-incoming"}>
      <p className="bubble-text">{message.text}</p>
      <span className="bubble-meta">
        {formatTime(message.timestamp)}
        {isOutgoing && message.status === "failed" && " · не отправлено"}
        {isOutgoing && message.status === "sending" && " · отправка…"}
      </span>
    </div>
  );
}
