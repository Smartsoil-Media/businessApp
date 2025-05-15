// Point values for different activities
export const POINT_VALUES = {
  TASK_COMPLETE: 10,
  IDEA_SHARED: 5,
  REPLY_ADDED: 2,
  TASK_ASSIGNED: 3,
  STREAK_BONUS: (streak: number) => Math.min(streak * 2, 20), // 2 points per day in streak, max 20
  CHALLENGE_COMPLETE: 25,
}

export const LEVEL_THRESHOLDS = [
  { level: 1, points: 0, title: "Soil Novice" },
  { level: 2, points: 50, title: "Sprout Grower" },
  { level: 3, points: 150, title: "Field Scout" },
  { level: 4, points: 300, title: "Crop Specialist" },
  { level: 5, points: 500, title: "Harvest Master" },
  { level: 6, points: 750, title: "Soil Scientist" },
  { level: 7, points: 1000, title: "Agriculture Guru" },
  { level: 8, points: 1500, title: "Ecosystem Engineer" },
  { level: 9, points: 2000, title: "Terrain Titan" },
  { level: 10, points: 3000, title: "Smartsoil Legend" },
]

// Get current level based on points
export function getUserLevel(points: number): {
  level: number
  title: string
  nextLevel?: { points: number; title: string }
} {
  let userLevel = LEVEL_THRESHOLDS[0]
  let nextLevel = LEVEL_THRESHOLDS[1]

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i].points) {
      userLevel = LEVEL_THRESHOLDS[i]
      nextLevel = LEVEL_THRESHOLDS[i + 1]
      break
    }
  }

  return {
    level: userLevel.level,
    title: userLevel.title,
    nextLevel: nextLevel ? nextLevel : undefined,
  }
}

// Get progress to next level as percentage
export function getLevelProgress(points: number): number {
  const { level, nextLevel } = getUserLevel(points)

  if (!nextLevel) return 100 // Max level reached

  const currentThreshold = LEVEL_THRESHOLDS.find((t) => t.level === level)?.points || 0
  const nextThreshold = nextLevel.points

  const pointsInCurrentLevel = points - currentThreshold
  const pointsRequiredForNextLevel = nextThreshold - currentThreshold

  return Math.min(Math.round((pointsInCurrentLevel / pointsRequiredForNextLevel) * 100), 100)
}

// Get formatted point value with animation class
export function formatPoints(points: number): string {
  return points.toLocaleString()
}

// Get week number from date
export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

// Check if two dates are in the same week
export function isSameWeek(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() && getWeekNumber(date1) === getWeekNumber(date2)
}

// Get start date of current week (Sunday)
export function getStartOfWeek(date: Date = new Date()): Date {
  const result = new Date(date)
  const day = result.getDay()
  result.setDate(result.getDate() - day)
  result.setHours(0, 0, 0, 0)
  return result
}

// Get end date of current week (Saturday)
export function getEndOfWeek(date: Date = new Date()): Date {
  const result = new Date(date)
  const day = result.getDay()
  result.setDate(result.getDate() + (6 - day))
  result.setHours(23, 59, 59, 999)
  return result
}
