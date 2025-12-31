"use client";

import { Check, Link2 } from "lucide-react";
import { useCallback, useState } from "react";

const COPY_TIMEOUT = 2000;

export function PostCopyURL() {
  const [isCopied, setCopied] = useState(false);

  const handleClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_TIMEOUT);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  }, []);

  return (
    <button
      type="button"
      onClick={handleClipboard}
      className="group inline-flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
      aria-label={isCopied ? "Link copied" : "Copy link"}
      title="Copy link to clipboard"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center border border-white/10 bg-white/5">
        {isCopied ? (
          <Check className="h-3.5 w-3.5 text-[#B8FF2C]" />
        ) : (
          <Link2 className="h-3.5 w-3.5" />
        )}
      </span>
      <span>{isCopied ? "Copied" : "Copy link"}</span>
    </button>
  );
}
