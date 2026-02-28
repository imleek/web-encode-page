<script setup lang="ts">
import { NSelect, NCard, NText, NSpace, NTag } from 'naive-ui'
import { computed } from 'vue'
import { useCrypto } from '@/composables/useCrypto'

const { currentAlgorithmName, currentAlgorithm, groupedAlgorithms, selectAlgorithm } = useCrypto()

// 转换为 NSelect 需要的格式
const selectOptions = computed(() => {
  return groupedAlgorithms.value.map(group => ({
    type: 'group' as const,
    label: group.label,
    key: group.type,
    children: group.algorithms.map(algo => ({
      label: algo.displayName,
      value: algo.name,
      description: algo.description
    }))
  }))
})

function handleSelect(value: string) {
  selectAlgorithm(value)
}
</script>

<template>
  <NCard title="选择算法" size="small">
    <NSelect
      :value="currentAlgorithmName"
      :options="selectOptions"
      placeholder="请选择加密算法"
      filterable
      @update:value="handleSelect"
    />
    
    <div v-if="currentAlgorithm" class="algorithm-info">
      <NSpace align="center">
        <NTag :type="currentAlgorithm.supportDecrypt ? 'success' : 'warning'" size="small">
          {{ currentAlgorithm.supportDecrypt ? '支持解密' : '仅加密' }}
        </NTag>
      </NSpace>
      <NText depth="3" class="description">
        {{ currentAlgorithm.description }}
      </NText>
    </div>
  </NCard>
</template>

<style scoped>
.algorithm-info {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.description {
  font-size: 13px;
  line-height: 1.5;
}
</style>
