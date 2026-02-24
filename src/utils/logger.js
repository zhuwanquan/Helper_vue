import axios from 'axios'

class Logger {
  constructor() {
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      fatal: 4
    }

    this.consoleColors = {
      debug: 'color: #9CA3AF',
      info: 'color: #3B82F6',
      warn: 'color: #F59E0B',
      error: 'color: #EF4444',
      fatal: 'color: #7E22CE'
    }

    this.config = {
      level: 'info',
      output: {
        console: true,
        local: false,
        api: false
      },
      apiEndpoint: '/api/logs',
      maxLocalLogs: 1000,
      logPrefix: '[HelperVue]'
    }
  }

  /**
   * 配置日志系统
   * @param {Object} config - 配置选项
   */
  configure(config) {
    this.config = { ...this.config, ...config }
  }

  /**
   * 检查日志级别是否应该被记录
   * @param {string} level - 日志级别
   * @returns {boolean} 是否应该记录
   */
  shouldLog(level) {
    return this.levels[level] >= this.levels[this.config.level]
  }

  /**
   * 生成日志对象
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   * @returns {Object} 日志对象
   */
  createLogObject(level, message, meta = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta: {
        ...meta,
        userId: localStorage.getItem('userId'),
        sessionId: this.getSessionId(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    }
  }

  /**
   * 获取或创建会话ID
   * @returns {string} 会话ID
   */
  getSessionId() {
    let sessionId = localStorage.getItem('sessionId')
    if (!sessionId) {
      sessionId = this.generateUUID()
      localStorage.setItem('sessionId', sessionId)
    }
    return sessionId
  }

  /**
   * 生成UUID
   * @returns {string} UUID
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  /**
   * 控制台输出日志
   * @param {Object} logObj - 日志对象
   */
  logToConsole(logObj) {
    if (!this.config.output.console) return

    const { level, message, meta, timestamp } = logObj
    const color = this.consoleColors[level]

    console.log(
      `%c${this.config.logPrefix} [${level.toUpperCase()}] ${timestamp}`,
      color,
      message,
      meta
    )
  }

  /**
   * 本地存储日志
   * @param {Object} logObj - 日志对象
   */
  logToLocal(logObj) {
    if (!this.config.output.local) return

    try {
      const logs = JSON.parse(localStorage.getItem('appLogs') || '[]')
      logs.push(logObj)

      if (logs.length > this.config.maxLocalLogs) {
        logs.splice(0, logs.length - this.config.maxLocalLogs)
      }

      localStorage.setItem('appLogs', JSON.stringify(logs))
    } catch {
      // 忽略本地存储错误
    }
  }

  /**
   * API上报日志
   * @param {Object} logObj - 日志对象
   */
  logToApi(logObj) {
    if (!this.config.output.api) return
    
    try {
      axios.post(this.config.apiEndpoint, logObj, {
        timeout: 2000,
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(() => {
        // 静默忽略API上报错误，避免影响主流程
      })
    } catch {
      // 忽略API上报错误
    }
  }

  /**
   * 记录日志
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   */
  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return

    const logObj = this.createLogObject(level, message, meta)

    this.logToConsole(logObj)
    this.logToLocal(logObj)
    this.logToApi(logObj)
  }

  /**
   * 记录调试日志
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   */
  debug(message, meta = {}) {
    this.log('debug', message, meta)
  }

  /**
   * 记录信息日志
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   */
  info(message, meta = {}) {
    this.log('info', message, meta)
  }

  /**
   * 记录警告日志
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   */
  warn(message, meta = {}) {
    this.log('warn', message, meta)
  }

  /**
   * 记录错误日志
   * @param {string|Error} message - 日志消息或错误对象
   * @param {Object} meta - 元数据
   */
  error(message, meta = {}) {
    let errorMessage = message
    let errorMeta = { ...meta }

    if (message instanceof Error) {
      errorMessage = message.message
      errorMeta = {
        ...errorMeta,
        stack: message.stack,
        name: message.name
      }
    }

    this.log('error', errorMessage, errorMeta)
  }

  /**
   * 记录致命错误日志
   * @param {string|Error} message - 日志消息或错误对象
   * @param {Object} meta - 元数据
   */
  fatal(message, meta = {}) {
    let errorMessage = message
    let errorMeta = { ...meta }

    if (message instanceof Error) {
      errorMessage = message.message
      errorMeta = {
        ...errorMeta,
        stack: message.stack,
        name: message.name
      }
    }

    this.log('fatal', errorMessage, errorMeta)
  }

  /**
   * 清除本地存储的日志
   */
  clearLocalLogs() {
    try {
      localStorage.removeItem('appLogs')
    } catch {
      // 忽略清除错误
    }
  }

  /**
   * 获取本地存储的日志
   * @returns {Array} 日志数组
   */
  getLocalLogs() {
    try {
      return JSON.parse(localStorage.getItem('appLogs') || '[]')
    } catch {
      // 忽略读取错误
      return []
    }
  }
}

// 导出单例实例
const logger = new Logger()
export default logger

// 导出类，以便在需要时创建新实例
export { Logger }
