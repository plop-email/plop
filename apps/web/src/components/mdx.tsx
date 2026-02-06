import { cn } from "@plop/ui/cn";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type React from "react";
import type { ReactNode } from "react";
import remarkGfm from "remark-gfm";
import { highlight } from "sugar-high";

interface CustomLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  className?: string;
}

function CustomLink({ href, className, ...props }: CustomLinkProps) {
  const linkClass = cn(
    "text-[#B8FF2C] hover:text-[#D7FF6A] underline underline-offset-4 transition-colors",
    className,
  );

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={linkClass} {...props}>
        <span>{props.children}</span>
      </Link>
    );
  }

  if (href.startsWith("#")) {
    return <a href={href} className={linkClass} {...props} />;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={linkClass}
      {...props}
    />
  );
}

interface RoundedImageProps extends React.ComponentProps<typeof Image> {
  alt: string;
  className?: string;
}

function RoundedImage({ className, alt, ...props }: RoundedImageProps) {
  const width = typeof props.width === "number" ? props.width : 1200;
  const height = typeof props.height === "number" ? props.height : 630;

  return (
    <Image
      alt={alt}
      width={width}
      height={height}
      sizes="100vw"
      className={cn(
        " border border-white/12 bg-[#0B0D0F] w-full h-auto",
        className,
      )}
      {...props}
    />
  );
}

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

function Code({ children, className, ...props }: CodeProps) {
  const language = className?.match(/language-(\w+)/)?.[1];
  const code = Array.isArray(children)
    ? children.join("")
    : typeof children === "string"
      ? children
      : "";
  const isInline = !language && !code.includes("\n");

  if (isInline) {
    return (
      <code
        className={cn(
          " bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white",
          className,
        )}
        {...props}
      >
        {children}
      </code>
    );
  }

  const codeHTML = highlight(code);
  return (
    <code
      className={cn("font-mono text-sm text-white", className)}
      dangerouslySetInnerHTML={{ __html: codeHTML }}
      {...props}
    />
  );
}

function slugify(str: string): string {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

interface HeadingProps {
  children: React.ReactNode;
  className?: string;
}

function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const Heading = ({ children, className }: HeadingProps) => {
    const text = Array.isArray(children)
      ? children.join("")
      : typeof children === "string"
        ? children
        : "";
    const slug = slugify(text);
    const Tag = `h${level}` as const;

    const sizeClasses =
      level === 1
        ? "text-3xl sm:text-4xl"
        : level === 2
          ? "text-2xl sm:text-3xl"
          : level === 3
            ? "text-xl sm:text-2xl"
            : "text-lg";

    return (
      <Tag
        id={slug}
        className={cn(
          "group relative font-heading text-white mt-8 scroll-mt-28",
          sizeClasses,
          className,
        )}
      >
        <a
          href={`#${slug}`}
          className="absolute -ml-8 mt-1 opacity-0 group-hover:opacity-100 text-white/40"
          aria-label={`Link to ${children}`}
        >
          #
        </a>
        {children}
      </Tag>
    );
  };

  Heading.displayName = `Heading${level}`;
  return Heading;
}

interface IframeProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  src: string;
  className?: string;
}

function Iframe({ src, className, ...props }: IframeProps) {
  return (
    <iframe
      src={src}
      className={cn("w-full  border border-white/12", className)}
      {...props}
    />
  );
}

function Note({
  type = "info",
  className,
  children,
}: {
  type?: "info" | "warning" | "success" | "error";
  className?: string;
  children: ReactNode;
}) {
  const variant =
    type === "warning"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-100"
      : type === "success"
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
        : type === "error"
          ? "border-red-500/30 bg-red-500/10 text-red-100"
          : "border-sky-500/30 bg-sky-500/10 text-sky-100";

  return (
    <div className={cn(" border p-3 text-sm", variant, className)}>
      {children}
    </div>
  );
}

const components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mt-4 text-[#A3A7AE] leading-relaxed" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="mt-4 space-y-2 list-disc list-inside text-[#A3A7AE]"
      {...props}
    />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="mt-4 space-y-2 list-decimal list-inside text-[#A3A7AE]"
      {...props}
    />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-white" {...props} />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic text-white/90" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="mt-6 border-l-2 border-[#B8FF2C] pl-4 text-white/80 italic"
      {...props}
    />
  ),
  table: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="mt-6 overflow-x-auto">
      <table
        className={cn("min-w-full border-collapse text-sm", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className={cn("border-b border-white/12", className)} {...props} />
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className={cn("border-b border-white/6", className)} {...props} />
  ),
  th: ({
    className,
    ...props
  }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={cn("text-left px-3 py-2 text-white/80 font-medium", className)}
      {...props}
    />
  ),
  td: ({
    className,
    ...props
  }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className={cn("px-3 py-2 text-white/70", className)} {...props} />
  ),
  img: RoundedImage,
  a: CustomLink,
  code: Code,
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="mt-4 overflow-x-auto border border-white/12 bg-[#0B0D0F] p-4"
      {...props}
    />
  ),
  iframe: Iframe,
  Note,
} as const;

interface CustomMDXProps {
  source: string;
  components?: Partial<typeof components>;
  className?: string;
}

export function CustomMDX({
  source,
  components: customComponents,
  className,
}: CustomMDXProps) {
  return (
    <div className={cn("mdx", className)}>
      <MDXRemote
        source={source}
        components={{ ...components, ...(customComponents || {}) }}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </div>
  );
}
