import { ref, computed } from 'vue'
import { registry } from '@/core/registry/AlgorithmRegistry'
import { AlgorithmType, AlgorithmTypeLabels, type ICryptoAlgorithm, type CryptoOptions, type CryptoResult, type OptionsSchema } from '@/core/types/crypto'
import { useHistory } from './useHistory'

// 模块级共享状态（单例）
const currentAlgorithmName = ref<string>('MD5')
const input = ref('')
const output = ref('')
const error = ref('')
const isLoading = ref(false)
const options = ref<CryptoOptions>({})

// 当前算法
const currentAlgorithm = computed<ICryptoAlgorithm | undefined>(() => {
  return registry.get(currentAlgorithmName.value)
})

// 当前算法的选项配置
const optionsSchema = computed<OptionsSchema>(() => {
  return currentAlgorithm.value?.getOptionsSchema() || { encrypt: [], decrypt: [] }
})

// 是否支持解密
const supportDecrypt = computed(() => {
  return currentAlgorithm.value?.supportDecrypt || false
})

// 所有算法（分组）
const groupedAlgorithms = computed(() => {
  const grouped = registry.getGrouped()
  const result: { label: string; type: AlgorithmType; algorithms: ICryptoAlgorithm[] }[] = []
  
  const typeOrder = [
    AlgorithmType.HASH,
    AlgorithmType.HMAC,
    AlgorithmType.ENCODING,
    AlgorithmType.SYMMETRIC,
    AlgorithmType.ASYMMETRIC
  ]
  
  for (const type of typeOrder) {
    const algorithms = grouped.get(type)
    if (algorithms && algorithms.length > 0) {
      result.push({
        label: AlgorithmTypeLabels[type],
        type,
        algorithms
      })
    }
  }
  
  return result
})

// 选择算法
function selectAlgorithm(name: string) {
  currentAlgorithmName.value = name
  // 重置选项为默认值
  options.value = {}
  const schema = registry.get(name)?.getOptionsSchema()
  if (schema) {
    for (const field of schema.encrypt) {
      if (field.default !== undefined) {
        (options.value as Record<string, unknown>)[field.key] = field.default
      }
    }
  }
  // 清空输出和错误
  output.value = ''
  error.value = ''
}

export function useCrypto() {
  const { addHistory } = useHistory()

  // 加密
  async function encrypt(): Promise<CryptoResult> {
    if (!currentAlgorithm.value) {
      error.value = '请选择加密算法'
      return { success: false, error: error.value }
    }

    if (!input.value) {
      error.value = '请输入要加密的内容'
      return { success: false, error: error.value }
    }

    isLoading.value = true
    error.value = ''

    try {
      const result = await currentAlgorithm.value.encrypt(input.value, options.value)
      
      if (result.success) {
        output.value = result.data || ''
        // 添加到历史记录
        addHistory({
          algorithmName: currentAlgorithm.value.name,
          algorithmDisplayName: currentAlgorithm.value.displayName,
          operation: 'encrypt',
          input: input.value,
          output: output.value,
          options: { ...options.value }
        })
      } else {
        error.value = result.error || '加密失败'
        output.value = ''
      }
      
      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加密失败'
      output.value = ''
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 解密
  async function decrypt(): Promise<CryptoResult> {
    if (!currentAlgorithm.value) {
      error.value = '请选择加密算法'
      return { success: false, error: error.value }
    }

    if (!currentAlgorithm.value.supportDecrypt) {
      error.value = `${currentAlgorithm.value.displayName} 不支持解密操作`
      return { success: false, error: error.value }
    }

    if (!input.value) {
      error.value = '请输入要解密的内容'
      return { success: false, error: error.value }
    }

    isLoading.value = true
    error.value = ''

    try {
      const result = await currentAlgorithm.value.decrypt(input.value, options.value)
      
      if (result.success) {
        output.value = result.data || ''
        // 添加到历史记录
        addHistory({
          algorithmName: currentAlgorithm.value.name,
          algorithmDisplayName: currentAlgorithm.value.displayName,
          operation: 'decrypt',
          input: input.value,
          output: output.value,
          options: { ...options.value }
        })
      } else {
        error.value = result.error || '解密失败'
        output.value = ''
      }
      
      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : '解密失败'
      output.value = ''
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 清空
  function clear() {
    input.value = ''
    output.value = ''
    error.value = ''
  }

  // 交换输入输出
  function swap() {
    const temp = input.value
    input.value = output.value
    output.value = temp
    error.value = ''
  }

  // 复制输出
  async function copyOutput(): Promise<boolean> {
    if (!output.value) return false
    try {
      await navigator.clipboard.writeText(output.value)
      return true
    } catch {
      return false
    }
  }

  return {
    // 状态
    currentAlgorithmName,
    currentAlgorithm,
    input,
    output,
    error,
    isLoading,
    options,
    optionsSchema,
    supportDecrypt,
    groupedAlgorithms,
    // 方法
    selectAlgorithm,
    encrypt,
    decrypt,
    clear,
    swap,
    copyOutput
  }
}
