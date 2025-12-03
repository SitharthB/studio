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
import { Input } from '@/components/ui/input';
import {
  FileText,
  Folder,
  Search,
  Clock,
  Pin,
  List,
  ChevronDown,
  Xlsx,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from './ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface SelectDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: Document[];
  collections: Collection[];
  selectedDocIds: string[];
  onSelectedDocIdsChange: (ids: string[]) => void;
}

function FileTypeIcon({ type }: { type: string }) {
  if (type.toLowerCase() === 'pdf') {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  if (type.toLowerCase() === 'txt') {
    return <FileText className="h-5 w-5 text-gray-500" />;
  }
   if (type.toLowerCase() === 'xlsx') {
    return <Xlsx className="h-5 w-5 text-green-500" />;
  }
  return <FileText className="h-5 w-5 text-gray-400" />;
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
  const [activeContext, setActiveContext] = useState<string>('all'); // 'all', 'recent', or collection id

  useEffect(() => {
    if (open) {
      setLocalSelectedIds(selectedDocIds);
    }
  }, [selectedDocIds, open]);

  const displayedDocuments = useMemo(() => {
    if (activeContext === 'all') {
      return documents;
    }
    if (activeContext === 'recent') {
      // Simple logic: return last 5 added documents.
      return [...documents].sort((a, b) => new Date(b.added).getTime() - new Date(a.added).getTime()).slice(0, 5);
    }
    return documents.filter((doc) => doc.collectionId === activeContext);
  }, [documents, activeContext]);

  const handleSave = () => {
    onSelectedDocIdsChange(localSelectedIds);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleDocCheckedChange = (docId: string, isChecked: boolean) => {
    setLocalSelectedIds((prev) => {
      if (isChecked) {
        return [...prev, docId];
      } else {
        return prev.filter((id) => id !== docId);
      }
    });
  };

  const handleCollectionCheckedChange = (collectionId: string, isChecked: boolean) => {
    const collectionDocIds = collections.find(c => c.id === collectionId)?.documentIds || [];
    setLocalSelectedIds(prev => {
      if (isChecked) {
        return [...new Set([...prev, ...collectionDocIds])];
      } else {
        return prev.filter(id => !collectionDocIds.includes(id));
      }
    });
  };

  const isCollectionSelected = (collectionId: string) => {
    const collectionDocIds = collections.find(c => c.id === collectionId)?.documentIds || [];
    return collectionDocIds.length > 0 && collectionDocIds.every(id => localSelectedIds.includes(id));
  };
  
  const isCollectionIndeterminate = (collectionId: string) => {
    const collectionDocIds = collections.find(c => c.id === collectionId)?.documentIds || [];
    const selectedCount = collectionDocIds.filter(id => localSelectedIds.includes(id)).length;
    return selectedCount > 0 && selectedCount < collectionDocIds.length;
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-lg">Select Documents</DialogTitle>
          <DialogDescription>
            Choose documents or collections to add to the chat context.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-[280px_1fr] min-h-0 border-t">
          {/* Left Panel */}
          <div className="flex flex-col border-r bg-background/50 p-3">
            <h2 className="px-3 text-base font-semibold">Select Context</h2>
            <div className="relative p-2">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search collections..." className="pl-9 h-9" />
            </div>
            <div className="flex flex-col gap-1 p-2">
                <Button variant={activeContext === 'all' ? 'secondary' : 'ghost'} size="sm" className="justify-start gap-2" onClick={() => setActiveContext('all')}>
                    <Folder className="h-4 w-4" /> All Files
                </Button>
                <Button variant={activeContext === 'recent' ? 'secondary' : 'ghost'} size="sm" className="justify-start gap-2" onClick={() => setActiveContext('recent')}>
                    <Clock className="h-4 w-4" /> Recent
                </Button>
            </div>
            <Separator className="my-2" />
             <ScrollArea className="flex-1">
              <div className="p-2 space-y-4">
                <div>
                  <h3 className="px-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase flex items-center gap-2"><Pin className="h-3 w-3" /> Pinned</h3>
                  <div className="mt-2 space-y-1">
                    {collections.map(col => (
                       <div key={col.id} className="group flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted/50">
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
                            <button className="flex items-center gap-2 text-sm" onClick={() => setActiveContext(col.id)}>
                                <Folder className="h-4 w-4 text-primary"/>
                                <span>{col.name}</span>
                            </button>
                        </div>
                        <span className="text-xs text-muted-foreground">{col.documentIds.length}</span>
                       </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
          
          {/* Right Panel */}
          <div className="flex flex-col min-h-0">
             <div className="flex items-center gap-2 p-3 border-b">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search in current view..." className="pl-9 h-9" />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9">All Types <ChevronDown className="h-4 w-4 ml-2" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Text</DropdownMenuItem>
                        <DropdownMenuItem>PDF</DropdownMenuItem>
                         <DropdownMenuItem>Spreadsheet</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9">Any Time <ChevronDown className="h-4 w-4 ml-2" /></Button>
                    </DropdownMenuTrigger>
                     <DropdownMenuContent>
                        <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                        <DropdownMenuItem>Last 30 days</DropdownMenuItem>
                        <DropdownMenuItem>Last 6 months</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="icon" className="h-9 w-9">
                    <List className="h-4 w-4" />
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <Table>
                    <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm">
                        <TableRow>
                            <TableHead className="w-[50px]"><Checkbox /></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="w-[100px]">Type</TableHead>
                            <TableHead className="w-[150px]">Modified</TableHead>
                            <TableHead className="text-right w-[100px]">Size</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayedDocuments.map(doc => (
                            <TableRow key={doc.id} className="cursor-pointer" onClick={() => handleDocCheckedChange(doc.id, !localSelectedIds.includes(doc.id))}>
                                <TableCell onClick={e => e.stopPropagation()}>
                                    <Checkbox 
                                        checked={localSelectedIds.includes(doc.id)}
                                        onCheckedChange={(checked) => handleDocCheckedChange(doc.id, !!checked)}
                                    />
                                </TableCell>
                                <TableCell className="font-medium flex items-center gap-2">
                                  <FileTypeIcon type={doc.type} />
                                  {doc.name}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{doc.type}</TableCell>
                                <TableCell className="text-muted-foreground">{formatDistanceToNow(new Date(doc.added), { addSuffix: true })}</TableCell>
                                <TableCell className="text-right text-muted-foreground">{(doc.size / 1024).toFixed(1)} KB</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter className="p-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Apply Selection</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
