export const useAvoidance = () => {
  const isOpen = useState<boolean>('avoidanceOpen', () => false)
  function openAvoidance() { isOpen.value = true }
  function closeAvoidance() { isOpen.value = false }
  return { isOpen, openAvoidance, closeAvoidance }
}
