import type { ICryptoAlgorithm, AlgorithmType } from '../types/crypto'

/**
 * 算法注册表（单例模式）
 * 管理所有加密算法的注册、查询和分类
 */
export class AlgorithmRegistry {
  private static instance: AlgorithmRegistry
  private algorithms: Map<string, ICryptoAlgorithm> = new Map()

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): AlgorithmRegistry {
    if (!AlgorithmRegistry.instance) {
      AlgorithmRegistry.instance = new AlgorithmRegistry()
    }
    return AlgorithmRegistry.instance
  }

  /**
   * 注册算法
   */
  register(algorithm: ICryptoAlgorithm): void {
    if (this.algorithms.has(algorithm.name)) {
      console.warn(`算法 "${algorithm.name}" 已注册，将被覆盖`)
    }
    this.algorithms.set(algorithm.name, algorithm)
  }

  /**
   * 批量注册算法
   */
  registerAll(algorithms: ICryptoAlgorithm[]): void {
    algorithms.forEach(algo => this.register(algo))
  }

  /**
   * 注销算法
   */
  unregister(name: string): boolean {
    return this.algorithms.delete(name)
  }

  /**
   * 获取算法
   */
  get(name: string): ICryptoAlgorithm | undefined {
    return this.algorithms.get(name)
  }

  /**
   * 检查算法是否存在
   */
  has(name: string): boolean {
    return this.algorithms.has(name)
  }

  /**
   * 获取所有算法
   */
  getAll(): ICryptoAlgorithm[] {
    return Array.from(this.algorithms.values())
  }

  /**
   * 获取所有算法名称
   */
  getAllNames(): string[] {
    return Array.from(this.algorithms.keys())
  }

  /**
   * 按类型获取算法
   */
  getByType(type: AlgorithmType): ICryptoAlgorithm[] {
    return this.getAll().filter(algo => algo.type === type)
  }

  /**
   * 获取分组后的算法（按类型分组）
   */
  getGrouped(): Map<AlgorithmType, ICryptoAlgorithm[]> {
    const grouped = new Map<AlgorithmType, ICryptoAlgorithm[]>()
    
    this.getAll().forEach(algo => {
      const list = grouped.get(algo.type) || []
      list.push(algo)
      grouped.set(algo.type, list)
    })
    
    return grouped
  }

  /**
   * 获取算法数量
   */
  get size(): number {
    return this.algorithms.size
  }

  /**
   * 清空所有算法
   */
  clear(): void {
    this.algorithms.clear()
  }
}

// 导出便捷访问方法
export const registry = AlgorithmRegistry.getInstance()
