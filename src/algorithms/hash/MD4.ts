import { CryptoAlgorithm } from '@/core/base/CryptoAlgorithm'
import { AlgorithmType, type CryptoOptions, type OptionsSchema } from '@/core/types/crypto'
import { getHashOptionsSchema } from '@/core/utils/optionFields'

export class MD4Algorithm extends CryptoAlgorithm {
  name = 'MD4'
  displayName = 'MD4'
  type = AlgorithmType.HASH
  description = 'MD4 消息摘要算法，MD5 的前身'
  supportDecrypt = false

  protected async encryptCore(input: string, options?: CryptoOptions): Promise<string> {
    // crypto-js 没有原生 MD4，使用自定义实现
    const hash = this.md4(input)
    const format = options?.outputFormat || 'hex'
    
    if (format === 'base64') {
      return btoa(this.hexToString(hash))
    }
    return this.formatHex(hash, options)
  }

  getOptionsSchema(): OptionsSchema {
    return getHashOptionsSchema()
  }

  private hexToString(hex: string): string {
    let str = ''
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16))
    }
    return str
  }

  // MD4 实现
  private md4(message: string): string {
    const bytes = this.stringToBytes(message)
    const paddedBytes = this.padMessage(bytes)
    const words = this.bytesToWords(paddedBytes)
    
    let a = 0x67452301
    let b = 0xefcdab89
    let c = 0x98badcfe
    let d = 0x10325476

    for (let i = 0; i < words.length; i += 16) {
      const aa = a, bb = b, cc = c, dd = d

      // Round 1
      a = this.ff(a, b, c, d, words[i + 0], 3)
      d = this.ff(d, a, b, c, words[i + 1], 7)
      c = this.ff(c, d, a, b, words[i + 2], 11)
      b = this.ff(b, c, d, a, words[i + 3], 19)
      a = this.ff(a, b, c, d, words[i + 4], 3)
      d = this.ff(d, a, b, c, words[i + 5], 7)
      c = this.ff(c, d, a, b, words[i + 6], 11)
      b = this.ff(b, c, d, a, words[i + 7], 19)
      a = this.ff(a, b, c, d, words[i + 8], 3)
      d = this.ff(d, a, b, c, words[i + 9], 7)
      c = this.ff(c, d, a, b, words[i + 10], 11)
      b = this.ff(b, c, d, a, words[i + 11], 19)
      a = this.ff(a, b, c, d, words[i + 12], 3)
      d = this.ff(d, a, b, c, words[i + 13], 7)
      c = this.ff(c, d, a, b, words[i + 14], 11)
      b = this.ff(b, c, d, a, words[i + 15], 19)

      // Round 2
      a = this.gg(a, b, c, d, words[i + 0], 3)
      d = this.gg(d, a, b, c, words[i + 4], 5)
      c = this.gg(c, d, a, b, words[i + 8], 9)
      b = this.gg(b, c, d, a, words[i + 12], 13)
      a = this.gg(a, b, c, d, words[i + 1], 3)
      d = this.gg(d, a, b, c, words[i + 5], 5)
      c = this.gg(c, d, a, b, words[i + 9], 9)
      b = this.gg(b, c, d, a, words[i + 13], 13)
      a = this.gg(a, b, c, d, words[i + 2], 3)
      d = this.gg(d, a, b, c, words[i + 6], 5)
      c = this.gg(c, d, a, b, words[i + 10], 9)
      b = this.gg(b, c, d, a, words[i + 14], 13)
      a = this.gg(a, b, c, d, words[i + 3], 3)
      d = this.gg(d, a, b, c, words[i + 7], 5)
      c = this.gg(c, d, a, b, words[i + 11], 9)
      b = this.gg(b, c, d, a, words[i + 15], 13)

      // Round 3
      a = this.hh(a, b, c, d, words[i + 0], 3)
      d = this.hh(d, a, b, c, words[i + 8], 9)
      c = this.hh(c, d, a, b, words[i + 4], 11)
      b = this.hh(b, c, d, a, words[i + 12], 15)
      a = this.hh(a, b, c, d, words[i + 2], 3)
      d = this.hh(d, a, b, c, words[i + 10], 9)
      c = this.hh(c, d, a, b, words[i + 6], 11)
      b = this.hh(b, c, d, a, words[i + 14], 15)
      a = this.hh(a, b, c, d, words[i + 1], 3)
      d = this.hh(d, a, b, c, words[i + 9], 9)
      c = this.hh(c, d, a, b, words[i + 5], 11)
      b = this.hh(b, c, d, a, words[i + 13], 15)
      a = this.hh(a, b, c, d, words[i + 3], 3)
      d = this.hh(d, a, b, c, words[i + 11], 9)
      c = this.hh(c, d, a, b, words[i + 7], 11)
      b = this.hh(b, c, d, a, words[i + 15], 15)

      a = this.add(a, aa)
      b = this.add(b, bb)
      c = this.add(c, cc)
      d = this.add(d, dd)
    }

    return this.wordsToHex([a, b, c, d])
  }

  private stringToBytes(str: string): number[] {
    const bytes: number[] = []
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i)
      if (code < 128) {
        bytes.push(code)
      } else if (code < 2048) {
        bytes.push(192 | (code >> 6), 128 | (code & 63))
      } else {
        bytes.push(224 | (code >> 12), 128 | ((code >> 6) & 63), 128 | (code & 63))
      }
    }
    return bytes
  }

  private padMessage(bytes: number[]): number[] {
    const bitLength = bytes.length * 8
    bytes.push(0x80)
    while ((bytes.length % 64) !== 56) {
      bytes.push(0)
    }
    for (let i = 0; i < 8; i++) {
      bytes.push((bitLength >>> (i * 8)) & 0xff)
    }
    return bytes
  }

  private bytesToWords(bytes: number[]): number[] {
    const words: number[] = []
    for (let i = 0; i < bytes.length; i += 4) {
      words.push(
        bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16) | (bytes[i + 3] << 24)
      )
    }
    return words
  }

  private wordsToHex(words: number[]): string {
    let hex = ''
    for (const word of words) {
      for (let i = 0; i < 4; i++) {
        hex += ((word >>> (i * 8)) & 0xff).toString(16).padStart(2, '0')
      }
    }
    return hex
  }

  private add(a: number, b: number): number {
    return (a + b) >>> 0
  }

  private rotl(x: number, n: number): number {
    return ((x << n) | (x >>> (32 - n))) >>> 0
  }

  private f(x: number, y: number, z: number): number {
    return (x & y) | (~x & z)
  }

  private g(x: number, y: number, z: number): number {
    return (x & y) | (x & z) | (y & z)
  }

  private h(x: number, y: number, z: number): number {
    return x ^ y ^ z
  }

  private ff(a: number, b: number, c: number, d: number, x: number, s: number): number {
    return this.rotl(this.add(a, this.add(this.f(b, c, d), x)), s)
  }

  private gg(a: number, b: number, c: number, d: number, x: number, s: number): number {
    return this.rotl(this.add(a, this.add(this.add(this.g(b, c, d), x), 0x5a827999)), s)
  }

  private hh(a: number, b: number, c: number, d: number, x: number, s: number): number {
    return this.rotl(this.add(a, this.add(this.add(this.h(b, c, d), x), 0x6ed9eba1)), s)
  }
}
