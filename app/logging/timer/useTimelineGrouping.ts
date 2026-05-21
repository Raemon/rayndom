import { useMemo } from 'react'
import type { TagInstance, Timeblock } from '../types'
import { dayKey } from '../lib/timeUtils'

// Shared day/week/month grouping used by both the main timer page and the zen page.
// Buckets timeblocks and tag instances by day, then groups previous days into
// months -> weeks -> days so they can be rendered with collapsible sections instead
// of mounting an editor for every historical block.
export const useTimelineGrouping = (timeblocks: Timeblock[], tagInstances: TagInstance[]) => {
  const timeblocksByDay = useMemo(() => {
    const map = new Map<string, Timeblock[]>()
    for (const tb of timeblocks) {
      const key = dayKey(new Date(tb.datetime))
      const existing = map.get(key)
      if (existing) existing.push(tb)
      else map.set(key, [tb])
    }
    return map
  }, [timeblocks])

  const tagInstancesByDay = useMemo(() => {
    const map = new Map<string, TagInstance[]>()
    for (const ti of tagInstances) {
      const key = dayKey(new Date(ti.datetime))
      const existing = map.get(key)
      if (existing) existing.push(ti)
      else map.set(key, [ti])
    }
    return map
  }, [tagInstances])

  const groupedDays = useMemo(() => {
    const getMonday = (date: Date) => {
      const d = new Date(date)
      const dow = d.getDay()
      d.setDate(d.getDate() - dow + (dow === 0 ? -6 : 1))
      d.setHours(0, 0, 0, 0)
      return d
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const currentMonday = getMonday(today)
    const allDays: Date[] = []
    for (let i = 0; i < 14; i++) {
      const day = new Date()
      day.setDate(day.getDate() - i)
      day.setHours(0, 0, 0, 0)
      allDays.push(day)
    }
    const allDayKeys = new Set(allDays.map(d => dayKey(d)))
    const historicalSources = [...timeblocks.map(tb => tb.datetime), ...tagInstances.map(ti => ti.datetime)]
    for (const dt of historicalSources) {
      const d = new Date(dt); d.setHours(0, 0, 0, 0)
      const key = dayKey(d)
      if (!allDayKeys.has(key)) { allDayKeys.add(key); allDays.push(new Date(d)) }
    }
    allDays.sort((a, b) => b.getTime() - a.getTime())
    const currentWeekDays = allDays.filter(d => d >= currentMonday)
    const previousDays = allDays.filter(d => d < currentMonday)
    const weekGroupsMap = new Map<string, { monday: Date, days: Date[] }>()
    for (const day of previousDays) {
      const mon = getMonday(day)
      const key = dayKey(mon)
      if (!weekGroupsMap.has(key)) weekGroupsMap.set(key, { monday: mon, days: [] })
      weekGroupsMap.get(key)!.days.push(day)
    }
    const previousWeeks = [...weekGroupsMap.values()].sort((a, b) => b.monday.getTime() - a.monday.getTime())
    const monthGroupsMap = new Map<string, { month: Date, weeks: { monday: Date, days: Date[] }[] }>()
    for (const week of previousWeeks) {
      const monthKey = `${week.monday.getFullYear()}-${String(week.monday.getMonth() + 1).padStart(2, '0')}`
      if (!monthGroupsMap.has(monthKey)) monthGroupsMap.set(monthKey, { month: new Date(week.monday.getFullYear(), week.monday.getMonth(), 1), weeks: [] })
      monthGroupsMap.get(monthKey)!.weeks.push(week)
    }
    const previousMonths = [...monthGroupsMap.values()].sort((a, b) => b.month.getTime() - a.month.getTime())
    return { today, currentWeekDays, previousMonths }
  }, [timeblocks, tagInstances])

  const newestKeys = useMemo(() => {
    if (groupedDays.previousMonths.length === 0) return { month: null as string | null, week: null as string | null }
    const m = groupedDays.previousMonths[0].month
    const month = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`
    const weeks = groupedDays.previousMonths[0].weeks
    const week = weeks.length > 0
      ? dayKey(weeks.reduce((a, b) => a.monday.getTime() > b.monday.getTime() ? a : b).monday)
      : null
    return { month, week }
  }, [groupedDays])

  return { timeblocksByDay, tagInstancesByDay, groupedDays, newestKeys }
}
