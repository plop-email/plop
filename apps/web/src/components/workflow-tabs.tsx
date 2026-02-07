"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@plop/ui/tabs";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { highlight } from "sugar-high";
import { useToast } from "@/hooks/use-toast";

type SnippetKey = "ts-sdk" | "py-sdk" | "cypress" | "playwright" | "node";

const tabs: { value: SnippetKey; label: string }[] = [
  { value: "ts-sdk", label: "TS SDK" },
  { value: "py-sdk", label: "PY SDK" },
  { value: "cypress", label: "Cypress" },
  { value: "playwright", label: "Playwright" },
  { value: "node", label: "Node" },
];

const codeSnippets: Record<SnippetKey, string> = {
  "ts-sdk": `// TypeScript SDK — one line to wait for an email
import { Plop } from '@plop/sdk'

const plop = new Plop({ apiKey: process.env.PLOP_API_KEY })
const msg = await plop.waitFor({
  mailbox: 'qa',
  tag: 'login',
  timeout: 10_000,
})
const otp = msg.textContent?.match(/\\b\\d{6}\\b/)?.[0]
await page.fill('[data-testid="otp-input"]', otp)`,
  "py-sdk": `# Python SDK — one line to wait for an email
from plop import Plop

client = Plop(api_key=os.environ["PLOP_API_KEY"])
msg = client.wait_for(
    mailbox="qa",
    tag="login",
    timeout=10.0,
)
import re
otp = re.search(r"\\b\\d{6}\\b", msg.text_content or "")`,
  cypress: `// Fetch the latest matching email
cy.request({
  method: 'GET',
  url: 'https://api.plop.email/v1/messages/latest?mailbox=qa&tag=login',
  headers: { Authorization: 'Bearer <API_KEY>' },
}).then(({ body }) => {
  const otp = body.data.textContent?.match(/\\b\\d{6}\\b/)?.[0]
  expect(otp).to.match(/\\b\\d{6}\\b/)
  cy.get('[data-testid="otp-input"]').type(otp)
})`,
  playwright: `// Poll the Messages API in Playwright
const apiUrl = 'https://api.plop.email'
const apiKey = '<API_KEY>'
const res = await request.get(
  \`\${apiUrl}/v1/messages/latest?mailbox=qa&tag=login\`,
  { headers: { Authorization: \`Bearer \${apiKey}\` } }
)
const { data } = await res.json()
const otp = data.textContent?.match(/\\b\\d{6}\\b/)?.[0]
await page.fill('[data-testid="otp-input"]', otp)`,
  node: `// Node fetch example
const apiKey = '<API_KEY>'
const res = await fetch(
  'https://api.plop.email/v1/messages/latest?mailbox=qa&tag=login',
  { headers: { Authorization: \`Bearer \${apiKey}\` } }
)
const { data } = await res.json()
const otp = data.textContent?.match(/\\b\\d{6}\\b/)?.[0]
console.log('OTP:', otp)`,
};

const highlightedSnippets: Record<SnippetKey, string> = Object.fromEntries(
  Object.entries(codeSnippets).map(([key, code]) => [key, highlight(code)]),
) as Record<SnippetKey, string>;

const triggerClassName =
  "px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-white/70 hover:text-white data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#B8FF2C] data-[state=active]:font-semibold";

export function WorkflowTabs(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<SnippetKey>("ts-sdk");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  function handleCopy(): void {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    toast({ description: "Copied", duration: 1200 });
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <section className="border-b border-white/12">
      <div className="mx-auto max-w-[1120px] px-6 lg:px-8 py-20 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl lg:text-4xl text-white mb-4">
            Works with your test framework
          </h2>
          <p className="text-[#A3A7AE] text-lg">
            Fetch emails, extract codes, assert content.
          </p>
        </div>

        <Tabs
          defaultValue="ts-sdk"
          className="w-full"
          onValueChange={(v) => setActiveTab(v as SnippetKey)}
        >
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 bg-[#111418] border border-white/12 p-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={triggerClassName}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-8">
              <div className="bg-[#111418] border border-white/12 p-4 sm:p-6 relative">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 text-[#A3A7AE] hover:text-white transition-colors"
                  aria-label="Copy snippet"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-[#B8FF2C]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <pre className="font-mono text-[12px] sm:text-[13px] text-white/80 overflow-x-auto leading-relaxed">
                  <code
                    className="block"
                    dangerouslySetInnerHTML={{
                      __html: highlightedSnippets[tab.value],
                    }}
                  />
                </pre>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
