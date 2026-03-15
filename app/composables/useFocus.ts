export const useFocus = () => {
  const focusTaskId = useState<string | null>('focusTaskId', () => null)
  const pickUpTaskId = useState<string | null>('pickUpTaskId', () => null)

  function enterFocus(taskId: string) {
    const tasksStore = useTasksStore()
    const children = tasksStore.getChildTasks(taskId)
    const hasPriorProgress = children.length > 0 && children.some(c => c.status === 'done')

    // Atomic tasks: set in_progress on focus entry so orbit inference has something to track
    if (children.length === 0) {
      const task = tasksStore.getTaskById(taskId)
      if (task && task.status === 'todo') {
        tasksStore.setTaskStatus(taskId, 'in_progress')
      }
    }

    if (hasPriorProgress) {
      pickUpTaskId.value = taskId
    } else {
      focusTaskId.value = taskId
    }
  }

  function confirmPickUp(taskId: string) {
    pickUpTaskId.value = null
    focusTaskId.value = taskId
  }

  function dismissPickUp() {
    pickUpTaskId.value = null
  }

  function exitFocus() {
    focusTaskId.value = null
  }

  return {
    focusTaskId,
    pickUpTaskId,
    enterFocus,
    confirmPickUp,
    dismissPickUp,
    exitFocus,
  }
}