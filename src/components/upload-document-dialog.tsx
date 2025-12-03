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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (!file) return;

    let destDetails: { type: string; id?: string; name?: string } = { type: destination };
    if (destination === 'existing' && selectedCollection) {
      destDetails.id = selectedCollection;
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
      <DialogContent className="sm:max-w-[500px]">
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
            <div className="mt-4 rounded-lg border-2 border-dashed border-border p-8 text-center">
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
                    <Button size="sm" variant="link" onClick={() => setFile(null)}>Choose a different file</Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <UploadCloud className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drag & drop a file here, or</p>
                  <Button onClick={() => fileInputRef.current?.click()}>Browse Files</Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {file && (
            <div className="mt-4 space-y-4">
                <h3 className="text-sm font-medium">Save to</h3>
                <RadioGroup value={destination} onValueChange={setDestination}>
                    <div className="flex items-center space-x-2 rounded-md border p-4">
                        <RadioGroupItem value="standalone" id="standalone" />
                        <Label htmlFor="standalone" className="flex items-center gap-2 w-full">
                            <Package className="h-4 w-4"/> Standalone Document
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-4">
                        <RadioGroupItem value="existing" id="existing" />
                        <Label htmlFor="existing" className="flex items-center gap-2 w-full">
                            <Folder className="h-4 w-4" /> Existing Collection
                        </Label>
                    </div>
                    {destination === 'existing' && (
                        <div className="pl-8 pb-2">
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
                    <div className="flex items-center space-x-2 rounded-md border p-4">
                        <RadioGroupItem value="new" id="new" />
                        <Label htmlFor="new" className="flex items-center gap-2 w-full">
                            <FolderPlus className="h-4 w-4"/> New Collection
                        </Label>
                    </div>
                    {destination === 'new' && (
                        <div className="pl-8 pb-2">
                           <Input 
                            placeholder="New collection name..."
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                           />
                        </div>
                    )}
                </RadioGroup>
            </div>
        )}

        <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button onClick={handleUploadClick} disabled={!canUpload()}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
