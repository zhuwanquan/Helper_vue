import { ErrorHandler } from '@/utils/errorHandler'

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

  const handleSSE = (response, onMessage, onError, onComplete, signal) => {
    return new Promise((resolve, reject) => {
      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`)
        const errorMessage = ErrorHandler.handleSseError(error)
        if (onError) onError(errorMessage)
        reject(error)
        return
      }

      if (signal?.aborted) {
        const error = new Error('Request aborted')
        const errorMessage = ErrorHandler.handleSseError(error)
        if (onError) onError(errorMessage)
        reject(error)
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      if (signal) {
        signal.addEventListener('abort', () => {
          reader.cancel()
          const error = new Error('Request aborted')
          const errorMessage = ErrorHandler.handleSseError(error)
          if (onError) onError(errorMessage)
          reject(error)
        })
      }

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
              const errorMessage = ErrorHandler.handleSseError(e)
              if (onError) onError(errorMessage)
            }

            read()
          })
          .catch((error) => {
            console.error('读取流错误:', error)
            const errorMessage = ErrorHandler.handleSseError(error)
            if (onError) onError(errorMessage)
            reject(error)
          })
      }

      read()
    })
  }

  return {
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
          const errorMessage = ErrorHandler.handleSseError(error)
          if (onError) onError(errorMessage)
          throw error
        })
    },

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
          const errorMessage = ErrorHandler.handleSseError(error)
          if (onError) onError(errorMessage)
          throw error
        })
    },
  }
}

export const aiApi = createApiClient()
