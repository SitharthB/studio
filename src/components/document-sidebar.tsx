"use client";

import React from 'react';
import {
  Plus,
  History,
  FolderKanban,
  MessageSquarePlus,
  Search,
} from 'lucide-react';
import {
  SidebarSeparator,
} from '@/components/ui/sidebar';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

interface DocumentSidebarProps {
  onUploadClick: () => void;
  className?: string;
  isSmartSearch: boolean;
  onSmartSearchChange: (value: boolean) => void;
}

export function DocumentSidebar({
  onUploadClick,
  className,
  isSmartSearch,
  onSmartSearchChange,
}: DocumentSidebarProps) {

  return (
    <div className={cn("w-[280px] h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border", className)}>
        <div className="p-4">
            <Logo />
        </div>
        <div className="p-2 space-y-2">
            <Button onClick={onUploadClick} variant="default" className="w-full bg-primary hover:bg-primary/90">
                <Plus className="mr-2" />
                Upload Document
            </Button>
            <Button variant="outline" className="w-full bg-sidebar-accent border-sidebar-border hover:bg-sidebar-accent/80">
                <FolderKanban className="mr-2" />
                Manage Collections
            </Button>
            <div className='flex items-center justify-between rounded-lg border border-sidebar-border bg-sidebar-accent p-3 mt-2'>
              <Label htmlFor="smart-search-toggle" className="flex items-center gap-2 cursor-pointer">
                <Search className="h-4 w-4" />
                <span className="font-medium">Document Search</span>
              </Label>
              <Switch
                id="smart-search-toggle"
                checked={isSmartSearch}
                onCheckedChange={onSmartSearchChange}
              />
            </div>
        </div>
        <div className="my-2">
            <SidebarSeparator />
        </div>
        <div className="p-2">
             <Button variant="ghost" className="w-full justify-start hover:bg-sidebar-accent">
                <MessageSquarePlus className="mr-2" />
                New Chat
            </Button>
        </div>
        <div className="flex-1 px-2 space-y-2 overflow-y-auto">
             <div className="flex items-center px-2 text-xs font-semibold text-sidebar-foreground/70">
                <History className="mr-2 h-4 w-4" />
                Chat History
            </div>
            <div className="space-y-1">
                <Button variant="ghost" size="sm" className="w-full justify-start truncate bg-sidebar-accent text-sidebar-accent-foreground">
                    Q3 Revenue Analysis
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start truncate hover:bg-sidebar-accent">
                    Competitor Strategy
                </Button>
                 <Button variant="ghost" size="sm" className="w-full justify-start truncate hover:bg-sidebar-accent">
                    Market Research Synthesis
                </Button>
                 <Button variant="ghost" size="sm" className="w-full justify-start truncate hover:bg-sidebar-accent">
                    Product Launch Plan
                </Button>
            </div>
        </div>
         <div className="p-2 mt-auto border-t border-sidebar-border">
            <Button variant="ghost" className="w-full justify-start gap-2 hover:bg-sidebar-accent">
                <Avatar className="h-8 w-8">
                    <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <span className="font-medium">John Doe</span>
                <Badge variant="outline" className="ml-auto border-sidebar-border">PRO</Badge>
            </Button>
        </div>
    </div>
  );
}
