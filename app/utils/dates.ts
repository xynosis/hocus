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

export function formatTimeSince(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days !== 1 ? 's' : ''} ago`
}