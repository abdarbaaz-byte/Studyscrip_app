'use server';
/**
 * @fileOverview A simple chatbot flow.
 *
 * - chat - A function that handles the chatbot conversation.
 */

import {ai} from '@/ai/genkit';
import {
  ChatInput,
  ChatInputSchema,
  ChatOutput,
  ChatOutputSchema,
} from './chat-flow-types';

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {prompt, messages} = input;
    const history = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const llmResponse = await ai.generate({
      prompt: prompt,
      history: history,
      model: 'googleai/gemini-2.0-flash',
    });

    return {
      text: llmResponse.text,
    };
  }
);
