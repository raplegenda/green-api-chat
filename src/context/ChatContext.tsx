import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import type { Chat, ChatMessage } from "../types";

interface ChatState {
  chats: Record<string, Chat>;
  activeChatId: string | null;
}

type ChatAction =
  | { type: "ensureChat"; chatId: string; title?: string }
  | { type: "addMessage"; chatId: string; message: ChatMessage; title?: string }
  | { type: "updateMessageStatus"; chatId: string; messageId: string; status: ChatMessage["status"] }
  | { type: "setActiveChat"; chatId: string };

function titleFromChatId(chatId: string): string {
  return chatId.replace(/@c\.us$|@g\.us$/, "");
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ensureChat": {
      if (state.chats[action.chatId]) return state;
      return {
        ...state,
        chats: {
          ...state.chats,
          [action.chatId]: {
            chatId: action.chatId,
            title: action.title ?? titleFromChatId(action.chatId),
            messages: [],
          },
        },
        activeChatId: state.activeChatId ?? action.chatId,
      };
    }
    case "addMessage": {
      const existing = state.chats[action.chatId] ?? {
        chatId: action.chatId,
        title: action.title ?? titleFromChatId(action.chatId),
        messages: [],
      };
      return {
        ...state,
        chats: {
          ...state.chats,
          [action.chatId]: { ...existing, messages: [...existing.messages, action.message] },
        },
        activeChatId: state.activeChatId ?? action.chatId,
      };
    }
    case "updateMessageStatus": {
      const chat = state.chats[action.chatId];
      if (!chat) return state;
      return {
        ...state,
        chats: {
          ...state.chats,
          [action.chatId]: {
            ...chat,
            messages: chat.messages.map((m) =>
              m.id === action.messageId ? { ...m, status: action.status } : m,
            ),
          },
        },
      };
    }
    case "setActiveChat":
      return { ...state, activeChatId: action.chatId };
    default:
      return state;
  }
}

const ChatStateContext = createContext<ChatState | null>(null);
const ChatDispatchContext = createContext<React.Dispatch<ChatAction> | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, { chats: {}, activeChatId: null });
  const memoState = useMemo(() => state, [state]);
  return (
    <ChatStateContext.Provider value={memoState}>
      <ChatDispatchContext.Provider value={dispatch}>{children}</ChatDispatchContext.Provider>
    </ChatStateContext.Provider>
  );
}

export function useChatState(): ChatState {
  const ctx = useContext(ChatStateContext);
  if (!ctx) throw new Error("useChatState must be used within ChatProvider");
  return ctx;
}

export function useChatDispatch(): React.Dispatch<ChatAction> {
  const ctx = useContext(ChatDispatchContext);
  if (!ctx) throw new Error("useChatDispatch must be used within ChatProvider");
  return ctx;
}
