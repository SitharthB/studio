'use server';
/**
 * @fileOverview Summarizes a list of documents using AI.
 *
 * - generateSummaryOfDocuments - A function that generates a summary of multiple documents.
 * - GenerateSummaryOfDocumentsInput - The input type for the generateSummaryOfDocuments function.
 * - GenerateSummaryOfDocumentsOutput - The return type for the generateSummaryOfDocuments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export type GenerateSummaryOfDocumentsInput = {
  documents: {name: string, content: string}[];
};

export type GenerateSummaryOfDocumentsOutput = {
  summary: string;
};

const GenerateSummaryOfDocumentsInputSchema = z.object({
  documents: z.array(z.object({
    name: z.string(),
    content: z.string(),
  })).describe('An array of document objects to be summarized.'),
});

const GenerateSummaryOfDocumentsOutputSchema = z.object({
  summary: z.string().describe('The combined summary of all the documents.'),
});


export async function generateSummaryOfDocuments(input: GenerateSummaryOfDocumentsInput): Promise<GenerateSummaryOfDocumentsOutput> {
  return generateSummaryOfDocumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSummaryOfDocumentsPrompt',
  input: {schema: GenerateSummaryOfDocumentsInputSchema },
  output: {schema: GenerateSummaryOfDocumentsOutputSchema},
  prompt: `Provide a concise and structured overall summary that synthesizes the key information from the following documents.

  Here are the documents:
  {{#each documents}}
  --- Document: {{{this.name}}} ---
  {{{this.content}}}
  {{/each}}
  `,
});

const generateSummaryOfDocumentsFlow = ai.defineFlow(
  {
    name: 'generateSummaryOfDocumentsFlow',
    inputSchema: GenerateSummaryOfDocumentsInputSchema,
    outputSchema: GenerateSummaryOfDocumentsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
