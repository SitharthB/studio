'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collection, Document } from '@/types';
import { useState, useEffect, useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Folder, FileText } from 'lucide-react';
import { Separator } from './ui/separator';

interface SelectDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: Document[];
  collections: Collection[];
  selectedDocIds: string[];
  onSelectedDocIdsChange: (ids: string[]) => void;
}

export function SelectDocumentsDialog({
  open,
  onOpenChange,
  documents,
  collections,
  selectedDocIds,
  onSelectedDocIdsChange,
}: SelectDocumentsDialogProps) {
  const [localSelectedIds, setLocalSelectedIds] = useState(selectedDocIds);

  useEffect(() => {
    setLocalSelectedIds(selectedDocIds);
  }, [selectedDocIds, open]);

  const { collectionsWithDocs, standaloneDocs } = useMemo(() => {
    const collectionsMap: Record<string, Document[]> = {};
    const standalone: Document[] = [];

    documents.forEach(doc => {
      if (doc.collectionId) {
        if (!collectionsMap[doc.collectionId]) {
          collectionsMap[doc.collectionId] = [];
        }
        collectionsMap[doc.collectionId].push(doc);
      } else {
        standalone.push(doc);
      }
    });

    const collectionsWithDocs = collections.map(col => ({
      ...col,
      docs: collectionsMap[col.id] || [],
    }));

    return { collectionsWithDocs, standaloneDocs: standalone };
  }, [documents, collections]);

  const handleSave = () => {
    onSelectedDocIdsChange(localSelectedIds);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleCheckedChange = (docId: string, isChecked: boolean) => {
    setLocalSelectedIds((prev) => {
      if (isChecked) {
        return [...prev, docId];
      } else {
        return prev.filter((id) => id !== docId);
      }
    });
  };

  const handleCollectionCheckedChange = (collectionId: string, isChecked: boolean) => {
    const collectionDocIds = collectionsWithDocs.find(c => c.id === collectionId)?.docs.map(d => d.id) || [];
    setLocalSelectedIds(prev => {
        if (isChecked) {
            return [...new Set([...prev, ...collectionDocIds])];
        } else {
            return prev.filter(id => !collectionDocIds.includes(id));
        }
    });
  }

  const isCollectionSelected = (collectionId: string) => {
    const collectionDocIds = collectionsWithDocs.find(c => c.id === collectionId)?.docs.map(d => d.id) || [];
    return collectionDocIds.length > 0 && collectionDocIds.every(id => localSelectedIds.includes(id));
  }

  const isCollectionIndeterminate = (collectionId: string) => {
    const collectionDocIds = collectionsWithDocs.find(c => c.id === collectionId)?.docs.map(d => d.id) || [];
    const selectedCount = collectionDocIds.filter(id => localSelectedIds.includes(id)).length;
    return selectedCount > 0 && selectedCount < collectionDocIds.length;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Documents</DialogTitle>
          <DialogDescription>
            Choose the documents you want to query with the AI.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96 w-full pr-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Collections</h3>
            <Accordion type="multiple" className="w-full">
              {collectionsWithDocs.map((col) => (
                <AccordionItem value={col.id} key={col.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`col-${col.id}`}
                        checked={isCollectionSelected(col.id)}
                        onCheckedChange={(checked) => handleCollectionCheckedChange(col.id, !!checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="data-[state=indeterminate]:bg-primary/50"
                        aria-label={`Select all documents in ${col.name}`}
                        ref={el => el && (el.dataset.state = isCollectionIndeterminate(col.id) ? 'indeterminate' : (isCollectionSelected(col.id) ? 'checked' : 'unchecked'))}
                      />
                       <Folder className="h-5 w-5 text-primary" />
                      <span className="font-medium">{col.name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-10">
                      {col.docs.map((doc) => (
                        <div key={doc.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={`doc-${doc.id}`}
                            checked={localSelectedIds.includes(doc.id)}
                            onCheckedChange={(checked) => handleCheckedChange(doc.id, !!checked)}
                          />
                          <label
                            htmlFor={`doc-${doc.id}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 truncate"
                          >
                            {doc.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            {standaloneDocs.length > 0 && (
              <>
                <Separator />
                <h3 className="text-sm font-medium text-muted-foreground">Standalone Documents</h3>
                <div className="space-y-3 pt-2">
                  {standaloneDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center space-x-3 rounded-md border p-3">
                      <Checkbox
                        id={`doc-${doc.id}`}
                        checked={localSelectedIds.includes(doc.id)}
                        onCheckedChange={(checked) => handleCheckedChange(doc.id, !!checked)}
                      />
                       <FileText className="h-5 w-5 text-muted-foreground" />
                      <label
                        htmlFor={`doc-${doc.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 truncate"
                      >
                        {doc.name}
                      </label>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
