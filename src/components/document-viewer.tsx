'use client';

import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Document as DocumentType, Citation } from '@/types';
import { X } from 'lucide-react';
import { Separator } from './ui/separator';

interface DocumentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocumentType | null;
  citation: Citation | null;
}

export function DocumentViewer({ open, onOpenChange, document, citation }: DocumentViewerProps) {
  const passageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && citation && passageRef.current) {
      passageRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [open, citation]);

  const getHighlightedContent = () => {
    if (!document || !citation) return null;
    const { content, passage } = citation;

    const passageIndex = document.content.indexOf(passage);
    if (passageIndex === -1) {
      // If passage not found, just show the whole content
      return document.content;
    }

    const prePassage = document.content.substring(0, passageIndex);
    const postPassage = document.content.substring(passageIndex + passage.length);

    return (
      <>
        {prePassage}
        <mark ref={passageRef as any} className="bg-accent/50 text-foreground rounded-sm px-1">
          {passage}
        </mark>
        {postPassage}
      </>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed right-0 top-0 h-full w-[480px] bg-background border-l shadow-2xl z-50 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex-1 min-w-0">
                <h2 className="font-headline text-lg truncate">{document?.name}</h2>
                <p className="text-sm text-muted-foreground">Cited passage highlighted below</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <pre className="whitespace-pre-wrap p-6 font-body text-sm leading-relaxed">{getHighlightedContent()}</pre>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
