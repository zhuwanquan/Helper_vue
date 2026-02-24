<script setup>
import { ref } from 'vue'
import { aiApi } from '@/api/aiApi'
import { useMealStore } from '@/stores/mealStore'
import { calculateTotalNutrition } from '@/utils/mealUtils'

const mealStore = useMealStore()

const userInput = ref('')
const chatMessages = ref([])
const isLoading = ref(false)
const eventSource = ref(null)
const chatContainer = ref(null)
const todayNutrition = ref(null)

const systemPrompt = ref('你是一位专业的营养分析专家。请根据用户提供的食物信息，分析其营养成分、热量、以及健康建议。请用简洁、专业的语言回答。')

const loadTodayNutrition = () => {
  const selectedMeals = mealStore.selectedMeals
  if (selectedMeals.length === 0) {
    chatMessages.value.push({
      role: 'assistant',
      content: '今日暂无选中的餐品数据，请先在餐品记录中选择今日摄入的餐品。',
    })
    scrollToBottom()
    return
  }

  const totalNutrition = calculateTotalNutrition(selectedMeals)
  todayNutrition.value = totalNutrition

  const nutritionText = `今日营养摄入数据：
- 能量：${totalNutrition.energy} kcal
- 蛋白质：${totalNutrition.protein} g
- 反式脂肪酸：${totalNutrition.trans_fat} g
- 饱和脂肪：${totalNutrition.saturated_fat} g
- 碳水化合物：${totalNutrition.carbohydrate} g
- 添加糖：${totalNutrition.added_sugar} g
- 食盐：${totalNutrition.salt} g
- 膳食纤维：${totalNutrition.dietary_fiber} g

共选择了 ${selectedMeals.length} 个餐品。`

  chatMessages.value.push({
    role: 'assistant',
    content: nutritionText,
  })
  scrollToBottom()

  userInput.value = `我今日摄入了能量${totalNutrition.energy}kcal，蛋白质${totalNutrition.protein}g，碳水化合物${totalNutrition.carbohydrate}g，脂肪${totalNutrition.saturated_fat}g，请帮我分析今日营养摄入是否均衡，并给出改善建议。`
}

const sendMessage = () => {
  if (!userInput.value.trim() || isLoading.value) {
    return
  }

  const message = userInput.value.trim()
  userInput.value = ''

  chatMessages.value.push({
    role: 'user',
    content: message,
  })

  isLoading.value = true

  let aiResponse = ''
  const aiMessageIndex = chatMessages.value.length
  chatMessages.value.push({
    role: 'assistant',
    content: '',
  })

  eventSource.value = aiApi.chatStream(
    message,
    systemPrompt.value,
    (chunk) => {
      aiResponse += chunk
      chatMessages.value[aiMessageIndex].content = aiResponse
      scrollToBottom()
    },
    (error) => {
      console.error('流式聊天错误:', error)
      chatMessages.value[aiMessageIndex].content = '抱歉，发生错误：' + error
      isLoading.value = false
    },
    () => {
      console.log('流式响应完成')
      isLoading.value = false
    }
  )
}

const stopGeneration = () => {
  if (eventSource.value) {
    eventSource.value.close()
    eventSource.value = null
  }
  isLoading.value = false
}

const clearChat = () => {
  if (eventSource.value) {
    eventSource.value.close()
    eventSource.value = null
  }
  chatMessages.value = []
  isLoading.value = false
}

const scrollToBottom = () => {
  setTimeout(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  }, 10)
}
</script>

<template>
  <div class="nutrition-analysis">
    <div class="nutrition-analysis__header">
      <h2 class="nutrition-analysis__title">营养分析</h2>
      <div class="nutrition-analysis__header-actions">
        <el-button type="success" plain @click="loadTodayNutrition" :disabled="isLoading">
          今日营养摄入
        </el-button>
        <el-button type="danger" plain @click="clearChat" :disabled="isLoading">清空对话</el-button>
      </div>
    </div>

    <div class="nutrition-analysis__chat-container" ref="chatContainer">
      <div v-if="chatMessages.length === 0" class="nutrition-analysis__empty">
        <el-empty description="开始对话，获取营养分析建议" />
      </div>

      <div
        v-for="(message, index) in chatMessages"
        :key="index"
        :class="['nutrition-analysis__message', `nutrition-analysis__message--${message.role}`]"
      >
        <div class="nutrition-analysis__message-avatar">
          <el-icon v-if="message.role === 'user'" :size="24"><User /></el-icon>
          <el-icon v-else :size="24"><ChatDotRound /></el-icon>
        </div>
        <div class="nutrition-analysis__message-content">
          <div class="nutrition-analysis__message-text" v-html="formatMessage(message.content)"></div>
        </div>
      </div>

      <div v-if="isLoading" class="nutrition-analysis__loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>正在分析...</span>
      </div>
    </div>

    <div class="nutrition-analysis__input-area">
      <el-input
        v-model="userInput"
        type="textarea"
        :rows="3"
        placeholder="请输入食物信息，例如：我今天吃了100g鸡胸肉、200g米饭、50g西兰花，请帮我分析营养成分..."
        @keydown.ctrl.enter="sendMessage"
        :disabled="isLoading"
      />
      <div class="nutrition-analysis__actions">
        <el-button
          v-if="isLoading"
          type="danger"
          @click="stopGeneration"
        >
          停止生成
        </el-button>
        <el-button
          v-else
          type="primary"
          @click="sendMessage"
          :disabled="!userInput.trim()"
        >
          发送 (Ctrl+Enter)
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { User, ChatDotRound, Loading } from '@element-plus/icons-vue'

export default {
  name: 'NutritionAnalysis',
  components: {
    User,
    ChatDotRound,
    Loading,
  },
  methods: {
    formatMessage(content) {
      if (!content) return ''
      return content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
    },
  },
}
</script>

<style scoped>
.nutrition-analysis {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  padding: 20px;
}

.nutrition-analysis__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.nutrition-analysis__title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.nutrition-analysis__header-actions {
  display: flex;
  gap: 12px;
}

.nutrition-analysis__chat-container {
  flex: 1;
  overflow-y: auto;
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.nutrition-analysis__empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.nutrition-analysis__message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.nutrition-analysis__message--user {
  flex-direction: row-reverse;
}

.nutrition-analysis__message-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.nutrition-analysis__message--user .nutrition-analysis__message-avatar {
  background: #409eff;
  color: white;
}

.nutrition-analysis__message--assistant .nutrition-analysis__message-avatar {
  background: #67c23a;
  color: white;
}

.nutrition-analysis__message-content {
  flex: 1;
  max-width: 70%;
}

.nutrition-analysis__message--user .nutrition-analysis__message-content {
  display: flex;
  justify-content: flex-end;
}

.nutrition-analysis__message-text {
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.6;
  word-wrap: break-word;
}

.nutrition-analysis__message--user .nutrition-analysis__message-text {
  background: #409eff;
  color: white;
  border-bottom-right-radius: 4px;
}

.nutrition-analysis__message--assistant .nutrition-analysis__message-text {
  background: white;
  color: #303133;
  border: 1px solid #e4e7ed;
  border-bottom-left-radius: 4px;
}

.nutrition-analysis__loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  width: fit-content;
}

.nutrition-analysis__input-area {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e4e7ed;
}

.nutrition-analysis__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

@media (max-width: 768px) {
  .nutrition-analysis {
    padding: 10px;
    height: calc(100vh - 100px);
  }

  .nutrition-analysis__message-content {
    max-width: 85%;
  }

  .nutrition-analysis__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
