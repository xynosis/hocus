const isFocused = ref(false)
const wordGoal = ref<number | null>(null)
const timeGoalMinutes = ref<number | null>(null)
const isTypewriter = ref(false)

export function useWriteFocus() {
  function enterFocus() {
    isFocused.value = true
  }

  function exitFocus() {
    isFocused.value = false
    wordGoal.value = null
    timeGoalMinutes.value = null
  }

  return {
    isFocused: readonly(isFocused),
    wordGoal,
    timeGoalMinutes,
    isTypewriter,
    enterFocus,
    exitFocus,
  }
}
