export type TaskStatus = 'todo' | 'in_progress' | 'orbit' | 'done'

export type TaskColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink'

export type TaskEnergy = 'easy' | 'moderate' | 'heavy'

export type TaskInterest = 'dreading' | 'neutral' | 'want_to'

export type TaskSize = 'S' | 'M' | 'L' | 'XL'

export type TaskRecurrence = 'daily' | 'weekly' | 'monthly'

export interface Task {
  id: string
  user_id: string
  title: string
  notes: string | null
  color_tag: TaskColor | null
  working_on_date: string | null
  due_date: string | null
  status: TaskStatus
  energy: TaskEnergy | null
  interest: TaskInterest | null
  estimated_minutes: number | null
  parent_id: string | null
  pattern_id: string | null
  recurrence: TaskRecurrence | null
  section_id: string | null
  is_container: boolean
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface ProjectSection {
  id: string
  project_id: string
  user_id: string
  name: string
  sort_order: number
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  due_date: string | null
  created_at: string
  updated_at: string
  color_tag: TaskColor | null
}

export interface TaskProject {
  task_id: string
  project_id: string
  user_id: string
}

export interface TaskDependency {
  task_id: string
  depends_on_id: string
  user_id: string
}

export interface UserPattern {
  id: string
  user_id: string
  name: string
  steps: string[]
  created_at: string
}