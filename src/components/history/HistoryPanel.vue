<script setup lang="ts">
import { 
  NDrawer, 
  NDrawerContent, 
  NList, 
  NListItem, 
  NThing, 
  NTag, 
  NButton, 
  NSpace, 
  NEmpty, 
  NPopconfirm,
  NText
} from 'naive-ui'
import { TrashOutline } from '@vicons/ionicons5'
import { useHistory } from '@/composables/useHistory'
import type { HistoryRecord } from '@/core/types/crypto'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'restore', record: HistoryRecord): void
}>()

const { historyRecords, hasHistory, deleteHistory, clearHistory, formatTime, truncateText } = useHistory()

function handleRestore(record: HistoryRecord) {
  emit('restore', record)
  emit('update:show', false)
}
</script>

<template>
  <NDrawer 
    :show="show" 
    :width="400" 
    placement="right"
    @update:show="$emit('update:show', $event)"
  >
    <NDrawerContent closable>
      <template #header>
        <div class="drawer-header">
          <span>历史记录</span>
          <NPopconfirm 
            v-if="hasHistory"
            @positive-click="clearHistory"
          >
            <template #trigger>
              <NButton size="small" quaternary type="error">
                清空
              </NButton>
            </template>
            确定要清空所有历史记录吗？
          </NPopconfirm>
        </div>
      </template>
      
      <NEmpty v-if="!hasHistory" description="暂无历史记录" />
      
      <NList v-else hoverable clickable>
        <NListItem 
          v-for="record in historyRecords" 
          :key="record.id"
          @click="handleRestore(record)"
        >
          <template #suffix>
            <NButton 
              quaternary 
              circle 
              size="tiny"
              @click.stop="deleteHistory(record.id)"
            >
              <template #icon>
                <TrashOutline />
              </template>
            </NButton>
          </template>
          
          <NThing>
            <template #header>
              <NSpace align="center">
                <span>{{ record.algorithmDisplayName }}</span>
                <NTag size="small" :type="record.operation === 'encrypt' ? 'info' : 'success'">
                  {{ record.operation === 'encrypt' ? '加密' : '解密' }}
                </NTag>
              </NSpace>
            </template>
            
            <template #description>
              <NText depth="3" style="font-size: 12px">
                {{ formatTime(record.timestamp) }}
              </NText>
            </template>
            
            <div class="record-preview">
              <div class="preview-item">
                <NText depth="3" style="font-size: 11px">输入:</NText>
                <NText code style="font-size: 12px">{{ truncateText(record.input, 40) }}</NText>
              </div>
              <div class="preview-item">
                <NText depth="3" style="font-size: 11px">输出:</NText>
                <NText code style="font-size: 12px">{{ truncateText(record.output, 40) }}</NText>
              </div>
            </div>
          </NThing>
        </NListItem>
      </NList>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 16px;
  font-weight: 500;
}

.record-preview {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-item {
  display: flex;
  gap: 8px;
  align-items: baseline;
}
</style>
