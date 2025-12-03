'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType, Citation } from '@/types';
import { Bot, Quote, User, Sparkles } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
  onCitationClick: (citation: Citation) => void;
}

export function ChatMessage({ message, onCitationClick }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={cn('flex items-start gap-4', isAssistant ? '' : 'flex-row-reverse')}>
      <Avatar className="h-9 w-9 border">
        <AvatarFallback className={cn(isAssistant ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
          {isAssistant ? <Bot /> : <User />}
        </AvatarFallback>
      </Avatar>
      <div className={cn('flex flex-col gap-2 rounded-lg p-4', isAssistant ? 'bg-card' : 'bg-primary text-primary-foreground')}>
        {message.isLoading ? (
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="text-sm">Thinking...</span>
          </div>
        ) : (
          <>
            <div
              className={cn(
                'prose prose-sm dark:prose-invert max-w-none',
                isAssistant ? '' : 'text-primary-foreground'
              )}
              dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br />') }}
            />
            {message.citations && message.citations.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-xs font-semibold uppercase">Citations</h4>
                <div className="flex flex-wrap gap-2">
                  {message.citations.map((citation, index) => (
                    <button
                      key={index}
                      onClick={() => onCitationClick(citation)}
                      className="group"
                    >
                      <Badge
                        variant={isAssistant ? 'secondary' : 'default'}
                        className="cursor-pointer transition-colors group-hover:bg-accent group-hover:text-accent-foreground"
                      >
                        <Quote className="mr-1.5 h-3 w-3" />
                        Citation {index + 1}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
