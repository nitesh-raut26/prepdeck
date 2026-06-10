import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import type { ComponentProps } from "react";
import { QA } from "./qa";
import { Mermaid } from "./mermaid";
import { Callout } from "./callout";
import { Figure } from "./figure";
import { CodeBlock, LanguageCoverageChecker } from "./code-block";

const components = {
  QA,
  Mermaid,
  Callout,
  Figure,
  // Replace default <pre> with our language-aware CodeBlock
  pre: (props: ComponentProps<"pre">) => <CodeBlock {...props} />,
  // Keep wide tables from breaking the layout.
  table: (props: ComponentProps<"table">) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-line">
      <table {...props} className="!my-0" />
    </div>
  ),
};

/** Compiles and renders an MDX body string with our plugins + components. */
export function Mdx({ source }: { source: string }) {
  return (
    <article className="prose prose-invert max-w-none">
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: "wrap" }],
              rehypeHighlight,
            ],
          },
        }}
      />
      {/* Shows a notice when the selected language has no examples on this page */}
      <LanguageCoverageChecker />
    </article>
  );
}
