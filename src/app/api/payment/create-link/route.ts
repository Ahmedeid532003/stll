import { NextRequest, NextResponse } from "next/server";

/**
 * إنشاء رابط دفع حقيقي يتطلب تكامل مع بوابة دفع (مثل Paymob / Accept).
 * يمكنك لاحقاً إضافة API_KEY و IFrame_ID من Paymob واستدعاء واجهتهم لإنشاء payment link.
 * حالياً نُرجع رسالة للمستخدم بالدفع عند الاستلام أو واتساب.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount, method } = body;
    if (!orderId || amount == null) {
      return NextResponse.json(
        { error: "بيانات الطلب مطلوبة" },
        { status: 400 }
      );
    }

    // TODO: تكامل Paymob/Accept — استدعاء واجهة إنشاء payment request
    // ثم إرجاع iframe_url أو redirect url للمستخدم
    // مثال: const res = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', { ... });
    // return NextResponse.json({ url: res.data.redirect_url });

    const env = process.env.PAYMOB_API_KEY ?? process.env.NEXT_PUBLIC_PAYMENT_URL;
    if (env) {
      // إذا وُجدت متغيرات الدفع يمكنك هنا إنشاء الرابط الحقيقي
      // return NextResponse.json({ url: "..." });
    }

    return NextResponse.json({
      error: "الدفع الإلكتروني قيد التفعيل. يمكنك الدفع عند الاستلام أو التواصل عبر واتساب للدفع (اتصالات كاش / انستا باي).",
    });
  } catch (e) {
    return NextResponse.json(
      { error: "فشل إنشاء رابط الدفع" },
      { status: 500 }
    );
  }
}
