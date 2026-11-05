import Link from 'next/link'

type Profile = { name: string; photoUrl: string | null } | null

export function DriverProfileLink({ profile }: { profile: Profile }) {
  if (!profile) {
    return <Link href="/driver" className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-sm border border-primary/60 px-3 py-2 text-xs font-bold uppercase text-primary transition-colors hover:bg-primary hover:text-primary-foreground">Driver Sign In</Link>
  }

  return <Link href="/driver" aria-label={`Open ${profile.name}'s driver profile`} className="inline-flex min-h-11 max-w-[190px] items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 transition-colors hover:border-primary hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary">
    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-sm font-black text-primary">
      {profile.photoUrl ? (
        // Driver photos are already stored in Supabase; URL is from the driver profile.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.photoUrl} alt="" className="size-full object-cover" />
      ) : profile.name.charAt(0).toUpperCase()}
    </span>
    <span className="min-w-0 truncate text-xs font-bold uppercase tracking-wide">{profile.name}</span>
  </Link>
}
