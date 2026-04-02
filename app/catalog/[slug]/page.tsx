import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeadForm } from "@/components/lead-form";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Badge, Card, SectionTitle } from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
    },
  });

  if (!product) {
    return {
      title: "Экран не найден",
    };
  }

  return {
    title: `${product.name} — LEDVision`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="container flex flex-col gap-8 py-12">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="overflow-hidden p-0">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-[360px] w-full object-cover"
              />
            ) : (
              <div className="flex h-[360px] items-center justify-center bg-neutral-900 text-neutral-500">
                Фото будет добавлено
              </div>
            )}
          </Card>

          <Card className="space-y-5">
            <Badge>{product.category}</Badge>
            <h1 className="text-3xl font-semibold text-white">{product.name}</h1>
            <p className="text-sm leading-relaxed text-neutral-300">{product.description}</p>
            <div className="rounded-xl border border-white/10 bg-neutral-900 p-4">
              <div className="text-xs uppercase tracking-wide text-neutral-500">
                Стоимость от
              </div>
              <div className="mt-2 text-3xl font-semibold text-white">
                {formatPrice(product.priceFrom)}
              </div>
            </div>
          </Card>
        </section>

        <section>
          <SectionTitle
            eyebrow="Технические параметры"
            title="Характеристики экрана"
            subtitle="Подберём конфигурацию под ваш объект, бюджет и задачу."
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              ["Шаг пикселя", product.pixelPitch],
              ["Яркость", `${product.brightness} нит`],
              ["Частота обновления", `${product.refreshRate} Гц`],
              ["Размер кабинета", product.cabinetSize],
              ["Гарантия", product.warranty],
              ["Тип", product.category],
            ].map(([label, value]) => (
              <Card key={label} className="space-y-2">
                <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
                <div className="text-lg font-medium text-white">{value}</div>
              </Card>
            ))}
          </div>
        </section>

        <section id="request">
          <SectionTitle
            eyebrow="Быстрый расчет"
            title="Получите предложение по этому экрану"
            subtitle="Ответим в течение 15 минут в рабочее время."
          />
          <LeadForm source={`catalog:${product.slug}`} productId={product.id} />
        </section>
      </main>
      <Footer />
    </>
  );
}
