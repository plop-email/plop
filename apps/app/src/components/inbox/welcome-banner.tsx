"use client";

import { Card, CardContent } from "@plop/ui/card";
import { Button } from "@plop/ui/button";
import { Copy, Check, X, Key } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useState, useCallback, useEffect } from "react";
import { WELCOME_DISMISSED_KEY } from "@/utils/onboarding-storage";
import Link from "next/link";

function useWelcomeDismissed() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(WELCOME_DISMISSED_KEY);
    if (stored === "true") {
      setDismissed(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(WELCOME_DISMISSED_KEY, "true");
    setDismissed(true);
  }, []);

  return { dismissed, dismiss };
}

export function WelcomeBanner() {
  const trpc = useTRPC();
  const { dismissed, dismiss } = useWelcomeDismissed();
  const [copied, setCopied] = useState(false);

  const { data: mailboxes = [] } = useQuery(
    trpc.inbox.mailboxes.list.queryOptions(),
  );

  const firstMailbox = mailboxes[0];

  if (dismissed || !firstMailbox) return null;

  const mailboxAddress = `${firstMailbox.name}@${firstMailbox.domain}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mailboxAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <h3 className="font-medium">Your test inbox is ready!</h3>
            <p className="text-sm text-muted-foreground">
              Send emails to{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                {mailboxAddress}
              </code>{" "}
              to start testing.
            </p>
            <p className="text-xs text-muted-foreground">
              Use <code className="font-mono">+tag</code> to route emails (e.g.,{" "}
              <code className="font-mono">
                {firstMailbox.name}+signup@{firstMailbox.domain}
              </code>
              )
            </p>
            <Link
              href="/settings/team/api-keys"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Key className="h-3 w-3" />
              Get your API key
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy address
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={dismiss}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
