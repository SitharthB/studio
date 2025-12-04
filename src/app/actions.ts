'use server';

import { answerQuestionsAboutDocuments } from '@/ai/flows/answer-questions-about-documents';
import { generateSummaryOfDocuments } from '@/ai/flows/generate-summary-of-documents';
import { findRelevantDocuments } from '@/ai/flows/find-relevant-documents';
import { z } from 'zod';
import type { Citation, Document } from '@/types';

// This is the full, canonical Document schema.
const FullDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
  collectionId: z.string().nullable(),
  type: z.string(),
  size: z.number(),
  added: z.string(),
});

// This schema represents the shape of the data that is actually being sent from the form.
const FormDocumentSchema = z.object({
    id: z.string(),
    name: z.string(),
    content: z.string(),
});

const AskQuestionSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty.'),
  // The 'documents' field is for non-smart-search and uses the form schema.
  documents: z.array(FormDocumentSchema).optional(),
  isSmartSearch: z.boolean(),
  // The 'allDocuments' field is for smart search and also uses the form schema.
  // The `transform` correctly parses the JSON string from the form.
  allDocuments: z.string().transform((str) => JSON.parse(str) as z.infer<typeof FormDocumentSchema>[]),
});

const SummarizeDocumentsSchema = z.object({
  documents: z.array(z.object({
    name: z.string(),
    content: z.string(),
  })),
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
    allDocuments: formData.get('allDocuments') as string,
    // When in smart search, documents are not selected, so we parse an empty array.
    documents: isSmartSearch ? [] : JSON.parse(formData.get('documents') as string || '[]'),
  };

  const parsed = AskQuestionSchema.safeParse(dataToParse);

  if (!parsed.success) {
    console.error('Zod Validation Error:', parsed.error.flatten());
    return { error: 'Invalid input. Please check the data and try again.' };
  }
  
  // We need the full documents for the response, so we re-parse the raw string with the full schema.
  const allDocumentsForResponse = JSON.parse(formData.get('allDocuments') as string) as Document[];
  const selectedDocumentsForResponse = JSON.parse(formData.get('documents') as string || '[]') as Document[];

  const { question, documents, allDocuments } = parsed.data;
  const selectedDocuments = documents || [];

  try {
    if (isSmartSearch) {
      const result = await findRelevantDocuments({
        query: question,
        // The AI flow expects the same shape as our form schema.
        documents: allDocuments,
      });

      const relevantDocs = allDocumentsForResponse.filter(doc => result.relevantDocumentIds.includes(doc.id));
      
      // Sort relevantDocs based on the order from the AI result
      const sortedDocs = result.relevantDocumentIds.map(id => relevantDocs.find(d => d.id === id)).filter((d): d is Document => !!d);

      return { relevantDocuments: sortedDocs };

    } else {
      if (selectedDocuments.length === 0) {
        return { error: 'Please select at least one document.' };
      }
      const documentContents = selectedDocuments.map((d) => `Document Name: ${d.name}\n\n${d.content}`);

      const result = await answerQuestionsAboutDocuments({
        question,
        documents: documentContents,
      });

      const remappedCitations = result.citations?.map(citation => {
        // Find the document whose name matches the one in the citation.
        const doc = selectedDocumentsForResponse.find(d => d.name === citation.document.replace('Document Name: ', ''));
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
    documents: JSON.parse(formData.get('documents') as string || '[]'),
  });

  if (!parsed.success) {
    console.error(parsed.error);
    return { error: 'Invalid input for summarization.' };
  }

  const { documents } = parsed.data;

  if (documents.length === 0) {
    return { error: 'Please select at least one document to summarize.' };
  }

  try {
      const result = await generateSummaryOfDocuments({
          documents: documents,
      });

      return { summary: result.summary };
  } catch (e: any) {
      console.error(e);
      return { error: e.message || 'Failed to generate summary. Please try again.' };
  }
}
