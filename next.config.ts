import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Content is compiled at build time via next-mdx-remote (see src/components/mdx),
  // so no MDX webpack/Turbopack loader config is required here.
  pageExtensions: ["ts", "tsx"],
};

export default nextConfig;
