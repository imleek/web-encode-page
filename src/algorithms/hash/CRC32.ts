import { CryptoAlgorithm } from '@/core/base/CryptoAlgorithm'
import { AlgorithmType, type CryptoOptions, type OptionsSchema } from '@/core/types/crypto'
import { getHashOptionsSchema } from '@/core/utils/optionFields'

export class CRC32Algorithm extends CryptoAlgorithm {
  name = 'CRC32'
  displayName = 'CRC32'
  type = AlgorithmType.HASH
  description = 'CRC32 循环冗余校验，常用于数据完整性验证'
  supportDecrypt = false

  private crcTable: number[] = []

  constructor() {
    super()
    this.initTable()
  }

  private initTable(): void {
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      }
      this.crcTable[i] = c >>> 0
    }
  }

  protected async encryptCore(input: string, options?: CryptoOptions): Promise<string> {
    let crc = 0xffffffff
    const bytes = new TextEncoder().encode(input)
    
    for (const byte of bytes) {
      crc = this.crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
    }
    
    crc = (crc ^ 0xffffffff) >>> 0
    
    const format = options?.outputFormat || 'hex'
    if (format === 'base64') {
      const hexStr = crc.toString(16).padStart(8, '0')
      let binary = ''
      for (let i = 0; i < hexStr.length; i += 2) {
        binary += String.fromCharCode(parseInt(hexStr.substring(i, i + 2), 16))
      }
      return btoa(binary)
    }
    
    const hex = crc.toString(16).padStart(8, '0')
    return this.formatHex(hex, options)
  }

  getOptionsSchema(): OptionsSchema {
    return getHashOptionsSchema()
  }
}
