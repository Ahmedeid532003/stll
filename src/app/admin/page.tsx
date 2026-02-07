"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("stella_admin")) {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          sessionStorage.setItem("stella_admin", "1");
          router.push("/admin/dashboard");
        } else {
          setError(data.error || "كلمة المرور غير صحيحة");
        }
      })
      .catch(() => setError("حدث خطأ في الاتصال"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-sutra-blush/40 to-sutra-pearl">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-sutra-blush/50 p-8">
        <h1 className="font-display text-2xl font-semibold text-sutra-charcoal text-center mb-2">
          Stella
        </h1>
        <p className="text-sutra-charcoal/70 text-center text-sm mb-6">لوحة الأدمن</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sutra-charcoal/80 mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-sutra-blush rounded-xl px-4 py-3 bg-sutra-pearl focus:ring-2 focus:ring-sutra-gold/30 focus:border-sutra-gold"
              placeholder="أدخل كلمة المرور"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sutra-charcoal text-sutra-cream rounded-xl font-medium hover:bg-sutra-gold transition-colors disabled:opacity-60"
          >
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>
        <p className="mt-4 text-center">
          <Link href="/" className="text-sutra-gold hover:underline text-sm">
            العودة للموقع
          </Link>
        </p>
      </div>
    </div>
  );
}
