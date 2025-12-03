'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType, Citation } from '@/types';
import { Bot, Quote, User, Sparkles } from 'lucide-react';
import React from 'react';

interface ChatMessageProps {
  message: ChatMessageType;
  onCitationClick: (citation: Citation) => void;
}

export function ChatMessage({ message, onCitationClick }: ChatMessageProps) {
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
      return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br />') }} />;
    });
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
          <div
            className={cn(
              'prose prose-sm dark:prose-invert max-w-none',
               isAssistant ? '' : 'text-primary-foreground'
            )}
          >
            {renderContentWithCitations(message.text, message.citations)}
          </div>
        )}
      </div>
       {!isAssistant && (
        <Avatar className="h-9 w-9 border">
            <AvatarFallback className='bg-secondary'>
                <User />
            </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
