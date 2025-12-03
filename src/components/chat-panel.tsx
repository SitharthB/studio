'use client';

import React, { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Sparkles, FileWarning } from 'lucide-react';
import { ChatMessage } from '@/components/chat-message';
import { askQuestion } from '@/app/actions';
import type { ChatMessage as ChatMessageType, Document, Citation } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';

interface ChatPanelProps {
  documents: Document[];
  selectedDocIds: string[];
  chatHistory: ChatMessageType[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessageType[]>>;
  onCitationClick: (citation: Citation) => void;
}

const initialState = {
  answer: undefined,
  citations: undefined,
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending} className="bg-accent hover:bg-accent/90">
      {pending ? <Sparkles className="h-5 w-5 animate-pulse" /> : <Send className="h-5 w-5" />}
      <span className="sr-only">Send</span>
    </Button>
  );
}

export function ChatPanel({
  documents,
  selectedDocIds,
  chatHistory,
  setChatHistory,
  onCitationClick,
}: ChatPanelProps) {
  const [state, formAction] = useFormState(askQuestion, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const selectedDocuments = documents.filter((doc) => selectedDocIds.includes(doc.id));

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
      // Remove loading message on error
      setChatHistory((prev) => prev.filter((msg) => !msg.isLoading));
    }
    if (state.answer) {
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.isLoading
            ? {
                ...msg,
                isLoading: false,
                text: state.answer ?? '',
                citations: state.citations,
              }
            : msg
        )
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    // Scroll to bottom when chat history changes
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [chatHistory]);


  const handleFormSubmit = (formData: FormData) => {
    const question = formData.get('question') as string;
    if (!question.trim()) return;

    const newQuestionMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: question,
    };
    const loadingMessage: ChatMessageType = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      text: '',
      isLoading: true,
    };

    setChatHistory((prev) => [...prev, newQuestionMessage, loadingMessage]);
    formAction(formData);
    formRef.current?.reset();
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 md:p-8">
            {chatHistory.length === 0 ? (
              <WelcomeScreen selectedCount={selectedDocuments.length} />
            ) : (
              <div className="space-y-8">
                {chatHistory.map((message) => (
                  <ChatMessage key={message.id} message={message} onCitationClick={onCitationClick} />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="border-t p-4">
        <Card>
          <CardContent className="p-2">
            <form ref={formRef} action={handleFormSubmit} className="flex items-end gap-2">
              <input
                type="hidden"
                name="documents"
                value={JSON.stringify(selectedDocuments.map(d => ({id: d.id, content: d.content})))}
              />
              <Textarea
                name="question"
                placeholder={
                  selectedDocuments.length > 0
                    ? `Ask a question about ${selectedDocuments.length} selected document(s)...`
                    : 'Select a document to begin...'
                }
                className="flex-1 resize-none border-none shadow-none focus-visible:ring-0"
                rows={1}
                disabled={selectedDocuments.length === 0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    formRef.current?.requestSubmit();
                  }
                }}
              />
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
        <div className="p-2 text-center text-xs text-muted-foreground">
          {selectedDocuments.length > 0 ? (
            <p>
              Querying <Badge variant="secondary">{selectedDocuments.length}</Badge> document(s).
            </p>
          ) : (
            <p>No documents selected.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ selectedCount }: { selectedCount: number }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="rounded-full bg-primary/10 p-4">
            <Sparkles className="h-10 w-10 text-primary" />
        </div>
      <h1 className="mt-6 font-headline text-3xl font-semibold">Welcome to DocuQuery</h1>
      <p className="mt-2 text-muted-foreground">
        Your intelligent assistant for document analysis.
      </p>
      <div className="mt-8">
        {selectedCount > 0 ? (
          <p className="flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-green-700 dark:text-green-400">
            <Sparkles className="h-4 w-4" />
            <span>{selectedCount} documents selected. Ask a question below!</span>
          </p>
        ) : (
          <p className="flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-2 text-amber-700 dark:text-amber-500">
            <FileWarning className="h-4 w-4" />
            <span>Select documents from the sidebar to get started.</span>
          </p>
        )}
      </div>
    </div>
  );
}
