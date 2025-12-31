"use client";

import { useId, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Input } from "@plop/ui/input";
import { Button } from "@plop/ui/button";

interface CopyInputProps {
  value: string;
  className?: string;
}

export function CopyInput({ value, className }: CopyInputProps) {
  const [copied, setCopied] = useState(false);
  const inputId = useId();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className={className}>
      <label htmlFor={inputId} className="text-xs text-white/60">
        Share link
      </label>
      <div className="mt-2 flex gap-2">
        <Input
          id={inputId}
          value={value}
          readOnly
          className="border-white/12 bg-[#0B0D0F] text-white"
        />
        <Button
          type="button"
          variant="outline"
          className="border-white/12 text-white hover:bg-white/20 hover:border-white/30"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-[#B8FF2C]" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
