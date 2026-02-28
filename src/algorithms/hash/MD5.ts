import CryptoJS from 'crypto-js'
import { CryptoAlgorithm } from '@/core/base/CryptoAlgorithm'
import { AlgorithmType, type CryptoOptions, type OptionsSchema } from '@/core/types/crypto'
import { getHashOptionsSchema } from '@/core/utils/optionFields'

export class MD5Algorithm extends CryptoAlgorithm {
  name = 'MD5'
  displayName = 'MD5'
  type = AlgorithmType.HASH
  description = 'MD5 消息摘要算法，生成128位哈希值'
  supportDecrypt = false

  protected async encryptCore(input: string, options?: CryptoOptions): Promise<string> {
    const hash = CryptoJS.MD5(input)
    const format = options?.outputFormat || 'hex'
    
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
