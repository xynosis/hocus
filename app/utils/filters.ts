import type { Task, TaskStatus, TaskEnergy, TaskInterest } from '~/types'

export interface TaskFilters {
  status: TaskStatus | null
  energy: TaskEnergy | null
  interest: TaskInterest | null
  projectId: string | null
  hasDueDate: boolean | null
  hasEstimate: boolean | null
}

export function emptyFilters(): TaskFilters {
  return {
    status: null,
    energy: null,
    interest: null,
    projectId: null,
    hasDueDate: null,
    hasEstimate: null,
  }
}

export function activeFilterCount(filters: TaskFilters): number {
  return Object.values(filters).filter(v => v !== null).length
}

export function applyFilters(tasks: Task[], filters: TaskFilters, projectTaskIds?: Set<string>): Task[] {
  return tasks.filter(task => {
    if (filters.status && task.status !== filters.status) return false
    if (filters.energy && task.energy !== filters.energy) return false
    if (filters.interest && task.interest !== filters.interest) return false
    if (filters.projectId !== null && projectTaskIds && !projectTaskIds.has(task.id)) return false
    if (filters.hasDueDate === true && !task.due_date) return false
    if (filters.hasDueDate === false && task.due_date) return false
    if (filters.hasEstimate === true && !task.estimated_minutes) return false
    if (filters.hasEstimate === false && task.estimated_minutes) return false
    return true
  })
}
