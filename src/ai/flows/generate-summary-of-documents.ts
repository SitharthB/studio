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
import { generateSummaryOfDocument } from './generate-summary-of-document';


const DocumentSchema = z.object({
  name: z.string().describe('The name of the document.'),
  content: z.string().describe('The text content of the document.'),
});

const GenerateSummaryOfDocumentsInputSchema = z.object({
  documents: z.array(DocumentSchema).describe('The documents to summarize.'),
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
  input: {schema: z.object({
    documentSummaries: z.array(z.string()).describe('The summaries of the documents to combine.')
  })},
  output: {schema: GenerateSummaryOfDocumentsOutputSchema},
  prompt: `Provide a concise and structured summary that synthesizes the key information from the following document summaries. The summary should represent the combined insights from all provided texts.

  Summaries:
  {{#each documentSummaries}}
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
  async (input) => {
    // "Map" step: Generate a summary for each document individually.
    const summaries = await Promise.all(
      input.documents.map(async (doc) => {
        // Correctly call the async function from the other module.
        const singleSummary = await generateSummaryOfDocument({ documentText: doc.content });
        return `Document: ${doc.name}\nSummary: ${singleSummary.summary}`;
      })
    );

    // "Reduce" step: Combine the individual summaries into a single master summary.
    const { output } = await prompt({ documentSummaries: summaries });
    return output!;
  }
);
