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

  let dataLoaded = false

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session && !dataLoaded && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
      dataLoaded = true
      await loadUserData()
    } else if (event === 'SIGNED_OUT') {
      dataLoaded = false
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
