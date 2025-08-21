/**
 * @fileOverview Types for the simple chatbot flow.
 *
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 * - ChatInputSchema - The Zod schema for the input type.
 * - ChatOutputSchema - The Zod schema for the output type.
 */
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.array(z.object({text: z.string()})),
});

export const ChatInputSchema = z.object({
  messages: z.array(ChatMessageSchema),
  prompt: z.string(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  text: z.string(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;
