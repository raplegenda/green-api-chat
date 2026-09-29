import { useState, type FormEvent, type KeyboardEvent } from "react";

interface Props {
  disabled?: boolean;
  onSend: (text: string) => void;
}

export function MessageInput({ disabled, onSend }: Props) {
  const [text, setText] = useState("");

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <form className="message-input" onSubmit={submit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Сообщение"
        disabled={disabled}
        rows={1}
      />
      <button type="submit" disabled={disabled || !text.trim()}>
        Отправить
      </button>
    </form>
  );
}
