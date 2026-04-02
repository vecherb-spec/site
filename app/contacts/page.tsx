import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { LeadForm } from "@/components/lead-form";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Свяжитесь с нами для расчета и подбора светодиодного экрана.",
};

export default function ContactsPage() {
  return (
    <>
      <Header />
      <main className="container py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="card p-8">
            <h1 className="text-3xl font-semibold">Контакты</h1>
            <p className="mt-3 text-[var(--muted)]">
              Работаем по всей России: проектирование, поставка, монтаж и сервис.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-zinc-200">
              <li>
                Телефон:{" "}
                <a className="hover:text-[var(--accent-soft)]" href={`tel:${COMPANY.phoneHref}`}>
                  {COMPANY.phone}
                </a>
              </li>
              <li>
                Email:{" "}
                <a className="hover:text-[var(--accent-soft)]" href={`mailto:${COMPANY.email}`}>
                  {COMPANY.email}
                </a>
              </li>
              <li>Адрес: {COMPANY.address}</li>
              <li>Время работы: Пн-Пт, 09:00-19:00</li>
            </ul>
            <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-sm text-[var(--muted)]">
              Логотип, фотографии проектов и карту подключим после получения ваших материалов.
            </div>
          </section>
          <section className="card p-8">
            <h2 className="mb-4 text-xl font-semibold">Отправить запрос</h2>
            <LeadForm source="Контакты" />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
