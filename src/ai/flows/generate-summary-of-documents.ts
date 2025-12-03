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

const GenerateSummaryOfDocumentsInputSchema = z.object({
  documents: z.string().describe('A single string containing the content of all documents to be summarized, separated by headers.'),
});
export type GenerateSummaryOfDocumentsInput = z.infer<typeof GenerateSummaryOfDocumentsInputSchema>;

const GenerateSummaryOfDocumentsOutputSchema = z.object({
  summary: z.string().describe('The combined summary of all the documents.'),
});
export type GenerateSummaryOfDocumentsOutput = z.infer<typeof GenerateSummaryOfDocumentsOutputSchema>;

export async function generateSummaryOfDocuments(input: GenerateSummaryOfDocumentsInput): Promise<GenerateSummaryOfDocumentsOutput> {
  return generateSummaryOfDocumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSummaryOfDocumentsPrompt',
  input: {schema: GenerateSummaryOfDocumentsInputSchema },
  output: {schema: GenerateSummaryOfDocumentsOutputSchema},
  prompt: `Provide a concise and structured overall summary that synthesizes the key information from the following text, which contains one or more documents.

  Here is the text:
  {{{documents}}}
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
