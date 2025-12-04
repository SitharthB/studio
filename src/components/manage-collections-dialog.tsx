'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from '@/components/ui/alert-dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collection, Document } from '@/types';
import { MoreHorizontal, Folder, FileText, Trash2, Edit, FolderPlus, Plus, ChevronDown, FolderSymlink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface ManageCollectionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  collections: Collection[];
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
}

function FileTypeIcon({ type }: { type: string }) {
    if (type.toLowerCase() === 'pdf') {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    if (type.toLowerCase() === 'txt') {
      return <FileText className="h-4 w-4 text-gray-500" />;
    }
     if (type.toLowerCase() === 'xlsx') {
      return <FileText className="h-4 w-4 text-green-500" />;
    }
    return <FileText className="h-4 w-4 text-gray-400" />;
  }

export function ManageCollectionsDialog({
  open,
  onOpenChange,
  documents,
  setDocuments,
  collections,
  setCollections,
}: ManageCollectionsDialogProps) {
  const { toast } = useToast();
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [collectionToRename, setCollectionToRename] = useState<Collection | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);
  const [newCollectionInputValue, setNewCollectionInputValue] = useState('');


  const standaloneDocuments = useMemo(
    () => documents.filter((doc) => !doc.collectionId),
    [documents]
  );
  
  const handleCreateCollection = () => {
    if (newCollectionInputValue.trim()) {
        const newCollection: Collection = {
            id: `col-${Date.now()}`,
            name: newCollectionInputValue.trim(),
            documentIds: [],
        };
        setCollections(prev => [...prev, newCollection]);
        setNewCollectionInputValue('');
        toast({ title: "Collection created", description: `"${newCollection.name}" has been created.` });
    }
  };

  const handleMoveDocument = (docId: string, targetCollectionId: string | null) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    // Update document's collectionId
    setDocuments(prevDocs => 
        prevDocs.map(d => d.id === docId ? { ...d, collectionId: targetCollectionId } : d)
    );
    
    // Remove from old collection
    if (doc.collectionId) {
        setCollections(prevCols => prevCols.map(col => 
            col.id === doc.collectionId ? { ...col, documentIds: col.documentIds.filter(id => id !== docId) } : col
        ));
    }

    // Add to new collection
    if (targetCollectionId) {
        setCollections(prevCols => prevCols.map(col => 
            col.id === targetCollectionId ? { ...col, documentIds: [...col.documentIds, docId] } : col
        ));
    }
    toast({ title: "Document moved", description: `"${doc.name}" has been moved.` });
  };

  const handleDeleteDocument = () => {
    if (!docToDelete) return;
    // Remove from documents list
    setDocuments(prev => prev.filter(doc => doc.id !== docToDelete.id));

    // Remove from any collection it was in
    if (docToDelete.collectionId) {
        setCollections(prev => prev.map(col => 
            col.id === docToDelete.collectionId 
            ? { ...col, documentIds: col.documentIds.filter(id => id !== docToDelete.id) } 
            : col
        ));
    }
    toast({ title: "Document deleted", description: `"${docToDelete.name}" has been permanently deleted.` });
    setDocToDelete(null);
  };
  
  const handleRenameCollection = () => {
    if (!collectionToRename || !newCollectionName.trim()) return;
    setCollections(prev => prev.map(col => 
        col.id === collectionToRename.id ? { ...col, name: newCollectionName.trim() } : col
    ));
    toast({ title: "Collection renamed", description: `"${collectionToRename.name}" is now "${newCollectionName.trim()}".` });
    setCollectionToRename(null);
    setNewCollectionName('');
  };

  const handleDeleteCollection = () => {
    if (!collectionToDelete) return;

    // Make all documents in the collection standalone
    setDocuments(prev => prev.map(doc => 
        collectionToDelete.documentIds.includes(doc.id) ? { ...doc, collectionId: null } : doc
    ));

    // Remove the collection
    setCollections(prev => prev.filter(col => col.id !== collectionToDelete.id));

    toast({ title: "Collection deleted", description: `"${collectionToDelete.name}" was deleted. Its documents are now standalone.` });
    setCollectionToDelete(null);
  };
  
  const getDocumentsForCollection = (collectionId: string) => {
    return documents.filter(doc => doc.collectionId === collectionId);
  }

  const renderDocumentRow = (doc: Document) => (
    <TableRow key={doc.id}>
        <TableCell className="flex items-center gap-2">
            <FileTypeIcon type={doc.type} />
            <span className="font-medium truncate" title={doc.name}>{doc.name}</span>
        </TableCell>
        <TableCell className="text-right">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <FolderSymlink className="mr-2 h-4 w-4" />
                            <span>Move to</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handleMoveDocument(doc.id, null)} disabled={!doc.collectionId}>
                                <FileText className="mr-2 h-4 w-4" />
                                Standalone
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {collections.filter(c => c.id !== doc.collectionId).map(collection => (
                                <DropdownMenuItem key={collection.id} onClick={() => handleMoveDocument(doc.id, collection.id)}>
                                    <Folder className="mr-2 h-4 w-4" />
                                    {collection.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDocToDelete(doc)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </TableCell>
    </TableRow>
  )

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl">Manage Collections</DialogTitle>
          <DialogDescription>
            Organize your documents into collections, or manage standalone files.
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 flex flex-col min-h-0 px-6'>
            <div className="flex items-center gap-2 mb-4">
                <Input 
                    placeholder="Create a new collection..."
                    value={newCollectionInputValue}
                    onChange={(e) => setNewCollectionInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
                />
                <Button onClick={handleCreateCollection} disabled={!newCollectionInputValue.trim()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create
                </Button>
            </div>
            
            <ScrollArea className="flex-1 -mx-6">
                <Accordion type="multiple" defaultValue={['item-standalone', ...(collections.map(c => `item-${c.id}`))]} className="px-6">
                    {/* Collections */}
                    {collections.map(collection => (
                        <AccordionItem value={`item-${collection.id}`} key={collection.id}>
                            <AccordionTrigger>
                                <div className="flex items-center gap-3">
                                    <Folder className="h-5 w-5 text-primary" />
                                    <span className="font-semibold text-base">{collection.name}</span>
                                    <span className="text-sm text-muted-foreground">({collection.documentIds.length})</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <Table>
                                    <TableBody>
                                        {getDocumentsForCollection(collection.id).map(doc => renderDocumentRow(doc))}
                                    </TableBody>
                                </Table>
                                {collection.documentIds.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">This collection is empty.</p>}
                                <div className="p-2 border-t mt-2">
                                <Button variant="ghost" size="sm" onClick={() => { setCollectionToRename(collection); setNewCollectionName(collection.name); }}>
                                    <Edit className="mr-2 h-4 w-4" /> Rename
                                </Button>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setCollectionToDelete(collection)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Collection
                                </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}

                    {/* Standalone Documents */}
                    <AccordionItem value="item-standalone">
                        <AccordionTrigger>
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5" />
                                <span className="font-semibold text-base">Standalone Documents</span>
                                <span className="text-sm text-muted-foreground">({standaloneDocuments.length})</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <Table>
                                <TableBody>
                                {standaloneDocuments.map(doc => renderDocumentRow(doc))}
                                </TableBody>
                            </Table>
                            {standaloneDocuments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No standalone documents.</p>}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </ScrollArea>
        </div>
        
        <DialogFooter className="p-4 border-t mt-auto">
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Confirmation Dialogs */}
    <AlertDialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete this document?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete "{docToDelete?.name}". This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDocToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteDocument} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={!!collectionToRename} onOpenChange={(open) => !open && setCollectionToRename(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Rename Collection</AlertDialogTitle>
                <AlertDialogDescription>
                    Enter a new name for the collection "{collectionToRename?.name}".
                </AlertDialogDescription>
            </AlertDialogHeader>
            <Input 
                value={newCollectionName}
                onChange={e => setNewCollectionName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRenameCollection()}
                className="my-4"
                autoFocus
            />
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setCollectionToRename(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRenameCollection} disabled={!newCollectionName.trim()}>Rename</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={!!collectionToDelete} onOpenChange={(open) => !open && setCollectionToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete this collection?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will delete the collection "{collectionToDelete?.name}". The documents within it will not be deleted but will become standalone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setCollectionToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteCollection} className="bg-destructive hover:bg-destructive/90">Delete Collection</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
