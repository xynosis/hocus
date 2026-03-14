import type { TaskSize } from '~/types'

export function inferTaskSize(minutes: number | null | undefined): TaskSize | null {
  if (!minutes || minutes <= 0) return null
  if (minutes <= 15) return 'S'
  if (minutes <= 45) return 'M'
  if (minutes <= 90) return 'L'
  return 'XL'
}

export function taskSizeLabel(size: TaskSize): string {
  return size
}

export const TASK_SIZE_NUDGE_THRESHOLD: TaskSize[] = ['L', 'XL']
