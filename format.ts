export function formatDate(value: string | null) {
  if (!value) return 'Date TBC'
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${value}T00:00:00Z`),
  )
}

const TZ = 'Europe/Athens'

function zoneOffsetMs(at: number) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
  }).formatToParts(new Date(at))
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value)
  return Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second')) - at
}

/** Race date + time are entered in Greek time (Europe/Athens). Returns the exact moment in ms. */
export function raceInstant(date: string | null, time: string | null) {
  if (!date || !time) return null
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const guess = Date.UTC(y, m - 1, d, hh, mm)
  const first = guess - zoneOffsetMs(guess)
  return guess - zoneOffsetMs(first)
}

export function formatDayMonth(value: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
    .format(new Date(`${value}T00:00:00Z`))
    .toUpperCase()
}
