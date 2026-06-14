"use client";

import Link from "next/link";
import { Check, ChevronsUpDown, Menu, Sparkles } from "lucide-react";
import { useProject } from "@/components/project-context";
import { CURRENT_USER } from "@/lib/mock/data";
import { initials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isAILiveClient } from "@/lib/ai/env";

export function Topbar() {
  const { projects, activeProjectId, setActiveProjectId } = useProject();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-2">
        <span className="hidden text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:inline">
          Project
        </span>
        <Select value={activeProjectId} onValueChange={setActiveProjectId}>
          <SelectTrigger className="h-8 w-[220px] text-sm font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.project_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Badge variant={isAILiveClient() ? "success" : "secondary"} className="gap-1">
          <Sparkles className="h-3 w-3" />
          {isAILiveClient() ? "AI Live" : "AI Demo"}
        </Badge>
        <Button asChild size="sm" variant="accent" className="hidden sm:inline-flex">
          <Link href="/projects/new">New Scan</Link>
        </Button>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {initials(CURRENT_USER.name)}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-xs font-semibold">{CURRENT_USER.name}</p>
            <p className="text-[10px] capitalize text-muted-foreground">
              {CURRENT_USER.plan} plan
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
