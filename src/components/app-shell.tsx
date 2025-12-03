'use client';

import React, { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { DocumentSidebar } from '@/components/document-sidebar';
import { ChatPanel } from '@/components/chat-panel';
import { DocumentViewer } from '@/components/document-viewer';
import { documents as initialDocuments } from '@/lib/data';
import type { Document, ChatMessage, Citation } from '@/types';
import { SelectDocumentsDialog } from './select-documents-dialog';

export default function AppShell() {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [viewingCitation, setViewingCitation] = useState<{ doc: Document, citation: Citation } | null>(null);
  const [isDocSelectOpen, setIsDocSelectOpen] = useState(false);

  const handleCitationClick = (citation: Citation) => {
    const doc = documents.find((d) => d.id === citation.documentId);
    if (doc) {
      setViewingCitation({ doc, citation });
    }
  };

  return (
    <SidebarProvider>
      <DocumentSidebar
        documents={documents}
        selectedDocs={selectedDocs}
        onDocSelect={() => {}}
      />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="md:hidden" />
        </header>
        <main className="flex-1 h-[calc(100vh-3.5rem)] md:h-screen">
            <ChatPanel
            documents={documents}
            selectedDocIds={selectedDocs}
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            onCitationClick={handleCitationClick}
            onSelectDocumentsClick={() => setIsDocSelectOpen(true)}
            />
        </main>
      </SidebarInset>
      <DocumentViewer
        open={!!viewingCitation}
        onOpenChange={(open) => !open && setViewingCitation(null)}
        document={viewingCitation?.doc ?? null}
        citation={viewingCitation?.citation ?? null}
      />
      <SelectDocumentsDialog
        open={isDocSelectOpen}
        onOpenChange={setIsDocSelectOpen}
        documents={documents}
        selectedDocIds={selectedDocs}
        onSelectedDocIdsChange={setSelectedDocs}
      />
    </SidebarProvider>
  );
}
