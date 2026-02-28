# 在线加解密网站实现计划

## 概述
使用 Vue 3 + Vite + TypeScript + Naive UI 开发在线加解密网站，采用混合加密方案（Web Crypto API + crypto-js）。

## 技术选型
| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API) |
| 构建 | Vite 5 |
| 语言 | TypeScript 5 |
| UI | Naive UI |
| 加密 | Web Crypto API + crypto-js |
| 状态 | Pinia |

## 项目结构

```
encoder/
├── src/
│   ├── core/                    # 核心架构层
│   │   ├── types/crypto.ts      # 类型定义
│   │   ├── base/CryptoAlgorithm.ts  # 抽象基类
│   │   └── registry/AlgorithmRegistry.ts  # 算法注册表
│   ├── algorithms/              # 算法实现层（每种一个文件）
│   │   ├── hash/                # MD4, MD5, CRC32, SHA1, SHA256, SHA384
│   │   ├── hmac/                # HMAC_SHA1, HMAC_SHA256, HMAC_SHA384
│   │   ├── encoding/            # Base64, Base91
│   │   ├── symmetric/           # DES, AES
│   │   ├── asymmetric/          # RSA, RSA2
│   │   └── index.ts             # 统一注册入口
│   ├── composables/             # Vue Composables
│   │   ├── useTheme.ts          # 主题切换
│   │   ├── useCrypto.ts         # 加密操作
│   │   └── useHistory.ts        # 历史记录
│   ├── components/              # UI 组件
│   │   ├── layout/              # AppHeader, AppFooter
│   │   ├── crypto/              # AlgorithmSelector, InputArea, OutputArea, OptionsPanel
│   │   └── history/             # HistoryPanel
│   ├── views/Home.vue           # 主页面
│   ├── App.vue
│   └── main.ts
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 核心架构设计

### 1. 算法接口 (`src/core/types/crypto.ts`)

```typescript
export enum AlgorithmType {
  HASH = 'hash',
  HMAC = 'hmac', 
  ENCODING = 'encoding',
  SYMMETRIC = 'symmetric',
  ASYMMETRIC = 'asymmetric'
}

export interface ICryptoAlgorithm {
  name: string
  type: AlgorithmType
  description: string
  supportDecrypt: boolean
  encrypt(input: string, options?: CryptoOptions): Promise<CryptoResult>
  decrypt(input: string, options?: CryptoOptions): Promise<CryptoResult>
  getOptionsSchema(): OptionsSchema
}
```

### 2. 算法注册表（单例模式）
- `register(algorithm)` - 注册算法
- `get(name)` - 获取算法
- `getByType(type)` - 按类型获取
- `getAll()` - 获取全部

### 3. 动态调用机制
```typescript
// 使用示例
const result = await AlgorithmRegistry.getInstance()
  .get('AES')
  ?.encrypt(input, { key, iv, mode: 'CBC' })
```

## 实现步骤

### Phase 1: 项目初始化
1. 使用 Vite 创建 Vue 3 + TypeScript 项目
2. 安装依赖：naive-ui, crypto-js, pinia, @vicons/ionicons5
3. 配置 vite.config.ts 和 tsconfig.json

### Phase 2: 核心架构
1. 创建 `src/core/types/crypto.ts` - 类型定义
2. 创建 `src/core/base/CryptoAlgorithm.ts` - 抽象基类
3. 创建 `src/core/registry/AlgorithmRegistry.ts` - 注册表

### Phase 3: 算法实现
按优先级实现各算法（每个单独文件）：
1. 哈希类：MD5, SHA256 (Web Crypto), SHA1, SHA384, MD4, CRC32
2. 编码类：Base64 (原生), Base91
3. HMAC类：HMAC_SHA256 (Web Crypto), HMAC_SHA1, HMAC_SHA384
4. 对称加密：AES (Web Crypto), DES (crypto-js)
5. 非对称加密：RSA, RSA2 (Web Crypto)

### Phase 4: Composables
1. `useTheme.ts` - 主题切换 + localStorage 持久化
2. `useCrypto.ts` - 加密操作核心逻辑
3. `useHistory.ts` - 历史记录管理

### Phase 5: UI 组件
1. `AppHeader.vue` - 顶部导航 + 主题切换
2. `AlgorithmSelector.vue` - 分组下拉选择
3. `InputArea.vue` / `OutputArea.vue` - 输入输出区
4. `OptionsPanel.vue` - 动态参数表单
5. `HistoryPanel.vue` - 历史记录侧边栏

### Phase 6: 页面集成
1. `Home.vue` - 组装所有组件
2. `App.vue` - 主题 Provider 配置
3. 样式优化和响应式布局

## 依赖列表

```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "naive-ui": "^2.38.0",
    "crypto-js": "^4.2.0",
    "pinia": "^2.1.0",
    "@vicons/ionicons5": "^0.12.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.0",
    "@types/crypto-js": "^4.2.0"
  }
}
```

## 验证方式

1. **启动开发服务器**：`npm run dev`
2. **功能测试**：
   - 选择各类算法进行加解密测试
   - 验证 Web Crypto API 优先使用
   - 测试主题切换和持久化
   - 测试历史记录的增删改查
3. **类型检查**：`npm run type-check` (vue-tsc)
4. **构建验证**：`npm run build`

## 扩展新算法

添加新算法只需 3 步：
1. 在 `src/algorithms/<type>/` 创建新文件
2. 继承 `CryptoAlgorithm` 基类实现 `encryptCore`/`decryptCore`
3. 在 `src/algorithms/index.ts` 导入并注册

无需修改其他代码，UI 自动显示新算法。
