import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isToday, isOverdue, isTodayOrOverdue, formatDate, toDateValue } from '~/utils/dates'

describe('date utils', () => {
  const MOCK_NOW = new Date('2025-03-14T12:00:00Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(MOCK_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('isToday returns true for today', () => {
    expect(isToday('2025-03-14')).toBe(true)
  })

  it('isToday returns false for yesterday', () => {
    expect(isToday('2025-03-13')).toBe(false)
  })

  it('isToday returns false for tomorrow', () => {
    expect(isToday('2025-03-15')).toBe(false)
  })

  it('isOverdue returns true for past date', () => {
    expect(isOverdue('2025-03-13')).toBe(true)
  })

  it('isOverdue returns false for today', () => {
    expect(isOverdue('2025-03-14')).toBe(false)
  })

  it('isOverdue returns false for future date', () => {
    expect(isOverdue('2025-03-15')).toBe(false)
  })

  it('isTodayOrOverdue returns true for today', () => {
    expect(isTodayOrOverdue('2025-03-14')).toBe(true)
  })

  it('isTodayOrOverdue returns true for past date', () => {
    expect(isTodayOrOverdue('2025-03-13')).toBe(true)
  })

  it('isTodayOrOverdue returns false for future date', () => {
    expect(isTodayOrOverdue('2025-03-15')).toBe(false)
  })

  it('formatDate formats correctly', () => {
    expect(formatDate('2025-03-14')).toBe('14 Mar')
  })

  it('toDateValue returns Infinity for null', () => {
    expect(toDateValue(null)).toBe(Infinity)
  })

  it('toDateValue returns timestamp for valid date', () => {
    expect(toDateValue('2025-03-14')).toBe(new Date('2025-03-14').getTime())
  })

  it('toDateValue sorts earlier dates before later dates', () => {
    expect(toDateValue('2025-03-13')).toBeLessThan(toDateValue('2025-03-14'))
  })
})