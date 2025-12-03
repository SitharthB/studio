'use client';

import { useState, useRef } from 'react';
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
import { UploadCloud, File, Package, PlusCircle, Folder, FolderPlus, CheckCircle } from 'lucide-react';
import { Collection } from '@/types';
import { cn } from '@/lib/utils';

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: Collection[];
  onUpload: (file: File, destination: { type: string; id?: string; name?: string }) => void;
}

export function UploadDocumentDialog({ open, onOpenChange, collections, onUpload }: UploadDocumentDialogProps) {
  const [activeTab, setActiveTab] = useState('local');
  const [file, setFile] = useState<File | null>(null);
  const [destination, setDestination] = useState('standalone');
  const [selectedCollection, setSelectedCollection] = useState<string | undefined>(undefined);
  const [newCollectionName, setNewCollectionName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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

    let destDetails: { type: string; id?: string; name?: string } = { type: destination };
    if (destination === 'existing' && selectedCollection) {
      destDetails.id = selectedCollection;
      destDetails.type = 'existing-collection';
    } else if (destination === 'new' && newCollectionName) {
      destDetails.name = newCollectionName;
      destDetails.type = 'new-collection'
    }

    onUpload(file, destDetails);
    resetState();
  };
  
  const resetState = () => {
    setFile(null);
    setDestination('standalone');
    setSelectedCollection(undefined);
    setNewCollectionName('');
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  }

  const canUpload = () => {
    if (!file) return false;
    if (destination === 'existing' && !selectedCollection) return false;
    if (destination === 'new' && !newCollectionName.trim()) return false;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>Upload a file and add it to your knowledge base.</DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="local">Local File</TabsTrigger>
            <TabsTrigger value="drive" disabled>Google Drive</TabsTrigger>
            <TabsTrigger value="onedrive" disabled>OneDrive</TabsTrigger>
          </TabsList>
          <TabsContent value="local">
            <div 
              className={cn(
                "mt-4 flex h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors",
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
                className="hidden"
                onChange={handleFileSelect}
              />
              {file ? (
                <div className="flex flex-col items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                    <span className="font-semibold">{file.name}</span>
                    <Button size="sm" variant="link" onClick={() => { setFile(null); fileInputRef.current!.value = ''; }}>Choose a different file</Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <UploadCloud className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drag & drop a file here, or</p>
                  <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>Browse Files</Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {file && (
            <div className="mt-4 space-y-4">
                <Label className="text-sm font-medium">Save to</Label>
                <RadioGroup value={destination} onValueChange={setDestination} className="space-y-2">
                    <Label htmlFor="standalone" className={cn("flex cursor-pointer flex-col gap-2 rounded-md border p-4 transition-colors hover:bg-accent/50", destination === 'standalone' && 'border-primary ring-2 ring-primary')}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="standalone" id="standalone" />
                            <div className="flex items-center gap-2 font-medium">
                                <Package className="h-4 w-4 text-muted-foreground"/> Standalone Document
                            </div>
                        </div>
                    </Label>
                    
                    <Label htmlFor="existing" className={cn("flex cursor-pointer flex-col gap-2 rounded-md border p-4 transition-colors hover:bg-accent/50", destination === 'existing' && 'border-primary ring-2 ring-primary')}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="existing" id="existing" />
                            <div className="flex items-center gap-2 font-medium">
                                <Folder className="h-4 w-4 text-muted-foreground" /> Existing Collection
                            </div>
                        </div>
                        {destination === 'existing' && (
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

                    <Label htmlFor="new" className={cn("flex cursor-pointer flex-col gap-2 rounded-md border p-4 transition-colors hover:bg-accent/50", destination === 'new' && 'border-primary ring-2 ring-primary')}>
                         <div className="flex items-center space-x-2">
                            <RadioGroupItem value="new" id="new" />
                            <div className="flex items-center gap-2 font-medium">
                                <FolderPlus className="h-4 w-4 text-muted-foreground"/> New Collection
                            </div>
                        </div>
                        {destination === 'new' && (
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
                </RadioGroup>
            </div>
        )}

        <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button onClick={handleUploadClick} disabled={!canUpload()}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
