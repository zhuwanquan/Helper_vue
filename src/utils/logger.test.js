import { useLogStore } from '@/stores/logStore'

// 测试日志系统功能
const testLogger = () => {
  const logStore = useLogStore()
  console.log('=== 开始测试日志系统 ===')
  
  // 测试不同级别的日志
  logStore.debug('这是一条调试日志', { test: 'debug' })
  logStore.info('这是一条信息日志', { test: 'info' })
  logStore.warn('这是一条警告日志', { test: 'warn' })
  logStore.error('这是一条错误日志', { test: 'error' })
  logStore.fatal('这是一条致命错误日志', { test: 'fatal' })
  
  // 测试错误对象
  try {
    throw new Error('测试错误对象')
  } catch (error) {
    logStore.error(error, { context: 'test-error' })
  }
  
  // 测试本地存储
  logStore.updateConfig({ output: { local: true } })
  logStore.info('测试本地存储日志', { test: 'local' })
  
  // 重新加载本地日志
  logStore.initialize()
  console.log('=== 本地存储的日志 ===')
  console.log(logStore.localLogs)
  
  // 测试日志统计
  console.log('=== 日志统计信息 ===')
  console.log(logStore.logStats)
  
  // 测试日志过滤
  console.log('=== 按级别过滤日志 ===')
  const errorLogs = logStore.filterLogsByLevel('error')
  console.log('错误日志:', errorLogs)
  
  // 测试日志搜索
  console.log('=== 搜索日志 ===')
  const searchResults = logStore.searchLogs('测试')
  console.log('搜索结果:', searchResults)
  
  // 测试日志导出
  console.log('=== 导出日志 ===')
  const exportedLogs = logStore.exportLogs()
  console.log('导出日志长度:', exportedLogs.length)
  
  // 测试配置
  logStore.setLogLevel('warn')
  console.log('=== 配置为 warn 级别后 ===')
  logStore.debug('这条调试日志不应该显示')
  logStore.info('这条信息日志不应该显示')
  logStore.warn('这条警告日志应该显示')
  logStore.error('这条错误日志应该显示')
  
  // 测试切换输出设置
  console.log('=== 测试切换输出设置 ===')
  logStore.toggleConsole(false)
  logStore.toggleLocal(true)
  logStore.toggleApi(false)
  logStore.info('测试输出设置切换', { test: 'output-toggle' })
  
  // 测试重置配置
  console.log('=== 测试重置配置 ===')
  logStore.resetConfig()
  
  // 测试清理过期日志
  console.log('=== 测试清理过期日志 ===')
  logStore.cleanupOldLogs(1)
  
  // 恢复默认配置
  logStore.setLogLevel(import.meta.env.PROD ? 'info' : 'debug')
  
  // 测试清除本地日志
  logStore.clearLocalLogs()
  console.log('=== 清除本地日志后 ===')
  console.log(logStore.localLogs)
  
  console.log('=== 日志系统测试完成 ===')
}

export default testLogger
