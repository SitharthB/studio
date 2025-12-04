'use server';
/**
 * @fileOverview This file registers the Genkit flows with the Next.js development server.
 *
 * It's important to keep this file up-to-date with all the flows you want to be available
 * in your application.
 */

import { config } from 'dotenv';
config();

import '@/ai/flows/answer-questions-about-documents.ts';
import '@/ai/flows/generate-summary-of-documents.ts';

    