'use server';
/**
 * @fileOverview This file defines a Genkit flow for finding relevant documents based on a user query.
 *
 * - findRelevantDocuments - A function that takes a query and a list of all documents and returns a list of relevant document IDs.
 * - FindRelevantDocumentsInput - The input type for the findRelevantDocuments function.
 * - FindRelevantDocumentsOutput - The return type for the findRelevantDocuments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Document } from '@/types';

export type FindRelevantDocumentsInput = {
  query: string;
  documents: Document[];
};

export type FindRelevantDocumentsOutput = {
  relevantDocumentIds: string[];
};

const DocumentSchemaForAI = z.object({
    id: z.string(),
    name: z.string(),
    content: z.string(),
    collectionId: z.string().nullable(),
    type: z.string(),
    size: z.number(),
    added: z.string(),
});

const FindRelevantDocumentsInputSchema = z.object({
  query: z.string().describe('The user\'s search query or topic of interest.'),
  documents: z.array(DocumentSchemaForAI).describe('The list of all available documents to search through.'),
});

const FindRelevantDocumentsOutputSchema = z.object({
  relevantDocumentIds: z.array(z.string()).describe('An array of document IDs that are most relevant to the user\'s query, ordered by relevance.'),
});

export async function findRelevantDocuments(input: FindRelevantDocumentsInput): Promise<FindRelevantDocumentsOutput> {
  return findRelevantDocumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findRelevantDocumentsPrompt',
  input: {schema: FindRelevantDocumentsInputSchema},
  output: {schema: FindRelevantDocumentsOutputSchema},
  prompt: `You are an expert document analysis AI. Your task is to find the most relevant documents based on a user's query.

  Carefully analyze the user's query:
  "{{{query}}}"

  Now, review the following documents and their content. For each document, determine how relevant it is to the user's query.

  Documents:
  {{#each documents}}
  ---
  Document ID: {{{this.id}}}
  Document Name: {{{this.name}}}
  Document Content:
  {{{this.content}}}
  ---
  {{/each}}

  Based on your analysis, return a JSON object containing an array of the document IDs that are most relevant to the query. The array should be ordered from most relevant to least relevant. Only include documents that have a strong connection to the query. If no documents are relevant, return an empty array.
  `,
});

const findRelevantDocumentsFlow = ai.defineFlow(
  {
    name: 'findRelevantDocumentsFlow',
    inputSchema: FindRelevantDocumentsInputSchema,
    outputSchema: FindRelevantDocumentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
