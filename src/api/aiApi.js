const createApiClient = () => {
  /**
   * 获取请求头
   * @param {string} contentType - 请求内容类型
   * @returns {Object} 请求头对象
   */
  const getHeaders = (contentType = 'application/json') => {
    const token = localStorage.getItem('token')
    const headers = {
      'Content-Type': contentType,
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  /**
   * 处理 SSE 流
   * @param {Response} response - Fetch API 响应对象
   * @param {Function} onMessage - 消息回调函数
   * @param {Function} onError - 错误回调函数
   * @param {Function} onComplete - 完成回调函数
   * @param {AbortSignal} signal - 取消信号
   * @returns {Promise} 处理结果
   */
  const handleSSE = (response, onMessage, onError, onComplete, signal) => {
    return new Promise((resolve, reject) => {
      // 检查响应状态
      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`)
        if (onError) onError(error.message)
        reject(error)
        return
      }

      // 检查 signal 是否已被取消
      if (signal?.aborted) {
        const error = new Error('Request aborted')
        if (onError) onError(error.message)
        reject(error)
        return
      }

      // 获取读取器和解码器
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      // 监听取消事件
      if (signal) {
        signal.addEventListener('abort', () => {
          reader.cancel()
          const error = new Error('Request aborted')
          if (onError) onError(error.message)
          reject(error)
        })
      }

      /**
       * 读取流数据
       */
      function read() {
        reader
          .read()
          .then(({ done, value }) => {
            if (done) {
              if (onComplete) onComplete()
              resolve()
              return
            }

            try {
              const chunk = decoder.decode(value, { stream: true })
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data:')) {
                  const data = line.slice(5).trim()
                  if (data === '[DONE]') {
                    if (onComplete) onComplete()
                    resolve()
                    return
                  }
                  try {
                    const parsed = JSON.parse(data)
                    if (parsed.event === 'message' && onMessage) {
                      onMessage(parsed.data)
                    } else if (parsed.event === 'error' && onError) {
                      onError(parsed.data)
                    }
                  } catch (e) {
                    console.error('SSE消息解析错误:', e)
                    if (onMessage) {
                      onMessage(data)
                    }
                  }
                }
              }
            } catch (e) {
              console.error('流处理错误:', e)
              if (onError) onError(e.message)
            }

            read()
          })
          .catch((error) => {
            console.error('读取流错误:', error)
            if (onError) onError(error.message)
            reject(error)
          })
      }

      read()
    })
  }

  return {
    /**
     * 聊天流
     * @param {string} message - 聊天消息
     * @param {string} [systemPrompt] - 系统提示
     * @param {Function} onMessage - 消息回调函数
     * @param {Function} onError - 错误回调函数
     * @param {Function} onComplete - 完成回调函数
     * @param {AbortSignal} [signal] - 取消信号
     * @returns {Promise} 处理结果
     */
    chatStream(message, systemPrompt = null, onMessage, onError, onComplete, signal) {
      const params = new URLSearchParams()
      params.append('message', message)
      if (systemPrompt) {
        params.append('systemPrompt', systemPrompt)
      }

      return fetch(`/api/ai/chat/stream?${params.toString()}`, {
        method: 'POST',
        headers: getHeaders('application/x-www-form-urlencoded'),
        signal,
      })
        .then((response) => handleSSE(response, onMessage, onError, onComplete, signal))
        .catch((error) => {
          console.error('请求错误:', error)
          if (onError) onError(error.message)
          throw error
        })
    },

    /**
     * 对话流
     * @param {Array} messages - 对话消息数组
     * @param {string} [systemPrompt] - 系统提示
     * @param {Function} onMessage - 消息回调函数
     * @param {Function} onError - 错误回调函数
     * @param {Function} onComplete - 完成回调函数
     * @param {AbortSignal} [signal] - 取消信号
     * @returns {Promise} 处理结果
     */
    conversationStream(messages, systemPrompt = null, onMessage, onError, onComplete, signal) {
      const params = new URLSearchParams()
      if (systemPrompt) {
        params.append('systemPrompt', systemPrompt)
      }

      return fetch(`/api/ai/chat/conversation?${params.toString()}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(messages),
        signal,
      })
        .then((response) => handleSSE(response, onMessage, onError, onComplete, signal))
        .catch((error) => {
          console.error('请求错误:', error)
          if (onError) onError(error.message)
          throw error
        })
    },
  }
}

export const aiApi = createApiClient()
