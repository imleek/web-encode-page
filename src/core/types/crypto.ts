// 算法类型枚举
export enum AlgorithmType {
  HASH = 'hash',
  HMAC = 'hmac',
  ENCODING = 'encoding',
  SYMMETRIC = 'symmetric',
  ASYMMETRIC = 'asymmetric'
}

// 算法类型中文映射
export const AlgorithmTypeLabels: Record<AlgorithmType, string> = {
  [AlgorithmType.HASH]: '哈希算法',
  [AlgorithmType.HMAC]: 'HMAC',
  [AlgorithmType.ENCODING]: '编码转换',
  [AlgorithmType.SYMMETRIC]: '对称加密',
  [AlgorithmType.ASYMMETRIC]: '非对称加密'
}

// 加密选项接口
export interface CryptoOptions {
  // 通用选项
  key?: string
  iv?: string
  outputFormat?: 'hex' | 'base64' | 'utf8'
  inputFormat?: 'utf8' | 'hex' | 'base64'
  hexCase?: 'lower' | 'upper'  // Hex 输出大小写
  
  // 对称加密选项
  mode?: 'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR' | 'GCM'
  padding?: 'Pkcs7' | 'ZeroPadding' | 'NoPadding'
  keySize?: 128 | 192 | 256
  
  // 非对称加密选项
  publicKey?: string
  privateKey?: string
  modulusLength?: 1024 | 2048 | 4096
  hashAlgorithm?: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
}

// 加密结果接口
export interface CryptoResult {
  success: boolean
  data?: string
  error?: string
}

// 选项字段类型
export type OptionFieldType = 'text' | 'textarea' | 'select' | 'number'

// 选项字段定义
export interface OptionField {
  key: keyof CryptoOptions
  label: string
  type: OptionFieldType
  required?: boolean
  default?: string | number
  options?: { label: string; value: string | number }[]
  placeholder?: string
  description?: string
  // 禁用条件：当指定字段为指定值时禁用此字段
  disabledWhen?: {
    field: keyof CryptoOptions
    values: (string | number)[]
  }
}

// 选项 Schema
export interface OptionsSchema {
  encrypt: OptionField[]
  decrypt: OptionField[]
}

// 算法接口
export interface ICryptoAlgorithm {
  // 算法名称（唯一标识）
  name: string
  // 显示名称
  displayName: string
  // 算法类型
  type: AlgorithmType
  // 算法描述
  description: string
  // 是否支持解密
  supportDecrypt: boolean
  // 加密方法
  encrypt(input: string, options?: CryptoOptions): Promise<CryptoResult>
  // 解密方法
  decrypt(input: string, options?: CryptoOptions): Promise<CryptoResult>
  // 获取选项配置
  getOptionsSchema(): OptionsSchema
}

// 历史记录接口
export interface HistoryRecord {
  id: string
  algorithmName: string
  algorithmDisplayName: string
  operation: 'encrypt' | 'decrypt'
  input: string
  output: string
  options?: CryptoOptions
  timestamp: number
}
