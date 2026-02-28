<script setup lang="ts">
import { NCard, NInput, NSpace, NButton, NText } from 'naive-ui'
import { computed } from 'vue'
import { ClipboardOutline, TrashOutline } from '@vicons/ionicons5'

const props = defineProps<{
  modelValue: string
  title?: string
  placeholder?: string
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'clear'): void
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const charCount = computed(() => props.modelValue.length)

async function copyToClipboard() {
  if (!props.modelValue) return
  try {
    await navigator.clipboard.writeText(props.modelValue)
  } catch {
    // 静默失败
  }
}

function clear() {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<template>
  <NCard :title="title || '输入'" size="small">
    <template #header-extra>
      <NSpace>
        <NText depth="3" style="font-size: 12px">
          {{ charCount }} 字符
        </NText>
        <NButton quaternary size="tiny" @click="copyToClipboard" :disabled="!modelValue">
          <template #icon>
            <ClipboardOutline />
          </template>
        </NButton>
        <NButton quaternary size="tiny" @click="clear" :disabled="!modelValue || readonly">
          <template #icon>
            <TrashOutline />
          </template>
        </NButton>
      </NSpace>
    </template>
    
    <NInput
      v-model:value="inputValue"
      type="textarea"
      :placeholder="placeholder || '请输入内容...'"
      :readonly="readonly"
      :autosize="{ minRows: 6, maxRows: 12 }"
      style="font-family: monospace"
    />
  </NCard>
</template>
