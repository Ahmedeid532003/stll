"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Order } from "@/lib/types";

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
};

const PAYMENT_STATUS_LABELS: Record<NonNullable<Order["paymentStatus"]>, string> = {
  pending: "جاري التأكيد",
  confirmed: "تم تأكيد الدفع",
  rejected: "تم رفض الطلب",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = (orderId: string, status: Order["status"]) => {
    fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then((r) => r.json())
      .then(() => load());
  };

  const updatePaymentStatus = (orderId: string, paymentStatus: "confirmed" | "rejected") => {
    fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus }),
    })
      .then((r) => r.json())
      .then(() => load());
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-sutra-charcoal mb-6">
        الطلبات
      </h1>

      {loading ? (
        <p className="text-sutra-charcoal/70">جاري التحميل...</p>
      ) : orders.length === 0 ? (
        <p className="text-sutra-charcoal/70">لا توجد طلبات حتى الآن.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-sutra-blush/50 overflow-hidden"
            >
              <div className="p-4 border-b border-sutra-blush/50 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-sutra-charcoal">{order.customerName}</p>
                  <p className="text-sm text-sutra-charcoal/70">{order.customerPhone} — {order.address}</p>
                  <p className="text-xs text-sutra-charcoal/60 mt-1">
                    {new Date(order.createdAt).toLocaleDateString("ar-EG")} — إجمالي {order.total} ج.م
                  </p>
                  {order.paymentMethod && (
                    <p className="text-xs text-sutra-charcoal/60 mt-0.5">
                      الدفع: {order.paymentMethod === "instapay" ? "انستا باي" : "اتصالات كاش"}
                      {order.paymentStatus && (
                        <span className="mr-2"> — {PAYMENT_STATUS_LABELS[order.paymentStatus]}</span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value as Order["status"])}
                    className="border border-sutra-blush rounded-lg px-3 py-2 bg-sutra-pearl text-sm"
                  >
                    {(["pending", "confirmed", "shipped", "delivered"] as const).map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <ul className="p-4 divide-y divide-sutra-blush/30">
                {order.items.map((item, i) => (
                  <li key={i} className="py-2 flex justify-between text-sm">
                    <span>{item.productName} × {item.quantity}</span>
                    <span>{item.price * item.quantity} ج.م</span>
                  </li>
                ))}
              </ul>
              {order.paymentStatus === "pending" && order.paymentProofUrl && (
                <div className="p-4 border-t border-sutra-blush/50 bg-sutra-soft/30">
                  <p className="text-sm font-medium text-sutra-charcoal mb-2">إثبات الدفع (سكرين شوت)</p>
                  <a
                    href={order.paymentProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="فتح إثبات الدفع في نافذة جديدة"
                    className="block relative w-full max-w-xs aspect-video rounded-lg overflow-hidden border border-sutra-blush bg-white mb-3"
                  >
                    <Image
                      src={order.paymentProofUrl}
                      alt="إثبات الدفع"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </a>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updatePaymentStatus(order.id, "confirmed")}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      تأكيد
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePaymentStatus(order.id, "rejected")}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                    >
                      رفض
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
