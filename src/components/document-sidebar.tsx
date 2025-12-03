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
