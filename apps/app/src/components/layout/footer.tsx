const SITE_URL = "https://plop.email";
const DOCS_URL = "https://docs.plop.email";

const links = {
  docs: DOCS_URL,
  privacy: `${SITE_URL}/legal/privacy`,
  terms: `${SITE_URL}/legal/terms`,
  cookies: `${SITE_URL}/legal/cookies`,
} as const;

export function Footer() {
  return (
    <footer className="w-full border-t py-4 text-xs text-muted-foreground">
      <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 sm:flex-row">
        <div className="flex items-center gap-1">
          <span className="font-medium">plop.email</span>
          <span className="text-muted-foreground/60">·</span>
          <span>© {new Date().getFullYear()}</span>
        </div>

        <nav className="flex items-center gap-4">
          <a
            href={links.docs}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Docs
          </a>
          <a
            href={links.privacy}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Privacy
          </a>
          <a
            href={links.terms}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Terms
          </a>
          <a
            href={links.cookies}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Cookies
          </a>
        </nav>
      </div>
    </footer>
  );
}
