import { NextRequest, NextResponse } from "next/server";
import { deleteProductPermanent } from "@/lib/db";

/** حذف المنتج نهائياً من قاعدة البيانات */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await deleteProductPermanent(id);
    if (!ok) return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "فشل الحذف النهائي" }, { status: 500 });
  }
}
