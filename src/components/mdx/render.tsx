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
import { Quiz } from "./quiz";
import { ThinkThrough } from "./think-through";
import { PracticeLadder } from "./practice-ladder";
import { DesignDrills } from "./design-drills";
import { Visualizer } from "@/components/viz/visualizer";
import { CodeBlock, LanguageCoverageChecker } from "./code-block";

const components = {
  QA,
  Mermaid,
  Callout,
  Figure,
  Quiz,
  ThinkThrough,
  PracticeLadder,
  DesignDrills,
  Visualizer,
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
          // next-mdx-remote v6 defaults blockJS + blockDangerousJS to true.
          // Our MDX is trusted static content (local repo files, not user input),
          // so we opt out to allow JSX attribute expressions (arrays, objects).
          blockJS: false,
          blockDangerousJS: false,
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
