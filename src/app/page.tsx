"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import type { Product, Section } from "@/lib/types";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((res) => res.json()),
      fetch("/api/sections").then((res) => res.json()),
    ])
      .then(([productsData, sectionsData]) => {
        setProducts(Array.isArray(productsData) ? productsData : []);
        setSections(Array.isArray(sectionsData) ? sectionsData : []);
      })
      .catch(() => {
        setProducts([]);
        setSections([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const productsBySection = sections.length > 0
    ? sections.map((sec) => ({
        section: sec,
        products: products.filter((p) => p.sectionId === sec.id),
      })).filter((g) => g.products.length > 0)
    : [];
  const productsWithoutSection = products.filter((p) => !p.sectionId);

  return (
    <>
      <Header />
      <main>
        <section className="relative py-28 md:py-44 px-5 md:px-8 overflow-hidden min-h-[70vh] flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-sutra-blush/60 via-sutra-cream/80 to-sutra-pearl" />
          <div className="absolute inset-0 bg-gradient-to-t from-sutra-pearl/90 via-transparent to-sutra-blush/30" />
          <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235C4A4A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="max-w-4xl mx-auto relative text-center">
            <p className="text-sutra-rose text-xs uppercase tracking-[0.4em] mb-6 font-semibold animate-fade-in-up opacity-90">
              مستلزمات حريمى
            </p>
            <div className="sutra-line mx-auto mb-8 animate-fade-in-up opacity-0 animate-fade-in-up-delay-1 [animation-fill-mode:forwards]" style={{ width: "56px", height: "3px" }} />
            <div className="sutra-hero-3d sutra-hero-3d-visible mb-8 inline-block px-2">
              <h1 className="font-display text-6xl md:text-8xl lg:text-9xl tracking-tight select-none" style={{ color: "#4a3c3c" }}>
                Stella
              </h1>
            </div>
            <p className="text-sutra-charcoal/75 text-lg md:text-xl max-w-xl mx-auto font-light leading-relaxed animate-fade-in-up opacity-0 animate-fade-in-up-delay-3 [animation-fill-mode:forwards]">
              تشكيلة مختارة من المستلزمات الحريمى الأنيقة — أناقة وراحة
            </p>
          </div>
        </section>

        <section id="products" className="py-24 md:py-32 px-5 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 md:mb-24">
              <div className="sutra-line mx-auto mb-5" style={{ width: "48px", height: "2px" }} />
              <h2 className="font-display text-3xl md:text-5xl font-semibold text-sutra-charcoal mb-4 tracking-tight">
                المنتجات
              </h2>
              <p className="text-sutra-charcoal/65 text-base md:text-lg max-w-md mx-auto leading-relaxed">
                تشكيلتنا المختارة لك
              </p>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-sutra-lg bg-sutra-soft/60 aspect-[3/4] animate-pulse"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-28 px-8 bg-white/80 rounded-2xl border-2 border-sutra-blush/50 shadow-[0_8px_32px_rgba(92,74,74,0.06)]">
                <p className="font-display text-2xl md:text-3xl text-sutra-charcoal/85">لا توجد منتجات حالياً.</p>
                <p className="mt-4 text-sutra-charcoal/65">تابعينا قريباً.</p>
              </div>
            ) : sections.length > 0 ? (
              <div className="space-y-16">
                {productsBySection.map(({ section, products: secProducts }) => (
                  <div key={section.id} className="scroll-mt-24">
                    <div className="flex items-center gap-5 mb-8">
                      <div className="sutra-line flex-shrink-0" style={{ width: "56px", height: "3px" }} />
                      <h3 className="font-display text-2xl md:text-4xl font-semibold text-sutra-charcoal tracking-tight">
                        {section.nameAr || section.name}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                      {secProducts.map((product, index) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          priority={index === 0}
                          sectionName={section.nameAr || section.name}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {productsWithoutSection.length > 0 && (
                  <div className="scroll-mt-24">
                    <div className="flex items-center gap-5 mb-8">
                      <div className="sutra-line flex-shrink-0" style={{ width: "56px", height: "3px" }} />
                      <h3 className="font-display text-2xl md:text-4xl font-semibold text-sutra-charcoal tracking-tight">
                        أخرى
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                      {productsWithoutSection.map((product, index) => (
                        <ProductCard key={product.id} product={product} priority={index === 0} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} priority={index === 0} />
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="border-t border-sutra-blush/80 py-14 md:py-16 px-5 md:px-8 mt-24 bg-gradient-to-b from-white/70 to-sutra-pearl">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
            <div>
              <p className="font-display text-2xl md:text-3xl text-sutra-charcoal font-semibold tracking-wide" style={{ textShadow: "0 2px 4px rgba(92,74,74,0.12)" }}>
                Stella
              </p>
              <p className="text-sutra-charcoal/65 text-sm md:text-base mt-2">
                مستلزمات حريمى أنيقة
              </p>
            </div>
            <div className="flex items-center gap-5">
              <a
                href="https://chat.whatsapp.com/DJjDPXMd7La29lc1vFYARQ?mode=r_c"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-11 h-11 rounded-full bg-sutra-blush/90 text-sutra-charcoal hover:bg-sutra-gold hover:text-white hover:scale-110 transition-all duration-300"
                aria-label="واتساب"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
