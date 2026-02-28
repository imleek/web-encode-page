import { CryptoAlgorithm } from '@/core/base/CryptoAlgorithm'
import { AlgorithmType, type OptionsSchema } from '@/core/types/crypto'

export class Base64Algorithm extends CryptoAlgorithm {
  name = 'Base64'
  displayName = 'Base64'
  type = AlgorithmType.ENCODING
  description = 'Base64 编码，将二进制数据转换为 ASCII 字符串'
  supportDecrypt = true

  protected async encryptCore(input: string): Promise<string> {
    // 处理 Unicode 字符
    const bytes = new TextEncoder().encode(input)
    let binary = ''
    bytes.forEach(b => binary += String.fromCharCode(b))
    return btoa(binary)
  }

  protected async decryptCore(input: string): Promise<string> {
    try {
      const binary = atob(input)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      return new TextDecoder().decode(bytes)
    } catch {
      throw new Error('无效的 Base64 字符串')
    }
  }

  getOptionsSchema(): OptionsSchema {
    return {
      encrypt: [],
      decrypt: []
    }
  }
}
