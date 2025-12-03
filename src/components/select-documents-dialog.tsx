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
import { Document } from '@/types';
import { useState, useEffect } from 'react';

interface SelectDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: Document[];
  selectedDocIds: string[];
  onSelectedDocIdsChange: (ids: string[]) => void;
}

export function SelectDocumentsDialog({
  open,
  onOpenChange,
  documents,
  selectedDocIds,
  onSelectedDocIdsChange,
}: SelectDocumentsDialogProps) {
  const [localSelectedIds, setLocalSelectedIds] = useState(selectedDocIds);

  useEffect(() => {
    setLocalSelectedIds(selectedDocIds);
  }, [selectedDocIds]);

  const handleSave = () => {
    onSelectedDocIdsChange(localSelectedIds);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset local state to what it was before opening
    setLocalSelectedIds(selectedDocIds);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Documents</DialogTitle>
          <DialogDescription>
            Choose the documents you want to query with the AI.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 w-full pr-4">
            <div className="space-y-4">
            {documents.map((doc) => (
                <div
                key={doc.id}
                className="flex items-center space-x-2 rounded-md border p-4"
                >
                <Checkbox
                    id={`doc-${doc.id}`}
                    checked={localSelectedIds.includes(doc.id)}
                    onCheckedChange={(checked) =>
                    handleCheckedChange(doc.id, !!checked)
                    }
                />
                <label
                    htmlFor={`doc-${doc.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    {doc.name}
                </label>
                </div>
            ))}
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
