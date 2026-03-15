export const useEndOfDaySweep = () => {
  const isOpen = useState<boolean>('endOfDaySweepOpen', () => false)

  function openSweep() { isOpen.value = true }
  function closeSweep() { isOpen.value = false }

  return { isOpen, openSweep, closeSweep }
}
