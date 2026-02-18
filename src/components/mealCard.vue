<script setup>
import { Picture } from '@element-plus/icons-vue'

const nutritionLabels = {
  energy: '能量',
  protein: '蛋白质',
  transFat: '反式脂肪',
  saturatedFat: '饱和脂肪',
  carbohydrate: '碳水化合物',
  addedSugar: '添加糖',
  salt: '盐',
  dietaryFiber: '膳食纤维',
}

defineProps({
  title: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  info: {
    type: Object,
    default: () => ({}),
  },
  checked: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:checked', 'check'])

const handleCheck = (event) => {
  const isChecked = event.target.checked
  emit('update:checked', isChecked)
  emit('check', isChecked)
}

const getLabel = (key) => {
  return nutritionLabels[key] || key
}
</script>

<template>
  <el-card class="meal-card" shadow="hover">
    <div class="meal-card__checkbox">
      <input
        type="checkbox"
        :checked="checked"
        :disabled="disabled"
        @change="handleCheck"
        class="meal-card__checkbox-input"
      />
    </div>
    <div class="meal-card__image">
      <img :src="imageUrl" :alt="title" v-if="imageUrl" />
      <div class="meal-card__placeholder" v-else>
        <el-icon><Picture /></el-icon>
      </div>
    </div>
    <div class="meal-card__content">
      <h3 class="meal-card__title">{{ title }}</h3>
      <div class="meal-card__info">
        <div v-for="(value, key) in info" :key="key" class="meal-card__info-item">
          <span class="meal-card__info-label">{{ getLabel(key) }}:</span>
          <span class="meal-card__info-value">{{ value }}</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.meal-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.meal-card:hover {
  transform: translateY(-4px);
}

.meal-card__checkbox {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}

.meal-card__checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.meal-card__image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f7fa;
}

.meal-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.meal-card:hover .meal-card__image img {
  transform: scale(1.05);
}

.meal-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 48px;
}

.meal-card__content {
  padding: 16px;
}

.meal-card__title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meal-card__info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meal-card__info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.meal-card__info-label {
  color: #909399;
}

.meal-card__info-value {
  color: #606266;
  font-weight: 500;
}
</style>
