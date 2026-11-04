export function SectionHeading({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
      <h2 id={id} className="text-3xl font-black uppercase italic tracking-tight md:text-4xl">
        {title}
      </h2>
    </div>
  )
}
