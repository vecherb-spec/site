import { prisma } from "@/lib/prisma";
import { deleteLeadAction } from "@/lib/actions";

export const metadata = {
  title: "Заявки | LEDVision",
  description: "Заявки с сайта LEDVision",
};

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Заявки</h1>
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#101523]">
        <table className="min-w-full text-sm">
          <thead className="text-left text-zinc-400">
            <tr className="border-b border-white/10">
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Имя</th>
              <th className="px-4 py-3">Телефон</th>
              <th className="px-4 py-3">Компания</th>
              <th className="px-4 py-3">Источник</th>
              <th className="px-4 py-3">Товар</th>
              <th className="px-4 py-3">Сообщение</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-white/5 text-zinc-200">
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Intl.DateTimeFormat("ru-RU", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(lead.createdAt)}
                </td>
                <td className="px-4 py-3">{lead.name}</td>
                <td className="px-4 py-3">
                  <a href={`tel:${lead.phone}`} className="hover:text-cyan-300">
                    {lead.phone}
                  </a>
                </td>
                <td className="px-4 py-3">{lead.company || "—"}</td>
                <td className="px-4 py-3">{lead.source}</td>
                <td className="px-4 py-3">{lead.product?.name || "—"}</td>
                <td className="px-4 py-3 max-w-xs whitespace-pre-wrap">
                  {lead.message || "—"}
                </td>
                <td className="px-4 py-3">
                  <form action={deleteLeadAction}>
                    <input type="hidden" name="id" value={lead.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-500/30 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                    >
                      Удалить
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!leads.length ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-zinc-400">
                  Пока заявок нет
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
