import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <div className="text-5xl font-semibold tracking-tight text-ink">404</div>
      <p className="mt-3 text-subtle">
        That page isn’t here. It may have moved or never existed.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
