export function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="container flex flex-col gap-4 text-sm text-zinc-400 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} LED Vision. Все права защищены.</p>
        <p>
          Проектирование, поставка, монтаж и сервис светодиодных экранов по РФ
          и СНГ.
        </p>
      </div>
    </footer>
  );
}
