export function formatDate(value: string | null) {
  if (!value) return 'Date TBC'
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${value}T00:00:00Z`),
  )
}
