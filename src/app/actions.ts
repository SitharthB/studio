'use server';

import { answerQuestionsAboutDocuments } from '@/ai/flows/answer-questions-about-documents';
import { z } from 'zod';
import type { Citation } from '@/types';

const AskQuestionSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty.'),
  documents: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      content: z.string(),
    })
  ),
});

type AskQuestionState = {
  answer?: string;
  citations?: Citation[];
  error?: string;
};

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
  } catch (e) {
    console.error(e);
    return { error: 'Failed to get an answer from the AI. Please try again.' };
  }
}
