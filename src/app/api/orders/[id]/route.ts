import { NextRequest, NextResponse } from "next/server";
import { updateOrder } from "@/lib/db";

/** العميل يرفع إثبات الدفع بعد إنشاء الطلب */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { paymentMethod, paymentProofUrl } = body;
    if (!paymentMethod || !["instapay", "etisalat_cash"].includes(paymentMethod)) {
      return NextResponse.json({ error: "طريقة الدفع غير صالحة" }, { status: 400 });
    }
    if (!paymentProofUrl?.trim()) {
      return NextResponse.json({ error: "رابط صورة إثبات الدفع مطلوب" }, { status: 400 });
    }
    const order = await updateOrder(id, {
      paymentMethod: paymentMethod as "instapay" | "etisalat_cash",
      paymentProofUrl: paymentProofUrl.trim(),
      paymentStatus: "pending",
    });
    if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    return NextResponse.json(order);
  } catch (e) {
    return NextResponse.json({ error: "فشل تحديث إثبات الدفع" }, { status: 500 });
  }
}
