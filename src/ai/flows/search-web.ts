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


const prompt = ai.definePrompt({
  name: 'searchWebPrompt',
  input: { schema: SearchWebInputSchema },
  output: { schema: SearchWebOutputSchema },
  tools: [ai.googleSearch],
  prompt: `You are an expert web search assistant. Your goal is to provide a comprehensive and accurate answer to the user's question based on information you find on the internet.

  Your task is to:
  1.  Take the user's query and perform a web search using the provided tools.
  2.  Carefully analyze the search results.
  3.  Synthesize the information from the most reliable sources to construct a single, well-written answer.
  4.  The answer should directly address the user's query.
  5.  Base your answer ONLY on the information you find from the web search. Do not use any prior knowledge.
  6.  Format the answer in clear, easy-to-read Markdown.

  User Query: {{{query}}}
  `,
});


export const searchWebFlow = ai.defineFlow(
  {
    name: 'searchWebFlow',
    inputSchema: SearchWebInputSchema,
    outputSchema: SearchWebOutputSchema,
  },
  async (input) => {

    const llmResponse = await prompt(input);

    const text = llmResponse.output!.answer;

    return { answer: text };
  }
);
