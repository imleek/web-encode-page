import { createApp } from 'vue'
import App from './App.vue'
import { registerAllAlgorithms } from '@/algorithms'

// 注册所有加密算法
registerAllAlgorithms()

// 创建并挂载应用
createApp(App).mount('#app')
