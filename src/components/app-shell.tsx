'use client';

import React, { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { DocumentSidebar } from '@/components/document-sidebar';
import { ChatPanel } from '@/components/chat-panel';
import { DocumentViewer } from '@/components/document-viewer';
import { documents as initialDocuments, collections as initialCollections } from '@/lib/data';
import type { Document, ChatMessage, Citation, Collection } from '@/types';
import { SelectDocumentsDialog } from './select-documents-dialog';
import { UploadDocumentDialog } from './upload-document-dialog';

export default function AppShell() {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [viewingCitation, setViewingCitation] = useState<{ doc: Document, citation: Citation } | null>(null);
  const [isDocSelectOpen, setIsDocSelectOpen] = useState(false);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);

  const handleCitationClick = (citation: Citation) => {
    const doc = documents.find((d) => d.id === citation.documentId);
    if (doc) {
      setViewingCitation({ doc, citation });
    }
  };

  const handleUpload = (file: File, destination: { type: string; id?: string; name?: string }) => {
    // This is a placeholder for the actual upload logic
    console.log('Uploading file:', file.name);
    console.log('Destination:', destination);

    // Create a new document object
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      name: file.name,
      content: 'File content will be processed here.', // Placeholder content
      collectionId: null,
    };

    if (destination.type === 'new-collection' && destination.name) {
      const newCollection: Collection = {
        id: `col-${Date.now()}`,
        name: destination.name,
        documentIds: [newDoc.id],
      };
      newDoc.collectionId = newCollection.id;
      setCollections(prev => [...prev, newCollection]);
    } else if (destination.type === 'existing-collection' && destination.id) {
      newDoc.collectionId = destination.id;
      setCollections(prev => prev.map(col =>
        col.id === destination.id
          ? { ...col, documentIds: [...col.documentIds, newDoc.id] }
          : col
      ));
    }

    setDocuments(prev => [...prev, newDoc]);
    setIsUploadDocOpen(false);
  };


  return (
    <SidebarProvider>
      <DocumentSidebar
        documents={documents}
        selectedDocs={selectedDocs}
        onDocSelect={() => {}}
        onUploadClick={() => setIsUploadDocOpen(true)}
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
        collections={collections}
        selectedDocIds={selectedDocs}
        onSelectedDocIdsChange={setSelectedDocs}
      />
      <UploadDocumentDialog
        open={isUploadDocOpen}
        onOpenChange={setIsUploadDocOpen}
        collections={collections}
        onUpload={handleUpload}
      />
    </SidebarProvider>
  );
}
