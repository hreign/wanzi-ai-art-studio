"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Image, Video, Settings, Moon, Sun, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import { getModelConfig } from "@/config/models";
import type { ModelId } from "@/types";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onSettingsClick: () => void;
}

const NAV_GROUPS: { label: string; models: ModelId[] }[] = [
  {
    label: "图像生成",
    models: ["sensenova-u1.5-lite", "sensenova-u1.5-fast", "agnes-image-2.5-flash"],
  },
  {
    label: "视频生成",
    models: ["agnes-video-2.5-flash"],
  },
];

const modelIcons: Record<string, React.ReactNode> = {
  "sensenova-u1.5-lite": <Image className="h-[18px] w-[18px]" />,
  "sensenova-u1.5-fast": <Image className="h-[18px] w-[18px]" />,
  "agnes-image-2.5-flash": <Image className="h-[18px] w-[18px]" />,
  "agnes-video-2.5-flash": <Video className="h-[18px] w-[18px]" />,
};

function getModelPath(modelId: ModelId): string {
  const config = getModelConfig(modelId);
  if (!config) return "/";
  return `/${config.category}/${modelId}`;
}

export function Sidebar({ collapsed, onToggle, onSettingsClick }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col h-dvh sticky top-0",
        "bg-[var(--color-bg-elevated)] border-r border-[var(--color-border-secondary)]",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]",
      )}
    >
      <Link
        href="/"
        className="flex items-center gap-2.5 px-4 h-14 border-b border-[var(--color-border-secondary)] cursor-pointer"
      >
        <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
          <Image className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">Wanzi AI Art Studio</h1>
            <p className="text-[10px] text-[var(--color-text-tertiary)] truncate">Wanzi 艺术工坊</p>
          </div>
        )}
      </Link>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-2 text-sm font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                {group.label}
              </p>
            )}
            <div className="flex flex-col gap-1">
              {group.models.map((modelId) => {
                const config = getModelConfig(modelId);
                if (!config) return null;
                const href = getModelPath(modelId);
                const isActive = pathname === href;
                return (
                  <Link
                    key={modelId}
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 h-10 rounded-[var(--radius-sm)] transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-medium"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]",
                      collapsed && "justify-center px-0",
                    )}
                    title={config.name}
                  >
                    <span className="flex-shrink-0">{modelIcons[modelId]}</span>
                    {!collapsed && (
                      <span className="text-sm truncate flex-1 text-left">{config.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--color-border-secondary)] p-2 flex flex-col gap-0.5">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "flex items-center gap-2.5 px-2.5 h-9 rounded-[var(--radius-sm)] cursor-pointer",
            "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
            "hover:bg-[var(--color-bg-tertiary)] transition-colors",
            collapsed && "justify-center px-0",
          )}
          title={theme === "dark" ? "切换到亮色模式" : "切换到暗色模式"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4 flex-shrink-0" /> : <Moon className="h-4 w-4 flex-shrink-0" />}
          {!collapsed && <span className="text-sm">{theme === "dark" ? "亮色模式" : "暗色模式"}</span>}
        </button>

        <button
          onClick={onSettingsClick}
          className={cn(
            "flex items-center gap-2.5 px-2.5 h-9 rounded-[var(--radius-sm)] cursor-pointer",
            "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
            "hover:bg-[var(--color-bg-tertiary)] transition-colors",
            collapsed && "justify-center px-0",
          )}
          title="设置"
        >
          <Settings className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">设置</span>}
        </button>

        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-2.5 px-2.5 h-9 rounded-[var(--radius-sm)] cursor-pointer",
            "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]",
            "hover:bg-[var(--color-bg-tertiary)] transition-colors",
            collapsed && "justify-center px-0",
          )}
          title={collapsed ? "展开侧栏" : "收起侧栏"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4 flex-shrink-0" /> : <ChevronLeft className="h-4 w-4 flex-shrink-0" />}
          {!collapsed && <span className="text-sm">收起</span>}
        </button>
      </div>
    </aside>
  );
}
