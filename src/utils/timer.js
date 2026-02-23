/**
 * 定时任务工具
 * 用于处理每天0点定时清理本地存储的逻辑
 */
import { cleanupExpiredStorage } from './storage'

// 设置每天0点定时清理
export const setupDailyCleanup = () => {
  // 立即执行一次清理
  cleanupExpiredStorage()

  // 计算到明天0点的时间
  const now = new Date()
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
  const timeUntilMidnight = tomorrow.getTime() - now.getTime()

  // 设置定时器，每天0点执行清理
  setTimeout(() => {
    cleanupExpiredStorage()
    // 之后每天执行一次
    setInterval(cleanupExpiredStorage, 24 * 60 * 60 * 1000)
  }, timeUntilMidnight)
}

// 取消所有定时器（可选）
let cleanupTimer = null
let cleanupInterval = null

export const cancelDailyCleanup = () => {
  if (cleanupTimer) {
    clearTimeout(cleanupTimer)
    cleanupTimer = null
  }
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
  }
}
