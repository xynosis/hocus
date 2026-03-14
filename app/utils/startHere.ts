import type { Task } from '~/types'
import { inferTaskSize } from '~/utils/taskSize'

function deadlineScore(task: Task): number {
  if (!task.due_date) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(task.due_date)
  due.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 5   // overdue
  if (diffDays === 0) return 4  // due today
  if (diffDays <= 3) return 2   // due within 3 days
  return 0
}

export function scoreTask(task: Task): number {
  let score = 0

  // Energy: easier = higher score (lower barrier to start)
  if (task.energy === 'easy') score += 3
  else if (task.energy === 'moderate') score += 2
  else if (task.energy === 'heavy') score += 1

  // Interest: more interest = higher score
  if (task.interest === 'want_to') score += 3
  else if (task.interest === 'neutral') score += 2
  else if (task.interest === 'dreading') score += 1

  // Deadline pressure
  score += deadlineScore(task)

  // Status boosts
  if (task.status === 'in_progress') score += 2
  if (task.status === 'orbit') score += 3  // already started, lower re-entry cost

  // Small estimate = lower friction
  const size = inferTaskSize(task.estimated_minutes)
  if (size === 'S' || size === 'M') score += 1

  return score
}

export function pickStartHereTask(tasks: Task[]): Task | null {
  const candidates = tasks.filter(t => t.status !== 'done')
  if (candidates.length === 0) return null
  return candidates.reduce((best, task) =>
    scoreTask(task) >= scoreTask(best) ? task : best
  )
}
