export const useParkIt = () => {
  const isOpen = useState<boolean>('parkItOpen', () => false)
  function openParkIt() { isOpen.value = true }
  function closeParkIt() { isOpen.value = false }
  return { isOpen, openParkIt, closeParkIt }
}
