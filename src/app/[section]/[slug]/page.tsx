import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { getSection } from "@/lib/nav";
import { getAdjacent, getAllDocParams, getDoc } from "@/lib/content";
import { Mdx } from "@/components/mdx/render";
import { DocStatusControl } from "@/components/doc-status-control";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllDocParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; slug: string }>;
}): Promise<Metadata> {
  const { section, slug } = await params;
  const doc = getDoc(section, slug);
  if (!doc) return {};
  return { title: doc.title, description: doc.summary || undefined };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ section: string; slug: string }>;
}) {
  const { section, slug } = await params;
  const doc = getDoc(section, slug);
  if (!doc) notFound();

  const meta = getSection(section);
  const { prev, next } = getAdjacent(section, slug);

  return (
    <div>
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-faint">
        <Link href="/" className="hover:text-subtle">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/${section}`} className="hover:text-subtle">
          {meta?.label ?? section}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="truncate text-subtle">{doc.title}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          {doc.title}
        </h1>
        <DocStatusControl href={doc.href} />
      </div>

      {doc.summary && (
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-subtle">
          {doc.summary}
        </p>
      )}

      {doc.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {doc.tags.map((t) => (
            <span
              key={t}
              className="rounded-md bg-surface-3 px-1.5 py-0.5 text-[11px] text-faint"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <hr className="my-7 border-line" />

      <Mdx source={doc.body} />

      {/* Prev / next */}
      <nav className="mt-12 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
        {prev ? (
          <Link
            href={prev.href}
            className="group flex flex-col gap-1 rounded-xl border border-line bg-surface-1 p-4 transition-colors hover:border-line-strong hover:bg-surface-2"
          >
            <span className="flex items-center gap-1 text-xs text-faint">
              <ArrowLeft className="size-3.5" /> Previous
            </span>
            <span className="font-medium text-ink">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={next.href}
            className="group flex flex-col items-end gap-1 rounded-xl border border-line bg-surface-1 p-4 text-right transition-colors hover:border-line-strong hover:bg-surface-2"
          >
            <span className="flex items-center gap-1 text-xs text-faint">
              Next <ArrowRight className="size-3.5" />
            </span>
            <span className="font-medium text-ink">{next.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
