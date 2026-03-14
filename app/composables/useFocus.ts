export const useFocus = () => {
  const focusTaskId = useState<string | null>('focusTaskId', () => null)

  function enterFocus(taskId: string) {
    focusTaskId.value = taskId
  }

  function exitFocus() {
    focusTaskId.value = null
  }

  return {
    focusTaskId,
    enterFocus,
    exitFocus,
  }
}