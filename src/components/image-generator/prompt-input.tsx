"use client";

import { Textarea } from "@/components/ui/textarea";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  hint?: string;
}

export function PromptInput({
  value,
  onChange,
  disabled,
  placeholder = "描述你想生成的图像… 例如：一只金色凤凰在日出时飞翔，中国水墨画风格",
  hint = "支持中英文提示词，越详细的描述效果越好",
}: PromptInputProps) {
  return (
    <Textarea
      label="提示词"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      hint={hint}
      rows={4}
      disabled={disabled}
    />
  );
}
