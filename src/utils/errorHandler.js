import { ElMessage } from 'element-plus'

export class ErrorHandler {
  static showError(message, duration = 3000) {
    ElMessage.error({
      message,
      duration
    })
  }

  static showSuccess(message, duration = 2000) {
    ElMessage.success({
      message,
      duration
    })
  }

  static showWarning(message, duration = 2500) {
    ElMessage.warning({
      message,
      duration
    })
  }

  static showInfo(message, duration = 2000) {
    ElMessage.info({
      message,
      duration
    })
  }

  static handleApiError(error) {
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

      this.showError(message)
      return message
    } else if (error.request) {
      const message = '网络错误，请检查网络连接'
      this.showError(message)
      return message
    } else {
      const message = error.message || '未知错误'
      this.showError(message)
      return message
    }
  }

  static handleSseError(error) {
    let message = '请求失败'

    if (error.message.includes('HTTP error')) {
      const statusMatch = error.message.match(/status: (\d+)/)
      if (statusMatch) {
        const status = parseInt(statusMatch[1])
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

    this.showError(message)
    return message
  }

  static reportError(error, context = {}) {
    console.error('上报错误:', error, context)
  }
}

export default ErrorHandler
