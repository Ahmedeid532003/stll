"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product, Section } from "@/lib/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    nameAr: "",
    descriptionAr: "",
    price: "",
    originalPrice: "",
    categoryAr: "",
    sectionId: "" as string,
    images: "" as string,
    sizes: "" as string,
    colors: "" as string,
    colorInput: "" as string,
    variantQtys: {} as Record<string, string>,
  });
  const [form, setForm] = useState({
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    price: "",
    originalPrice: "",
    category: "فستان",
    categoryAr: "فستان",
    sectionId: "" as string,
    images: "" as string,
    sizes: "" as string,
    colors: "" as string,
    colorInput: "" as string,
    variantQtys: {} as Record<string, string>,
    initialStock: "0",
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingImages(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append("image", files[i]);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "فشل الرفع" });
        return;
      }
      const newUrls = data.url ? [data.url] : data.urls || [];
      const line = newUrls.join("\n");
      if (isEdit) {
        setEditForm((f) => ({ ...f, images: f.images ? f.images + "\n" + line : line }));
        if (editFileInputRef.current) editFileInputRef.current.value = "";
      } else {
        setForm((f) => ({ ...f, images: f.images ? f.images + "\n" + line : line }));
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch {
      setMessage({ type: "err", text: "فشل رفع الصور" });
    } finally {
      setUploadingImages(false);
    }
  };

  const load = () => {
    Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/sections").then((r) => r.json()),
    ])
      .then(([productsData, sectionsData]) => {
        setProducts(Array.isArray(productsData) ? productsData : []);
        setSections(Array.isArray(sectionsData) ? sectionsData : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const buildVariants = (sizes: string[], colors: string[], variantQtys: Record<string, string>) => {
    return sizes.flatMap((size) =>
      colors.map((color) => ({
        size,
        color,
        quantity: Math.max(0, Number(variantQtys[`${size}|${color}`]) || 0),
      }))
    ).filter((v) => v.quantity > 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const images = form.images
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const sizes = form.sizes.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    const colors = form.colors.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    const variants = buildVariants(sizes, colors, form.variantQtys);
    fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        nameAr: form.nameAr || undefined,
        description: form.description || form.descriptionAr || "",
        descriptionAr: form.descriptionAr || undefined,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        category: form.category || "عام",
        categoryAr: form.categoryAr || form.category || undefined,
        sectionId: form.sectionId || undefined,
        images,
        sizes: sizes.length ? sizes : undefined,
        colors: colors.length ? colors : undefined,
        variants: variants.length ? variants : undefined,
        initialStock: variants.length ? 0 : Number(form.initialStock) || 0,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setMessage({ type: "err", text: data.error });
        } else {
          setMessage({ type: "ok", text: "تمت إضافة المنتج بنجاح." });
          setShowForm(false);
          setForm({
            name: "",
            nameAr: "",
            description: "",
            descriptionAr: "",
            price: "",
            originalPrice: "",
            category: "فستان",
            categoryAr: "فستان",
            sectionId: "",
            images: "",
            sizes: "",
            colors: "",
            colorInput: "",
            variantQtys: {},
            initialStock: "0",
          });
          load();
        }
      })
      .catch(() => setMessage({ type: "err", text: "حدث خطأ." }))
      .finally(() => setSaving(false));
  };

  const handleShowAgain = (id: string) => {
    fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    })
      .then((r) => r.json())
      .then(() => {
        setMessage({ type: "ok", text: "تم إظهار المنتج مرة أخرى." });
        load();
      })
      .catch(() => setMessage({ type: "err", text: "حدث خطأ." }));
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`إخفاء المنتج "${name}" من العرض؟`)) return;
    fetch(`/api/admin/products/${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then(() => {
        setMessage({ type: "ok", text: "تم إخفاء المنتج." });
        load();
      });
  };

  const handlePermanentDelete = (id: string, name: string) => {
    if (!confirm(`حذف المنتج "${name}" نهائياً؟ لا يمكن التراجع.`)) return;
    fetch(`/api/admin/products/${id}/permanent-delete`, { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setMessage({ type: "err", text: data.error });
        } else {
          setMessage({ type: "ok", text: "تم حذف المنتج نهائياً." });
          setEditingProduct((p) => (p?.id === id ? null : p));
          load();
        }
      })
      .catch(() => setMessage({ type: "err", text: "حدث خطأ أثناء الحذف." }));
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    const variantQtys: Record<string, string> = {};
    (p.variants || []).forEach((v) => {
      variantQtys[`${v.size}|${v.color}`] = String(v.quantity);
    });
    setEditForm({
      name: p.name,
      nameAr: p.nameAr || "",
      descriptionAr: p.descriptionAr || "",
      price: String(p.price),
      originalPrice: p.originalPrice != null ? String(p.originalPrice) : "",
      categoryAr: p.categoryAr || p.category || "",
      sectionId: p.sectionId || "",
      images: (p.images || []).join("\n"),
      sizes: (p.sizes || []).join(", "),
      colors: (p.colors || []).join(", "),
      colorInput: "",
      variantQtys,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);
    setMessage(null);
    const images = editForm.images
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const sizes = editForm.sizes.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    const colors = editForm.colors.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    const variants = buildVariants(sizes, colors, editForm.variantQtys);
    fetch(`/api/admin/products/${editingProduct.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        nameAr: editForm.nameAr || undefined,
        description: editForm.descriptionAr || editingProduct.description,
        descriptionAr: editForm.descriptionAr || undefined,
        price: Number(editForm.price),
        originalPrice: editForm.originalPrice ? Number(editForm.originalPrice) : undefined,
        categoryAr: editForm.categoryAr || undefined,
        sectionId: editForm.sectionId || undefined,
        images,
        sizes: sizes.length ? sizes : undefined,
        colors: colors.length ? colors : undefined,
        variants: variants.length ? variants : undefined,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setMessage({ type: "err", text: data.error });
        } else {
          setMessage({ type: "ok", text: "تم تحديث المنتج." });
          setEditingProduct(null);
          load();
        }
      })
      .catch(() => setMessage({ type: "err", text: "حدث خطأ." }))
      .finally(() => setSaving(false));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-sutra-charcoal">
          المنتجات
        </h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-sutra-gold text-white rounded-xl font-medium hover:bg-sutra-charcoal transition-colors"
        >
          {showForm ? "إلغاء" : "إضافة منتج"}
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-xl text-sm ${message.type === "ok" ? "bg-green-100 text-green-800" : "bg-red-50 text-red-800"}`}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 bg-white rounded-2xl border border-sutra-blush/50 space-y-4"
        >
          <h2 className="font-display text-lg font-semibold text-sutra-charcoal mb-4">
            منتج جديد
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">الاسم (إنجليزي) *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">الاسم (عربي)</label>
              <input
                value={form.nameAr}
                onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
                className="w-full border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">الوصف (عربي أو إنجليزي) *</label>
            <textarea
              rows={2}
              value={form.descriptionAr}
              onChange={(e) => setForm((f) => ({ ...f, descriptionAr: e.target.value }))}
              placeholder="وصف المنتج"
              className="w-full border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">السعر بعد الخصم (ج.م)</label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="اختياري"
                className="w-full border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">السعر قبل الخصم (ج.م) — يظهر عليه خط</label>
              <input
                type="number"
                min={0}
                value={form.originalPrice}
                onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
                placeholder="اختياري"
                className="w-full border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">الكمية الأولية (مخزون)</label>
              <input
                type="number"
                min={0}
                value={form.initialStock}
                onChange={(e) => setForm((f) => ({ ...f, initialStock: e.target.value }))}
                className="w-full border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">التصنيف (عربي)</label>
            <input
              value={form.categoryAr}
              onChange={(e) => setForm((f) => ({ ...f, categoryAr: e.target.value }))}
              placeholder="فستان، بلوزة، إلخ"
              className="w-full border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">القسم (اختياري)</label>
            <select
              value={form.sectionId}
              onChange={(e) => setForm((f) => ({ ...f, sectionId: e.target.value }))}
              className="w-full border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl"
            >
              <option value="">— بدون قسم —</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.nameAr || s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">الصور: روابط أو رفع من الجهاز</label>
            <textarea
              rows={3}
              value={form.images}
              onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
              placeholder="https://example.com/image1.jpg أو ارفع صوراً من التلفون/اللاب"
              className="w-full border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl font-mono text-sm mb-2"
            />
            <div className="flex items-center gap-2 flex-wrap">
              <label className="cursor-pointer px-3 py-2 rounded-lg border border-sutra-blush bg-sutra-soft hover:bg-sutra-blush/20 text-sutra-charcoal text-sm font-medium">
                رفع صور من الجهاز
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => handleUploadImages(e, false)}
                  disabled={uploadingImages}
                />
              </label>
              {uploadingImages && <span className="text-sm text-sutra-charcoal/70">جاري الرفع...</span>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">المقاسات (اختياري، مفصولة بفاصلة)</label>
              <input
                value={form.sizes}
                onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
                placeholder="S, M, L, XL"
                className="w-full border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">الألوان (مقسّمة مثل المقاسات)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.colors.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean).map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-sutra-blush bg-sutra-soft text-sm"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({
                        ...f,
                        colors: f.colors.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean).filter((x) => x !== c).join(", "),
                      }))}
                      className="text-sutra-charcoal/60 hover:text-red-600"
                      aria-label="حذف اللون"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.colorInput ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, colorInput: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const v = (form.colorInput ?? "").trim();
                      if (v) setForm((f) => ({ ...f, colors: (f.colors ? f.colors + ", " : "") + v, colorInput: "" }));
                    }
                  }}
                  placeholder="أضف لون ثم Enter أو اضغط إضافة"
                  className="flex-1 border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl"
                />
                <button
                  type="button"
                  onClick={() => {
                    const v = (form.colorInput ?? "").trim();
                    if (v) setForm((f) => ({ ...f, colors: (f.colors ? f.colors + ", " : "") + v, colorInput: "" }));
                  }}
                  className="px-3 py-2 border border-sutra-blush rounded-lg bg-sutra-soft hover:bg-sutra-blush/30 text-sm font-medium"
                >
                  إضافة
                </button>
              </div>
            </div>
          </div>
          {(() => {
            const sizeList = form.sizes.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
            const colorList = form.colors.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
            if (sizeList.length && colorList.length) {
              return (
                <div className="border border-sutra-blush rounded-lg p-4 bg-sutra-soft/30">
                  <p className="text-sm font-medium text-sutra-charcoal/80 mb-3">كمية لكل مقاس ولون (يُظهر للعميل متوفر أم لا)</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr>
                          <th className="text-right p-2 border border-sutra-blush/50 bg-white">مقاس / لون</th>
                          {colorList.map((c) => (
                            <th key={c} className="text-right p-2 border border-sutra-blush/50 bg-white">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sizeList.map((s) => (
                          <tr key={s}>
                            <td className="p-2 border border-sutra-blush/50 bg-white font-medium">{s}</td>
                            {colorList.map((c) => (
                              <td key={c} className="p-1 border border-sutra-blush/50">
                                <input
                                  type="number"
                                  min={0}
                                  value={form.variantQtys[`${s}|${c}`] ?? ""}
                                  onChange={(e) => setForm((f) => ({
                                    ...f,
                                    variantQtys: { ...f.variantQtys, [`${s}|${c}`]: e.target.value },
                                  }))}
                                  placeholder="0"
                                  className="w-14 text-center border border-sutra-blush rounded px-1 py-1.5 bg-white"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-sutra-charcoal/60 mt-2">إذا تركت الكميات 0، يُستخدم حقل «الكمية الأولية» للمخزون الموحد.</p>
                </div>
              );
            }
            return null;
          })()}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-sutra-blush rounded-xl text-sutra-charcoal hover:bg-sutra-soft"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-sutra-charcoal text-white rounded-xl font-medium hover:bg-sutra-gold disabled:opacity-60"
            >
              {saving ? "جاري الحفظ..." : "إضافة المنتج"}
            </button>
          </div>
        </form>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sutra-charcoal/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-sutra-blush/50 shadow-xl max-w-lg w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-xl font-semibold text-sutra-charcoal mb-4">تعديل المنتج</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">الاسم (إنجليزي) *</label>
                <input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">الاسم (عربي)</label>
                <input
                  value={editForm.nameAr}
                  onChange={(e) => setEditForm((f) => ({ ...f, nameAr: e.target.value }))}
                  className="w-full border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">الوصف (عربي)</label>
                <textarea
                  rows={2}
                  value={editForm.descriptionAr}
                  onChange={(e) => setEditForm((f) => ({ ...f, descriptionAr: e.target.value }))}
                  className="w-full border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">السعر بعد الخصم (ج.م) *</label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={editForm.price}
                    onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">السعر قبل الخصم (ج.م) — يظهر عليه خط</label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.originalPrice}
                    onChange={(e) => setEditForm((f) => ({ ...f, originalPrice: e.target.value }))}
                    placeholder="اختياري"
                    className="w-full border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">التصنيف (عربي)</label>
                <input
                  value={editForm.categoryAr}
                  onChange={(e) => setEditForm((f) => ({ ...f, categoryAr: e.target.value }))}
                  className="w-full border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">القسم (اختياري)</label>
                <select
                  value={editForm.sectionId}
                  onChange={(e) => setEditForm((f) => ({ ...f, sectionId: e.target.value }))}
                  className="w-full border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl"
                >
                  <option value="">— بدون قسم —</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>{s.nameAr || s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">الصور: روابط أو رفع من الجهاز</label>
                <textarea
                  rows={2}
                  value={editForm.images}
                  onChange={(e) => setEditForm((f) => ({ ...f, images: e.target.value }))}
                  className="w-full border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl font-mono text-sm mb-2"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="cursor-pointer px-3 py-2 rounded-lg border border-sutra-blush bg-sutra-soft hover:bg-sutra-blush/20 text-sutra-charcoal text-sm font-medium">
                    رفع صور من الجهاز
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(e) => handleUploadImages(e, true)}
                      disabled={uploadingImages}
                    />
                  </label>
                  {uploadingImages && <span className="text-sm text-sutra-charcoal/70">جاري الرفع...</span>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">المقاسات</label>
                  <input
                    value={editForm.sizes}
                    onChange={(e) => setEditForm((f) => ({ ...f, sizes: e.target.value }))}
                    placeholder="S, M, L"
                    className="w-full border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sutra-charcoal/80 mb-1">الألوان (مقسّمة)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(editForm.colors.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)).map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-sutra-blush bg-sutra-soft text-sm"
                      >
                        {c}
                        <button
                          type="button"
                          onClick={() => setEditForm((f) => ({
                            ...f,
                            colors: f.colors.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean).filter((x) => x !== c).join(", "),
                          }))}
                          className="text-sutra-charcoal/60 hover:text-red-600"
                          aria-label="حذف اللون"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editForm.colorInput ?? ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, colorInput: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          const v = (editForm.colorInput ?? "").trim();
                          if (v) setEditForm((f) => ({ ...f, colors: (f.colors ? f.colors + ", " : "") + v, colorInput: "" }));
                        }
                      }}
                      placeholder="أضف لون ثم Enter أو اضغط إضافة"
                      className="flex-1 border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const v = (editForm.colorInput ?? "").trim();
                        if (v) setEditForm((f) => ({ ...f, colors: (f.colors ? f.colors + ", " : "") + v, colorInput: "" }));
                      }}
                      className="px-3 py-2 border border-sutra-blush rounded-lg bg-sutra-soft hover:bg-sutra-blush/30 text-sm font-medium"
                    >
                      إضافة
                    </button>
                  </div>
                </div>
              </div>
              {(() => {
                const sizeList = editForm.sizes.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
                const colorList = editForm.colors.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
                if (sizeList.length && colorList.length) {
                  return (
                    <div className="border border-sutra-blush rounded-lg p-4 bg-sutra-soft/30">
                      <p className="text-sm font-medium text-sutra-charcoal/80 mb-3">كمية لكل مقاس ولون</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr>
                              <th className="text-right p-2 border border-sutra-blush/50 bg-white">مقاس / لون</th>
                              {colorList.map((c) => (
                                <th key={c} className="text-right p-2 border border-sutra-blush/50 bg-white">{c}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sizeList.map((s) => (
                              <tr key={s}>
                                <td className="p-2 border border-sutra-blush/50 bg-white font-medium">{s}</td>
                                {colorList.map((c) => (
                                  <td key={c} className="p-1 border border-sutra-blush/50">
                                    <input
                                      type="number"
                                      min={0}
                                      value={editForm.variantQtys[`${s}|${c}`] ?? ""}
                                      onChange={(e) => setEditForm((f) => ({
                                        ...f,
                                        variantQtys: { ...f.variantQtys, [`${s}|${c}`]: e.target.value },
                                      }))}
                                      placeholder="0"
                                      className="w-14 text-center border border-sutra-blush rounded px-1 py-1.5 bg-white"
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 border border-sutra-blush rounded-xl text-sutra-charcoal hover:bg-sutra-soft"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-sutra-charcoal text-white rounded-xl font-medium hover:bg-sutra-gold disabled:opacity-60"
                >
                  {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sutra-charcoal/70">جاري التحميل...</p>
      ) : products.length === 0 ? (
        <p className="text-sutra-charcoal/70">لا توجد منتجات. أضف منتجاً من الزر أعلاه.</p>
      ) : (
        <div className="space-y-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl border border-sutra-blush/50"
            >
              <div className="w-20 h-24 relative rounded-lg overflow-hidden bg-sutra-soft flex-shrink-0">
                {p.images?.[0] && (p.images[0].startsWith("http") || p.images[0].startsWith("/") || p.images[0].startsWith("data:")) ? (
                  <Image
                    src={p.images[0]}
                    alt={p.nameAr || p.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-sutra-rose/50 text-xs">Stella</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sutra-charcoal">{p.nameAr || p.name}</p>
                <div className="flex items-center gap-2 flex-wrap text-sm text-sutra-charcoal/70">
                  <span>{p.categoryAr || p.category}</span>
                  <span>—</span>
                  {p.originalPrice != null && (
                    <span className="line-through text-sutra-charcoal/50">{p.originalPrice} ج.م</span>
                  )}
                  <span className="text-sutra-gold font-medium">{p.price} ج.م</span>
                </div>
                {!p.isActive && <span className="text-xs text-amber-600 block mt-1">مخفى من العرض</span>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {p.isActive ? (
                  <Link
                    href={`/product/${p.id}`}
                    target="_blank"
                    className="px-3 py-1.5 text-sm border border-sutra-blush rounded-lg text-sutra-charcoal hover:bg-sutra-soft"
                  >
                    معاينة
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleShowAgain(p.id)}
                    className="px-3 py-1.5 text-sm bg-sutra-gold text-white rounded-lg hover:bg-sutra-charcoal"
                  >
                    عرض
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="px-3 py-1.5 text-sm border border-sutra-blush rounded-lg text-sutra-charcoal hover:bg-sutra-soft"
                >
                  تعديل
                </button>
                {p.isActive && (
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id, p.nameAr || p.name)}
                    className="px-3 py-1.5 text-sm text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50"
                  >
                    إخفاء
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handlePermanentDelete(p.id, p.nameAr || p.name)}
                  className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                  title="حذف نهائي من قاعدة البيانات"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
