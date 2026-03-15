import type { Task } from '~/types'

export const useOrbitWarming = () => {
  const orbitTask = useState<Task | null>('orbitWarmingTask', () => null)
  const isOpen = useState<boolean>('orbitWarmingOpen', () => false)

  function open(task: Task) {
    orbitTask.value = task
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return { orbitTask, isOpen, open, close }
}
