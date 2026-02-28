import { CryptoAlgorithm } from '@/core/base/CryptoAlgorithm'
import { AlgorithmType, type OptionsSchema } from '@/core/types/crypto'

// Base91 字符集
const BASE91_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"'

export class Base91Algorithm extends CryptoAlgorithm {
  name = 'Base91'
  displayName = 'Base91'
  type = AlgorithmType.ENCODING
  description = 'Base91 编码，比 Base64 更高效的编码方式'
  supportDecrypt = true

  protected async encryptCore(input: string): Promise<string> {
    const bytes = new TextEncoder().encode(input)
    return this.encode(bytes)
  }

  protected async decryptCore(input: string): Promise<string> {
    const bytes = this.decode(input)
    return new TextDecoder().decode(bytes)
  }

  private encode(data: Uint8Array): string {
    let result = ''
    let b = 0
    let n = 0

    for (const byte of data) {
      b |= byte << n
      n += 8

      if (n > 13) {
        let v = b & 8191
        if (v > 88) {
          b >>= 13
          n -= 13
        } else {
          v = b & 16383
          b >>= 14
          n -= 14
        }
        result += BASE91_CHARS[v % 91] + BASE91_CHARS[Math.floor(v / 91)]
      }
    }

    if (n) {
      result += BASE91_CHARS[b % 91]
      if (n > 7 || b > 90) {
        result += BASE91_CHARS[Math.floor(b / 91)]
      }
    }

    return result
  }

  private decode(data: string): Uint8Array {
    const result: number[] = []
    let b = 0
    let n = 0
    let v = -1

    for (const char of data) {
      const c = BASE91_CHARS.indexOf(char)
      if (c === -1) continue

      if (v < 0) {
        v = c
      } else {
        v += c * 91
        b |= v << n
        n += (v & 8191) > 88 ? 13 : 14

        while (n > 7) {
          result.push(b & 255)
          b >>= 8
          n -= 8
        }
        v = -1
      }
    }

    if (v > -1) {
      result.push((b | (v << n)) & 255)
    }

    return new Uint8Array(result)
  }

  getOptionsSchema(): OptionsSchema {
    return {
      encrypt: [],
      decrypt: []
    }
  }
}
