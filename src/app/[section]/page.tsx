import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";
import { getSection, isSectionId } from "@/lib/nav";
import { getNav, getSectionDocs } from "@/lib/content";

export function generateStaticParams() {
  return getNav().map((s) => ({ section: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const meta = getSection(section);
  return { title: meta?.title ?? "Section" };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!isSectionId(section)) notFound();
  const meta = getSection(section);
  const docs = getSectionDocs(section);
  if (!meta || docs.length === 0) notFound();

  return (
    <div>
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-faint">
        <Link href="/" className="hover:text-subtle">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-subtle">{meta.label}</span>
      </nav>

      <h1 className="text-3xl font-semibold tracking-tight text-ink">
        {meta.title}
      </h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-subtle">
        {meta.blurb}
      </p>

      <ul className="mt-8 space-y-3">
        {docs.map((doc) => (
          <li key={doc.href}>
            <Link
              href={doc.href}
              className="group flex items-start gap-4 rounded-xl border border-line bg-surface-1 p-4 transition-colors hover:border-line-strong hover:bg-surface-2"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink">{doc.title}</span>
                  {doc.difficulty && (
                    <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-faint">
                      {doc.difficulty}
                    </span>
                  )}
                </div>
                {doc.summary && (
                  <p className="mt-1 text-sm leading-relaxed text-subtle">
                    {doc.summary}
                  </p>
                )}
                {doc.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
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
              </div>
              <ArrowRight className="mt-1 size-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-subtle" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
