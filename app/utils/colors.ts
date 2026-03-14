import type { TaskColor } from '~/types'

export const COLOR_MAP: Record<TaskColor, string> = {
  red:    '#E24B4A',
  orange: '#EF9F27',
  yellow: '#EF9F27',
  green:  '#639922',
  blue:   '#378ADD',
  purple: '#7F77DD',
  pink:   '#D4537E',
}

export function getColorHex(color: TaskColor | string | null): string | null {
  if (!color) return null
  return COLOR_MAP[color as TaskColor] ?? null
}