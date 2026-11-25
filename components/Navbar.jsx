"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/records", label: "Records" },
  { href: "/dashboard/upload", label: "Upload" },
  { href: "/dashboard/query", label: "Ask AI" },
];

export default function Navbar({ fullName }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out failed:", error.message);
      return;
    }
    router.refresh();
    router.push("/");
  }

  return (
    <nav className="bg-brand-600 text-white">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <span className="font-bold">Intelligent PHR</span>
          <div className="hidden sm:flex gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm ${
                  pathname === link.href ? "font-semibold underline" : "text-brand-50 hover:underline"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden sm:inline text-brand-50">Hi, {fullName}</span>
          <button onClick={handleSignOut} className="btn-secondary py-1! px-3!">
            Sign out
          </button>
        </div>
      </div>
      {/* mobile links */}
      <div className="sm:hidden flex gap-4 px-4 pb-2 text-sm">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="text-brand-50">
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
