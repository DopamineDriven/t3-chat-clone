"use client";

import React, { createContext, useContext } from "react";
import { useSession } from "next-auth/react";
import type { ChatWsEvent } from "@/types/chat-ws";
import { useChatWebSocket } from "@/hooks/use-chat-ws";

export interface ChatWebSocketContextValue {
  lastEvent: ChatWsEvent | null;
  isConnected: boolean;
  sendEvent: (event: ChatWsEvent) => void;
}

const ChatWebSocketContext = createContext<ChatWebSocketContextValue | null>(
  null
);

export function ChatWebSocketProvider({
  children,
  email
}: {
  children: React.ReactNode;
  email?: string;
}) {
  const { data: session } = useSession();

  console.log(JSON.stringify(session, null, 2));
  const { lastEvent, isConnected, sendEvent } = useChatWebSocket(
    `${process.env.NEXT_PUBLIC_WS_URL}?email=${email ?? session?.user?.email}`
  );

  return (
    <ChatWebSocketContext.Provider
      value={{ lastEvent, isConnected, sendEvent }}>
      {children}
    </ChatWebSocketContext.Provider>
  );
}

export function useChatWebSocketContext() {
  const context = useContext(ChatWebSocketContext);
  if (!context) {
    throw new Error(
      "useChatWebSocketContext must be used within ChatWebSocketProvider"
    );
  }
  return context;
}
