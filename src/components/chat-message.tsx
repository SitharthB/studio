'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType, Citation, Document } from '@/types';
import { Bot, Quote, User, Sparkles, FileText, Search } from 'lucide-react';
import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface ChatMessageProps {
  message: ChatMessageType;
  onCitationClick: (citation: Citation) => void;
  onDocumentResultClick: (document: Document) => void;
}

function FileTypeIcon({ type }: { type?: string }) {
  if (type?.toLowerCase() === 'pdf') {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  if (type?.toLowerCase() === 'txt') {
    return <FileText className="h-5 w-5 text-gray-500" />;
  }
  return <FileText className="h-5 w-5 text-gray-400" />;
}

export function ChatMessage({ message, onCitationClick, onDocumentResultClick }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  const renderContentWithCitations = (text: string, citations?: Citation[]) => {
    if (!citations || citations.length === 0) {
      return <div dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br />') }} />;
    }

    const parts = text.split(/(\[\d+\])/g);

    return parts.map((part, index) => {
      const citationMatch = part.match(/\[(\d+)\]/);
      if (citationMatch) {
        const citationNumber = parseInt(citationMatch[1], 10);
        const citation = citations.find(c => c.citationNumber === citationNumber);
        if (citation) {
          return (
            <button
              key={index}
              onClick={() => onCitationClick(citation)}
              className="inline-block mx-0.5 align-super"
            >
              <Badge
                variant="secondary"
                className="cursor-pointer rounded-full h-5 w-5 p-0 justify-center transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {citationNumber}
              </Badge>
            </button>
          );
        }
      }
      // Use dangerouslySetInnerHTML for parts that may contain HTML, like line breaks
      return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br />') }} />;
    });
  };

  const renderRelevantDocuments = (documents?: Document[]) => {
    if (!documents || documents.length === 0) {
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          Sorry, no document matches your query.
        </div>
      )
    }

    return (
      <div className='space-y-3'>
        <p className="font-medium text-sm">I found {documents.length} relevant document{documents.length > 1 ? 's' : ''} for you. Click to preview.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {documents.map(doc => (
             <Button
              key={doc.id}
              variant="outline"
              className="h-auto w-full justify-start items-center p-3 gap-3"
              onClick={() => onDocumentResultClick(doc)}
            >
              <FileTypeIcon type={doc.type} />
              <div className="text-left">
                <p className="font-medium text-sm truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{(doc.size / 1024).toFixed(1)} KB</p>
              </div>
            </Button>
          ))}
        </div>
      </div>
    );
  };


  return (
    <div className={cn('flex items-start gap-4', isAssistant ? '' : 'justify-end')}>
      {isAssistant && (
        <Avatar className="h-9 w-9 border">
            <AvatarFallback className='bg-primary text-primary-foreground'>
                <Bot />
            </AvatarFallback>
        </Avatar>
      )}
      <div className={cn('flex flex-col gap-2 rounded-lg p-4 max-w-3xl', isAssistant ? 'bg-card' : 'bg-primary text-primary-foreground')}>
        {message.isLoading ? (
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="text-sm">Thinking...</span>
          </div>
        ) : (
          <>
            {message.relevantDocuments ? renderRelevantDocuments(message.relevantDocuments) : (
              <div
                className={cn(
                  'prose prose-sm dark:prose-invert max-w-none',
                  isAssistant ? '' : 'text-primary-foreground'
                )}
              >
                {renderContentWithCitations(message.text, message.citations)}
              </div>
            )}
          </>
        )}
      </div>
       {!isAssistant && (
        <Avatar className="h-9 w-9 border">
            <AvatarFallback className='bg-secondary'>
                {message.isSmartSearch ? <Search /> : <User />}
            </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
