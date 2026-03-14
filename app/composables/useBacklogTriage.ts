export const useBacklogTriage = () => {
  const isOpen = useState<boolean>('backlogTriageOpen', () => false)

  function openTriage() { isOpen.value = true }
  function closeTriage() { isOpen.value = false }

  return { isOpen, openTriage, closeTriage }
}
