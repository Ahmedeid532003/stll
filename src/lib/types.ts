/** كمية لكل تركيبة مقاس + لون */
export interface ProductVariant {
  size: string;
  color: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  /** السعر الحالي (بعد الخصم) */
  price: number;
  /** سعر قبل الخصم - يظهر عليه خط للإلغاء */
  originalPrice?: number;
  category: string;
  categoryAr?: string;
  images: string[];
  sizes?: string[];
  colors?: string[];
  /** كمية لكل مقاس/لون — إن وُجد يُستخدم بدل المخزون الموحد */
  variants?: ProductVariant[];
  /** قسم اختياري */
  sectionId?: string;
  createdAt: string;
  isActive: boolean;
}

/** قسم لعرض المنتجات تحته (اختياري) */
export interface Section {
  id: string;
  name: string;
  nameAr?: string;
  order: number;
}

export interface Stock {
  productId: string;
  quantity: number;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

/** عنصر في سلة المشتريات (قبل إنشاء الطلب) */
export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

/** حالة إثبات الدفع من الأدمن */
export type PaymentStatus = "pending" | "confirmed" | "rejected";

export interface Order {
  id: string;
  items: OrderItem[];
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  notes?: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  createdAt: string;
  /** طريقة الدفع (انستاباي / اتصالات كاش) */
  paymentMethod?: "instapay" | "etisalat_cash";
  /** رابط صورة إثبات الدفع */
  paymentProofUrl?: string;
  /** حالة إثبات الدفع: جاري التأكيد | تم التأكيد | تم الرفض */
  paymentStatus?: PaymentStatus;
}

export const ADMIN_PASSWORD = "yomna2003";
