"use client";

import type { LucideIcon } from "lucide-react";
import { Search, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchInputProps = {
  placeholder: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  className?: string;
};

export function PageActionButton({
  icon: Icon,
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { icon?: LucideIcon }) {
  return (
    <Button className={cn("h-10 rounded-xl px-5 text-[14px] font-medium", className)} {...props}>
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </Button>
  );
}

export function SearchInput({
  placeholder,
  value,
  onChange,
  className,
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9f98af]" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="h-11 rounded-[12px] pl-14"
      />
    </div>
  );
}

export function UploadAvatarField({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-w-[122px] flex-col items-center gap-3", className)}>
      <div className="flex h-[108px] w-[108px] items-center justify-center rounded-full border border-dashed border-[#d9d5e9] bg-[#faf9fd]">
        <Upload className="h-8 w-8 text-[#9f98af]" />
      </div>
      <span className="text-[14px] text-foreground">Upload Photo</span>
    </div>
  );
}

export function SoftStatusBadge({
  children,
  tone = "lavender",
  className,
}: {
  children: React.ReactNode;
  tone?: "lavender" | "blue" | "danger" | "success";
  className?: string;
}) {
  const tones = {
    lavender: "border-[#e5ddff] bg-[#c8bcff] text-white",
    blue: "border-[#dce8ff] bg-[#eef4ff] text-[#93a6d7]",
    danger: "border-[#ffdbe0] bg-[#ffeef1] text-[#ef8f9a]",
    success: "border-[#dcefd6] bg-[#edf8e8] text-[#78ae5e]",
  };

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md border px-2.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
