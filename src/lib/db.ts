import { promises as fs } from "fs";
import path from "path";
import type { Product, ProductVariant, Stock, Order, Section } from "./types";
import { v4 as uuidv4 } from "uuid";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const STOCK_FILE = path.join(DATA_DIR, "stock.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const SECTIONS_FILE = path.join(DATA_DIR, "sections.json");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // dir exists
  }
}

async function readJson<T>(file: string, defaultValue: T): Promise<T> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(file, "utf-8");
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

function ensureArray<T>(value: unknown, defaultValue: T[] = []): T[] {
  return Array.isArray(value) ? value : defaultValue;
}

export async function getProducts(): Promise<Product[]> {
  const raw = await readJson<unknown>(PRODUCTS_FILE, []);
  const products = ensureArray<Product>(raw);
  return products.filter((p) => p && typeof p === "object" && p.isActive !== false);
}

export async function getProductsAdmin(): Promise<Product[]> {
  const raw = await readJson<unknown>(PRODUCTS_FILE, []);
  return ensureArray<Product>(raw);
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProductsAdmin();
  return products.find((p) => p.id === id) ?? null;
}

export async function addProduct(
  product: Omit<Product, "id" | "createdAt">,
  initialStock: number = 0
): Promise<Product> {
  const products = await getProductsAdmin();
  const newProduct: Product = {
    ...product,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  await writeJson(PRODUCTS_FILE, products);
  if (!newProduct.variants?.length) {
    await setStock(newProduct.id, initialStock);
  }
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const products = await getProductsAdmin();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  products[index] = { ...products[index], ...updates };
  await writeJson(PRODUCTS_FILE, products);
  return products[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = await getProductsAdmin();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  products[index].isActive = false;
  await writeJson(PRODUCTS_FILE, products);
  return true;
}

/** حذف المنتج نهائياً من المنتجات والمخزون */
export async function deleteProductPermanent(id: string): Promise<boolean> {
  const products = await getProductsAdmin();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  await writeJson(PRODUCTS_FILE, products);
  const raw = await readJson<unknown>(STOCK_FILE, []);
  const stockList = ensureArray<{ productId: string; quantity: number; updatedAt?: string }>(raw);
  const filtered = stockList.filter((s) => s && s.productId !== id);
  await writeJson(STOCK_FILE, filtered);
  return true;
}

export async function getStock(): Promise<Record<string, number>> {
  const raw = await readJson<unknown>(STOCK_FILE, []);
  const stock = ensureArray<{ productId: string; quantity: number }>(raw);
  return stock.reduce((acc, s) => {
    if (s && s.productId != null) acc[s.productId] = Number(s.quantity) || 0;
    return acc;
  }, {} as Record<string, number>);
}

export async function getStockForProduct(productId: string): Promise<number> {
  const stock = await getStock();
  return stock[productId] ?? 0;
}

export async function setStock(productId: string, quantity: number): Promise<void> {
  const raw = await readJson<unknown>(STOCK_FILE, []);
  const stockList = ensureArray<{ productId: string; quantity: number; updatedAt?: string }>(raw);
  const index = stockList.findIndex((s) => s && s.productId === productId);
  const record = { productId, quantity, updatedAt: new Date().toISOString() };
  if (index >= 0) stockList[index] = record;
  else stockList.push(record);
  await writeJson(STOCK_FILE, stockList);
}

export async function decreaseStock(productId: string, by: number): Promise<boolean> {
  const qty = await getStockForProduct(productId);
  if (qty < by) return false;
  await setStock(productId, qty - by);
  return true;
}

/** كمية متوفرة لتركيبة مقاس+لون (من variants المنتج) */
export async function getVariantStock(productId: string, size: string, color: string): Promise<number> {
  const product = await getProductById(productId);
  if (!product?.variants?.length) return 0;
  const v = product.variants.find((x) => x.size === size && x.color === color);
  return v ? v.quantity : 0;
}

/** خصم كمية من تركيبة مقاس+لون */
export async function decreaseVariantStock(productId: string, size: string, color: string, by: number): Promise<boolean> {
  const products = await getProductsAdmin();
  const idx = products.findIndex((p) => p.id === productId);
  if (idx < 0 || !products[idx].variants?.length) return false;
  const vIdx = products[idx].variants!.findIndex((x) => x.size === size && x.color === color);
  if (vIdx < 0) return false;
  const v = products[idx].variants![vIdx];
  if (v.quantity < by) return false;
  v.quantity -= by;
  await writeJson(PRODUCTS_FILE, products);
  return true;
}

// ——— أقسام ———
export async function getSections(): Promise<Section[]> {
  const raw = await readJson<unknown>(SECTIONS_FILE, []);
  const arr = ensureArray<Section>(raw);
  return arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function createSection(section: Omit<Section, "id">): Promise<Section> {
  const sections = await getSections();
  const newSection: Section = { ...section, id: uuidv4() };
  sections.push(newSection);
  await writeJson(SECTIONS_FILE, sections);
  return newSection;
}

export async function updateSection(id: string, updates: Partial<Omit<Section, "id">>): Promise<Section | null> {
  const sections = await getSections();
  const idx = sections.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  sections[idx] = { ...sections[idx], ...updates };
  await writeJson(SECTIONS_FILE, sections);
  return sections[idx];
}

export async function deleteSection(id: string): Promise<boolean> {
  const sections = await getSections();
  const idx = sections.findIndex((s) => s.id === id);
  if (idx < 0) return false;
  sections.splice(idx, 1);
  await writeJson(SECTIONS_FILE, sections);
  return true;
}

export async function getOrders(): Promise<Order[]> {
  const raw = await readJson<unknown>(ORDERS_FILE, []);
  return ensureArray<Order>(raw);
}

export async function createOrder(
  items: { productId: string; productName: string; quantity: number; price: number; size?: string; color?: string }[],
  customer: { name: string; phone: string; email?: string; address: string; notes?: string }
): Promise<Order | { error: string }> {
  const orders = await getOrders();
  const stock = await getStock();
  for (const item of items) {
    const product = await getProductById(item.productId);
    if (product?.variants?.length && item.size != null && item.color != null) {
      const available = await getVariantStock(item.productId, item.size, item.color);
      if (available < item.quantity) {
        return { error: `الكمية غير متوفرة (${item.size} / ${item.color}) للمنتج: ${item.productName}. المتاح: ${available}` };
      }
    } else {
      const available = stock[item.productId] ?? 0;
      if (available < item.quantity) {
        return { error: `الكمية غير متوفرة للمنتج: ${item.productName}. المتاح: ${available}` };
      }
    }
  }
  for (const item of items) {
    const product = await getProductById(item.productId);
    if (product?.variants?.length && item.size != null && item.color != null) {
      const ok = await decreaseVariantStock(item.productId, item.size, item.color, item.quantity);
      if (!ok) return { error: `فشل تحديث المخزون للمنتج: ${item.productName}` };
    } else {
      const ok = await decreaseStock(item.productId, item.quantity);
      if (!ok) return { error: `فشل تحديث المخزون للمنتج: ${item.productName}` };
    }
  }
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const order: Order = {
    id: uuidv4(),
    items,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerEmail: customer.email,
    address: customer.address,
    notes: customer.notes,
    total,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  await writeJson(ORDERS_FILE, orders);
  return order;
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["status"]
): Promise<Order | null> {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;
  orders[index].status = status;
  await writeJson(ORDERS_FILE, orders);
  return orders[index];
}

export async function updateOrder(
  orderId: string,
  updates: Partial<Pick<Order, "paymentMethod" | "paymentProofUrl" | "paymentStatus" | "status">>
): Promise<Order | null> {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;
  if (updates.status != null) orders[index].status = updates.status;
  if (updates.paymentMethod != null) orders[index].paymentMethod = updates.paymentMethod;
  if (updates.paymentProofUrl != null) orders[index].paymentProofUrl = updates.paymentProofUrl;
  if (updates.paymentStatus != null) orders[index].paymentStatus = updates.paymentStatus;
  await writeJson(ORDERS_FILE, orders);
  return orders[index];
}
