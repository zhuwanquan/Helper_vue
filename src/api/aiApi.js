export const aiApi = {
  chatStream(message, systemPrompt = null, onMessage, onError, onComplete) {
    return new Promise((resolve, reject) => {
      const params = new URLSearchParams()
      params.append('message', message)
      if (systemPrompt) {
        params.append('systemPrompt', systemPrompt)
      }

      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      fetch(`/api/ai/chat/stream?${params.toString()}`, {
        method: 'POST',
        headers,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const reader = response.body.getReader()
          const decoder = new TextDecoder()

          function read() {
            reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  if (onComplete) onComplete()
                  resolve()
                  return
                }

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
        .catch((error) => {
          console.error('请求错误:', error)
          if (onError) onError(error.message)
          reject(error)
        })
    })
  },

  conversationStream(messages, systemPrompt = null, onMessage, onError, onComplete) {
    return new Promise((resolve, reject) => {
      const params = new URLSearchParams()
      if (systemPrompt) {
        params.append('systemPrompt', systemPrompt)
      }

      fetch(`/api/ai/chat/conversation?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const reader = response.body.getReader()
          const decoder = new TextDecoder()

          function read() {
            reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  if (onComplete) onComplete()
                  resolve()
                  return
                }

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
        .catch((error) => {
          console.error('请求错误:', error)
          if (onError) onError(error.message)
          reject(error)
        })
    })
  },
}
