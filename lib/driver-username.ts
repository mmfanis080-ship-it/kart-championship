/** Private synthetic email convention used only for the Supabase Auth password API. */
export function normalizeDriverUsername(input: string): string | null {
  const username = input.trim().toLowerCase()
  return /^[a-z][a-z0-9_]{2,23}$/.test(username) ? username : null
}
export function driverAuthEmail(username: string): string {
  return `${username}@drivers.kart-championship.invalid`
}
