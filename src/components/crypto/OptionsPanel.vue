<script setup lang="ts">
import { NCard, NForm, NFormItem, NInput, NSelect, NText, NButton } from 'naive-ui'
import { computed } from 'vue'
import type { CryptoOptions, OptionsSchema, OptionField } from '@/core/types/crypto'
import { generateRSAKeyPair } from '@/algorithms/asymmetric/RSA'
import { generateRSA2KeyPair } from '@/algorithms/asymmetric/RSA2'
import { KeyOutline } from '@vicons/ionicons5'

const props = defineProps<{
  modelValue: CryptoOptions
  schema: OptionsSchema
  operation: 'encrypt' | 'decrypt'
  algorithmName?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: CryptoOptions): void
}>()

const currentFields = computed(() => {
  return props.operation === 'encrypt' ? props.schema.encrypt : props.schema.decrypt
})

const hasOptions = computed(() => currentFields.value.length > 0)

// 检查字段是否应该被禁用
function isFieldDisabled(field: OptionField): boolean {
  if (!field.disabledWhen) return false
  
  const { field: depField, values } = field.disabledWhen
  const currentValue = props.modelValue[depField] ?? getFieldDefault(depField)
  return values.includes(currentValue as string | number)
}

// 获取字段的默认值
function getFieldDefault(fieldKey: keyof CryptoOptions): string | number | undefined {
  const field = currentFields.value.find(f => f.key === fieldKey)
  return field?.default
}

function updateOption(key: string, value: string | number) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}

// RSA 密钥生成
const isRSA = computed(() => props.algorithmName === 'RSA' || props.algorithmName === 'RSA2')
const isGenerating = computed(() => false)

async function generateKeyPair() {
  try {
    let keyPair: { publicKey: string; privateKey: string }
    
    if (props.algorithmName === 'RSA') {
      keyPair = await generateRSAKeyPair(2048)
    } else {
      keyPair = await generateRSA2KeyPair(2048)
    }
    
    emit('update:modelValue', {
      ...props.modelValue,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey
    })
  } catch (error) {
    console.error('密钥生成失败:', error)
  }
}
</script>

<template>
  <NCard v-if="hasOptions || isRSA" title="参数配置" size="small">
    <template v-if="isRSA" #header-extra>
      <NButton size="small" @click="generateKeyPair" :loading="isGenerating">
        <template #icon>
          <KeyOutline />
        </template>
        生成密钥对
      </NButton>
    </template>
    
    <NForm label-placement="left" label-width="auto" size="small">
      <NFormItem 
        v-for="field in currentFields" 
        :key="field.key"
        :label="field.label"
        :required="field.required"
      >
        <!-- 文本输入 -->
        <NInput
          v-if="field.type === 'text'"
          :value="(modelValue[field.key] as string) || ''"
          :placeholder="field.placeholder"
          @update:value="(v: string) => updateOption(field.key, v)"
        />
        
        <!-- 多行文本 -->
        <NInput
          v-else-if="field.type === 'textarea'"
          type="textarea"
          :value="(modelValue[field.key] as string) || ''"
          :placeholder="field.placeholder"
          :autosize="{ minRows: 3, maxRows: 6 }"
          @update:value="(v: string) => updateOption(field.key, v)"
          style="font-family: monospace; font-size: 12px"
        />
        
        <!-- 下拉选择 -->
        <NSelect
          v-else-if="field.type === 'select'"
          :value="(modelValue[field.key] as string) || field.default"
          :options="field.options"
          :disabled="isFieldDisabled(field)"
          @update:value="(v: string) => updateOption(field.key, v)"
        />
        
        <!-- 描述信息 -->
        <template v-if="field.description" #feedback>
          <NText depth="3" style="font-size: 12px">
            {{ field.description }}
          </NText>
        </template>
      </NFormItem>
    </NForm>
  </NCard>
</template>
