"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";

interface AppShellProps {
  children: ReactNode;
  onSettingsClick: () => void;
}

export function AppShell({ children, onSettingsClick }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-dvh bg-[var(--color-bg-primary)]">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onSettingsClick={onSettingsClick}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
