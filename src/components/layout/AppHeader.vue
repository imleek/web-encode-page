<script setup lang="ts">
import { NLayoutHeader, NSpace, NButton, NTooltip, NBadge } from 'naive-ui'
import { MoonOutline, SunnyOutline, TimeOutline } from '@vicons/ionicons5'
import { useTheme } from '@/composables/useTheme'
import { useHistory } from '@/composables/useHistory'

const { isDark, toggleTheme } = useTheme()
const { historyCount, hasHistory } = useHistory()

defineEmits<{
  (e: 'toggleHistory'): void
}>()
</script>

<template>
  <NLayoutHeader bordered class="app-header">
    <div class="header-content">
      <div class="logo">
        <span class="logo-icon">🔐</span>
        <span class="logo-text">在线加解密工具</span>
      </div>
      
      <NSpace>
        <NTooltip trigger="hover">
          <template #trigger>
            <NBadge :value="historyCount" :max="99" :show="hasHistory">
              <NButton quaternary circle @click="$emit('toggleHistory')">
                <template #icon>
                  <TimeOutline />
                </template>
              </NButton>
            </NBadge>
          </template>
          历史记录
        </NTooltip>
        
        <NTooltip trigger="hover">
          <template #trigger>
            <NButton quaternary circle @click="toggleTheme">
              <template #icon>
                <MoonOutline v-if="isDark" />
                <SunnyOutline v-else />
              </template>
            </NButton>
          </template>
          {{ isDark ? '切换到浅色模式' : '切换到深色模式' }}
        </NTooltip>
      </NSpace>
    </div>
  </NLayoutHeader>
</template>

<style scoped>
.app-header {
  height: 60px;
  padding: 0 24px;
}

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.logo-icon {
  font-size: 24px;
}
</style>
