'use client';

import React, { useState, useMemo } from 'react';
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
import { MoreHorizontal, Folder, FileText, Trash2, Edit, FolderPlus, Plus, FolderSymlink, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

interface ManageCollectionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  collections: Collection[];
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
}

function FileTypeIcon({ type, className }: { type?: string, className?: string }) {
    if (type?.toLowerCase() === 'pdf') {
      return <FileText className={cn("h-4 w-4 text-red-500", className)} />;
    }
    if (type?.toLowerCase() === 'txt') {
      return <FileText className={cn("h-4 w-4 text-gray-500", className)} />;
    }
     if (type?.toLowerCase() === 'xlsx') {
      return <FileText className={cn("h-4 w-4 text-green-500", className)} />;
    }
    return <FileText className={cn("h-4 w-4 text-gray-400", className)} />;
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
  const [activeContext, setActiveContext] = useState<string>('standalone'); // collection id or 'standalone'
  const [collectionSearchQuery, setCollectionSearchQuery] = useState('');
  const [documentSearchQuery, setDocumentSearchQuery] = useState('');

  const standaloneDocuments = useMemo(
    () => documents.filter((doc) => !doc.collectionId),
    [documents]
  );

  const filteredCollections = useMemo(() => {
    if (!collectionSearchQuery) return collections;
    return collections.filter(col => 
        col.name.toLowerCase().includes(collectionSearchQuery.toLowerCase())
    );
  }, [collections, collectionSearchQuery]);

  const displayedDocuments = useMemo(() => {
    let docs;
    if (activeContext === 'standalone') {
        docs = standaloneDocuments;
    } else {
        docs = documents.filter(doc => doc.collectionId === activeContext);
    }

    if (documentSearchQuery) {
        return docs.filter(doc => doc.name.toLowerCase().includes(documentSearchQuery.toLowerCase()));
    }
    
    return docs;
  }, [documents, activeContext, standaloneDocuments, documentSearchQuery]);

  const activeCollection = useMemo(() => {
    return collections.find(c => c.id === activeContext);
  }, [collections, activeContext]);
  
  const handleCreateCollection = () => {
    if (newCollectionInputValue.trim()) {
        const newCollection: Collection = {
            id: `col-${Date.now()}`,
            name: newCollectionInputValue.trim(),
            documentIds: [],
        };
        setCollections(prev => [...prev, newCollection]);
        setNewCollectionInputValue('');
        setActiveContext(newCollection.id);
        toast({ title: "Collection created", description: `"${newCollection.name}" has been created.` });
    }
  };

  const handleMoveDocument = (docId: string, targetCollectionId: string | null) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    const originalCollectionId = doc.collectionId;
    
    // Update document's collectionId
    setDocuments(prevDocs => 
        prevDocs.map(d => d.id === docId ? { ...d, collectionId: targetCollectionId } : d)
    );
    
    // Remove from old collection
    if (originalCollectionId) {
        setCollections(prevCols => prevCols.map(col => 
            col.id === originalCollectionId ? { ...col, documentIds: col.documentIds.filter(id => id !== docId) } : col
        ));
    }

    // Add to new collection
    if (targetCollectionId) {
        setCollections(prevCols => prevCols.map(col => 
            col.id === targetCollectionId ? { ...col, documentIds: [...col.documentIds, docId] } : col
        ));
    }
    const targetCollection = collections.find(c => c.id === targetCollectionId);
    toast({ title: "Document moved", description: `"${doc.name}" moved to ${targetCollection ? `"${targetCollection.name}"` : 'Standalone'}.` });
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
    setActiveContext('standalone');

    toast({ title: "Collection deleted", description: `"${collectionToDelete.name}" was deleted. Its documents are now standalone.` });
    setCollectionToDelete(null);
  };

  const renderDocumentRow = (doc: Document) => (
    <TableRow key={doc.id}>
        <TableCell>
            <div className="flex items-center gap-3">
              <FileTypeIcon type={doc.type} />
              <span className="font-medium truncate" title={doc.name}>{doc.name}</span>
            </div>
        </TableCell>
        <TableCell className="text-right text-muted-foreground">
            {(doc.size / 1024).toFixed(1)} KB
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
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-lg">Manage Documents & Collections</DialogTitle>
          <DialogDescription>
            Organize your documents into collections, or manage standalone files.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] flex-1 min-h-0">
            {/* Left Panel */}
            <div className="flex flex-col border-r bg-background/50 p-3">
                <div className="flex items-center gap-2 mb-2">
                    <Input 
                        placeholder="New collection..."
                        className="h-9"
                        value={newCollectionInputValue}
                        onChange={(e) => setNewCollectionInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
                    />
                    <Button onClick={handleCreateCollection} disabled={!newCollectionInputValue.trim()} size="icon" className="h-9 w-9 shrink-0">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                      placeholder="Search collections..."
                      className="h-9 pl-9"
                      value={collectionSearchQuery}
                      onChange={(e) => setCollectionSearchQuery(e.target.value)}
                  />
                </div>
                <Separator className="mb-2" />
                <ScrollArea className="flex-1 -mx-3">
                    <div className="px-2 pb-2">
                        <h3 className="px-2 py-1 text-xs font-semibold text-muted-foreground tracking-wider uppercase">Collections</h3>
                        <div className="space-y-1 mt-1">
                          {filteredCollections.map(col => (
                          <div key={col.id} className="flex items-center group">
                              <Button 
                                  variant={activeContext === col.id ? 'secondary' : 'ghost'} 
                                  size="sm" 
                                  className="w-full justify-start gap-2 flex-1 h-8" 
                                  onClick={() => setActiveContext(col.id)}
                              >
                                  <Folder className="h-4 w-4 text-primary"/>
                                  <span className="truncate">{col.name}</span>
                                  <span className="ml-auto text-xs text-muted-foreground">{col.documentIds.length}</span>
                              </Button>
                              <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 focus-visible:opacity-100">
                                          <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => { setCollectionToRename(col); setNewCollectionName(col.name); }}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          Rename
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => setCollectionToDelete(col)} className="text-destructive focus:text-destructive">
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                      </DropdownMenuItem>
                                  </DropdownMenuContent>
                              </DropdownMenu>
                          </div>
                          ))}
                           {collections.length > 0 && filteredCollections.length === 0 && <p className="px-3 text-xs text-muted-foreground">No matching collections.</p>}
                        </div>
                    </div>
                     <Separator className="my-2" />
                    <div className="px-2">
                         <h3 className="px-2 py-1 text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-1">Documents</h3>
                        <Button variant={activeContext === 'standalone' ? 'secondary' : 'ghost'} size="sm" className="w-full justify-start gap-2 h-8" onClick={() => setActiveContext('standalone')}>
                            <FileText className="h-4 w-4"/>
                            <span>Standalone Documents</span>
                            <span className="ml-auto text-xs text-muted-foreground">{standaloneDocuments.length}</span>
                        </Button>
                    </div>
                </ScrollArea>
            </div>
            
            {/* Right Panel */}
            <div className="flex flex-col min-h-0">
                <div className="p-4 border-b flex items-center justify-between gap-4">
                    {activeCollection ? (
                        <div className="flex items-center gap-3">
                            <Folder className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-base truncate" title={activeCollection.name}>{activeCollection.name}</h3>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5" />
                            <h3 className="font-semibold text-base">Standalone Documents</h3>
                        </div>
                    )}
                     <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search documents..."
                            className="h-9 pl-9"
                            value={documentSearchQuery}
                            onChange={(e) => setDocumentSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    {displayedDocuments.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="w-[100px] text-right">Size</TableHead>
                                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayedDocuments.map(doc => renderDocumentRow(doc))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                             {documentSearchQuery ? (
                                <p>No documents match your search.</p>
                            ) : (
                                <p>{activeCollection ? 'This collection is empty.' : 'No standalone documents.'}</p>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
        
        <DialogFooter className="p-4 border-t">
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
