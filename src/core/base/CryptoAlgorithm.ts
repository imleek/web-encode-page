import type { 
  ICryptoAlgorithm, 
  AlgorithmType, 
  CryptoOptions, 
  CryptoResult, 
  OptionsSchema 
} from '../types/crypto'

/**
 * 加密算法抽象基类
 * 所有具体算法都应继承此类
 */
export abstract class CryptoAlgorithm implements ICryptoAlgorithm {
  abstract name: string
  abstract displayName: string
  abstract type: AlgorithmType
  abstract description: string
  abstract supportDecrypt: boolean

  /**
   * 加密方法（对外接口）
   */
  async encrypt(input: string, options?: CryptoOptions): Promise<CryptoResult> {
    try {
      // 输入验证
      if (!input && input !== '') {
        return { success: false, error: '输入内容不能为空' }
      }
      
      // 选项验证
      const validationError = this.validateOptions(options, 'encrypt')
      if (validationError) {
        return { success: false, error: validationError }
      }
      
      // 执行加密
      const result = await this.encryptCore(input, options)
      return { success: true, data: result }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '加密失败'
      }
    }
  }

  /**
   * 解密方法（对外接口）
   */
  async decrypt(input: string, options?: CryptoOptions): Promise<CryptoResult> {
    try {
      if (!this.supportDecrypt) {
        return { success: false, error: `${this.displayName} 不支持解密操作` }
      }
      
      if (!input) {
        return { success: false, error: '输入内容不能为空' }
      }
      
      // 选项验证
      const validationError = this.validateOptions(options, 'decrypt')
      if (validationError) {
        return { success: false, error: validationError }
      }
      
      // 执行解密
      const result = await this.decryptCore(input, options)
      return { success: true, data: result }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '解密失败'
      }
    }
  }

  /**
   * 核心加密逻辑（子类必须实现）
   */
  protected abstract encryptCore(input: string, options?: CryptoOptions): Promise<string>

  /**
   * 核心解密逻辑（支持解密的子类需要实现）
   */
  protected async decryptCore(_input: string, _options?: CryptoOptions): Promise<string> {
    throw new Error('此算法不支持解密')
  }

  /**
   * 验证选项
   */
  protected validateOptions(_options?: CryptoOptions, _operation?: 'encrypt' | 'decrypt'): string | null {
    return null
  }

  /**
   * 获取选项配置（子类可重写）
   */
  getOptionsSchema(): OptionsSchema {
    return {
      encrypt: [],
      decrypt: []
    }
  }

  /**
   * 辅助方法：字符串转 ArrayBuffer
   */
  protected stringToArrayBuffer(str: string): ArrayBuffer {
    const encoder = new TextEncoder()
    return encoder.encode(str).buffer
  }

  /**
   * 辅助方法：ArrayBuffer 转 Hex 字符串
   */
  protected arrayBufferToHex(buffer: ArrayBuffer, uppercase: boolean = false): string {
    const bytes = new Uint8Array(buffer)
    const hex = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    return uppercase ? hex.toUpperCase() : hex
  }

  /**
   * 辅助方法：根据选项格式化 Hex 输出
   */
  protected formatHex(hex: string, options?: CryptoOptions): string {
    return options?.hexCase === 'upper' ? hex.toUpperCase() : hex.toLowerCase()
  }

  /**
   * 辅助方法：ArrayBuffer 转 Base64 字符串
   */
  protected arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    bytes.forEach(b => binary += String.fromCharCode(b))
    return btoa(binary)
  }

  /**
   * 辅助方法：Hex 字符串转 ArrayBuffer
   */
  protected hexToArrayBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
    }
    return bytes.buffer
  }

  /**
   * 辅助方法：Base64 字符串转 ArrayBuffer
   */
  protected base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }
}
