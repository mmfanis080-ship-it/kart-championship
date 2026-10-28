import type { Metadata } from 'next'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { basicRule, categories, rulesEyebrow, rulesTitle, type PenaltyLevel } from '@/lib/rules'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Rules | Kart Championship',
  description: 'Racing Kart Tournament 2026/27 rules and penalties.',
}

const badgeStyle: Record<PenaltyLevel, string> = {
  3: 'border-border text-foreground',
  5: 'border-foreground/40 text-foreground',
  7: 'border-primary/60 text-primary',
  10: 'border-primary bg-primary/15 text-primary',
  dsq: 'border-primary bg-primary text-primary-foreground',
  info: 'border-border text-muted-foreground',
}

const scale: { label: string; level: PenaltyLevel }[] = [
  { label: '3 πόντοι', level: 3 },
  { label: '5 πόντοι', level: 5 },
  { label: '7 πόντοι', level: 7 },
  { label: '10 πόντοι', level: 10 },
  { label: 'Black Flag (DSQ)', level: 'dsq' },
]

export default function RulesPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-4xl flex-col gap-12 px-4 py-12 md:px-6 md:py-16">
        <header className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">{rulesEyebrow}</p>
          <h1 className="text-4xl font-black uppercase italic leading-none tracking-tight md:text-6xl">{rulesTitle}</h1>
        </header>

        <div className="flex flex-col gap-6">
          <div className="rounded-sm border border-primary/50 bg-primary/10 p-5">
            <p className="font-mono text-[11px] uppercase tracking-widest text-primary">Βασικός κανόνας</p>
            <p className="mt-2 text-lg font-bold">{basicRule}</p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Κλίμακα ποινών</p>
            <ul className="flex flex-wrap gap-2">
              {scale.map((item) => (
                <li key={item.label} className={cn('rounded-sm border px-3 py-1.5 font-mono text-xs font-bold uppercase', badgeStyle[item.level])}>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Κατηγορίες" className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="rounded-sm border border-border px-3 py-1.5 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
              >
                {category.title}
              </a>
            ))}
          </nav>
        </div>

        {categories.map((category) => (
          <section key={category.id} id={category.id} aria-labelledby={`${category.id}-title`} className="scroll-mt-24">
            <h2 id={`${category.id}-title`} className="mb-4 text-2xl font-black uppercase italic tracking-tight md:text-3xl">
              {category.title}
            </h2>
            <ul className="overflow-hidden rounded-sm border border-border bg-card">
              {category.rules.map((rule) => (
                <li
                  key={rule.text}
                  className="flex flex-col gap-3 border-b border-border p-5 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                >
                  <div className="flex flex-col gap-1.5">
                    <p className="text-base font-semibold leading-snug">{rule.text}</p>
                    {rule.note && <p className="text-sm leading-relaxed text-muted-foreground">{rule.note}</p>}
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5 sm:items-end">
                    <span className={cn('w-fit rounded-sm border px-3 py-1.5 font-mono text-xs font-bold uppercase sm:text-right', badgeStyle[rule.level])}>
                      {rule.penalty}
                    </span>
                    {rule.stewards && (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Ελέγχεται από αγωνοδίκες
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  )
}
