import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import { ErrorHandler } from './utils/errorHandler'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.config.errorHandler = (err, instance, info) => {
  console.error('Vue 应用错误:', err)
  console.error('错误实例:', instance)
  console.error('错误信息:', info)
  ErrorHandler.reportError(err, { instance, info })
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 拒绝:', event.reason)
  ErrorHandler.reportError(event.reason, { type: 'unhandledrejection' })
  event.preventDefault()
})

window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error)
  ErrorHandler.reportError(event.error, { type: 'global-error' })
})

app.mount('#app')
