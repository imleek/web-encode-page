import { ref, computed, watch } from 'vue'
import { darkTheme, type GlobalTheme } from 'naive-ui'

const THEME_KEY = 'encoder-theme'

// 从 localStorage 读取主题设置
function getStoredTheme(): boolean {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored !== null) {
    return stored === 'dark'
  }
  // 默认跟随系统主题
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// 全局状态
const isDark = ref(getStoredTheme())

export function useTheme() {
  // 计算属性：当前主题
  const theme = computed<GlobalTheme | null>(() => {
    return isDark.value ? darkTheme : null
  })

  // 主题名称
  const themeName = computed(() => isDark.value ? '深色' : '浅色')

  // 切换主题
  function toggleTheme() {
    isDark.value = !isDark.value
  }

  // 设置主题
  function setTheme(dark: boolean) {
    isDark.value = dark
  }

  // 监听变化并持久化
  watch(isDark, (value) => {
    localStorage.setItem(THEME_KEY, value ? 'dark' : 'light')
    // 更新 body 类名以便全局样式使用
    document.body.classList.toggle('dark', value)
  }, { immediate: true })

  return {
    isDark,
    theme,
    themeName,
    toggleTheme,
    setTheme
  }
}
