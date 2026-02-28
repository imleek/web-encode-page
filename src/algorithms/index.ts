import { registry } from '@/core/registry/AlgorithmRegistry'

// 哈希算法
import { MD4Algorithm } from './hash/MD4'
import { MD5Algorithm } from './hash/MD5'
import { CRC32Algorithm } from './hash/CRC32'
import { SHA1Algorithm } from './hash/SHA1'
import { SHA256Algorithm } from './hash/SHA256'
import { SHA384Algorithm } from './hash/SHA384'

// 编码算法
import { Base64Algorithm } from './encoding/Base64'
import { Base91Algorithm } from './encoding/Base91'

// HMAC 算法
import { HMAC_SHA1Algorithm } from './hmac/HMAC_SHA1'
import { HMAC_SHA256Algorithm } from './hmac/HMAC_SHA256'
import { HMAC_SHA384Algorithm } from './hmac/HMAC_SHA384'

// 对称加密
import { AESAlgorithm } from './symmetric/AES'
import { DESAlgorithm } from './symmetric/DES'

// 非对称加密
import { RSAAlgorithm } from './asymmetric/RSA'
import { RSA2Algorithm } from './asymmetric/RSA2'

// 注册所有算法
export function registerAllAlgorithms(): void {
  // 哈希算法
  registry.register(new MD5Algorithm())
  registry.register(new MD4Algorithm())
  registry.register(new CRC32Algorithm())
  registry.register(new SHA1Algorithm())
  registry.register(new SHA256Algorithm())
  registry.register(new SHA384Algorithm())

  // 编码算法
  registry.register(new Base64Algorithm())
  registry.register(new Base91Algorithm())

  // HMAC 算法
  registry.register(new HMAC_SHA1Algorithm())
  registry.register(new HMAC_SHA256Algorithm())
  registry.register(new HMAC_SHA384Algorithm())

  // 对称加密
  registry.register(new AESAlgorithm())
  registry.register(new DESAlgorithm())

  // 非对称加密
  registry.register(new RSAAlgorithm())
  registry.register(new RSA2Algorithm())
}

// 导出密钥生成函数
export { generateRSAKeyPair } from './asymmetric/RSA'
export { generateRSA2KeyPair } from './asymmetric/RSA2'
