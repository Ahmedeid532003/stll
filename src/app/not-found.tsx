import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-sutra-pearl text-sutra-charcoal" dir="rtl">
      <div className="text-center max-w-md">
        <h1 className="font-display text-4xl md:text-6xl font-semibold mb-4 text-sutra-charcoal">
          الصفحة غير موجودة
        </h1>
        <p className="text-sutra-charcoal/70 mb-8">
          الرابط الذي فتحته غير صحيح أو الصفحة تم نقلها.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl bg-sutra-charcoal text-white font-medium hover:opacity-90 transition"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
