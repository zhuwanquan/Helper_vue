import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import { ErrorHandler } from './utils/errorHandler'
import { useLogStore } from './stores/logStore'
import testLogger from './utils/logger.test'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 初始化日志存储
const logStore = useLogStore()
logStore.loadConfig()
logStore.initialize()

// 配置错误处理
app.config.errorHandler = ErrorHandler.handleVueError

window.addEventListener('unhandledrejection', ErrorHandler.handleUnhandledRejection)

window.addEventListener('error', ErrorHandler.handleGlobalError)

// 测试日志系统
if (!import.meta.env.PROD) {
  testLogger()
}

// 记录应用启动
logStore.info('应用启动', {
  version: '1.0.0',
  env: import.meta.env.MODE
})

app.mount('#app')
