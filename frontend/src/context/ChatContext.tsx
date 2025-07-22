'use client';

import React, { createContext, useReducer, useContext, ReactNode, Dispatch } from "react";

// Tipos de mensaje y estado
export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
};

export type WizardStep = {
  id: string;
  question: string;
  answer: string;
  valid: boolean;
};

export type ChatState = {
  messages: Message[];
  wizard: WizardStep[];
  currentStep: number;
  loading: boolean;
};

const initialState: ChatState = {
  messages: [],
  wizard: [],
  currentStep: 0,
  loading: false,
};

// Acciones
export type ChatAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_WIZARD"; payload: WizardStep[] }
  | { type: "SET_STEP"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET" };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "SET_WIZARD":
      return { ...state, wizard: action.payload };
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const ChatContext = createContext<{
  state: ChatState;
  dispatch: Dispatch<ChatAction>;
} | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat debe usarse dentro de ChatProvider");
  return context;
} 