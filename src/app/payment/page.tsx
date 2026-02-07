"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";

const PAYMENT_METHODS = [
  {
    id: "card",
    name: "فيزا / ماستركارد",
    desc: "الدفع بالبطاقة الائتمانية",
    icon: "card",
  },
  {
    id: "instapay",
    name: "انستا باي",
    desc: "التحويل الفوري بين البنوك",
    icon: "instapay",
  },
  {
    id: "etisalat_cash",
    name: "اتصالات كاش",
    desc: "المحفظة الإلكترونية",
    icon: "etisalat",
  },
] as const;

function PaymentContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const totalParam = searchParams.get("total");
  const total = totalParam ? Number(totalParam) : 0;
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePay = (method: string) => {
    if (!orderId || total <= 0) {
      setError("بيانات الطلب غير صحيحة.");
      return;
    }
    setLoading(method);
    setError(null);
    fetch("/api/payment/create-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, amount: total, method }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        if (data.error) {
          setError(data.error);
        } else {
          setError("لم يتم إنشاء رابط الدفع. تواصل معنا للدفع عند الاستلام أو عبر واتساب.");
        }
        setLoading(null);
      })
      .catch(() => {
        setError("حدث خطأ. حاول مرة أخرى أو تواصل معنا.");
        setLoading(null);
      });
  };

  if (!orderId || total <= 0) {
    return (
      <>
        <Header />
        <main className="max-w-lg mx-auto px-5 py-16 text-center">
          <p className="text-sutra-charcoal/80 mb-4">لم يتم العثور على طلب للدفع.</p>
          <Link href="/cart" className="text-sutra-gold font-medium hover:underline">
            العودة للسلة
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-lg mx-auto px-5 md:px-8 py-10 md:py-16">
        <div className="sutra-line mb-6" />
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-sutra-charcoal mb-2">
          ادفع الآن
        </h1>
        <p className="text-sutra-charcoal/70 mb-8">
          اختر طريقة الدفع لإتمام طلبك. المبلغ:{" "}
          <span className="font-semibold text-sutra-gold">
            {new Intl.NumberFormat("ar-EG", {
              style: "currency",
              currency: "EGP",
              minimumFractionDigits: 0,
            }).format(total)}
          </span>
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-sutra bg-red-50 text-red-800 text-sm border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handlePay(m.id)}
              disabled={!!loading}
              className="w-full flex items-center gap-4 p-5 rounded-sutra-lg border-2 border-sutra-blush bg-white hover:border-sutra-gold hover:bg-sutra-soft/50 transition-colors disabled:opacity-60 text-right"
            >
              <span className="flex-1">
                <span className="block font-semibold text-sutra-charcoal">{m.name}</span>
                <span className="block text-sm text-sutra-charcoal/60 mt-0.5">{m.desc}</span>
              </span>
              {loading === m.id ? (
                <span className="text-sm text-sutra-charcoal/70">جاري التوجيه...</span>
              ) : (
                <span className="text-sutra-gold font-medium">ادفع</span>
              )}
            </button>
          ))}
        </div>

        <p className="mt-8 text-sm text-sutra-charcoal/60 text-center">
          يمكنك أيضاً الدفع عند الاستلام أو عبر واتساب. رقم الطلب: <strong>{orderId.slice(0, 8)}</strong>
        </p>
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sutra-gold font-medium hover:underline"
          >
            العودة للرئيسية
          </Link>
        </div>
      </main>
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="max-w-lg mx-auto px-5 py-16 text-center">
          <p className="text-sutra-charcoal/70">جاري التحميل...</p>
        </main>
      </>
    }>
      <PaymentContent />
    </Suspense>
  );
}
