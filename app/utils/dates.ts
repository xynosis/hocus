export function isToday(date: string): boolean {
  const today = new Date().toDateString()
  return new Date(date).toDateString() === today
}

export function isOverdue(date: string): boolean {
  return new Date(date) < new Date(new Date().toDateString())
}

export function isTodayOrOverdue(date: string): boolean {
  return isToday(date) || isOverdue(date)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function toDateValue(date: string | null): number {
  if (!date) return Infinity
  return new Date(date).getTime()
}