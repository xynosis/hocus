import { defineStore } from 'pinia'
import type { TaskDependency } from '~/types'
import { useTasksStore } from '~/stores/tasks'

export const useDependenciesStore = defineStore('dependencies', () => {
  const supabase = useSupabaseClient()
  const authStore = useAuthStore()
  const tasksStore = useTasksStore()

  const dependencies = ref<TaskDependency[]>([])

  async function fetchDependencies() {
    const { data } = await supabase.from('task_dependencies').select('*')
    dependencies.value = (data as TaskDependency[]) ?? []
  }

  async function addDependency(taskId: string, dependsOnId: string) {
    const dep: TaskDependency = { task_id: taskId, depends_on_id: dependsOnId, user_id: authStore.user!.id }
    dependencies.value.push(dep)
    const { error } = await supabase.from('task_dependencies').insert(dep)
    if (error) {
      console.error('Failed to add dependency:', error.message)
      dependencies.value = dependencies.value.filter(
        d => !(d.task_id === taskId && d.depends_on_id === dependsOnId)
      )
    }
  }

  async function removeDependency(taskId: string, dependsOnId: string) {
    const previous = [...dependencies.value]
    dependencies.value = dependencies.value.filter(
      d => !(d.task_id === taskId && d.depends_on_id === dependsOnId)
    )
    const { error } = await supabase
      .from('task_dependencies')
      .delete()
      .eq('task_id', taskId)
      .eq('depends_on_id', dependsOnId)
    if (error) {
      console.error('Failed to remove dependency:', error.message)
      dependencies.value = previous
    }
  }

  function getBlockerIds(taskId: string): string[] {
    return dependencies.value.filter(d => d.task_id === taskId).map(d => d.depends_on_id)
  }

  function isBlocked(taskId: string): boolean {
    return getBlockerIds(taskId).some(id => {
      const blocker = tasksStore.getTaskById(id)
      return blocker && blocker.status !== 'done'
    })
  }

  return { dependencies, fetchDependencies, addDependency, removeDependency, getBlockerIds, isBlocked }
})
