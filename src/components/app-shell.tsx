'use client';

import React, { useState } from 'react';
import { DocumentSidebar } from '@/components/document-sidebar';
import { ChatPanel } from '@/components/chat-panel';
import { DocumentViewer } from '@/components/document-viewer';
import { documents as initialDocuments, collections as initialCollections } from '@/lib/data';
import type { Document, ChatMessage, Citation, Collection } from '@/types';
import { SelectDocumentsDialog } from './select-documents-dialog';
import { UploadDocumentDialog } from './upload-document-dialog';
import { cn } from '@/lib/utils';

export default function AppShell() {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  const [isEvidenceViewerOpen, setIsEvidenceViewerOpen] = useState(false);
  const [evidenceCitations, setEvidenceCitations] = useState<Citation[]>([]);

  const [isDocSelectOpen, setIsDocSelectOpen] = useState(false);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);

  const handleCitationClick = (citation: Citation) => {
    // Open the viewer on the first click
    if (!isEvidenceViewerOpen) {
      setIsEvidenceViewerOpen(true);
    }
    // Add the new citation if it's not already in the list
    setEvidenceCitations(prev => {
        const exists = prev.some(c => c.citationNumber === citation.citationNumber && c.documentId === citation.documentId);
        return exists ? prev : [...prev, citation];
    });
  };

  const handleNewQuestion = () => {
    // Reset evidence viewer when a new question is asked
    setIsEvidenceViewerOpen(false);
    setEvidenceCitations([]);
  };

  const handleUpload = (file: File, destination: { type: string; id?: string; name?: string }) => {
    console.log('Uploading file:', file.name);
    console.log('Destination:', destination);

    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      name: file.name,
      content: 'File content will be processed here.', // Placeholder content
      collectionId: null,
      type: file.type.split('/')[1]?.toUpperCase() || 'TXT',
      size: file.size,
      added: new Date().toISOString(),
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

  const evidenceDocuments = evidenceCitations
    .map(citation => documents.find(d => d.id === citation.documentId))
    .filter((d): d is Document => !!d);

  return (
    <div className="flex h-screen w-full bg-background">
      <DocumentSidebar
        onUploadClick={() => setIsUploadDocOpen(true)}
      />
      <main className={cn(
          "flex-1 flex flex-col h-screen transition-[width] duration-300 ease-in-out",
           isEvidenceViewerOpen ? "w-[calc(100%-280px-480px)]" : "w-full"
      )}>
          <ChatPanel
            documents={documents}
            collections={collections}
            selectedDocIds={selectedDocIds}
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            onCitationClick={handleCitationClick}
            onSelectDocumentsClick={() => setIsDocSelectOpen(true)}
            onNewQuestion={handleNewQuestion}
          />
      </main>
       <DocumentViewer
          open={isEvidenceViewerOpen}
          onOpenChange={setIsEvidenceViewerOpen}
          documents={evidenceDocuments}
          citations={evidenceCitations}
      />
      
      <SelectDocumentsDialog
        open={isDocSelectOpen}
        onOpenChange={setIsDocSelectOpen}
        documents={documents}
        collections={collections}
        selectedDocIds={selectedDocIds}
        onSelectedDocIdsChange={setSelectedDocIds}
      />
      <UploadDocumentDialog
        open={isUploadDocOpen}
        onOpenChange={setIsUploadDocOpen}
        collections={collections}
        onUpload={handleUpload}
      />
    </div>
  );
}
