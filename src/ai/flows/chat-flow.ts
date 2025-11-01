
'use server';
/**
 * @fileOverview A simple chatbot flow.
 *
 * - chat - A function that handles the chatbot conversation.
 */
import { ChatInput, ChatOutput } from './chat-flow-types';
// This flow is temporarily disabled to resolve package dependency issues.
export async function chat(input: ChatInput): Promise<ChatOutput> {
  console.warn("AI features are temporarily disabled.");
  return {
    text: "I'm sorry, my AI capabilities are temporarily offline while we resolve some technical issues. Please check back later."
  };
}
