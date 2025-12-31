import { BookOpen, Terminal } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

const endpoints = [
  {
    method: "GET",
    path: "/v1/messages",
    description: "List message summaries with filters.",
  },
  {
    method: "GET",
    path: "/v1/messages/latest",
    description: "Fetch the latest matching message with full content.",
  },
  {
    method: "GET",
    path: "/v1/messages/:id",
    description: "Retrieve a specific message by id.",
  },
];

const scopes = ["api.full", "email.full", "email.mailbox"];

export function DocsSection() {
  return (
    <section id="docs" className="border-b border-white/12">
      <div className="mx-auto max-w-[1120px] px-6 lg:px-8 py-20 sm:py-24">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 text-[#B8FF2C] mb-3">
            <BookOpen className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-widest">
              Docs at a glance
            </span>
          </div>
          <h2 className="font-heading text-3xl lg:text-4xl text-white mb-4">
            Messages API
          </h2>
          <p className="text-[#A3A7AE] text-lg">
            Use the REST API to list inboxes, filter by mailbox + tag, and pull
            the latest message for E2E tests.
          </p>
          <div className="mt-4 flex items-center justify-center">
            <Link
              href={siteConfig.docsUrl}
              className="text-sm font-semibold text-[#B8FF2C] hover:opacity-80 transition-opacity"
              target="_blank"
              rel="noreferrer"
            >
              Read the full docs →
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {endpoints.map((endpoint) => (
            <div
              key={endpoint.path}
              className="bg-[#111418] border border-white/12 p-5 sm:p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#B8FF2C]">
                  {endpoint.method}
                </span>
                <code className="text-sm text-white">{endpoint.path}</code>
              </div>
              <p className="text-[#A3A7AE] text-sm">{endpoint.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="bg-[#0B0D0F] border border-white/12 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-[#B8FF2C] mb-4">
              <Terminal className="h-4 w-4" />
              <span className="font-mono text-xs uppercase tracking-widest">
                Example request
              </span>
            </div>
            <pre className="text-[11px] sm:text-xs text-white font-mono overflow-x-auto leading-relaxed">
              <code>{`curl -H "Authorization: Bearer <API_KEY>" \\
  "https://api.plop.email/v1/messages/latest?mailbox=qa&tag=login"`}</code>
            </pre>
          </div>
          <div className="bg-[#111418] border border-white/12 p-5 sm:p-6">
            <h3 className="font-heading text-white text-lg mb-3">Scopes</h3>
            <p className="text-[#A3A7AE] text-sm mb-4">
              Choose the narrowest scope for each key. Mailbox-scoped keys must
              match the mailbox filter.
            </p>
            <div className="flex flex-wrap gap-2">
              {scopes.map((scope) => (
                <span
                  key={scope}
                  className="border border-white/12 px-3 py-1 text-xs text-white font-mono"
                >
                  {scope}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
