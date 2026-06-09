/** Simple captioned image for diagrams/screenshots stored under /public. */
export function Figure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="not-prose my-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full rounded-xl border border-line"
      />
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-faint">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
