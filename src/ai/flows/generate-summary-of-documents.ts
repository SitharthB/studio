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
  documents: z.array(z.string()).describe('The text content of the documents to summarize.'),
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
  input: {schema: GenerateSummaryOfDocumentsInputSchema},
  output: {schema: GenerateSummaryOfDocumentsOutputSchema},
  prompt: `Provide a concise and structured summary that synthesizes the key information from the following documents. The summary should represent the combined insights from all provided texts.

  Documents:
  {{#each documents}}
  ---
  {{{this}}}
  ---
  {{/each}}
  `,
});

const generateSummaryOfDocumentsFlow = ai.defineFlow(
  {
    name: 'generateSummaryOfDocumentsFlow',
    inputSchema: GenerateSummaryOfDocumentsInputSchema,
    outputSchema: GenerateSummaryOfDocumentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
