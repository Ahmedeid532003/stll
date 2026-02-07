"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import type { Product, ProductVariant } from "@/lib/types";

interface ProductWithQty extends Product {
  quantity?: number;
}

interface ProductPageClientProps {
  id: string;
}

export default function ProductPageClient({ id }: ProductPageClientProps) {
  const { addToCart } = useCart();
  const [product, setProduct] = useState<ProductWithQty | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderQty, setOrderQty] = useState(1);
  /** لكل قطعة: مقاس ولون (قطعة 1، 2، 3...) */
  const [itemOptions, setItemOptions] = useState<{ size: string; color: string }[]>([{ size: "", color: "" }]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<"delivery" | "payment" | "pending">("delivery");
  const [paymentMethod, setPaymentMethod] = useState<"instapay" | "etisalat_cash" | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofSubmitting, setProofSubmitting] = useState(false);
  const proofInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) {
      setProduct(null);
      setLoading(false);
      return;
    }
    fetch(`/api/products/${id}`)
      .then(async (res) => {
        let data: { error?: string; sizes?: string[]; colors?: string[] } & ProductWithQty;
        try {
          data = await res.json();
        } catch {
          setProduct(null);
          return;
        }
        if (!res.ok || data.error) {
          setProduct(null);
          return;
        }
        setProduct(data);
        const defSize = data.sizes?.[0] ?? "";
        const defColor = data.colors?.[0] ?? "";
        setItemOptions([{ size: defSize, color: defColor }]);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmitting(true);
    setMessage(null);
    const items = itemOptions.map((opt) => ({
      productId: product.id,
      productName: product.nameAr || product.name,
      quantity: 1,
      price: product.price,
      size: opt.size || undefined,
      color: opt.color || undefined,
    }));
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email || undefined,
        address: formData.address,
        notes: formData.notes || undefined,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMessage({ type: "err", text: data.error });
        } else {
          setCreatedOrderId(data.id);
          setPaymentStep("payment");
          setPaymentMethod(null);
          setProofFile(null);
        }
      })
      .catch(() => setMessage({ type: "err", text: "حدث خطأ. حاول مرة أخرى." }))
      .finally(() => setSubmitting(false));
  };

  const handleConfirmPayment = () => {
    if (!createdOrderId || !paymentMethod || !proofFile) return;
    setProofSubmitting(true);
    const formDataProof = new FormData();
    formDataProof.append("image", proofFile);
    fetch("/api/upload-payment-proof", { method: "POST", body: formDataProof })
      .then((res) => res.json())
      .then((data) => {
        if (data.error || !data.url) {
          setMessage({ type: "err", text: data.error || "فشل رفع الصورة." });
          setProofSubmitting(false);
          return;
        }
        return fetch(`/api/orders/${createdOrderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentMethod, paymentProofUrl: data.url }),
        });
      })
      .then((res) => (res && res.ok ? res.json() : null))
      .then(() => {
        setPaymentStep("pending");
        setProofSubmitting(false);
      })
      .catch(() => {
        setMessage({ type: "err", text: "حدث خطأ. حاول مرة أخرى." });
        setProofSubmitting(false);
      });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="aspect-[3/4] bg-sutra-soft/60 rounded-sutra-lg animate-pulse" />
            <div className="space-y-6">
              <div className="h-6 w-24 bg-sutra-soft/60 rounded animate-pulse" />
              <div className="h-10 w-3/4 bg-sutra-soft/60 rounded animate-pulse" />
              <div className="h-4 w-full bg-sutra-soft/40 rounded animate-pulse" />
              <div className="h-4 w-full bg-sutra-soft/40 rounded animate-pulse" />
              <div className="h-8 w-32 bg-sutra-soft/60 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="max-w-xl mx-auto px-5 py-24 text-center">
          <p className="font-display text-2xl text-sutra-charcoal/80 mb-4">المنتج غير موجود.</p>
          <Link href="/" className="inline-block px-6 py-3 bg-sutra-charcoal text-sutra-cream rounded-sutra font-medium hover:bg-sutra-gold transition-colors btn-primary">
            العودة للرئيسية
          </Link>
        </div>
      </>
    );
  }

  const title = product.nameAr || product.name;
  const desc = product.descriptionAr || product.description;
  const priceFormatted = new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(Number(product.price));
  const originalPriceFormatted = product.originalPrice != null
    ? new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0 }).format(Number(product.originalPrice))
    : null;
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const getVariantQty = (size: string, color: string): number => {
    if (!hasVariants) return 0;
    const v = product.variants!.find((x: ProductVariant) => x.size === size && x.color === color);
    return v ? v.quantity : 0;
  };
  const inStock = hasVariants
    ? (product.variants!.some((v: ProductVariant) => v.quantity > 0))
    : ((product.quantity ?? 0) > 0);
  const maxQtyNoVariants = product.quantity ?? 0;
  const canOrder = inStock && (
    !hasVariants
      ? orderQty <= maxQtyNoVariants
      : itemOptions.every((opt) => getVariantQty(opt.size, opt.color) >= 1)
  );
  const mainImage = product.images?.[0];

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-5 md:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
          <div className="aspect-[3/4] relative rounded-sutra-lg overflow-hidden bg-sutra-soft shadow-sutra-lg">
            {mainImage && (mainImage.startsWith("http") || mainImage.startsWith("/") || mainImage.startsWith("data:")) ? (
              <Image
                src={mainImage}
                alt={title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sutra-rose/40 font-display text-5xl">
                SUTRA
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sutra-rose uppercase tracking-[0.2em] text-xs font-medium mb-3">
              {product.categoryAr || product.category}
            </p>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-sutra-charcoal mb-4 leading-tight">
              {title}
            </h1>
            <p className="text-sutra-charcoal/75 mb-6 whitespace-pre-line leading-relaxed">{desc}</p>
            <div className="flex items-center gap-3 flex-wrap mb-8">
              {originalPriceFormatted && (
                <span className="text-xl text-sutra-charcoal/60 line-through">{originalPriceFormatted}</span>
              )}
              <span className="text-2xl text-sutra-gold font-semibold">{priceFormatted}</span>
            </div>

            {!inStock && (
              <p className="text-red-600/90 mb-4 text-sm font-medium">غير متوفر حالياً</p>
            )}

            <div className="flex items-center gap-4 mb-6">
              <label className="text-sm font-medium text-sutra-charcoal/80">الكمية</label>
              <input
                type="number"
                min={1}
                max={hasVariants ? undefined : Math.max(1, product.quantity ?? 1)}
                value={orderQty}
                onChange={(e) => {
                  const n = Math.max(1, Number(e.target.value) || 1);
                  setOrderQty(n);
                  setItemOptions((prev) => {
                    const next = prev.slice(0, n);
                    const defSize = product.sizes?.[0] ?? "";
                    const defColor = product.colors?.[0] ?? "";
                    while (next.length < n) next.push({ size: defSize, color: defColor });
                    return next;
                  });
                }}
                className="input-sutra w-20 border border-sutra-blush rounded-sutra px-3 py-2.5 text-center bg-white"
              />
            </div>

            {(Array.isArray(product.sizes) && product.sizes.length > 0) || (Array.isArray(product.colors) && product.colors.length > 0) ? (
              <div className="space-y-6 mb-8">
                <p className="text-sm font-medium text-sutra-charcoal/80">اختر مقاس ولون لكل قطعة</p>
                {Array.from({ length: orderQty }, (_, i) => (
                  <div key={i} className="p-4 rounded-sutra border border-sutra-blush bg-sutra-soft/50">
                    <p className="text-sm font-medium text-sutra-charcoal mb-3">قطعة {i + 1}</p>
                    {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs text-sutra-charcoal/70 mb-1 block">المقاس</span>
                        <div className="flex flex-wrap gap-2">
                          {product.sizes.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setItemOptions((prev) => {
                                const u = [...prev];
                                if (!u[i]) u[i] = { size: "", color: prev[i]?.color ?? "" };
                                u[i] = { ...u[i], size: s };
                                return u;
                              })}
                              className={`min-w-[3rem] px-4 py-2 rounded-sutra border text-sm font-medium transition-all ${
                                itemOptions[i]?.size === s
                                  ? "border-sutra-gold bg-sutra-gold/10 text-sutra-gold"
                                  : "border-sutra-blush bg-white text-sutra-charcoal hover:border-sutra-rose"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {Array.isArray(product.colors) && product.colors.length > 0 && (
                      <div>
                        <span className="text-xs text-sutra-charcoal/70 mb-1 block">اللون</span>
                        <div className="flex flex-wrap gap-2">
                          {product.colors.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setItemOptions((prev) => {
                                const u = [...prev];
                                if (!u[i]) u[i] = { size: prev[i]?.size ?? "", color: "" };
                                u[i] = { ...u[i], color: c };
                                return u;
                              })}
                              className={`min-w-[4rem] px-4 py-2 rounded-sutra border text-sm font-medium transition-all ${
                                itemOptions[i]?.color === c
                                  ? "border-sutra-gold bg-sutra-gold/10 text-sutra-gold"
                                  : "border-sutra-blush bg-white text-sutra-charcoal hover:border-sutra-rose"
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {hasVariants && itemOptions[i] && (
                      <p className={`text-sm mt-2 ${getVariantQty(itemOptions[i].size, itemOptions[i].color) > 0 ? "text-green-700" : "text-red-600"}`}>
                        {getVariantQty(itemOptions[i].size, itemOptions[i].color) > 0
                          ? `متوفر (${getVariantQty(itemOptions[i].size, itemOptions[i].color)})`
                          : "غير متوفر"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              {canOrder && (
                <button
                  type="button"
                  onClick={() => {
                    const cartItems = itemOptions.map((opt) => ({
                      productId: product.id,
                      productName: product.nameAr || product.name,
                      price: product.price,
                      quantity: 1,
                      size: opt.size || undefined,
                      color: opt.color || undefined,
                      image: product.images?.[0],
                    }));
                    addToCart(cartItems);
                    setMessage({ type: "ok", text: "تمت إضافة المنتج إلى السلة." });
                  }}
                  className="btn-secondary px-8 py-4 border border-sutra-blush rounded-sutra font-medium text-base hover:bg-sutra-soft"
                >
                  أضف إلى السلة
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowOrderForm(true)}
                disabled={!canOrder}
                className="btn-primary w-full md:w-auto px-10 py-4 bg-sutra-charcoal text-sutra-cream rounded-sutra font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canOrder ? "اطلب الآن" : (hasVariants ? "اختر مقاس ولون متوفر لكل قطعة" : "غير متوفر")}
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`mt-8 p-5 rounded-sutra-lg text-sm font-medium ${message.type === "ok" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}
          >
            {message.text}
          </div>
        )}

        {showOrderForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-sutra-charcoal/50 backdrop-blur-md">
            <div className="bg-white rounded-sutra-lg shadow-sutra-lg max-w-md w-full p-8 md:p-10 max-h-[90vh] overflow-y-auto border border-sutra-blush/50">
              <div className="sutra-line mb-5" />

              {paymentStep === "delivery" && (
                <>
                  <h3 className="font-display text-2xl font-semibold text-sutra-charcoal mb-6">
                    بيانات التوصيل
                  </h3>
                  <form onSubmit={handleOrder} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-sutra-charcoal/80 mb-2">الاسم *</label>
                      <input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                        className="input-sutra w-full border border-sutra-blush rounded-sutra px-4 py-3 bg-sutra-pearl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sutra-charcoal/80 mb-2">رقم الموبايل *</label>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData((d) => ({ ...d, phone: e.target.value }))}
                        className="input-sutra w-full border border-sutra-blush rounded-sutra px-4 py-3 bg-sutra-pearl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sutra-charcoal/80 mb-2">البريد (اختياري)</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))}
                        className="input-sutra w-full border border-sutra-blush rounded-sutra px-4 py-3 bg-sutra-pearl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sutra-charcoal/80 mb-2">العنوان *</label>
                      <textarea
                        required
                        rows={2}
                        value={formData.address}
                        onChange={(e) => setFormData((d) => ({ ...d, address: e.target.value }))}
                        className="input-sutra w-full border border-sutra-blush rounded-sutra px-4 py-3 bg-sutra-pearl resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sutra-charcoal/80 mb-2">ملاحظات (اختياري)</label>
                      <textarea
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData((d) => ({ ...d, notes: e.target.value }))}
                        className="input-sutra w-full border border-sutra-blush rounded-sutra px-4 py-3 bg-sutra-pearl resize-none"
                      />
                    </div>
                    <div className="flex gap-4 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowOrderForm(false)}
                        className="btn-secondary flex-1 py-3.5 rounded-sutra text-sutra-charcoal font-medium"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary flex-1 py-3.5 bg-sutra-charcoal text-sutra-cream rounded-sutra font-medium disabled:opacity-60 disabled:transform-none"
                      >
                        {submitting ? "جاري الإرسال..." : "تأكيد الطلب"}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {paymentStep === "payment" && (
                <>
                  <h3 className="font-display text-2xl font-semibold text-sutra-charcoal mb-4">
                    الدفع
                  </h3>
                  <p className="text-sm text-sutra-charcoal/70 mb-4">اختر انستا باي أو اتصالات كاش ثم ارفع إثبات الدفع.</p>
                  <div className="space-y-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("instapay")}
                      className={`w-full p-4 rounded-sutra border-2 text-right ${paymentMethod === "instapay" ? "border-sutra-gold bg-sutra-gold/10" : "border-sutra-blush bg-white"}`}
                    >
                      <span className="font-semibold text-sutra-charcoal">انستا باي</span>
                      <p className="text-lg font-mono text-sutra-gold mt-1">01145285394</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("etisalat_cash")}
                      className={`w-full p-4 rounded-sutra border-2 text-right ${paymentMethod === "etisalat_cash" ? "border-sutra-gold bg-sutra-gold/10" : "border-sutra-blush bg-white"}`}
                    >
                      <span className="font-semibold text-sutra-charcoal">اتصالات كاش</span>
                      <p className="text-lg font-mono text-sutra-gold mt-1">01145285394</p>
                    </button>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-sutra-charcoal/80 mb-2">رفع إثبات الدفع (سكرين شوت)</label>
                    <input
                      ref={proofInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                    />
                    <button
                      type="button"
                      onClick={() => proofInputRef.current?.click()}
                      className="w-full py-3 border-2 border-dashed border-sutra-blush rounded-sutra text-sutra-charcoal/70 hover:border-sutra-gold hover:bg-sutra-soft/50"
                    >
                      {proofFile ? proofFile.name : "اختر صورة"}
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setPaymentStep("delivery"); setCreatedOrderId(null); }}
                      className="btn-secondary flex-1 py-3 rounded-sutra"
                    >
                      رجوع
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmPayment}
                      disabled={!paymentMethod || !proofFile || proofSubmitting}
                      className="btn-primary flex-1 py-3 bg-sutra-charcoal text-sutra-cream rounded-sutra font-medium disabled:opacity-50"
                    >
                      {proofSubmitting ? "جاري الرفع..." : "تأكيد"}
                    </button>
                  </div>
                </>
              )}

              {paymentStep === "pending" && (
                <>
                  <h3 className="font-display text-2xl font-semibold text-sutra-charcoal mb-4">
                    جاري تأكيد الدفع
                  </h3>
                  <p className="text-sutra-charcoal/70 mb-6">
                    تم إرسال إثبات الدفع. سنتحقق منه ونخبرك عند التأكيد. يمكنك متابعة الحالة من صفحة طلباتي.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOrderForm(false);
                      setPaymentStep("delivery");
                      setCreatedOrderId(null);
                      setFormData({ name: "", phone: "", email: "", address: "", notes: "" });
                      setMessage({ type: "ok", text: "تم إرسال الطلب وإثبات الدفع. تابع الحالة من طلباتي." });
                    }}
                    className="btn-primary w-full py-3.5 bg-sutra-charcoal text-sutra-cream rounded-sutra font-medium"
                  >
                    حسناً
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
