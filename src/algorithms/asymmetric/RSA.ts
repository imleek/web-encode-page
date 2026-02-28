import { CryptoAlgorithm } from '@/core/base/CryptoAlgorithm'
import { AlgorithmType, type CryptoOptions, type OptionsSchema } from '@/core/types/crypto'

export class RSAAlgorithm extends CryptoAlgorithm {
  name = 'RSA'
  displayName = 'RSA'
  type = AlgorithmType.ASYMMETRIC
  description = 'RSA 非对称加密算法，使用 PKCS#1 v1.5 填充'
  supportDecrypt = true

  protected validateOptions(options?: CryptoOptions, operation?: 'encrypt' | 'decrypt'): string | null {
    if (operation === 'encrypt' && !options?.publicKey) {
      return '加密需要提供公钥'
    }
    if (operation === 'decrypt' && !options?.privateKey) {
      return '解密需要提供私钥'
    }
    return null
  }

  protected async encryptCore(input: string, options?: CryptoOptions): Promise<string> {
    const publicKeyPem = options?.publicKey || ''
    
    try {
      const publicKey = await this.importPublicKey(publicKeyPem)
      const data = new TextEncoder().encode(input)
      
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        data
      )
      
      return this.arrayBufferToBase64(encrypted)
    } catch (error) {
      throw new Error(`加密失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  protected async decryptCore(input: string, options?: CryptoOptions): Promise<string> {
    const privateKeyPem = options?.privateKey || ''
    
    try {
      const privateKey = await this.importPrivateKey(privateKeyPem)
      const data = this.base64ToArrayBuffer(input)
      
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        data
      )
      
      return new TextDecoder().decode(decrypted)
    } catch (error) {
      throw new Error(`解密失败: ${error instanceof Error ? error.message : '未知错误'}`)
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
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      false,
      ['encrypt']
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
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      false,
      ['decrypt']
    )
  }

  getOptionsSchema(): OptionsSchema {
    return {
      encrypt: [
        {
          key: 'publicKey',
          label: '公钥（PEM 格式）',
          type: 'textarea',
          required: true,
          placeholder: '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----',
          description: '请输入 PEM 格式的 RSA 公钥'
        }
      ],
      decrypt: [
        {
          key: 'privateKey',
          label: '私钥（PEM 格式）',
          type: 'textarea',
          required: true,
          placeholder: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----',
          description: '请输入 PEM 格式的 RSA 私钥（PKCS#8 格式）'
        }
      ]
    }
  }
}

// 生成 RSA 密钥对的辅助函数
export async function generateRSAKeyPair(modulusLength: number = 2048): Promise<{ publicKey: string; privateKey: string }> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['encrypt', 'decrypt']
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
