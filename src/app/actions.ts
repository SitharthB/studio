'use server';

import { answerQuestionsAboutDocuments } from '@/ai/flows/answer-questions-about-documents';
import { answerQuestionsUsingDocumentsAndWeb } from '@/ai/flows/answer-questions-using-documents-and-web';
import { generateSummaryOfDocuments } from '@/ai/flows/generate-summary-of-documents';
import { searchWebFlow } from '@/ai/flows/search-web';
import { z } from 'zod';
import type { Citation } from '@/types';

const DocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
});

const AskQuestionSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty.'),
  documents: z.array(DocumentSchema),
  isWebSearchEnabled: z.boolean(),
});

const SummarizeDocumentsSchema = z.object({
    documents: z.array(DocumentSchema),
});

const SearchWebSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty.'),
});

type AskQuestionState = {
  answer?: string;
  citations?: Citation[];
  error?: string;
};

type SummarizeState = {
  summary?: string;
  error?: string;
};

type WebSearchState = {
    answer?: string;
    error?: string;
}


export async function askQuestion(
  prevState: AskQuestionState,
  formData: FormData
): Promise<AskQuestionState> {
  const parsed = AskQuestionSchema.safeParse({
    question: formData.get('question'),
    documents: JSON.parse(formData.get('documents') as string),
    isWebSearchEnabled: formData.get('isWebSearchEnabled') === 'true',
  });

  if (!parsed.success) {
    return { error: 'Invalid input.' };
  }

  const { question, documents, isWebSearchEnabled } = parsed.data;

  if (documents.length === 0 && !isWebSearchEnabled) {
    return { error: 'Please select at least one document or enable web search.' };
  }

  try {
    let result;
    const documentContents = documents.map((d) => `Document Name: ${d.name}\n\n${d.content}`);

    if (isWebSearchEnabled) {
       result = await answerQuestionsUsingDocumentsAndWeb({
        question,
        documents: documentContents,
      });
    } else {
       result = await answerQuestionsAboutDocuments({
        question,
        documents: documentContents,
      });
    }
    
    const remappedCitations = result.citations?.map(citation => {
        // The AI is asked to return the document name. We find the corresponding ID.
        // If it's a web search, the ID can be 'web-search'
        const doc = documents.find(d => d.name === citation.document);
        return {
            documentId: doc ? doc.id : 'web-search',
            passage: citation.passage,
            citationNumber: citation.citationNumber,
        };
    }) || [];

    return { answer: result.answer, citations: remappedCitations };
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

export async function searchWeb(
    prevState: WebSearchState,
    formData: FormData
): Promise<WebSearchState> {
    const parsed = SearchWebSchema.safeParse({
        question: formData.get('question'),
    });

    if (!parsed.success) {
        return { error: 'Invalid input for web search.' };
    }

    const { question } = parsed.data;

    try {
        const result = await searchWebFlow({ query: question });
        return { answer: result.answer };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Failed to get an answer from the web. Please try again.' };
    }
}
