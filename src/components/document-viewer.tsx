'use client';

import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Document as DocumentType, Citation } from '@/types';
import { X, FileText } from 'lucide-react';

interface DocumentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: DocumentType[];
  citations: Citation[];
}

const EvidenceBlock = React.forwardRef<HTMLDivElement, { doc: DocumentType, citation: Citation }>(({ doc, citation }, ref) => {
  const getHighlightedContent = () => {
    if (!doc || !citation) return null;
    const { content } = doc;
    const { passage } = citation;

    const passageIndex = content.indexOf(passage);
    if (passageIndex === -1) {
      // If passage not found, just show the whole content
      return <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed">{content}</pre>;
    }

    const prePassage = content.substring(0, passageIndex);
    const postPassage = content.substring(passageIndex + passage.length);

    return (
      <p className="whitespace-pre-wrap font-body text-sm leading-relaxed text-muted-foreground">
        {prePassage.slice(-200)}
        <mark className="bg-accent/20 text-foreground rounded-sm px-1">
          {passage}
        </mark>
        {postPassage.slice(0, 200)}
      </p>
    );
  };
  
  return (
    <div ref={ref} className="bg-card p-4 rounded-lg border">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-none rounded-full h-6 w-6 flex items-center justify-center bg-secondary text-secondary-foreground text-xs font-bold">
          {citation.citationNumber}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate" title={doc.name}>
            {doc.name}
          </p>
        </div>
      </div>
      {getHighlightedContent()}
    </div>
  );
});
EvidenceBlock.displayName = 'EvidenceBlock';


export function DocumentViewer({ open, onOpenChange, documents, citations }: DocumentViewerProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  useEffect(() => {
    // When a new citation is added, scroll to it.
    if (open && citations.length > 0) {
      const latestCitation = citations[citations.length - 1];
      const ref = blockRefs.current[latestCitation.citationNumber];
      
      setTimeout(() => {
        if (ref) {
            ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100); // Small delay to allow for render
    }
  }, [citations, open]);

  const handleClose = () => {
    onOpenChange(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-[480px] h-screen bg-background border-l shadow-2xl z-50 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex-1 min-w-0">
                <h2 className="font-headline text-lg">Document Evidence</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
              {citations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                  <FileText className="h-12 w-12 mb-4"/>
                  <p className="font-medium">No Evidence Selected</p>
                  <p className="text-sm">Click a citation number in the answer to view the source document and passage here.</p>
                </div>
              ) : (
                citations.map((citation) => {
                  const doc = documents.find(d => d.id === citation.documentId);
                  if (!doc) return null;
                  return (
                    <EvidenceBlock 
                      key={`${citation.documentId}-${citation.citationNumber}`}
                      doc={doc} 
                      citation={citation} 
                      ref={el => blockRefs.current[citation.citationNumber] = el}
                    />
                  );
                })
              )}
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}