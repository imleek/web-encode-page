<script setup lang="ts">
import { ref, watch } from 'vue'
import { NLayout, NLayoutContent, NGrid, NGi, NCard, NSpace, NButton, NAlert, useMessage } from 'naive-ui'
import { LockClosedOutline, LockOpenOutline, SwapHorizontalOutline, TrashOutline } from '@vicons/ionicons5'

import AppHeader from '@/components/layout/AppHeader.vue'
import AlgorithmSelector from '@/components/crypto/AlgorithmSelector.vue'
import InputArea from '@/components/crypto/InputArea.vue'
import OptionsPanel from '@/components/crypto/OptionsPanel.vue'
import HistoryPanel from '@/components/history/HistoryPanel.vue'

import { useCrypto } from '@/composables/useCrypto'
import type { HistoryRecord } from '@/core/types/crypto'

const message = useMessage()
const showHistory = ref(false)
const operation = ref<'encrypt' | 'decrypt'>('encrypt')

const {
  currentAlgorithmName,
  input,
  output,
  error,
  isLoading,
  options,
  optionsSchema,
  supportDecrypt,
  selectAlgorithm,
  encrypt,
  decrypt,
  clear,
  swap,
  copyOutput
} = useCrypto()

// 加密操作
async function handleEncrypt() {
  operation.value = 'encrypt'
  const result = await encrypt()
  if (result.success) {
    message.success('加密成功')
  }
}

// 解密操作
async function handleDecrypt() {
  operation.value = 'decrypt'
  const result = await decrypt()
  if (result.success) {
    message.success('解密成功')
  }
}

// 复制结果
async function handleCopy() {
  const success = await copyOutput()
  if (success) {
    message.success('已复制到剪贴板')
  } else {
    message.error('复制失败')
  }
}

// 交换输入输出
function handleSwap() {
  swap()
  // 如果当前是加密操作且算法支持解密，自动切换到解密
  if (operation.value === 'encrypt' && supportDecrypt.value) {
    operation.value = 'decrypt'
  } else if (operation.value === 'decrypt') {
    operation.value = 'encrypt'
  }
}

// 从历史记录恢复
function handleRestoreHistory(record: HistoryRecord) {
  selectAlgorithm(record.algorithmName)
  input.value = record.input
  output.value = record.output
  if (record.options) {
    options.value = { ...record.options }
  }
  operation.value = record.operation
  message.info(`已恢复: ${record.algorithmDisplayName}`)
}

// 监听算法变化，重置操作类型
watch(currentAlgorithmName, () => {
  if (!supportDecrypt.value) {
    operation.value = 'encrypt'
  }
})
</script>

<template>
  <NLayout class="app-layout">
    <AppHeader @toggle-history="showHistory = !showHistory" />
    
    <NLayoutContent class="app-content">
      <div class="main-container">
        <NGrid :cols="24" :x-gap="16" :y-gap="16">
          <!-- 左侧：算法选择和参数配置 -->
          <NGi :span="24" :md="8">
            <NSpace vertical :size="16">
              <AlgorithmSelector />
              
              <OptionsPanel
                v-model="options"
                :schema="optionsSchema"
                :operation="operation"
                :algorithm-name="currentAlgorithmName"
              />
            </NSpace>
          </NGi>
          
          <!-- 右侧：输入输出区域 -->
          <NGi :span="24" :md="16">
            <NSpace vertical :size="16">
              <!-- 输入区域 -->
              <InputArea
                v-model="input"
                title="输入"
                :placeholder="operation === 'encrypt' ? '请输入要加密的内容...' : '请输入要解密的内容...'"
              />
              
              <!-- 操作按钮 -->
              <NCard size="small">
                <NSpace justify="center" align="center" :wrap="true">
                  <NButton
                    type="primary"
                    :loading="isLoading && operation === 'encrypt'"
                    @click="handleEncrypt"
                    size="large"
                  >
                    <template #icon>
                      <LockClosedOutline />
                    </template>
                    加密
                  </NButton>
                  
                  <NButton
                    v-if="supportDecrypt"
                    type="info"
                    :loading="isLoading && operation === 'decrypt'"
                    @click="handleDecrypt"
                    size="large"
                  >
                    <template #icon>
                      <LockOpenOutline />
                    </template>
                    解密
                  </NButton>
                  
                  <NButton @click="handleSwap" :disabled="!output">
                    <template #icon>
                      <SwapHorizontalOutline />
                    </template>
                    交换
                  </NButton>
                  
                  <NButton @click="clear">
                    <template #icon>
                      <TrashOutline />
                    </template>
                    清空
                  </NButton>
                </NSpace>
              </NCard>
              
              <!-- 错误提示 -->
              <NAlert v-if="error" type="error" :title="error" closable @close="error = ''" />
              
              <!-- 输出区域 -->
              <InputArea
                v-model="output"
                title="输出"
                placeholder="结果将显示在这里..."
                readonly
                @clear="output = ''"
              />
              
              <!-- 复制按钮 -->
              <NButton 
                v-if="output" 
                type="primary" 
                block 
                @click="handleCopy"
              >
                复制结果
              </NButton>
            </NSpace>
          </NGi>
        </NGrid>
      </div>
    </NLayoutContent>
    
    <!-- 历史记录侧边栏 -->
    <HistoryPanel
      v-model:show="showHistory"
      @restore="handleRestoreHistory"
    />
  </NLayout>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.app-content {
  padding: 24px;
  background: var(--n-color);
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
