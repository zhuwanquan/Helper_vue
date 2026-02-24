<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <h3>抱歉，页面出现了错误</h3>
      <p class="error-message">{{ errorMessage }}</p>
      <el-button type="primary" @click="resetError">重试</el-button>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')

const emit = defineEmits(['reset'])

const resetError = () => {
  hasError.value = false
  errorMessage.value = ''
  emit('reset')
}

const handleError = (err) => {
  hasError.value = true
  errorMessage.value = err.message || '未知错误'
  console.error('错误边界捕获错误:', err)
  return true
}

onErrorCaptured(handleError)
</script>

<style scoped>
.error-boundary {
  padding: 60px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-content {
  text-align: center;
  background-color: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
}

.error-content h3 {
  color: #f56c6c;
  margin-bottom: 16px;
  font-size: 20px;
}

.error-message {
  color: #606266;
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 1.6;
}
</style>
