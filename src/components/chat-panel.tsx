'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Sparkles, FileText, HelpCircle, Folder, BookText, Globe } from 'lucide-react';
import { ChatMessage } from '@/components/chat-message';
import { askQuestion, summarizeDocuments, searchWeb } from '@/app/actions';
import type { ChatMessage as ChatMessageType, Document, Citation, Collection } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  documents: Document[];
  collections: Collection[];
  selectedDocIds: string[];
  chatHistory: ChatMessageType[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessageType[]>>;
  onCitationClick: (citation: Citation) => void;
  onSelectDocumentsClick: () => void;
  onNewQuestion: () => void;
}

const initialQuestionState = {
  answer: undefined,
  citations: undefined,
  error: undefined,
};

const initialSummaryState = {
    summary: undefined,
    error: undefined,
};

const initialWebSearchState = {
    answer: undefined,
    error: undefined,
};


function SubmitButton({ icon, children, disabled }: { icon: React.ReactNode, children?: React.ReactNode, disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size={children ? 'default' : 'icon'} disabled={pending || disabled}>
      {pending ? <Sparkles className="h-5 w-5 animate-pulse" /> : icon}
      {children}
      <span className="sr-only">Send</span>
    </Button>
  );
}

export function ChatPanel({
  documents,
  collections,
  selectedDocIds,
  chatHistory,
  setChatHistory,
  onCitationClick,
  onSelectDocumentsClick,
  onNewQuestion,
}: ChatPanelProps) {
  const [questionState, questionFormAction] = useFormState(askQuestion, initialQuestionState);
  const [summaryState, summaryFormAction] = useFormState(summarizeDocuments, initialSummaryState);
  const [webSearchState, webSearchFormAction] = useFormState(searchWeb, initialWebSearchState);
  
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const summaryFormRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const selectedDocuments = documents.filter((doc) => selectedDocIds.includes(doc.id));

  const isAIThinking = chatHistory.some(msg => msg.isLoading);

  const contextDisplay = useMemo(() => {
    if (isWebSearchEnabled) {
      return { icon: Globe, text: 'Searching the web' };
    }
    if (selectedDocIds.length === 0) {
      return { icon: FileText, text: 'No documents selected' };
    }

    const selectedCollections = collections.filter(col => 
      col.documentIds.length > 0 && col.documentIds.every(id => selectedDocIds.includes(id))
    );
    
    const selectedCollectionDocIds = new Set(selectedCollections.flatMap(c => c.documentIds));
    
    const standaloneDocs = selectedDocuments.filter(doc => !selectedCollectionDocIds.has(doc.id));

    const parts: {name: string, isCollection: boolean}[] = [];
    if (selectedCollections.length > 0) {
      parts.push(...selectedCollections.map(c => ({name: c.name, isCollection: true})));
    }
    if (standaloneDocs.length > 0) {
      parts.push(...standaloneDocs.map(d => ({name: d.name, isCollection: false})));
    }
    
    const isCollectionSelected = selectedCollections.length > 0;

    return { icon: isCollectionSelected ? Folder : FileText, parts };

  }, [selectedDocIds, documents, collections, isWebSearchEnabled]);

  useEffect(() => {
    const state = isWebSearchEnabled ? webSearchState : questionState;
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
      setChatHistory((prev) => prev.filter((msg) => !msg.isLoading));
    }
    if (state.answer) {
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.isLoading && msg.role === 'assistant'
            ? {
                ...msg,
                isLoading: false,
                text: state.answer ?? '',
                citations: (state as any).citations,
              }
            : msg
        )
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionState, webSearchState]);
  
  useEffect(() => {
    if (summaryState.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: summaryState.error,
      });
      setChatHistory((prev) => prev.filter((msg) => !msg.isLoading));
    }
    if (summaryState.summary) {
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.isLoading && msg.role === 'assistant'
            ? {
                ...msg,
                isLoading: false,
                text: summaryState.summary ?? '',
              }
            : msg
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaryState]);


  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [chatHistory]);


  const handleFormSubmit = (formData: FormData) => {
    const question = formData.get('question') as string;
    if (!question.trim() || isAIThinking) return;

    onNewQuestion();

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

    if (isWebSearchEnabled) {
        webSearchFormAction(formData);
    } else {
        questionFormAction(formData);
    }
    
    formRef.current?.reset();
    // Keep the web search toggle state as is
  };
  
  const handleSummarySubmit = (formData: FormData) => {
    if (isAIThinking) return;
    onNewQuestion();
    
    const summaryRequestMessage: ChatMessageType = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: `Summarize the selected document(s).`,
    };
    
    const loadingMessage: ChatMessageType = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: '',
        isLoading: true,
    };

    setChatHistory((prev) => [...prev, summaryRequestMessage, loadingMessage]);
    summaryFormAction(formData);
  };

  const ContextIcon = contextDisplay.icon;
  const isContextSelected = selectedDocIds.length > 0;

  return (
    <div className="flex h-full flex-col bg-secondary/50">
       <div className="flex items-center justify-between border-b bg-background p-4 gap-4">
        <div className="text-sm text-muted-foreground min-w-0">
          <div className="flex items-center gap-2 truncate">
          {Array.isArray(contextDisplay.parts) ? (
             <div className="flex items-center gap-2 truncate">
              {contextDisplay.parts.map((part, index) => (
                <React.Fragment key={index}>
                  <div className="flex items-center gap-1.5 bg-secondary px-2 py-1 rounded-md">
                    {part.isCollection ? <Folder className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4" />}
                    <span className="font-semibold text-foreground truncate" title={part.name}>
                      {part.name}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          ) : (
            <>
              <ContextIcon className={cn("h-4 w-4 shrink-0", isWebSearchEnabled && "text-primary")} />
              <span className="font-semibold text-foreground truncate" title={contextDisplay.text}>
                {contextDisplay.text}
              </span>
            </>
          )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
            <form ref={summaryFormRef} action={handleSummarySubmit}>
                 <input
                    type="hidden"
                    name="documents"
                    value={JSON.stringify(selectedDocuments.map(d => ({id: d.id, name: d.name, content: d.content})))}
                />
                 <Button variant="outline" size="sm" type="submit" disabled={!isContextSelected || isAIThinking || isWebSearchEnabled}>
                    {isAIThinking ? <Sparkles className="mr-2 h-4 w-4 animate-pulse" /> : <BookText className="mr-2 h-4 w-4" />}
                    Summarize Selected
                </Button>
            </form>
            <Button variant="outline" size="sm" onClick={onSelectDocumentsClick} disabled={isWebSearchEnabled}>
                <FileText className="mr-2 h-4 w-4" />
                {selectedDocIds.length > 0 ? 'Change Documents' : 'Select Documents'}
            </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-background">
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
      <div className="border-t bg-background p-4">
        <Card>
          <CardContent className="p-2">
            <form ref={formRef} action={handleFormSubmit} className="flex items-end gap-2">
              <input
                type="hidden"
                name="documents"
                value={JSON.stringify(selectedDocuments.map(d => ({id: d.id, name: d.name, content: d.content})))}
              />
              <input type="hidden" name="webSearch" value={String(isWebSearchEnabled)} />
              <Textarea
                name="question"
                placeholder={
                  isWebSearchEnabled 
                    ? 'Ask the web anything...' 
                    : selectedDocuments.length > 0
                      ? 'Ask a question...'
                      : 'Select a document to start chatting'
                }
                className="flex-1 resize-none border-none shadow-none focus-visible:ring-0"
                rows={1}
                disabled={(selectedDocuments.length === 0 && !isWebSearchEnabled) || isAIThinking}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    formRef.current?.requestSubmit();
                  }
                }}
              />
              <SubmitButton icon={<Send className="h-5 w-5" />} disabled={isAIThinking} />
            </form>
          </CardContent>
          <CardFooter className="px-2 py-1 justify-end">
            <div className="flex items-center space-x-2">
                <Switch 
                    id="web-search-toggle" 
                    checked={isWebSearchEnabled}
                    onCheckedChange={setIsWebSearchEnabled}
                    disabled={isAIThinking}
                />
                <Label htmlFor="web-search-toggle" className="text-xs text-muted-foreground">Web Search</Label>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function WelcomeScreen({ selectedCount }: { selectedCount: number }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="rounded-full bg-primary/10 p-4">
            <HelpCircle className="h-12 w-12 text-primary" />
        </div>
      <h1 className="mt-6 font-headline text-3xl font-semibold">Ready to answer your questions</h1>
      <p className="mt-2 text-muted-foreground max-w-sm">
        Ask a question about the documents you&apos;ve selected, or toggle on web search to ask the internet.
      </p>
      <div className="mt-8">
        {selectedCount === 0 && (
           <p className="flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-2 text-sm text-amber-700 dark:text-amber-500">
             <Sparkles className="h-4 w-4" />
             <span>Please select at least one document to start a chat session.</span>
           </p>
        )}
      </div>
    </div>
  );
}
