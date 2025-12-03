"use client";

import React from 'react';
import {
  FileText,
  Plus,
  MoreHorizontal,
  Trash2,
  PenSquare,
  ArrowRightLeft,
  History,
  FolderKanban,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import type { Document } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface DocumentSidebarProps {
  documents: Document[];
  selectedDocs: string[];
  onDocSelect: (docId: string, isSelected: boolean) => void;
  className?: string;
}

export function DocumentSidebar({
  documents,
  selectedDocs,
  onDocSelect,
  className,
}: DocumentSidebarProps) {

  return (
    <Sidebar
      className={cn("border-r border-sidebar-border", className)}
      collapsible="icon"
    >
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Button variant="default" className="w-full bg-primary hover:bg-primary/90">
            <Plus className="mr-2" />
            Upload Document
          </Button>
        </SidebarGroup>
        <SidebarGroup>
          <Button variant="outline" className="w-full">
            <FolderKanban className="mr-2" />
            Manage Collections
          </Button>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center">
            <FileText className="mr-2" />
            All Files
          </SidebarGroupLabel>
          {documents.map((doc) => (
            <DocumentItem
              key={doc.id}
              doc={doc}
              isSelected={selectedDocs.includes(doc.id)}
              onSelect={onDocSelect}
            />
          ))}
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center">
            <History className="mr-2" />
            Chat History
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="sm" className="truncate" isActive>Q3 Revenue Analysis</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton size="sm" className="truncate">Competitor Strategy</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Avatar className="h-8 w-8">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="font-medium">John Doe</span>
              <Badge variant="outline" className="ml-auto">PRO</Badge>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

const DocumentItem = ({
  doc,
  isSelected,
  onSelect,
}: {
  doc: Document;
  isSelected: boolean;
  onSelect: (docId: string, isSelected: boolean) => void;
}) => (
  <div className="group/item flex w-full items-center rounded-md p-1 pr-2 hover:bg-sidebar-accent">
    <label className="flex flex-grow cursor-pointer items-center gap-2 py-1 text-sm text-sidebar-foreground">
      <Checkbox
        checked={isSelected}
        onCheckedChange={(checked) => onSelect(doc.id, !!checked)}
        className="border-sidebar-foreground data-[state=checked]:bg-accent data-[state=checked]:border-accent-foreground"
      />
      <span className="truncate">{doc.name}</span>
    </label>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/item:opacity-100">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem><ArrowRightLeft className="mr-2"/>Move to...</DropdownMenuItem>
        <DropdownMenuItem><PenSquare className="mr-2"/>Rename</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2"/>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);
