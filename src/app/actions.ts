'use server';

import { answerQuestionsAboutDocuments } from '@/ai/flows/answer-questions-about-documents';
import { generateSummaryOfDocuments } from '@/ai/flows/generate-summary-of-documents';
import { findRelevantDocuments } from '@/ai/flows/find-relevant-documents';
import { z } from 'zod';
import type { Citation, Document } from '@/types';

const DocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
  collectionId: z.string().nullable(),
  type: z.string(),
  size: z.number(),
  added: z.string(),
});

const AskQuestionSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty.'),
  documents: z.array(DocumentSchema).optional(), // Make documents optional
  isSmartSearch: z.boolean(),
  allDocuments: z.array(DocumentSchema),
});

const SummarizeDocumentsSchema = z.object({
    documents: z.array(DocumentSchema),
});

type AskQuestionState = {
  answer?: string;
  citations?: Citation[];
  relevantDocuments?: Document[];
  error?: string;
};

type SummarizeState = {
  summary?: string;
  error?: string;
};

export async function askQuestion(
  prevState: AskQuestionState,
  formData: FormData
): Promise<AskQuestionState> {
  const isSmartSearch = formData.get('isSmartSearch') === 'true';

  const dataToParse = {
    question: formData.get('question'),
    isSmartSearch: isSmartSearch,
    allDocuments: JSON.parse(formData.get('allDocuments') as string),
    // Conditionally parse documents only when not in smart search mode
    documents: !isSmartSearch ? JSON.parse(formData.get('documents') as string) : [],
  };

  const parsed = AskQuestionSchema.safeParse(dataToParse);


  if (!parsed.success) {
    console.error(parsed.error);
    return { error: 'Invalid input.' };
  }

  const { question, documents, allDocuments } = parsed.data;

  try {
    if (isSmartSearch) {
      const result = await findRelevantDocuments({
        query: question,
        documents: allDocuments,
      });
      const relevantDocs = allDocuments.filter(doc => result.relevantDocumentIds.includes(doc.id));
      
      // Sort relevantDocs based on the order from the AI result
      const sortedDocs = result.relevantDocumentIds.map(id => relevantDocs.find(d => d.id === id)).filter((d): d is Document => !!d);

      return { relevantDocuments: sortedDocs };

    } else {
      if (!documents || documents.length === 0) {
        return { error: 'Please select at least one document.' };
      }
      const documentContents = documents.map((d) => `Document Name: ${d.name}\n\n${d.content}`);

      const result = await answerQuestionsAboutDocuments({
        question,
        documents: documentContents,
      });

      const remappedCitations = result.citations?.map(citation => {
        // Find the document whose name matches the one in the citation.
        const doc = documents.find(d => d.name === citation.document);
        return {
            documentId: doc ? doc.id : 'unknown-doc',
            passage: citation.passage,
            citationNumber: citation.citationNumber,
        };
      }) || [];

      return { answer: result.answer, citations: remappedCitations };
    }
    
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Failed to get an answer from the AI. Please try again.' };
  }
}

export async function summarizeDocuments(
    prevState: SummarizeState,
    formData: FormData
): Promise<SummarizeState> {
  const parsed = SummarizeDocumentsSchema.safeParse({
    documents: JSON.parse(formData.get('documents') as string),
  });

  if (!parsed.success) {
    return { error: 'Invalid input for summarization.' };
  }

  const { documents } = parsed.data;

  if (documents.length === 0) {
    return { error: 'Please select at least one document to summarize.' };
  }

  try {
      const combinedContent = documents.map(d => {
          return `--- Document: ${d.name} ---\n\n${d.content}`;
      }).join('\n\n');
      
      const result = await generateSummaryOfDocuments({
          documents: combinedContent,
      });

      return { summary: result.summary };
  } catch (e: any) {
      console.error(e);
      return { error: e.message || 'Failed to generate summary. Please try again.' };
  }
}
