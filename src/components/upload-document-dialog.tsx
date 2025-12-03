'use client';

import { useState, useRef, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadCloud, File as FileIcon, Package, PlusCircle, Folder, FolderPlus, CheckCircle, ChevronDown, X } from 'lucide-react';
import { Collection } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: Collection[];
  onUpload: (file: File, destination: { type: string; id?: string; name?: string }) => void;
}

export function UploadDocumentDialog({ open, onOpenChange, collections, onUpload }: UploadDocumentDialogProps) {
  const [activeTab, setActiveTab] = useState('local');
  const [file, setFile] = useState<File | null>(null);
  const [collectionOption, setCollectionOption] = useState<'existing' | 'new' | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | undefined>(undefined);
  const [newCollectionName, setNewCollectionName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleUploadClick = () => {
    if (!file) return;

    let destDetails: { type: string; id?: string; name?: string } = { type: 'standalone' };
    if (collectionOption === 'existing' && selectedCollection) {
        destDetails.id = selectedCollection;
        destDetails.type = 'existing-collection';
    } else if (collectionOption === 'new' && newCollectionName) {
        destDetails.name = newCollectionName;
        destDetails.type = 'new-collection'
    }

    onUpload(file, destDetails);
    resetStateAndClose();
  };

  const resetState = () => {
    setFile(null);
    setCollectionOption(null);
    setSelectedCollection(undefined);
    setNewCollectionName('');
    setIsCollectionsOpen(false);
    if(fileInputRef.current) fileInputRef.current.value = '';
  }

  const resetStateAndClose = () => {
    resetState();
    onOpenChange(false);
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  }

  const canUpload = useMemo(() => {
    if (!file) return false;
    if (collectionOption === 'existing' && !selectedCollection) return false;
    if (collectionOption === 'new' && !newCollectionName.trim()) return false;
    return true;
  }, [file, collectionOption, selectedCollection, newCollectionName]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>Upload a file to start asking questions.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="local">Local File</TabsTrigger>
            <TabsTrigger value="drive" disabled>Google Drive</TabsTrigger>
            <TabsTrigger value="onedrive" disabled>OneDrive</TabsTrigger>
          </TabsList>
          <TabsContent value="local" className="py-4">
            {!file ? (
                <div
                className={cn(
                    "relative flex h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors",
                    isDragging && "border-primary bg-primary/10"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="absolute h-full w-full opacity-0 cursor-pointer"
                    onChange={handleFileSelect}
                />
                <div className="flex flex-col items-center gap-2 text-center pointer-events-none">
                    <UploadCloud className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Drag & drop a file here, or click to browse</p>
                </div>
                </div>
            ) : (
                <Card>
                    <CardContent className="flex items-center gap-4 p-4">
                        <FileIcon className="h-8 w-8 text-primary"/>
                        <div className="flex-grow">
                            <p className="text-sm font-semibold truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => resetState()}>
                            <X className="h-4 w-4"/>
                            <span className="sr-only">Remove file</span>
                        </Button>
                    </CardContent>
                </Card>
            )}
          </TabsContent>
          <TabsContent value="drive">
              {/* Placeholder for Google Drive Integration */}
          </TabsContent>
          <TabsContent value="onedrive">
              {/* Placeholder for OneDrive Integration */}
          </TabsContent>
        </Tabs>
        
        <Separator />

        <Collapsible open={isCollectionsOpen} onOpenChange={setIsCollectionsOpen} className="space-y-4">
            <CollapsibleTrigger asChild>
                <button className="flex w-full items-center justify-between text-sm font-medium">
                    <span>Add to Collection (Optional)</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isCollectionsOpen && "rotate-180")}/>
                </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <RadioGroup value={collectionOption || ""} onValueChange={(val) => setCollectionOption(val as 'existing' | 'new' | null)}>
                    <div className="space-y-2">
                        <Label htmlFor="existing" className={cn("flex cursor-pointer flex-col gap-2 rounded-md border p-4 transition-colors hover:bg-accent/50", collectionOption === 'existing' && 'border-primary ring-2 ring-primary')}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="existing" id="existing" />
                                <div className="flex items-center gap-2 font-medium">
                                    <Folder className="h-4 w-4 text-muted-foreground" /> Existing Collection
                                </div>
                            </div>
                            {collectionOption === 'existing' && (
                                <div className="pl-6 pt-2">
                                    <Select onValueChange={setSelectedCollection} value={selectedCollection}>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select a collection" />
                                        </SelectTrigger>
                                        <SelectContent>
                                        {collections.map((col) => (
                                            <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </Label>

                        <Label htmlFor="new" className={cn("flex cursor-pointer flex-col gap-2 rounded-md border p-4 transition-colors hover:bg-accent/50", collectionOption === 'new' && 'border-primary ring-2 ring-primary')}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="new" id="new" />
                                <div className="flex items-center gap-2 font-medium">
                                    <FolderPlus className="h-4 w-4 text-muted-foreground"/> New Collection
                                </div>
                            </div>
                            {collectionOption === 'new' && (
                                <div className="pl-6 pt-2">
                                <Input 
                                    placeholder="E.g. 'Marketing Reports'"
                                    value={newCollectionName}
                                    onChange={(e) => setNewCollectionName(e.target.value)}
                                    onClick={(e) => e.preventDefault()} // Prevent label click from toggling radio
                                />
                                </div>
                            )}
                        </Label>
                    </div>
                </RadioGroup>
            </CollapsibleContent>
        </Collapsible>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={handleUploadClick} disabled={!canUpload}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
