import Link from "next/link";

export default function AuthHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"
        aria-label="Authentication navigation"
      >
        <Link href="/" className="text-lg font-bold tracking-tight text-brand-600">
          Intelligent PHR
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="flex items-center gap-1 text-gray-600 hover:text-brand-600">
            <span aria-hidden="true">&larr;</span> Back to home
          </Link>
          <Link href="/dashboard" className="font-semibold text-brand-600 hover:underline">
            Dashboard
          </Link>
        </div>
      </nav>
    </header>
  );
}
