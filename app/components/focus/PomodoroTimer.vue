<template>
  <div class="flex flex-col items-center gap-4">
    <div
      class="flex flex-col items-center justify-center rounded-full transition-colors duration-500"
      :class="phase === 'work'
        ? 'bg-purple-50 dark:bg-purple-950'
        : 'bg-green-50 dark:bg-green-950'"
      style="width: 160px; height: 160px;"
    >
      <span
        class="text-4xl font-semibold tabular-nums transition-colors duration-500"
        :class="phase === 'work'
          ? 'text-purple-600 dark:text-purple-300'
          : 'text-green-600 dark:text-green-300'"
      >
        {{ formattedTime }}
      </span>
      <span
        class="text-xs font-medium mt-1 transition-colors duration-500"
        :class="phase === 'work'
          ? 'text-purple-400 dark:text-purple-500'
          : 'text-green-400 dark:text-green-500'"
      >
        {{ phase === 'work' ? 'Focus' : 'Break' }}
      </span>
    </div>

    <div class="flex gap-3">
      <button
        type="button"
        class="px-5 py-2 rounded-xl text-sm font-medium transition-colors"
        :class="phase === 'work'
          ? 'bg-purple-500 hover:bg-purple-600 text-white'
          : 'bg-green-500 hover:bg-green-600 text-white'"
        style="min-height: 44px; min-width: 88px;"
        @click="toggleTimer"
      >
        {{ isRunning ? 'Pause' : 'Start' }}
      </button>
      <button
        type="button"
        class="px-5 py-2 rounded-xl text-sm font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        style="min-height: 44px;"
        @click="resetTimer"
      >
        Reset
      </button>
      <button
        type="button"
        class="px-3 py-2 rounded-xl text-sm border transition-colors"
        :class="showSettings
          ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
          : 'border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'"
        style="min-height: 44px;"
        aria-label="Timer settings"
        @click="showSettings = !showSettings"
      >
        ⚙︎
      </button>
    </div>

    <Transition name="expand">
      <div v-if="showSettings" class="w-full flex flex-col gap-3 pt-1">
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs text-neutral-500 dark:text-neutral-400 text-center">Focus (min)</label>
            <input
              v-model.number="draftWork"
              type="number"
              min="1"
              max="120"
              class="w-full rounded-xl border px-3 py-2 text-sm text-center bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-neutral-500 dark:text-neutral-400 text-center">Break (min)</label>
            <input
              v-model.number="draftBreak"
              type="number"
              min="1"
              max="60"
              class="w-full rounded-xl border px-3 py-2 text-sm text-center bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>
        <button
          type="button"
          class="w-full py-2 rounded-xl text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 active:opacity-80 transition-colors"
          style="min-height: 44px;"
          @click="saveDurations"
        >
          Save
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const DEFAULT_WORK = 25
const DEFAULT_BREAK = 5

function loadWorkMinutes(): number {
  const v = localStorage.getItem('pomodoro_work_minutes')
  return v ? Math.max(1, parseInt(v)) : DEFAULT_WORK
}

function loadBreakMinutes(): number {
  const v = localStorage.getItem('pomodoro_break_minutes')
  return v ? Math.max(1, parseInt(v)) : DEFAULT_BREAK
}

const workMinutes = ref(DEFAULT_WORK)
const breakMinutes = ref(DEFAULT_BREAK)

const workSeconds = computed(() => workMinutes.value * 60)
const breakSeconds = computed(() => breakMinutes.value * 60)

const phase = ref<'work' | 'break'>('work')
const remaining = ref(workSeconds.value)
const isRunning = ref(false)
let interval: ReturnType<typeof setInterval> | null = null

// Settings UI
const showSettings = ref(false)
const draftWork = ref(DEFAULT_WORK)
const draftBreak = ref(DEFAULT_BREAK)

function saveDurations() {
  const newWork = Math.max(1, draftWork.value || DEFAULT_WORK)
  const newBreak = Math.max(1, draftBreak.value || DEFAULT_BREAK)
  workMinutes.value = newWork
  breakMinutes.value = newBreak
  localStorage.setItem('pomodoro_work_minutes', String(newWork))
  localStorage.setItem('pomodoro_break_minutes', String(newBreak))
  // Reset timer to new duration if not running
  if (!isRunning.value) {
    phase.value = 'work'
    remaining.value = workSeconds.value
    saveState()
  }
  showSettings.value = false
}

const formattedTime = computed(() => {
  const m = Math.floor(remaining.value / 60).toString().padStart(2, '0')
  const s = (remaining.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

function playChime() {
  try {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(phase.value === 'work' ? 528 : 396, ctx.currentTime)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 1.2)
  } catch {
    // Audio not available — fail silently
  }
}

function transitionPhase() {
  phase.value = phase.value === 'work' ? 'break' : 'work'
  remaining.value = phase.value === 'work' ? workSeconds.value : breakSeconds.value
  playChime()
  saveState()
}

function tick() {
  if (remaining.value <= 1) {
    transitionPhase()
    return
  }
  remaining.value--
  saveState()
}

function toggleTimer() {
  if (isRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

function startTimer() {
  isRunning.value = true
  interval = setInterval(tick, 1000)
  saveState()
}

function pauseTimer() {
  isRunning.value = false
  if (interval) clearInterval(interval)
  saveState()
}

function resetTimer() {
  isRunning.value = false
  if (interval) clearInterval(interval)
  phase.value = 'work'
  remaining.value = workSeconds.value
  saveState()
}

function saveState() {
  sessionStorage.setItem('pomodoro_phase', phase.value)
  sessionStorage.setItem('pomodoro_remaining', String(remaining.value))
  sessionStorage.setItem('pomodoro_running', String(isRunning.value))
  sessionStorage.setItem('pomodoro_timestamp', String(Date.now()))
}

function restoreState() {
  workMinutes.value = loadWorkMinutes()
  breakMinutes.value = loadBreakMinutes()
  draftWork.value = workMinutes.value
  draftBreak.value = breakMinutes.value

  const savedPhase = sessionStorage.getItem('pomodoro_phase') as 'work' | 'break' | null
  const savedRemaining = sessionStorage.getItem('pomodoro_remaining')
  const savedRunning = sessionStorage.getItem('pomodoro_running')
  const savedTimestamp = sessionStorage.getItem('pomodoro_timestamp')

  if (!savedPhase || !savedRemaining || !savedTimestamp) {
    remaining.value = workSeconds.value
    return
  }

  phase.value = savedPhase
  let remainingSeconds = parseInt(savedRemaining)

  if (savedRunning === 'true') {
    const elapsed = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000)
    remainingSeconds = Math.max(0, remainingSeconds - elapsed)
  }

  remaining.value = remainingSeconds

  if (savedRunning === 'true') {
    startTimer()
  }
}

onMounted(() => {
  restoreState()
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.2s ease;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
}
</style>
