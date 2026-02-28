import CryptoJS from 'crypto-js'
import { CryptoAlgorithm } from '@/core/base/CryptoAlgorithm'
import { AlgorithmType, type CryptoOptions, type OptionsSchema } from '@/core/types/crypto'

export class DESAlgorithm extends CryptoAlgorithm {
  name = 'DES'
  displayName = 'DES'
  type = AlgorithmType.SYMMETRIC
  description = 'DES 数据加密标准，使用 56 位密钥（已不推荐用于敏感数据）'
  supportDecrypt = true

  protected validateOptions(options?: CryptoOptions, _operation?: 'encrypt' | 'decrypt'): string | null {
    if (!options?.key) {
      return '请输入密钥'
    }
    if (options.key.length !== 8) {
      return '密钥长度必须为 8 字节'
    }
    const mode = options.mode || 'CBC'
    if (mode !== 'ECB' && !options.iv) {
      return `${mode} 模式需要提供 IV（初始向量）`
    }
    if (options.iv && options.iv.length !== 8) {
      return 'IV 长度必须为 8 字节'
    }
    return null
  }

  protected async encryptCore(input: string, options?: CryptoOptions): Promise<string> {
    const key = CryptoJS.enc.Utf8.parse(options?.key || '')
    const iv = options?.iv ? CryptoJS.enc.Utf8.parse(options.iv) : undefined
    const mode = this.getMode(options?.mode)
    const padding = this.getPadding(options?.padding)
    const outputFormat = options?.outputFormat || 'base64'

    const encrypted = CryptoJS.DES.encrypt(input, key, {
      iv,
      mode,
      padding
    })

    if (outputFormat === 'hex') {
      return encrypted.ciphertext.toString(CryptoJS.enc.Hex)
    }
    return encrypted.toString()
  }

  protected async decryptCore(input: string, options?: CryptoOptions): Promise<string> {
    const key = CryptoJS.enc.Utf8.parse(options?.key || '')
    const iv = options?.iv ? CryptoJS.enc.Utf8.parse(options.iv) : undefined
    const mode = this.getMode(options?.mode)
    const padding = this.getPadding(options?.padding)
    const inputFormat = options?.inputFormat || 'base64'

    let cipherParams: CryptoJS.lib.CipherParams
    if (inputFormat === 'hex') {
      cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(input)
      })
    } else {
      cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(input)
      })
    }

    const decrypted = CryptoJS.DES.decrypt(cipherParams, key, {
      iv,
      mode,
      padding
    })

    const result = decrypted.toString(CryptoJS.enc.Utf8)
    if (!result) {
      throw new Error('解密失败，请检查密钥和 IV 是否正确')
    }
    return result
  }

  private getMode(mode?: string): typeof CryptoJS.mode.CBC {
    switch (mode) {
      case 'ECB': return CryptoJS.mode.ECB
      case 'CFB': return CryptoJS.mode.CFB
      case 'OFB': return CryptoJS.mode.OFB
      default: return CryptoJS.mode.CBC
    }
  }

  private getPadding(padding?: string): typeof CryptoJS.pad.Pkcs7 {
    switch (padding) {
      case 'ZeroPadding': return CryptoJS.pad.ZeroPadding
      case 'NoPadding': return CryptoJS.pad.NoPadding
      default: return CryptoJS.pad.Pkcs7
    }
  }

  getOptionsSchema(): OptionsSchema {
    const commonOptions = [
      {
        key: 'key' as const,
        label: '密钥',
        type: 'text' as const,
        required: true,
        placeholder: '8 字节密钥',
        description: 'DES 密钥长度固定为 8 字节'
      },
      {
        key: 'iv' as const,
        label: 'IV（初始向量）',
        type: 'text' as const,
        placeholder: '8 字节 IV（ECB 模式不需要）',
        description: '初始向量，CBC/CFB/OFB 模式必须提供'
      },
      {
        key: 'mode' as const,
        label: '加密模式',
        type: 'select' as const,
        default: 'CBC',
        options: [
          { label: 'CBC', value: 'CBC' },
          { label: 'ECB', value: 'ECB' },
          { label: 'CFB', value: 'CFB' },
          { label: 'OFB', value: 'OFB' }
        ]
      },
      {
        key: 'padding' as const,
        label: '填充方式',
        type: 'select' as const,
        default: 'Pkcs7',
        options: [
          { label: 'PKCS7', value: 'Pkcs7' },
          { label: 'Zero Padding', value: 'ZeroPadding' },
          { label: 'No Padding', value: 'NoPadding' }
        ]
      }
    ]

    return {
      encrypt: [
        ...commonOptions,
        {
          key: 'outputFormat',
          label: '输出格式',
          type: 'select',
          default: 'base64',
          options: [
            { label: 'Base64', value: 'base64' },
            { label: 'Hex', value: 'hex' }
          ]
        }
      ],
      decrypt: [
        ...commonOptions,
        {
          key: 'inputFormat',
          label: '输入格式',
          type: 'select',
          default: 'base64',
          options: [
            { label: 'Base64', value: 'base64' },
            { label: 'Hex', value: 'hex' }
          ]
        }
      ]
    }
  }
}
