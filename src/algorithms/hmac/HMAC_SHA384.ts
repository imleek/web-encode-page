import CryptoJS from 'crypto-js'
import { CryptoAlgorithm } from '@/core/base/CryptoAlgorithm'
import { AlgorithmType, type CryptoOptions, type OptionsSchema } from '@/core/types/crypto'
import { getHmacOptionsSchema } from '@/core/utils/optionFields'

export class HMAC_SHA384Algorithm extends CryptoAlgorithm {
  name = 'HMAC_SHA384'
  displayName = 'HMAC-SHA384'
  type = AlgorithmType.HMAC
  description = 'HMAC-SHA384 消息认证码，用于验证消息完整性和真实性'
  supportDecrypt = false

  protected validateOptions(options?: CryptoOptions): string | null {
    if (!options?.key) {
      return '请输入密钥'
    }
    return null
  }

  protected async encryptCore(input: string, options?: CryptoOptions): Promise<string> {
    const key = options?.key || ''
    const format = options?.outputFormat || 'hex'
    const isUpper = options?.hexCase === 'upper'
    
    // 优先使用 Web Crypto API
    if (window.crypto && window.crypto.subtle) {
      try {
        const keyBuffer = this.stringToArrayBuffer(key)
        const dataBuffer = this.stringToArrayBuffer(input)
        
        const cryptoKey = await window.crypto.subtle.importKey(
          'raw',
          keyBuffer,
          { name: 'HMAC', hash: 'SHA-384' },
          false,
          ['sign']
        )
        
        const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, dataBuffer)
        
        if (format === 'base64') {
          return this.arrayBufferToBase64(signature)
        }
        return this.arrayBufferToHex(signature, isUpper)
      } catch {
        // 降级到 crypto-js
      }
    }
    
    // 降级使用 crypto-js
    const hash = CryptoJS.HmacSHA384(input, key)
    if (format === 'base64') {
      return hash.toString(CryptoJS.enc.Base64)
    }
    const hex = hash.toString(CryptoJS.enc.Hex)
    return this.formatHex(hex, options)
  }

  getOptionsSchema(): OptionsSchema {
    return getHmacOptionsSchema()
  }
}
