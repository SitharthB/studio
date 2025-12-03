'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
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
import { UploadCloud, File as FileIcon, Folder, FolderPlus, X } from 'lucide-react';
import { Collection } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';

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

  useEffect(() => {
    if (open && collections.length > 0) {
      setCollectionOption('existing');
    } else if (open) {
      setCollectionOption(null);
    }
  }, [open, collections.length]);


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
    setCollectionOption(collections.length > 0 ? 'existing' : null);
    setSelectedCollection(undefined);
    setNewCollectionName('');
    if(fileInputRef.current) fileInputRef.current.value = '';
  }

  const resetStateAndClose = () => {
    resetState();
    onOpenChange(false);
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetStateAndClose();
    }
    onOpenChange(isOpen);
  }

  const canUpload = useMemo(() => {
    if (!file) return false;
    // Allow upload even if no collection option is selected
    if (collectionOption === 'existing' && !selectedCollection) return false;
    if (collectionOption === 'new' && !newCollectionName.trim()) return false;
    return true;
  }, [file, collectionOption, selectedCollection, newCollectionName]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-medium text-lg">Upload Document</DialogTitle>
          <DialogDescription>Upload a file to start asking questions.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="local">Local File</TabsTrigger>
            <TabsTrigger value="drive" disabled>Google Drive</TabsTrigger>
            <TabsTrigger value="onedrive" disabled>OneDrive</TabsTrigger>
          </TabsList>
          <TabsContent value="local" className="pt-6">
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
                    className="absolute h-full w-full cursor-pointer opacity-0"
                    onChange={handleFileSelect}
                />
                <div className="flex flex-col items-center gap-2 text-center pointer-events-none">
                    <UploadCloud className="h-10 w-10 text-muted-foreground" />
                    <p className="font-medium">Drag &amp; drop or click to upload</p>
                    <p className="text-sm text-muted-foreground">PDF, DOCX, TXT up to 10MB</p>
                </div>
                </div>
            ) : (
                <Card className="shadow-sm border-border">
                    <CardContent className="flex items-center gap-4 p-4">
                        <FileIcon className="h-8 w-8 text-primary"/>
                        <div className="flex-grow min-w-0">
                            <p className="text-sm font-semibold truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full shrink-0" onClick={() => setFile(null)}>
                            <X className="h-4 w-4"/>
                            <span className="sr-only">Remove file</span>
                        </Button>
                    </CardContent>
                </Card>
            )}
          </TabsContent>
        </Tabs>
        
        {file && (
        <>
            <Separator />
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Choose Collection</h3>
                <p className="text-sm text-muted-foreground">
                  Organizing files into collections improves search. If you skip, the document will be saved as standalone.
                </p>
              </div>

              <RadioGroup value={collectionOption || ''} onValueChange={(val) => setCollectionOption(val as 'existing' | 'new' | null)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Label htmlFor="existing-collection" className={cn(
                    "flex flex-col gap-2 rounded-lg border p-4 cursor-pointer transition-colors hover:bg-accent/50",
                    collectionOption === 'existing' && 'border-primary bg-primary/5 ring-1 ring-primary'
                )}>
                    <div className="flex items-center space-x-3">
                        <RadioGroupItem value="existing" id="existing-collection" />
                        <div className="flex items-center gap-2 font-medium">
                            <Folder className="h-4 w-4 text-muted-foreground" />
                            <span>Existing Collection</span>
                        </div>
                    </div>
                    {collectionOption === 'existing' && (
                        <div className="pl-8 pt-2">
                            <Select onValueChange={setSelectedCollection} value={selectedCollection} disabled={collections.length === 0}>
                                <SelectTrigger onClick={(e) => e.preventDefault()}>
                                    <SelectValue placeholder={collections.length > 0 ? "Select a collection" : "No collections yet"} />
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

                <Label htmlFor="new-collection" className={cn(
                    "flex flex-col gap-2 rounded-lg border p-4 cursor-pointer transition-colors hover:bg-accent/50",
                    collectionOption === 'new' && 'border-primary bg-primary/5 ring-1 ring-primary'
                )}>
                    <div className="flex items-center space-x-3">
                        <RadioGroupItem value="new" id="new-collection" />
                        <div className="flex items-center gap-2 font-medium">
                            <FolderPlus className="h-4 w-4 text-muted-foreground"/>
                            <span>New Collection</span>
                        </div>
                    </div>
                    {collectionOption === 'new' && (
                        <div className="pl-8 pt-2">
                            <Input 
                                placeholder="E.g. 'Marketing Reports'"
                                value={newCollectionName}
                                onChange={(e) => setNewCollectionName(e.target.value)}
                                onClick={(e) => e.preventDefault()}
                            />
                        </div>
                    )}
                </Label>
              </RadioGroup>
            </div>
        </>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={resetStateAndClose}>Cancel</Button>
          <Button onClick={handleUploadClick} disabled={!canUpload}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
