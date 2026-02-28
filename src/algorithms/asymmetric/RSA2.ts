import { CryptoAlgorithm } from '@/core/base/CryptoAlgorithm'
import { AlgorithmType, type CryptoOptions, type OptionsSchema } from '@/core/types/crypto'

export class RSA2Algorithm extends CryptoAlgorithm {
  name = 'RSA2'
  displayName = 'RSA2 (SHA256withRSA)'
  type = AlgorithmType.ASYMMETRIC
  description = 'RSA2 签名算法，使用 SHA-256 哈希和 RSASSA-PKCS1-v1_5 签名'
  supportDecrypt = true // 这里的 "解密" 实际是验签

  protected validateOptions(options?: CryptoOptions, operation?: 'encrypt' | 'decrypt'): string | null {
    if (operation === 'encrypt' && !options?.privateKey) {
      return '签名需要提供私钥'
    }
    if (operation === 'decrypt' && !options?.publicKey) {
      return '验签需要提供公钥'
    }
    return null
  }

  protected async encryptCore(input: string, options?: CryptoOptions): Promise<string> {
    const privateKeyPem = options?.privateKey || ''
    
    try {
      const privateKey = await this.importPrivateKey(privateKeyPem)
      const data = new TextEncoder().encode(input)
      
      const signature = await window.crypto.subtle.sign(
        { name: 'RSASSA-PKCS1-v1_5' },
        privateKey,
        data
      )
      
      return this.arrayBufferToBase64(signature)
    } catch (error) {
      throw new Error(`签名失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  protected async decryptCore(input: string, options?: CryptoOptions): Promise<string> {
    // RSA2 的 "解密" 实际上是验证签名
    // input 是签名，options.key 是原始数据
    const publicKeyPem = options?.publicKey || ''
    const originalData = options?.key || '' // 使用 key 字段传递原始数据
    
    if (!originalData) {
      throw new Error('验签需要提供原始数据（在密钥字段中输入）')
    }
    
    try {
      const publicKey = await this.importPublicKey(publicKeyPem)
      const signature = this.base64ToArrayBuffer(input)
      const data = new TextEncoder().encode(originalData)
      
      const isValid = await window.crypto.subtle.verify(
        { name: 'RSASSA-PKCS1-v1_5' },
        publicKey,
        signature,
        data
      )
      
      return isValid ? '签名验证成功 ✓' : '签名验证失败 ✗'
    } catch (error) {
      throw new Error(`验签失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  private async importPublicKey(pem: string): Promise<CryptoKey> {
    const pemContent = pem
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '')
    
    const binaryDer = this.base64ToArrayBuffer(pemContent)
    
    return await window.crypto.subtle.importKey(
      'spki',
      binaryDer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256'
      },
      false,
      ['verify']
    )
  }

  private async importPrivateKey(pem: string): Promise<CryptoKey> {
    const pemContent = pem
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/-----BEGIN RSA PRIVATE KEY-----/, '')
      .replace(/-----END RSA PRIVATE KEY-----/, '')
      .replace(/\s/g, '')
    
    const binaryDer = this.base64ToArrayBuffer(pemContent)
    
    return await window.crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256'
      },
      false,
      ['sign']
    )
  }

  getOptionsSchema(): OptionsSchema {
    return {
      encrypt: [
        {
          key: 'privateKey',
          label: '私钥（PEM 格式）',
          type: 'textarea',
          required: true,
          placeholder: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----',
          description: '签名操作需要使用私钥'
        }
      ],
      decrypt: [
        {
          key: 'publicKey',
          label: '公钥（PEM 格式）',
          type: 'textarea',
          required: true,
          placeholder: '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----',
          description: '验签操作需要使用公钥'
        },
        {
          key: 'key',
          label: '原始数据',
          type: 'textarea',
          required: true,
          placeholder: '请输入签名时使用的原始数据',
          description: '用于验证签名的原始数据'
        }
      ]
    }
  }
}

// 生成 RSA2 密钥对的辅助函数
export async function generateRSA2KeyPair(modulusLength: number = 2048): Promise<{ publicKey: string; privateKey: string }> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['sign', 'verify']
  )

  const publicKeyBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey)
  const privateKeyBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey)

  const publicKeyBase64 = arrayBufferToBase64(publicKeyBuffer)
  const privateKeyBase64 = arrayBufferToBase64(privateKeyBuffer)

  const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${formatPem(publicKeyBase64)}\n-----END PUBLIC KEY-----`
  const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${formatPem(privateKeyBase64)}\n-----END PRIVATE KEY-----`

  return { publicKey: publicKeyPem, privateKey: privateKeyPem }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach(b => binary += String.fromCharCode(b))
  return btoa(binary)
}

function formatPem(base64: string): string {
  const lines = []
  for (let i = 0; i < base64.length; i += 64) {
    lines.push(base64.substring(i, i + 64))
  }
  return lines.join('\n')
}
