'use server';
/**
 * @fileoverview This file is the entrypoint for Genkit flows in production.
 * It is used to expose the flows as API endpoints.
 */

import { nextHandler } from '@genkit-ai/next';
import '@/ai/flows/answer-questions-about-documents';
import '@/ai/flows/find-relevant-documents';
import '@/ai/flows/generate-summary-of-documents';

export const POST = nextHandler();
