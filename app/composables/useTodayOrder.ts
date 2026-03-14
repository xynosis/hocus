import type { Task } from '~/types'

export function useTodayOrder() {
  const today = new Date().toISOString().split('T')[0]!
  const key = `today-order-${today}`

  function loadOrder(): string[] {
    if (typeof localStorage === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem(key) ?? '[]') as string[]
    } catch {
      return []
    }
  }

  function saveOrder(ids: string[]) {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(key, JSON.stringify(ids))
  }

  function applyOrder(tasks: Task[]): Task[] {
    const order = loadOrder()
    if (order.length === 0) return tasks
    const orderMap = new Map(order.map((id, i) => [id, i]))
    return [...tasks].sort((a, b) => {
      const aIdx = orderMap.get(a.id) ?? Infinity
      const bIdx = orderMap.get(b.id) ?? Infinity
      if (aIdx === Infinity && bIdx === Infinity) return 0
      return aIdx - bIdx
    })
  }

  return { loadOrder, saveOrder, applyOrder }
}
