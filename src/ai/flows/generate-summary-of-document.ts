'use server';
/**
 * @fileOverview Summarizes a document using AI.
 *
 * - generateSummaryOfDocument - A function that generates a summary of a document.
 * - GenerateSummaryOfDocumentInput - The input type for the generateSummaryOfDocument function.
 * - GenerateSummaryOfDocumentOutput - The return type for the generateSummaryOfDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSummaryOfDocumentInputSchema = z.object({
  documentText: z.string().describe('The text content of the document to summarize.'),
});
export type GenerateSummaryOfDocumentInput = z.infer<typeof GenerateSummaryOfDocumentInputSchema>;

const GenerateSummaryOfDocumentOutputSchema = z.object({
  summary: z.string().describe('The summary of the document.'),
});
export type GenerateSummaryOfDocumentOutput = z.infer<typeof GenerateSummaryOfDocumentOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateSummaryOfDocumentPrompt',
  input: {schema: GenerateSummaryOfDocumentInputSchema},
  output: {schema: GenerateSummaryOfDocumentOutputSchema},
  prompt: `Summarize the following document. The summary should be concise and capture the main points of the document.\n\nDocument:\n{{{documentText}}}`,
});

// This is now an async function that can be directly called by other flows.
export async function generateSummaryOfDocument(input: GenerateSummaryOfDocumentInput): Promise<GenerateSummaryOfDocumentOutput> {
  const {output} = await prompt(input);
  return output!;
}
