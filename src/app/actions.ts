'use server';

import { answerQuestionsAboutDocuments } from '@/ai/flows/answer-questions-about-documents';
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
  });

  if (!parsed.success) {
    return { error: 'Invalid input.' };
  }

  const { question, documents } = parsed.data;

  if (documents.length === 0) {
    return { error: 'Please select at least one document to ask questions about.' };
  }

  try {
    const result = await answerQuestionsAboutDocuments({
      question,
      documents: documents.map((d) => `Document Name: ${d.name}\n\n${d.content}`),
    });

    const remappedCitations = result.citations?.map(citation => {
        // The AI is asked to return the document name. We find the corresponding ID.
        const doc = documents.find(d => d.name === citation.document);
        return {
            documentId: doc ? doc.id : 'unknown',
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
