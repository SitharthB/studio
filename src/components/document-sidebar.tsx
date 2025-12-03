"use client";

import React from 'react';
import {
  Plus,
  History,
  FolderKanban,
  MessageSquarePlus,
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

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface DocumentSidebarProps {
  onUploadClick: () => void;
  className?: string;
}

export function DocumentSidebar({
  onUploadClick,
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
          <Button onClick={onUploadClick} variant="default" className="w-full bg-primary hover:bg-primary/90">
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
          <Button variant="ghost" className="w-full justify-start">
            <MessageSquarePlus className="mr-2" />
            New Chat
          </Button>
        </SidebarGroup>
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
