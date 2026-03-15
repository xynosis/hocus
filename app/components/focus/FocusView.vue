<template>
  <div class="fixed inset-0 z-50 bg-stone-50 dark:bg-neutral-950 overflow-y-auto">
    <div class="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6 min-h-screen">

      <div class="flex items-center justify-between">
        <span
          class="text-sm font-medium px-3 py-1 rounded-full"
          :class="task?.status === 'done'
            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
            : 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300'"
        >
          Focus
        </span>
        <div class="flex items-center gap-1">
          <button
            type="button"
            aria-label="Capture a thought"
            class="text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors flex items-center gap-1.5"
            style="min-height: 44px; min-width: 44px; display: flex; align-items: center; justify-content: center;"
            @click="openParkIt"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <button
            type="button"
            class="text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            style="min-height: 44px; min-width: 44px; display: flex; align-items: center; justify-content: flex-end;"
            @click="onExitClick"
          >
            Exit
          </button>
        </div>
      </div>

      <div v-if="task" class="flex flex-col gap-2">
        <h1 class="text-4xl font-semibold leading-snug text-neutral-800 dark:text-neutral-100">
          {{ task.title }}
        </h1>
        <p class="text-sm text-neutral-400 dark:text-neutral-500">
          <span v-if="task.estimated_minutes">~{{ task.estimated_minutes }} min estimated · </span>
          <span>{{ elapsedDisplay }}</span>
        </p>
        <p
          v-if="task.notes"
          class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed"
        >
          {{ task.notes }}
        </p>
      </div>

      <!-- 90-minute hyperfocus nudge -->
      <Transition name="fade">
        <div
          v-if="showHyperfocusNudge"
          class="rounded-2xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 flex flex-col gap-2"
        >
          <p class="text-sm font-medium text-amber-800 dark:text-amber-200">90 minutes in</p>
          <p class="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
            Your brain works better with rest. Even a short break now will help.
          </p>
          <div class="flex gap-2 mt-1">
            <button
              type="button"
              class="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
              style="min-height: 44px;"
              @click="hyperfocusNudgeDismissed = true"
            >
              Keep going
            </button>
          </div>
        </div>
      </Transition>

      <div v-if="children.length > 0" class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Steps</span>
          <span class="text-sm text-neutral-400 dark:text-neutral-500">
            {{ completeCount }} of {{ children.length }} done
          </span>
        </div>
        <div class="flex flex-col gap-2">
          <ChildTaskItem
            v-for="child in children"
            :key="child.id"
            :task="child"
            :depth="0"
          />
        </div>
      </div>

      <div class="border-t border-neutral-100 dark:border-neutral-800 pt-6">
        <PomodoroTimer />
      </div>

      <!-- Ambient sound -->
      <div class="flex flex-col gap-3">
        <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Ambient sound</span>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="sound in AMBIENT_SOUNDS"
            :key="sound.id"
            type="button"
            class="flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-colors"
            :class="ambientActive === sound.id
              ? 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
              : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'"
            style="min-height: 44px;"
            @click="ambientSelect(sound.id)"
          >
            <span>{{ sound.emoji }}</span>
            <span>{{ sound.label }}</span>
          </button>
        </div>
        <input
          v-if="ambientActive"
          type="range"
          min="0"
          max="1"
          step="0.05"
          :value="ambientVolume"
          class="w-full accent-purple-500"
          @input="ambientSetVolume(Number(($event.target as HTMLInputElement).value))"
        />
      </div>

      <Transition name="celebrate">
        <div
          v-if="isComplete"
          class="fixed inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm"
        >
          <div class="flex flex-col items-center gap-6 px-8 text-center">
            <p class="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">
              All done. Great work.
            </p>
            <p class="text-sm text-neutral-400 dark:text-neutral-500">
              Take a moment to appreciate what you just finished.
            </p>
            <button
              type="button"
              class="px-6 py-3 rounded-xl bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 active:bg-purple-700 transition-colors"
              style="min-height: 44px;"
              @click="onExit"
            >
              Exit Focus
            </button>
          </div>
        </div>
      </Transition>

      <!-- Exit note prompt -->
      <Transition name="celebrate">
        <div
          v-if="showNotePrompt"
          class="fixed inset-0 z-10 flex items-end justify-center bg-black/40"
        >
          <div class="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-t-2xl px-4 pt-5 pb-8 flex flex-col gap-3 shadow-xl">
            <p class="text-base font-semibold text-neutral-800 dark:text-neutral-100">Before you go…</p>
            <p class="text-sm text-neutral-400 dark:text-neutral-500">Where did you get to? (optional)</p>
            <textarea
              ref="noteInput"
              v-model="exitNoteBody"
              placeholder="e.g. Got halfway through, blocked on X…"
              rows="3"
              class="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
            <div class="flex gap-2">
              <button
                type="button"
                class="flex-1 py-3 rounded-xl text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 transition-colors"
                style="min-height: 44px;"
                @click="saveNoteAndExit"
              >
                Save &amp; exit
              </button>
              <button
                type="button"
                class="flex-1 py-3 rounded-xl text-sm font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                style="min-height: 44px;"
                @click="onExit"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      </Transition>

    </div>
    <canvas ref="confettiCanvas" class="fixed inset-0 z-20 pointer-events-none" style="width: 100%; height: 100%;" />
  </div>
</template>

<script setup lang="ts">
import confetti from 'canvas-confetti'
import { useTasksStore } from '~/stores/tasks'
import { useTaskNotesStore } from '~/stores/taskNotes'
import ChildTaskItem from '~/components/task/ChildTaskItem.vue'
import PomodoroTimer from '~/components/focus/PomodoroTimer.vue'
import { useAmbientSound, AMBIENT_SOUNDS } from '~/composables/useAmbientSound'

const props = defineProps<{
  taskId: string
}>()

const { exitFocus } = useFocus()
const { openParkIt } = useParkIt()
const tasksStore = useTasksStore()
const taskNotesStore = useTaskNotesStore()
const { active: ambientActive, volume: ambientVolume, select: ambientSelect, setVolume: ambientSetVolume, stop: ambientStop } = useAmbientSound()

const task = computed(() => tasksStore.getTaskById(props.taskId))
const children = computed(() => tasksStore.getChildTasks(props.taskId))
const completeCount = computed(() => children.value.filter(t => t.status === 'done').length)

// Elapsed time
const sessionStart = ref(Date.now())
const elapsedSeconds = ref(0)
const completedAtStart = ref(0)
let elapsedTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  sessionStart.value = Date.now()
  completedAtStart.value = completeCount.value
  elapsedTimer = setInterval(() => {
    elapsedSeconds.value = Math.floor((Date.now() - sessionStart.value) / 1000)
  }, 1000)
})

onUnmounted(() => {
  if (elapsedTimer) clearInterval(elapsedTimer)
})

const hyperfocusNudgeDismissed = ref(false)
const showHyperfocusNudge = computed(() =>
  !hyperfocusNudgeDismissed.value && elapsedSeconds.value >= 90 * 60
)

const elapsedDisplay = computed(() => {
  const mins = Math.floor(elapsedSeconds.value / 60)
  if (mins === 0) return 'Just started'
  if (mins < 60) return `${mins} min in`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m in` : `${h}h in`
})

const isComplete = computed(() => {
  if (children.value.length > 0) {
    return completeCount.value === children.value.length
  }
  return task.value?.status === 'done'
})

const confettiCanvas = ref<HTMLCanvasElement | null>(null)
const hasCelebrated = ref(false)

watch(isComplete, (complete) => {
  if (complete && !hasCelebrated.value) {
    hasCelebrated.value = true
    nextTick(() => fireConfetti())
  }
})

function fireConfetti() {
  if (!confettiCanvas.value) return
  const myConfetti = confetti.create(confettiCanvas.value, { resize: true })
  myConfetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.5 },
    colors: ['#7F77DD', '#639922', '#EF9F27', '#378ADD', '#D4537E'],
  })
}

async function saveSessionNote() {
  const mins = Math.floor(elapsedSeconds.value / 60)
  if (mins < 1) return
  const completedThisSession = completeCount.value - completedAtStart.value
  const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const parts = [`Focus session · ${mins} min`]
  if (completedThisSession > 0) {
    parts.push(`${completedThisSession} step${completedThisSession !== 1 ? 's' : ''} completed`)
  }
  parts.push(`${date} at ${time}`)
  await taskNotesStore.addNote(props.taskId, parts.join(' · '))
}

const showNotePrompt = ref(false)
const exitNoteBody = ref('')
const noteInput = ref<HTMLTextAreaElement | null>(null)

function onExitClick() {
  if (isComplete.value) {
    onExit()
    return
  }
  showNotePrompt.value = true
  nextTick(() => noteInput.value?.focus())
}

async function saveNoteAndExit() {
  const body = exitNoteBody.value.trim()
  if (body) await taskNotesStore.addNote(props.taskId, body)
  await onExit()
}

async function onExit() {
  showNotePrompt.value = false
  exitNoteBody.value = ''
  await saveSessionNote()
  ambientStop()
  exitFocus()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.celebrate-enter-active,
.celebrate-leave-active {
  transition: opacity 0.4s ease;
}
.celebrate-enter-from,
.celebrate-leave-to {
  opacity: 0;
}
</style>
