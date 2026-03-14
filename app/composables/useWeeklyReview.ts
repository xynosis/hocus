export const useWeeklyReview = () => {
  const isOpen = useState<boolean>('weeklyReviewOpen', () => false)

  function openReview() { isOpen.value = true }
  function closeReview() { isOpen.value = false }

  return { isOpen, openReview, closeReview }
}
