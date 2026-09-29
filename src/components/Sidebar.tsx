import { useState, type FormEvent } from "react";
import { phoneToChatId } from "../api/greenApi";
import { useChatDispatch, useChatState } from "../context/ChatContext";

export function Sidebar() {
  const { chats, activeChatId } = useChatState();
  const dispatch = useChatDispatch();
  const [phone, setPhone] = useState("");

  const chatList = Object.values(chats).sort((a, b) => {
    const aLast = a.messages.at(-1)?.timestamp ?? 0;
    const bLast = b.messages.at(-1)?.timestamp ?? 0;
    return bLast - aLast;
  });

  function handleAddChat(e: FormEvent) {
    e.preventDefault();
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 6) return;
    const chatId = phoneToChatId(digitsOnly);
    dispatch({ type: "ensureChat", chatId });
    dispatch({ type: "setActiveChat", chatId });
    setPhone("");
  }

  return (
    <aside className="sidebar">
      <form className="new-chat-form" onSubmit={handleAddChat}>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Номер телефона, напр. 77071234567"
        />
        <button type="submit">+</button>
      </form>

      <ul className="chat-list">
        {chatList.length === 0 && <li className="chat-list-empty">Пока нет диалогов</li>}
        {chatList.map((chat) => {
          const last = chat.messages.at(-1);
          return (
            <li
              key={chat.chatId}
              className={chat.chatId === activeChatId ? "chat-list-item active" : "chat-list-item"}
              onClick={() => dispatch({ type: "setActiveChat", chatId: chat.chatId })}
            >
              <span className="chat-list-title">{chat.title}</span>
              <span className="chat-list-preview">{last?.text ?? "Нет сообщений"}</span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
