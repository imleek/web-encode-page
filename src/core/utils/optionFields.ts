import type { OptionField } from '@/core/types/crypto'

/**
 * 公共选项配置
 * 用于在多个算法中复用相同的选项字段
 */

// 输出格式选项（Hex/Base64）
export const outputFormatField: OptionField = {
  key: 'outputFormat',
  label: '输出格式',
  type: 'select',
  default: 'hex',
  options: [
    { label: 'Hex', value: 'hex' },
    { label: 'Base64', value: 'base64' }
  ]
}

// Hex 大小写选项（仅在输出格式为 Hex 时启用）
export const hexCaseField: OptionField = {
  key: 'hexCase',
  label: 'Hex 大小写',
  type: 'select',
  default: 'lower',
  options: [
    { label: '小写 (abc)', value: 'lower' },
    { label: '大写 (ABC)', value: 'upper' }
  ],
  disabledWhen: {
    field: 'outputFormat',
    values: ['base64', 'utf8']
  }
}

// HMAC 密钥选项
export const hmacKeyField: OptionField = {
  key: 'key',
  label: '密钥',
  type: 'text',
  required: true,
  placeholder: '请输入 HMAC 密钥'
}

// 对称加密密钥选项
export const symmetricKeyField = (keyLength: string): OptionField => ({
  key: 'key',
  label: '密钥',
  type: 'text',
  required: true,
  placeholder: `${keyLength} 字节密钥`,
  description: '密钥长度决定加密强度'
})

// IV 选项
export const ivField = (length: number): OptionField => ({
  key: 'iv',
  label: 'IV（初始向量）',
  type: 'text',
  placeholder: `${length} 字节 IV（ECB 模式不需要）`,
  description: '初始向量，CBC/CFB/OFB/CTR 模式必须提供'
})

// 加密模式选项
export const modeField = (modes: string[]): OptionField => ({
  key: 'mode',
  label: '加密模式',
  type: 'select',
  default: 'CBC',
  options: modes.map(m => ({ label: m, value: m }))
})

// 填充方式选项
export const paddingField: OptionField = {
  key: 'padding',
  label: '填充方式',
  type: 'select',
  default: 'Pkcs7',
  options: [
    { label: 'PKCS7', value: 'Pkcs7' },
    { label: 'Zero Padding', value: 'ZeroPadding' },
    { label: 'No Padding', value: 'NoPadding' }
  ]
}

// 输入格式选项（用于解密）
export const inputFormatField: OptionField = {
  key: 'inputFormat',
  label: '输入格式',
  type: 'select',
  default: 'base64',
  options: [
    { label: 'Base64', value: 'base64' },
    { label: 'Hex', value: 'hex' }
  ]
}

// RSA 公钥选项
export const publicKeyField: OptionField = {
  key: 'publicKey',
  label: '公钥（PEM 格式）',
  type: 'textarea',
  required: true,
  placeholder: '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----',
  description: '请输入 PEM 格式的 RSA 公钥'
}

// RSA 私钥选项
export const privateKeyField: OptionField = {
  key: 'privateKey',
  label: '私钥（PEM 格式）',
  type: 'textarea',
  required: true,
  placeholder: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----',
  description: '请输入 PEM 格式的 RSA 私钥（PKCS#8 格式）'
}

/**
 * 生成哈希算法的标准选项配置
 */
export function getHashOptionsSchema() {
  return {
    encrypt: [outputFormatField, hexCaseField],
    decrypt: []
  }
}

/**
 * 生成 HMAC 算法的标准选项配置
 */
export function getHmacOptionsSchema() {
  return {
    encrypt: [hmacKeyField, outputFormatField, hexCaseField],
    decrypt: []
  }
}
