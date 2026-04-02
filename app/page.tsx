import Link from "next/link";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { LeadForm } from "@/components/lead-form";
import { ProductCard } from "@/components/product-card";
import { SectionTitle } from "@/components/ui";
import { COMPANY } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

const advantages = [
  {
    title: "Проектирование под задачу",
    text: "Подбираем шаг пикселя, яркость и конструктив на основе реальных условий монтажа.",
  },
  {
    title: "Монтаж и пусконаладка",
    text: "Берем на себя полный цикл: от кабельной схемы до обучения персонала.",
  },
  {
    title: "Сервис 24/7",
    text: "Оперативная диагностика, запас модулей и регламентное обслуживание на объекте.",
  },
  {
    title: "Гарантия результата",
    text: "Фиксируем SLA в договоре и обеспечиваем стабильную работу экрана долгие годы.",
  },
];

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <>
      <Header />
      <main>
        <section className="container py-18 md:py-24">
          <div className="glass rounded-3xl p-8 md:p-12">
            <span className="inline-flex rounded-full border border-[var(--line)] bg-white/6 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-[var(--accent)] uppercase">
              Поставка и интеграция LED-экранов
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl leading-tight font-semibold md:text-6xl">
              Светодиодные экраны для рекламы, ритейла и событий
            </h1>
            <p className="mt-6 max-w-3xl text-lg text-[var(--muted)]">
              {COMPANY.name} проектирует, поставляет и обслуживает LED-решения по
              всей России: от фасадных медиафасадов до интерьерных видеостен.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/catalog" className="btn-primary rounded-xl px-5 py-3 text-center font-semibold">
                Смотреть каталог
              </Link>
              <Link
                href="/contacts"
                className="btn-secondary rounded-xl px-5 py-3 text-center font-semibold"
              >
                Получить консультацию
              </Link>
            </div>
            <dl className="mt-10 grid gap-6 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-[var(--muted)]">Проектов в год</dt>
                <dd className="mt-2 text-3xl font-semibold">120+</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Гарантия</dt>
                <dd className="mt-2 text-3xl font-semibold">до 5 лет</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Срок поставки</dt>
                <dd className="mt-2 text-3xl font-semibold">от 10 дней</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="container pb-18 md:pb-24">
          <SectionTitle
            eyebrow="Каталог решений"
            title="Популярные модели"
            description="Подобрали варианты с высоким спросом для уличных и интерьерных задач."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)
            ) : (
              <div className="glass col-span-full rounded-2xl p-8 text-[var(--muted)]">
                Пока нет отмеченных моделей. Добавьте товары в админке.
              </div>
            )}
          </div>
          <div className="mt-8">
            <Link href="/catalog" className="btn-secondary rounded-xl px-5 py-3 font-semibold">
              Перейти в полный каталог
            </Link>
          </div>
        </section>

        <section className="container pb-18 md:pb-24">
          <SectionTitle
            eyebrow="Почему мы"
            title="Современный B2B-подход"
            description="Прозрачные этапы, измеримый результат и поддержка после запуска."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {advantages.map((item) => (
              <article key={item.title} className="glass rounded-2xl p-6">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-[var(--muted)]">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container pb-24">
          <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <div id="lead-form" className="glass rounded-2xl p-8">
              <SectionTitle
                eyebrow="Быстрый расчет"
                title="Оставьте заявку"
                description="Свяжемся в течение 15 минут, уточним задачу и предложим оптимальное решение."
              />
              <div className="mt-6">
                <LeadForm source="Главная страница" />
              </div>
            </div>
            <aside className="glass rounded-2xl p-8">
              <h3 className="text-2xl font-semibold">Контакты</h3>
              <ul className="mt-4 space-y-3 text-[var(--muted)]">
                <li>
                  Телефон:{" "}
                  <a className="text-[var(--foreground)] hover:text-[var(--accent)]" href={`tel:${COMPANY.phoneHref}`}>
                    {COMPANY.phone}
                  </a>
                </li>
                <li>
                  Email:{" "}
                  <a className="text-[var(--foreground)] hover:text-[var(--accent)]" href={`mailto:${COMPANY.email}`}>
                    {COMPANY.email}
                  </a>
                </li>
                <li>Адрес: {COMPANY.address}</li>
                <li>Минимальный бюджет проекта: {formatPrice(250000)}</li>
              </ul>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
