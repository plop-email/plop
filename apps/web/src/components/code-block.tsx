"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { highlight } from "sugar-high";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = "typescript",
  title,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SAFETY: highlight() from sugar-high escapes HTML entities.
  // The code prop comes from our own data files, not user input.
  const highlightedCode = highlight(code);

  return (
    <div className="group relative rounded-lg border border-white/10 bg-[#0a0a0a] overflow-hidden">
      {title && (
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="text-sm text-gray-400">{title}</span>
          <span className="text-xs text-gray-500 font-mono">{language}</span>
        </div>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={handleCopy}
          className="absolute right-2 top-2 p-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="size-4 text-green-400" />
          ) : (
            <Copy className="size-4 text-gray-400" />
          )}
        </button>
        <pre className="overflow-x-auto p-4 text-sm">
          <code
            className={showLineNumbers ? "line-numbers" : ""}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
}
