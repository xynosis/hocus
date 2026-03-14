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
import { useSubtasksStore } from '~/stores/subtasks'
import { useProjectsStore } from '~/stores/projects'

const authStore = useAuthStore()
const tasksStore = useTasksStore()
const subtasksStore = useSubtasksStore()
const projectsStore = useProjectsStore()
const supabase = useSupabaseClient()

async function loadUserData() {
  await Promise.all([
    tasksStore.fetchTasks(),
    subtasksStore.fetchAllSubtasks(),
    projectsStore.fetchProjects(),
    projectsStore.fetchTaskProjects(),
  ])
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
      subtasksStore.subtasks = []
      projectsStore.projects = []
      projectsStore.taskProjects = []
    }
  })
})

onErrorCaptured((err) => {
  console.error('App error:', err)
  return false
})
</script>