function debounce(func, delay = 300, immediate = false) {
  let timer = null

  return function (...args) {
    const callNow = immediate && !timer

    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      timer = null
      if (!immediate) {
        func.apply(this, args)
      }
    }, delay)

    if (callNow) {
      func.apply(this, args)
    }
  }
}

function throttle(func, delay = 300) {
  let lastTime = 0
  let timer = null

  return function (...args) {
    const now = Date.now()
    const remaining = delay - (now - lastTime)

    if (remaining <= 0 || remaining > delay) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      lastTime = now
      func.apply(this, args)
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now()
        timer = null
        func.apply(this, args)
      }, remaining)
    }
  }
}

export default {
  debounce,
  throttle,
}
