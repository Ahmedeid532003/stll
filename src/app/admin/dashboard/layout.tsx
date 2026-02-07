"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const ok = sessionStorage.getItem("stella_admin");
    if (!ok) router.replace("/admin");
  }, [mounted, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sutra-pearl">
        <p className="text-sutra-charcoal/70">جاري التحميل...</p>
      </div>
    );
  }

  const nav = [
    { href: "/admin/dashboard", label: "الرئيسية" },
    { href: "/admin/dashboard/sections", label: "الأقسام" },
    { href: "/admin/dashboard/products", label: "المنتجات" },
    { href: "/admin/dashboard/stock", label: "المخزون" },
    { href: "/admin/dashboard/orders", label: "الطلبات" },
  ];

  return (
    <div className="min-h-screen bg-sutra-pearl">
      <header className="bg-white border-b border-sutra-blush/50 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <Link href="/admin/dashboard" className="font-display text-xl font-semibold text-sutra-charcoal">
            Stella — الأدمن
          </Link>
          <nav className="flex gap-4">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium ${pathname === href ? "text-sutra-gold" : "text-sutra-charcoal/70 hover:text-sutra-charcoal"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem("stella_admin");
              router.push("/admin");
            }}
            className="text-sm text-sutra-charcoal/70 hover:text-sutra-gold"
          >
            خروج
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
