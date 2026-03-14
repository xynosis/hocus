<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useTasksStore } from '~/stores/tasks'
import { useProjectsStore } from '~/stores/projects'
import { usePatternsStore } from '~/stores/patterns'
import { useDependenciesStore } from '~/stores/dependencies'
import { useTaskNotesStore } from '~/stores/taskNotes'

const authStore = useAuthStore()
const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()
const patternsStore = usePatternsStore()
const dependenciesStore = useDependenciesStore()
const taskNotesStore = useTaskNotesStore()
const supabase = useSupabaseClient()

async function loadUserData() {
  await Promise.all([
    tasksStore.fetchTasks(),
    projectsStore.fetchProjects(),
    projectsStore.fetchTaskProjects(),
    projectsStore.fetchSections(),
    patternsStore.fetchPatterns(),
    dependenciesStore.fetchDependencies(),
    taskNotesStore.fetchNotes(),
  ])
  await tasksStore.inferOrbitTasks()
}

onMounted(async () => {
  await authStore.init()

  const { data } = await supabase.auth.getSession()
  if (data.session) {
    await loadUserData()
  }

  supabase.auth.onAuthStateChange(async (event) => {
    if (event === 'SIGNED_IN') {
      await loadUserData()
    } else if (event === 'SIGNED_OUT') {
      tasksStore.tasks = []
      projectsStore.projects = []
      projectsStore.taskProjects = []
      projectsStore.sections = []
      patternsStore.patterns = []
      dependenciesStore.dependencies = []
      taskNotesStore.notes = []
    }
  })
})

onErrorCaptured((err) => {
  console.error('App error:', err)
  return false
})
</script>
