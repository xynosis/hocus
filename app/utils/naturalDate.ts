/**
 * Parses natural language date strings into ISO date strings (YYYY-MM-DD).
 * Returns null if the input cannot be parsed.
 */
export function parseNaturalDate(input: string): string | null {
  const trimmed = input.trim().toLowerCase()
  if (!trimmed) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const toISO = (d: Date): string => d.toISOString().split('T')[0]!

  if (trimmed === 'today') return toISO(today)

  if (trimmed === 'tomorrow') {
    const d = new Date(today)
    d.setDate(d.getDate() + 1)
    return toISO(d)
  }

  if (trimmed === 'next week') {
    const d = new Date(today)
    d.setDate(d.getDate() + 7)
    return toISO(d)
  }

  if (trimmed === 'next month') {
    const d = new Date(today)
    d.setMonth(d.getMonth() + 1)
    return toISO(d)
  }

  // next monday / tuesday / etc — or bare day name (nearest upcoming)
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const nextDayMatch = trimmed.match(/^(?:next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/)
  if (nextDayMatch) {
    const targetDay = dayNames.indexOf(nextDayMatch[1]!)
    const d = new Date(today)
    d.setDate(d.getDate() + 1) // start from tomorrow
    while (d.getDay() !== targetDay) d.setDate(d.getDate() + 1)
    return toISO(d)
  }

  // in N days
  const inDaysMatch = trimmed.match(/^in\s+(\d+)\s+days?$/)
  if (inDaysMatch) {
    const n = parseInt(inDaysMatch[1]!)
    const d = new Date(today)
    d.setDate(d.getDate() + n)
    return toISO(d)
  }

  // in N weeks
  const inWeeksMatch = trimmed.match(/^in\s+(\d+)\s+weeks?$/)
  if (inWeeksMatch) {
    const n = parseInt(inWeeksMatch[1]!)
    const d = new Date(today)
    d.setDate(d.getDate() + n * 7)
    return toISO(d)
  }

  // YYYY-MM-DD passthrough
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/)
  if (dmyMatch) {
    const date = new Date(parseInt(dmyMatch[3]!), parseInt(dmyMatch[2]!) - 1, parseInt(dmyMatch[1]!))
    if (!isNaN(date.getTime())) return toISO(date)
  }

  return null
}

/**
 * Returns a human-friendly relative label for a date, e.g. "Tomorrow", "Monday", "15 Mar".
 */
export function formatNaturalPreview(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 1 && diff < 7) return d.toLocaleDateString('en-GB', { weekday: 'long' })
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
