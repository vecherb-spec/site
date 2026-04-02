import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Каталог LED экранов",
  description:
    "Каталог светодиодных экранов: уличные, интерьерные, прозрачные и сценические решения под задачу бизнеса.",
};

export default async function CatalogPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <Header />
      <main className="container py-16">
        <section className="space-y-4">
          <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1 text-sm text-white/80">
            Каталог оборудования
          </span>
          <h1 className="text-3xl font-semibold md:text-5xl">Светодиодные экраны</h1>
          <p className="max-w-3xl text-white/70">
            Подберем экран под фасад, торговый зал, офис, шоурум, ТРЦ, сцену или мобильное
            мероприятие. Все товары доступны для консультации и расчета под ваш проект.
          </p>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {products.length === 0 ? (
            <div className="card md:col-span-2">
              <p className="text-white/70">Товары появятся после заполнения каталога в админке.</p>
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
    </>
  );
}
