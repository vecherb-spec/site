import type { ComponentProps, ReactNode } from "react";

export function SectionTitle({
  eyebrow,
  title,
  description,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  subtitle?: string;
}) {
  const text = description ?? subtitle;

  return (
    <div className="space-y-2">
      {eyebrow ? (
        <p className="text-xs font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold md:text-4xl">{title}</h2>
      {text ? <p className="max-w-3xl text-[var(--muted)]">{text}</p> : null}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-[var(--line)] bg-white/6 px-3 py-1 text-xs text-[var(--muted)]">
      {children}
    </span>
  );
}

export function Label(props: ComponentProps<"label">) {
  return <label {...props} className={`text-sm text-zinc-300 ${props.className ?? ""}`} />;
}

export function Input(props: ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-white/12 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-cyan-400 ${props.className ?? ""}`}
    />
  );
}

export function Textarea(props: ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-white/12 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-cyan-400 ${props.className ?? ""}`}
    />
  );
}

export function FormMessage({ children }: { children: ReactNode }) {
  return <p className="text-sm text-rose-300">{children}</p>;
}

export function SubmitButton({
  children,
  pending = false,
}: {
  children: ReactNode;
  pending?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Сохранение..." : children}
    </button>
  );
}
