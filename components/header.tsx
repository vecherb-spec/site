import Link from "next/link";
import { COMPANY } from "@/lib/constants";

const navItems = [
  { href: "/catalog", label: "Каталог" },
  { href: "/#advantages", label: "Преимущества" },
  { href: "/contacts", label: "Контакты" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07080c]/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-sm font-semibold tracking-[0.18em] text-white">
          {COMPANY.name}
        </Link>
        <nav className="hidden gap-6 text-sm text-white/80 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/#lead-form" className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold">
          Получить расчет
        </Link>
      </div>
    </header>
  );
}
