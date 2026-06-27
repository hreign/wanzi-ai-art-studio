"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import type { ModelId } from "@/types";

interface AppShellProps {
  children: ReactNode;
  onSettingsClick: () => void;
  activeModel: ModelId;
  onModelChange: (model: ModelId) => void;
}

export function AppShell({ children, onSettingsClick, activeModel, onModelChange }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-primary)]">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onSettingsClick={onSettingsClick}
        activeModel={activeModel}
        onModelChange={onModelChange}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
