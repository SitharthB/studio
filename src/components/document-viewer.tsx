'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Document as DocumentType, Citation } from '@/types';

interface DocumentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocumentType | null;
  citation: Citation | null;
}

export function DocumentViewer({ open, onOpenChange, document, citation }: DocumentViewerProps) {
  if (!document || !citation) {
    return null;
  }

  const getHighlightedContent = () => {
    const parts = document.content.split(citation.passage);
    return (
      <>
        {parts[0]}
        <mark className="bg-accent/50 text-foreground">{citation.passage}</mark>
        {parts.slice(1).join(citation.passage)}
      </>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0">
        <div className="flex h-full flex-col">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle className="font-headline">{document.name}</SheetTitle>
            <SheetDescription>Cited passage highlighted below.</SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1">
            <pre className="whitespace-pre-wrap p-6 pt-4 font-body text-sm">{getHighlightedContent()}</pre>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
