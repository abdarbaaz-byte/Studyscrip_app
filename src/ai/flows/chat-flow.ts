
'use server';
/**
 * @fileOverview A simple chatbot flow.
 *
 * - chat - A function that handles the chatbot conversation.
 */
import {ai} from '../genkit';
import {ChatInput, ChatOutput, ChatOutputSchema} from './chat-flow-types';

export async function chat(input: ChatInput): Promise<ChatOutput> {
  const llmResponse = await ai.generate({
    model: 'googleai/gemini-1.0-pro',
    prompt: input.prompt,
    history: input.messages,
    output: {
      schema: ChatOutputSchema,
    },
  });
  return llmResponse.output as ChatOutput;
}
