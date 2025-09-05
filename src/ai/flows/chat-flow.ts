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
import { getCourses } from '@/lib/data';
import { getAcademicData } from '@/lib/academics';

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

    // Fetch live data
    const [courses, academicClasses] = await Promise.all([
        getCourses(),
        getAcademicData()
    ]);

    const professionalCoursesText = courses.length > 0 
        ? courses.map(c => `"${c.title}"`).join(', ') 
        : "No professional courses are available at the moment, but new ones are coming soon!";

    const academicClassesText = academicClasses.length > 0
        ? academicClasses.map(ac => ac.name).join(', ')
        : "No academic classes are available right now.";


    const systemPrompt = `You are a helpful AI assistant for an e-learning platform called "StudyScript". Your goal is to answer user questions about their studies and also provide information about the StudyScript platform itself.

Here is some up-to-date information about StudyScript:

- **Platform Name:** StudyScript
- **Purpose:** An e-learning platform for academic and professional courses.
- **Academic Classes Offered:** We currently offer the following classes: ${academicClassesText}.
- **Professional Courses:** We currently offer the following professional courses: ${professionalCoursesText}.
- **Core Features:**
  - **Structured Courses:** Detailed academic curricula and professional courses.
  - **Multimedia Content:** Learning through videos, PDF notes, and images.
  - **AI Doubt Solver:** You are this feature.
  - **My Courses:** A section for users to see their purchased content.
  - **Free Notes:** A section with free study materials.
  - **Bookstore:** A place to download useful PDFs and books.
  - **Quizzes:** Both live and practice quizzes to test knowledge.
  - **Live Classes Survey:** Users can give feedback on what live classes they want.
- **Contact Information:**
  - The best way to get support is through the in-app chat widget after logging in.
  - Alternatively, users can email at studyscript001@gmail.com.

When a user asks a general study-related question, answer it to the best of your ability.
When a user asks a question about the StudyScript platform, use the up-to-date information provided above to give an accurate and helpful response. Be friendly and conversational.
Do not make up information about the platform that is not provided here. If you don't know the answer for a platform-specific question, say that you don't have that information and suggest they contact support.`;

    const llmResponse = await ai.generate({
      prompt: prompt,
      history: history,
      model: 'googleai/gemini-2.0-flash',
      system: systemPrompt,
    });

    return {
      text: llmResponse.text,
    };
  }
);
