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
    </div>
  </div>
</template>

<script setup lang="ts">
const WORK_SECONDS = 25 * 60
const BREAK_SECONDS = 5 * 60

const phase = ref<'work' | 'break'>('work')
const remaining = ref(WORK_SECONDS)
const isRunning = ref(false)
let interval: ReturnType<typeof setInterval> | null = null

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
  remaining.value = phase.value === 'work' ? WORK_SECONDS : BREAK_SECONDS
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
  remaining.value = WORK_SECONDS
  saveState()
}

function saveState() {
  sessionStorage.setItem('pomodoro_phase', phase.value)
  sessionStorage.setItem('pomodoro_remaining', String(remaining.value))
  sessionStorage.setItem('pomodoro_running', String(isRunning.value))
  sessionStorage.setItem('pomodoro_timestamp', String(Date.now()))
}

function restoreState() {
  const savedPhase = sessionStorage.getItem('pomodoro_phase') as 'work' | 'break' | null
  const savedRemaining = sessionStorage.getItem('pomodoro_remaining')
  const savedRunning = sessionStorage.getItem('pomodoro_running')
  const savedTimestamp = sessionStorage.getItem('pomodoro_timestamp')

  if (!savedPhase || !savedRemaining || !savedTimestamp) return

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