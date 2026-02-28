import CryptoJS from 'crypto-js'
import { CryptoAlgorithm } from '@/core/base/CryptoAlgorithm'
import { AlgorithmType, type CryptoOptions, type OptionsSchema } from '@/core/types/crypto'
import { getHashOptionsSchema } from '@/core/utils/optionFields'

export class SHA256Algorithm extends CryptoAlgorithm {
  name = 'SHA256'
  displayName = 'SHA-256'
  type = AlgorithmType.HASH
  description = 'SHA-256 安全哈希算法，生成256位哈希值'
  supportDecrypt = false

  protected async encryptCore(input: string, options?: CryptoOptions): Promise<string> {
    const format = options?.outputFormat || 'hex'
    const isUpper = options?.hexCase === 'upper'
    
    // 优先使用 Web Crypto API
    if (window.crypto && window.crypto.subtle) {
      try {
        const buffer = this.stringToArrayBuffer(input)
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer)
        
        if (format === 'base64') {
          return this.arrayBufferToBase64(hashBuffer)
        }
        return this.arrayBufferToHex(hashBuffer, isUpper)
      } catch {
        // 降级到 crypto-js
      }
    }
    
    // 降级使用 crypto-js
    const hash = CryptoJS.SHA256(input)
    if (format === 'base64') {
      return hash.toString(CryptoJS.enc.Base64)
    }
    const hex = hash.toString(CryptoJS.enc.Hex)
    return this.formatHex(hex, options)
  }

  getOptionsSchema(): OptionsSchema {
    return getHashOptionsSchema()
  }
}
