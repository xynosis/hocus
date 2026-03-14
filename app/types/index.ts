export type TaskStatus = 'todo' | 'in_progress' | 'done'

export type TaskColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink'

export interface Task {
  id: string
  user_id: string
  title: string
  notes: string | null
  color_tag: TaskColor | null
  working_on_date: string | null
  due_date: string | null
  status: TaskStatus
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface Subtask {
  id: string
  task_id: string
  user_id: string
  title: string
  is_complete: boolean
  estimated_minutes: number | null
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