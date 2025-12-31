import type { NextRequest } from "next/server";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { getPageImage, source } from "@/lib/source";

export const revalidate = false;
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://docs.plop.email";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  const logo = await fetch(new URL("/icon.png", baseUrl)).then((res) =>
    res.blob(),
  );

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0b0b0c",
        padding: "64px",
        fontFamily: "Inter, system-ui, sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top left, rgba(59, 130, 246, 0.25), transparent 60%), radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.2), transparent 60%)",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* biome-ignore lint/performance/noImgElement: ImageResponse doesn't support next/image. */}
          <img src={logo} width={48} height={48} alt="Plop" />
        </div>
        <span style={{ color: "#e4e4e7", fontSize: "22px", fontWeight: 500 }}>
          Plop Docs
        </span>
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          marginTop: "auto",
          marginBottom: "72px",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontSize: page.data.title.length > 40 ? "48px" : "56px",
            fontWeight: 700,
            color: "#fafafa",
            lineHeight: 1.1,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          {page.data.title}
        </h1>
        {page.data.description && (
          <p
            style={{
              fontSize: "24px",
              color: "#d4d4d8",
              margin: 0,
              lineHeight: 1.4,
              maxWidth: "880px",
            }}
          >
            {page.data.description.length > 140
              ? `${page.data.description.slice(0, 140)}...`
              : page.data.description}
          </p>
        )}
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #27272a",
          paddingTop: "24px",
          color: "#a1a1aa",
          fontSize: "18px",
          zIndex: 1,
        }}
      >
        <span>Plop Docs</span>
        <span>Platform Documentation</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageImage(page).segments,
  }));
}
