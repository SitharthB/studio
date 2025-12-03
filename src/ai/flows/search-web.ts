'use server';
/**
 * @fileOverview Defines a Genkit flow for performing a web search to answer a user's question.
 *
 * - searchWebFlow - A flow that takes a user's query, uses the Gemini model's built-in
 *   web search capabilities, and returns a direct answer.
 * - SearchWebInput - The input type for the searchWebFlow.
 * - SearchWebOutput - The return type for the searchWebFlow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SearchWebInputSchema = z.object({
  query: z.string().describe('The user\'s question to be answered using a web search.'),
});
export type SearchWebInput = z.infer<typeof SearchWebInputSchema>;

const SearchWebOutputSchema = z.object({
  answer: z.string().describe('The answer to the query, generated from web search results.'),
});
export type SearchWebOutput = z.infer<typeof SearchWebOutputSchema>;

export const searchWebFlow = ai.defineFlow(
  {
    name: 'searchWebFlow',
    inputSchema: SearchWebInputSchema,
    outputSchema: SearchWebOutputSchema,
  },
  async (input) => {

    const llmResponse = await ai.generate({
      prompt: input.query,
      tools: [ai.googleSearch], // Enable the built-in Google Search tool
      config: {
        // Higher temperature for more creative/fluent web-based answers
        temperature: 0.7,
      },
    });

    const text = llmResponse.text;

    return { answer: text };
  }
);
