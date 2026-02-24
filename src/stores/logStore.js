import { defineStore } from 'pinia'
import logger from '@/utils/logger'

export const useLogStore = defineStore('log', {
  state: () => ({
    config: {
      level: import.meta.env.PROD ? 'info' : 'debug',
      output: {
        console: true,
        local: true,
        api: false
      },
      apiEndpoint: '/api/logs',
      maxLocalLogs: 1000,
      logPrefix: '[HelperVue]'
    },
    localLogs: [],
    isLoading: false,
    lastLogTime: null,
    logStats: {
      today: 0,
      total: 0
    }
  }),

  getters: {
    currentLevel: (state) => state.config.level,
    outputSettings: (state) => state.config.output,
    logCount: (state) => state.localLogs.length,
    isDebugMode: (state) => state.config.level === 'debug',
    isProductionMode: (state) => state.config.level === 'info' || state.config.level === 'warn',
    hasLocalLogs: (state) => state.localLogs.length > 0,
    consoleEnabled: (state) => state.config.output.console,
    localEnabled: (state) => state.config.output.local,
    apiEnabled: (state) => state.config.output.api
  },

  actions: {
    /**
     * 初始化日志存储
     */
    initialize() {
      this.loadConfig()
      this.loadLocalLogs()
      this.calculateStats()
      this.applyConfig()
      this.info('日志系统初始化完成', { version: '1.0.0' })
    },

    /**
     * 应用配置到日志系统
     */
    applyConfig() {
      logger.configure(this.config)
    },

    /**
     * 更新日志配置
     * @param {Object} newConfig - 新的配置
     */
    updateConfig(newConfig) {
      this.config = { ...this.config, ...newConfig }
      this.applyConfig()
      this.saveConfig()
      this.info('日志配置已更新', { config: newConfig })
    },

    /**
     * 更新日志级别
     * @param {string} level - 日志级别
     */
    setLogLevel(level) {
      this.config.level = level
      this.applyConfig()
      this.saveConfig()
      this.info('日志级别已更新', { level })
    },

    /**
     * 更新输出设置
     * @param {Object} output - 输出设置
     */
    setOutput(output) {
      this.config.output = { ...this.config.output, ...output }
      this.applyConfig()
      this.saveConfig()
      this.info('日志输出设置已更新', { output })
    },

    /**
     * 切换控制台输出
     * @param {boolean} enabled - 是否启用
     */
    toggleConsole(enabled) {
      this.config.output.console = enabled
      this.applyConfig()
      this.saveConfig()
    },

    /**
     * 切换本地存储
     * @param {boolean} enabled - 是否启用
     */
    toggleLocal(enabled) {
      this.config.output.local = enabled
      this.applyConfig()
      this.saveConfig()
    },

    /**
     * 切换API上报
     * @param {boolean} enabled - 是否启用
     */
    toggleApi(enabled) {
      this.config.output.api = enabled
      this.applyConfig()
      this.saveConfig()
    },

    /**
     * 加载本地日志
     */
    loadLocalLogs() {
      this.isLoading = true
      try {
        this.localLogs = logger.getLocalLogs()
        this.calculateStats()
      } catch {
        this.localLogs = []
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 清除本地日志
     */
    clearLocalLogs() {
      try {
        logger.clearLocalLogs()
        this.localLogs = []
        this.logStats = { today: 0, total: 0 }
        this.info('本地日志已清除')
      } catch {
        this.warn('清除本地日志失败')
      }
    },

    /**
     * 保存配置到本地存储
     */
    saveConfig() {
      try {
        localStorage.setItem('logConfig', JSON.stringify(this.config))
      } catch {
        this.warn('保存日志配置失败')
      }
    },

    /**
     * 从本地存储加载配置
     */
    loadConfig() {
      try {
        const savedConfig = localStorage.getItem('logConfig')
        if (savedConfig) {
          this.config = { ...this.config, ...JSON.parse(savedConfig) }
          this.applyConfig()
        }
      } catch {
        this.warn('加载日志配置失败')
      }
    },

    /**
     * 重置配置为默认值
     */
    resetConfig() {
      this.config = {
        level: import.meta.env.PROD ? 'info' : 'debug',
        output: {
          console: true,
          local: true,
          api: false
        },
        apiEndpoint: '/api/logs',
        maxLocalLogs: 1000,
        logPrefix: '[HelperVue]'
      }
      this.applyConfig()
      this.saveConfig()
      this.info('日志配置已重置为默认值')
    },

    /**
     * 计算日志统计信息
     */
    calculateStats() {
      const today = new Date().toDateString()
      let todayCount = 0

      this.localLogs.forEach(log => {
        const logDate = new Date(log.timestamp).toDateString()
        if (logDate === today) {
          todayCount++
        }
      })

      this.logStats = {
        today: todayCount,
        total: this.localLogs.length
      }
    },

    /**
     * 按级别过滤日志
     * @param {string} level - 日志级别
     * @returns {Array} 过滤后的日志
     */
    filterLogsByLevel(level) {
      return this.localLogs.filter(log => log.level === level)
    },

    /**
     * 按日期过滤日志
     * @param {string} date - 日期字符串
     * @returns {Array} 过滤后的日志
     */
    filterLogsByDate(date) {
      const targetDate = new Date(date).toDateString()
      return this.localLogs.filter(log => {
        const logDate = new Date(log.timestamp).toDateString()
        return logDate === targetDate
      })
    },

    /**
     * 搜索日志
     * @param {string} keyword - 搜索关键词
     * @returns {Array} 搜索结果
     */
    searchLogs(keyword) {
      const lowerKeyword = keyword.toLowerCase()
      return this.localLogs.filter(log => {
        return (
          log.message.toLowerCase().includes(lowerKeyword) ||
          JSON.stringify(log.meta).toLowerCase().includes(lowerKeyword)
        )
      })
    },

    /**
     * 记录调试日志
     * @param {string} message - 日志消息
     * @param {Object} meta - 元数据
     */
    debug(message, meta = {}) {
      this.updateLastLogTime()
      logger.debug(message, meta)
    },

    /**
     * 记录信息日志
     * @param {string} message - 日志消息
     * @param {Object} meta - 元数据
     */
    info(message, meta = {}) {
      this.updateLastLogTime()
      logger.info(message, meta)
    },

    /**
     * 记录警告日志
     * @param {string} message - 日志消息
     * @param {Object} meta - 元数据
     */
    warn(message, meta = {}) {
      this.updateLastLogTime()
      logger.warn(message, meta)
    },

    /**
     * 记录错误日志
     * @param {string|Error} message - 日志消息或错误对象
     * @param {Object} meta - 元数据
     */
    error(message, meta = {}) {
      this.updateLastLogTime()
      logger.error(message, meta)
    },

    /**
     * 记录致命错误日志
     * @param {string|Error} message - 日志消息或错误对象
     * @param {Object} meta - 元数据
     */
    fatal(message, meta = {}) {
      this.updateLastLogTime()
      logger.fatal(message, meta)
    },

    /**
     * 更新最后日志时间
     */
    updateLastLogTime() {
      this.lastLogTime = new Date().toISOString()
    },

    /**
     * 导出本地日志
     * @returns {string} 导出的日志JSON
     */
    exportLogs() {
      try {
        const exportData = {
          timestamp: new Date().toISOString(),
          config: this.config,
          stats: this.logStats,
          logs: this.localLogs
        }
        return JSON.stringify(exportData, null, 2)
      } catch {
        this.warn('导出日志失败')
        return '{}'
      }
    },

    /**
     * 清理过期日志
     * @param {number} days - 保留天数
     */
    cleanupOldLogs(days = 7) {
      try {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)

        const filteredLogs = this.localLogs.filter(log => {
          return new Date(log.timestamp) >= cutoffDate
        })

        const deletedCount = this.localLogs.length - filteredLogs.length
        this.localLogs = filteredLogs

        // 更新本地存储
        if (this.config.output.local) {
          try {
            localStorage.setItem('appLogs', JSON.stringify(filteredLogs))
          } catch {
            // 忽略存储错误
          }
        }

        this.calculateStats()
        this.info('过期日志已清理', { deletedCount, days })
      } catch {
        this.warn('清理过期日志失败')
      }
    }
  }
})
