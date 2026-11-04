export function SectionHeading({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
      <h2 id={id} className="break-words text-[1.7rem] font-black uppercase italic tracking-tight sm:break-normal sm:text-3xl md:text-4xl">
        {title}
      </h2>
    </div>
  )
}
