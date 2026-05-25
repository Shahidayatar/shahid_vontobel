import { create } from "zustand";
import type { ChatMessage } from "@/types/domain";

type ChatState = {
  modelMessages: Record<string, ChatMessage[]>;
  agentMessages: Record<string, ChatMessage[]>;
  setModelMessages: (id: string, messages: ChatMessage[]) => void;
  setAgentMessages: (id: string, messages: ChatMessage[]) => void;
  clearModelMessages: (id: string) => void;
  clearAgentMessages: (id: string) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  modelMessages: {},
  agentMessages: {},
  setModelMessages: (id, messages) =>
    set((state) => ({ modelMessages: { ...state.modelMessages, [id]: messages } })),
  setAgentMessages: (id, messages) =>
    set((state) => ({ agentMessages: { ...state.agentMessages, [id]: messages } })),
  clearModelMessages: (id) =>
    set((state) => ({ modelMessages: { ...state.modelMessages, [id]: [] } })),
  clearAgentMessages: (id) =>
    set((state) => ({ agentMessages: { ...state.agentMessages, [id]: [] } }))
}));