<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getTodayMealsFromStorage } from '@/utils/storage'
import {
  nutritionStandards,
  calculateNutritionPercentage,
  assessNutritionStatus,
  getStatusColor,
} from '@/utils/nutritionStandards'
import {
  calculateTotalNutrition,
  toChineseKey,
  toEnglishKey,
  formatNutritionValue,
} from '@/utils/mealUtils'

const selectedMeals = ref([])
const totalNutrition = ref({})
const nutritionAssessment = ref({})
const radarChart = ref(null)
const barChart = ref(null)

const calculateTotalNutritionData = () => {
  const meals = getTodayMealsFromStorage()
  selectedMeals.value = meals

  const total = calculateTotalNutrition(meals)

  Object.keys(total).forEach((key) => {
    const chineseKey = toChineseKey(key)
    totalNutrition.value[chineseKey] = formatNutritionValue(total[key], key)
  })

  assessNutrition()
}

const assessNutrition = () => {
  const assessment = {}
  Object.keys(nutritionStandards).forEach((key) => {
    const chineseKey = toChineseKey(key)
    const intake = totalNutrition.value[chineseKey] || '0'
    const standard = nutritionStandards[key]
    const percentage = calculateNutritionPercentage(intake, standard)
    const status = assessNutritionStatus(percentage)
    const color = getStatusColor(status)

    assessment[chineseKey] = {
      intake,
      standard,
      percentage: (percentage * 100).toFixed(1),
      status,
      color,
    }
  })
  nutritionAssessment.value = assessment
}

const initRadarChart = () => {
  if (!radarChart.value) return

  const myChart = echarts.init(radarChart.value)

  const indicators = Object.keys(nutritionStandards).map((key) => ({
    name: toChineseKey(key),
    max: 100,
  }))

  const seriesData = Object.keys(nutritionStandards).map((key) => {
    const chineseKey = toChineseKey(key)
    const assessment = nutritionAssessment.value[chineseKey]
    return parseFloat(assessment.percentage)
  })

  const option = {
    title: {
      text: '营养摄入雷达图',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
      },
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      data: ['实际摄入', '标准值'],
      bottom: 10,
    },
    radar: {
      indicator: indicators,
      radius: '65%',
    },
    series: [
      {
        name: '营养摄入对比',
        type: 'radar',
        data: [
          {
            value: seriesData,
            name: '实际摄入',
            areaStyle: {
              color: 'rgba(64, 158, 255, 0.2)',
            },
            lineStyle: {
              color: '#409EFF',
            },
            itemStyle: {
              color: '#409EFF',
            },
          },
          {
            value: Array(indicators.length).fill(100),
            name: '标准值',
            lineStyle: {
              color: '#67C23A',
              type: 'dashed',
            },
            itemStyle: {
              color: '#67C23A',
            },
          },
        ],
      },
    ],
  }

  myChart.setOption(option)

  window.addEventListener('resize', () => {
    myChart.resize()
  })
}

const initBarChart = () => {
  if (!barChart.value) return

  const myChart = echarts.init(barChart.value)

  const categories = Object.keys(nutritionStandards).map((key) => toChineseKey(key))
  const intakeData = categories.map((chineseKey) => {
    return parseFloat(totalNutrition.value[chineseKey]?.replace(/[^\d.]/g, '') || 0)
  })
  const standardData = categories.map((chineseKey) => {
    const englishKey = toEnglishKey(chineseKey)
    return parseFloat(nutritionStandards[englishKey].replace(/[^\d.]/g, ''))
  })
  const statusColors = categories.map((chineseKey) => {
    return nutritionAssessment.value[chineseKey].color
  })

  const option = {
    title: {
      text: '营养摄入与标准值对比',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['实际摄入', '标准值'],
      bottom: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        rotate: 45,
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      name: '摄入量',
    },
    series: [
      {
        name: '实际摄入',
        type: 'bar',
        data: intakeData,
        itemStyle: {
          color: function (params) {
            return statusColors[params.dataIndex]
          },
        },
      },
      {
        name: '标准值',
        type: 'bar',
        data: standardData,
        itemStyle: {
          color: '#909399',
        },
      },
    ],
  }

  myChart.setOption(option)

  window.addEventListener('resize', () => {
    myChart.resize()
  })
}

const severeDeficiencies = computed(() => {
  return Object.entries(nutritionAssessment.value)
    .filter(([, assessment]) => assessment.status === '缺乏')
    .sort((a, b) => parseFloat(a[1].percentage) - parseFloat(b[1].percentage))
})

const excessNutrition = computed(() => {
  return Object.entries(nutritionAssessment.value)
    .filter(([, assessment]) => assessment.status === '过量')
    .sort((a, b) => parseFloat(b[1].percentage) - parseFloat(a[1].percentage))
})

const refreshCharts = () => {
  nextTick(() => {
    initRadarChart()
    initBarChart()
  })
}

watch(
  nutritionAssessment,
  () => {
    refreshCharts()
  },
  { deep: true },
)

onMounted(() => {
  calculateTotalNutritionData()
  nextTick(() => {
    initRadarChart()
    initBarChart()
  })
})
</script>

<template>
  <div class="nutrition-visualization">
    <div class="nutrition-visualization__header">
      <h2 class="nutrition-visualization__title">营养可视化分析</h2>
    </div>

    <div class="nutrition-visualization__content">
      <div v-if="selectedMeals.length > 0">
        <div class="nutrition-visualization__overview">
          <h3 class="nutrition-visualization__subtitle">营养状态评估</h3>
          <div class="nutrition-visualization__status-grid">
            <div
              v-for="(assessment, key) in nutritionAssessment"
              :key="key"
              class="nutrition-visualization__status-item"
            >
              <div class="nutrition-visualization__status-label">{{ key }}</div>
              <div class="nutrition-visualization__status-value">
                {{ totalNutrition[key] || '0' }} / {{ nutritionStandards[toEnglishKey(key)] }}
              </div>
              <div
                class="nutrition-visualization__status-badge"
                :style="{ backgroundColor: assessment.color }"
              >
                {{ assessment.status }}
              </div>
              <div class="nutrition-visualization__status-percentage">
                {{ assessment.percentage }}%
              </div>
            </div>
          </div>
        </div>

        <div class="nutrition-visualization__alerts">
          <div
            v-if="severeDeficiencies.length > 0"
            class="nutrition-visualization__alert nutrition-visualization__alert--warning"
          >
            <h4 class="nutrition-visualization__alert-title">⚠️ 营养缺乏提醒</h4>
            <ul class="nutrition-visualization__alert-list">
              <li v-for="(item, index) in severeDeficiencies" :key="index">
                {{ item[0] }} 摄入严重不足，仅为标准值的 {{ item[1].percentage }}%
              </li>
            </ul>
          </div>

          <div
            v-if="excessNutrition.length > 0"
            class="nutrition-visualization__alert nutrition-visualization__alert--info"
          >
            <h4 class="nutrition-visualization__alert-title">⚠️ 营养过量提醒</h4>
            <ul class="nutrition-visualization__alert-list">
              <li v-for="(item, index) in excessNutrition" :key="index">
                {{ item[0] }} 摄入过量，为标准值的 {{ item[1].percentage }}%
              </li>
            </ul>
          </div>
        </div>

        <div class="nutrition-visualization__charts">
          <div class="nutrition-visualization__chart-item">
            <div ref="radarChart" class="nutrition-visualization__chart"></div>
          </div>

          <div class="nutrition-visualization__chart-item">
            <div ref="barChart" class="nutrition-visualization__chart"></div>
          </div>
        </div>
      </div>

      <div v-else class="nutrition-visualization__empty">
        <el-empty description="暂无营养摄入记录，请先添加餐品" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.nutrition-visualization {
  padding: 20px;
}

.nutrition-visualization__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.nutrition-visualization__title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.nutrition-visualization__content {
  min-height: 600px;
}

.nutrition-visualization__subtitle {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.nutrition-visualization__status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.nutrition-visualization__status-item {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.nutrition-visualization__status-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.nutrition-visualization__status-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.nutrition-visualization__status-value {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.nutrition-visualization__status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: white;
  margin-bottom: 8px;
}

.nutrition-visualization__status-percentage {
  font-size: 14px;
  color: #909399;
}

.nutrition-visualization__alerts {
  margin-bottom: 32px;
}

.nutrition-visualization__alert {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.nutrition-visualization__alert--warning {
  background: #fefce8;
  border: 1px solid #fde68a;
}

.nutrition-visualization__alert--info {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
}

.nutrition-visualization__alert-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.nutrition-visualization__alert-list {
  margin: 0;
  padding-left: 20px;
}

.nutrition-visualization__alert-list li {
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.nutrition-visualization__charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.nutrition-visualization__chart-item {
  background: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 16px;
}

.nutrition-visualization__chart {
  width: 100%;
  height: 400px;
}

.nutrition-visualization__empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: #f9fafb;
  border-radius: 8px;
}

@media (max-width: 1200px) {
  .nutrition-visualization__charts {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .nutrition-visualization {
    padding: 10px;
  }

  .nutrition-visualization__status-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .nutrition-visualization__chart {
    height: 300px;
  }

  .nutrition-visualization__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
