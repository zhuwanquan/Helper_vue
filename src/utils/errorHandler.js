import { ElMessage } from 'element-plus'
import { useLogStore } from '@/stores/logStore'

export class ErrorHandler {
  /**
   * 显示错误消息
   * @param {string} message - 错误消息
   * @param {number} duration - 显示时长
   */
  static showError(message, duration = 3000) {
    ElMessage.error({
      message,
      duration
    })
  }

  /**
   * 显示成功消息
   * @param {string} message - 成功消息
   * @param {number} duration - 显示时长
   */
  static showSuccess(message, duration = 2000) {
    ElMessage.success({
      message,
      duration
    })
  }

  /**
   * 显示警告消息
   * @param {string} message - 警告消息
   * @param {number} duration - 显示时长
   */
  static showWarning(message, duration = 2500) {
    ElMessage.warning({
      message,
      duration
    })
  }

  /**
   * 显示信息消息
   * @param {string} message - 信息消息
   * @param {number} duration - 显示时长
   */
  static showInfo(message, duration = 2000) {
    ElMessage.info({
      message,
      duration
    })
  }

  /**
   * 处理API错误
   * @param {Object} error - 错误对象
   * @returns {string} 错误消息
   */
  static handleApiError(error) {
    const logStore = useLogStore()
    
    if (error.response) {
      const { status, data } = error.response
      let message = '请求失败'

      switch (status) {
        case 401:
          message = '未授权，请重新登录'
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器错误'
          break
        default:
          message = data?.message || '请求失败'
      }

      logStore.error(message, {
        type: 'api-error',
        status,
        url: error.config?.url,
        method: error.config?.method,
        response: {
          status,
          data: this.sanitizeData(data)
        }
      })

      this.showError(message)
      return message
    } else if (error.request) {
      const message = '网络错误，请检查网络连接'
      logStore.error(message, {
        type: 'network-error',
        url: error.config?.url,
        method: error.config?.method
      })
      this.showError(message)
      return message
    } else {
      const message = error.message || '未知错误'
      logStore.error(message, {
        type: 'unknown-error',
        error: error.toString()
      })
      this.showError(message)
      return message
    }
  }

  /**
   * 处理SSE错误
   * @param {Object} error - 错误对象
   * @returns {string} 错误消息
   */
  static handleSseError(error) {
    const logStore = useLogStore()
    let message = '请求失败'
    let status = null

    if (error.message.includes('HTTP error')) {
      const statusMatch = error.message.match(/status: (\d+)/)
      if (statusMatch) {
        status = parseInt(statusMatch[1])
        switch (status) {
          case 401:
            message = '未授权，请重新登录'
            localStorage.removeItem('token')
            window.location.href = '/login'
            break
          case 403:
            message = '拒绝访问'
            break
          case 404:
            message = '请求的资源不存在'
            break
          case 500:
            message = '服务器错误'
            break
          default:
            message = `请求失败 (${status})`
        }
      }
    } else if (error.message.includes('aborted')) {
      message = '请求已取消'
    } else if (error.message.includes('Failed to fetch')) {
      message = '网络错误，请检查网络连接'
    } else {
      message = error.message || '未知错误'
    }

    logStore.error(message, {
      type: 'sse-error',
      status,
      error: error.toString()
    })

    this.showError(message)
    return message
  }

  /**
   * 上报未处理的错误
   * @param {Error|string} error - 错误对象或错误消息
   * @param {Object} context - 上下文信息
   */
  static reportError(error, context = {}) {
    const logStore = useLogStore()
    logStore.error(error, {
      type: 'unhandled-error',
      ...context
    })
  }

  /**
   * 处理Vue应用错误
   * @param {Error} err - 错误对象
   * @param {Object} instance - Vue实例
   * @param {string} info - 错误信息
   */
  static handleVueError(err, instance, info) {
    const logStore = useLogStore()
    logStore.error(err, {
      type: 'vue-error',
      instance: instance?.$options?.name || 'Unknown',
      info
    })
  }

  /**
   * 处理未捕获的Promise拒绝
   * @param {Event} event - 事件对象
   */
  static handleUnhandledRejection(event) {
    const logStore = useLogStore()
    logStore.error(event.reason, {
      type: 'unhandled-rejection'
    })
  }

  /**
   * 处理全局错误
   * @param {Event} event - 事件对象
   */
  static handleGlobalError(event) {
    const logStore = useLogStore()
    logStore.error(event.error, {
      type: 'global-error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  }

  /**
   * 清理数据，移除敏感信息
   * @param {Object} data - 原始数据
   * @returns {Object} 清理后的数据
   */
  static sanitizeData(data) {
    if (!data || typeof data !== 'object') {
      return data
    }

    const sanitized = { ...data }
    const sensitiveFields = ['password', 'token', 'auth', 'secret']

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***'
      }
    })

    return sanitized
  }
}

export default ErrorHandler
