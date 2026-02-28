import { ref, computed } from 'vue'
import type { HistoryRecord } from '@/core/types/crypto'

const HISTORY_KEY = 'encoder-history'
const MAX_HISTORY = 100

// 从 localStorage 读取历史记录
function getStoredHistory(): HistoryRecord[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// 保存历史记录到 localStorage
function saveHistory(records: HistoryRecord[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(records))
  } catch {
    // 存储失败时清理旧记录
    const trimmed = records.slice(0, Math.floor(MAX_HISTORY / 2))
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
  }
}

// 生成唯一 ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// 全局历史记录状态
const historyRecords = ref<HistoryRecord[]>(getStoredHistory())

export function useHistory() {
  // 历史记录数量
  const historyCount = computed(() => historyRecords.value.length)

  // 是否有历史记录
  const hasHistory = computed(() => historyRecords.value.length > 0)

  // 添加历史记录（自动去重）
  function addHistory(record: Omit<HistoryRecord, 'id' | 'timestamp'>) {
    // 检查是否存在相同记录（算法、操作、输入、输出都相同）
    const isDuplicate = historyRecords.value.some(
      r => r.algorithmName === record.algorithmName &&
           r.operation === record.operation &&
           r.input === record.input &&
           r.output === record.output
    )
    
    if (isDuplicate) {
      return // 跳过重复记录
    }

    const newRecord: HistoryRecord = {
      ...record,
      id: generateId(),
      timestamp: Date.now()
    }

    // 添加到开头
    historyRecords.value.unshift(newRecord)

    // 限制数量
    if (historyRecords.value.length > MAX_HISTORY) {
      historyRecords.value = historyRecords.value.slice(0, MAX_HISTORY)
    }

    // 持久化
    saveHistory(historyRecords.value)
  }

  // 获取所有历史记录
  function getHistory(): HistoryRecord[] {
    return historyRecords.value
  }

  // 获取单条历史记录
  function getHistoryById(id: string): HistoryRecord | undefined {
    return historyRecords.value.find(r => r.id === id)
  }

  // 删除单条历史记录
  function deleteHistory(id: string) {
    const index = historyRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      historyRecords.value.splice(index, 1)
      saveHistory(historyRecords.value)
    }
  }

  // 清空所有历史记录
  function clearHistory() {
    historyRecords.value = []
    localStorage.removeItem(HISTORY_KEY)
  }

  // 格式化时间戳
  function formatTime(timestamp: number): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - timestamp

    // 1 分钟内
    if (diff < 60 * 1000) {
      return '刚刚'
    }

    // 1 小时内
    if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))} 分钟前`
    }

    // 今天
    if (date.toDateString() === now.toDateString()) {
      return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }

    // 昨天
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
      return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }

    // 其他
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  // 截断文本
  function truncateText(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return {
    // 状态
    historyRecords,
    historyCount,
    hasHistory,
    // 方法
    addHistory,
    getHistory,
    getHistoryById,
    deleteHistory,
    clearHistory,
    formatTime,
    truncateText
  }
}
