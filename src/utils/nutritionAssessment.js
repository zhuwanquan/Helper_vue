import {
  NUTRITION_STATUS_CONSTANTS,
  calculateIntakePercentage,
  evaluateNutritionStatus,
  evaluateNutritionStatusWithDetails,
  generateNutritionOverview,
  getAllNutritionStandards,
  getNutrientList,
} from './nutritionStandards.js'

const NUTRITION_STATUS = NUTRITION_STATUS_CONSTANTS

const STATUS_LEVELS = {
  [NUTRITION_STATUS.DEFICIENT]: {
    level: 1,
    name: '缺乏',
    severity: 'high',
    description: '营养素严重不足，需要立即补充',
    recommendation: '建议增加富含该营养素的食物摄入，或考虑营养补充剂',
  },
  [NUTRITION_STATUS.INSUFFICIENT]: {
    level: 2,
    name: '不足',
    severity: 'medium',
    description: '营养素摄入偏低，需要注意',
    recommendation: '建议适当增加该营养素的食物摄入',
  },
  [NUTRITION_STATUS.ADEQUATE]: {
    level: 3,
    name: '适宜',
    severity: 'low',
    description: '营养素摄入量符合推荐标准',
    recommendation: '继续保持当前的饮食习惯',
  },
  [NUTRITION_STATUS.EXCESSIVE]: {
    level: 4,
    name: '过量',
    severity: 'high',
    description: '营养素摄入过多，可能对健康造成影响',
    recommendation: '建议减少该营养素的摄入，避免过量',
  },
}

class NutritionAssessment {
  constructor() {
    this.standards = getAllNutritionStandards()
    this.nutrientList = getNutrientList()
  }

  calculateNutrientIntakePercentage(currentIntake, nutrientKey) {
    if (currentIntake == null || currentIntake < 0) {
      return 0
    }
    return calculateIntakePercentage(currentIntake, nutrientKey)
  }

  calculateAllNutrientIntakePercentages(intakeData) {
    const percentages = {}

    Object.entries(intakeData).forEach(([nutrientKey, intake]) => {
      percentages[nutrientKey] = this.calculateNutrientIntakePercentage(intake, nutrientKey)
    })

    return percentages
  }

  assessNutrientStatus(currentIntake, nutrientKey) {
    if (currentIntake == null || currentIntake < 0) {
      return {
        status: NUTRITION_STATUS.INSUFFICIENT,
        level: STATUS_LEVELS[NUTRITION_STATUS.INSUFFICIENT],
      }
    }

    const status = evaluateNutritionStatus(currentIntake, nutrientKey)
    return {
      status,
      level: STATUS_LEVELS[status],
    }
  }

  assessAllNutrientStatus(intakeData) {
    const statusResults = {}

    Object.entries(intakeData).forEach(([nutrientKey, intake]) => {
      statusResults[nutrientKey] = this.assessNutrientStatus(intake, nutrientKey)
    })

    return statusResults
  }

  assessNutrientStatusWithDetails(currentIntake, nutrientKey) {
    if (currentIntake == null || currentIntake < 0) {
      return {
        status: NUTRITION_STATUS.INSUFFICIENT,
        percentage: 0,
        color: { bg: '#fef3c7', text: '#d97706', border: '#f59e0b', name: '不足' },
        intake: currentIntake || 0,
        standard: this.standards[nutrientKey]?.dailyValue || 0,
        unit: this.standards[nutrientKey]?.unit || '',
        nutrientName: this.standards[nutrientKey]?.name || nutrientKey,
        level: STATUS_LEVELS[NUTRITION_STATUS.INSUFFICIENT],
      }
    }

    const details = evaluateNutritionStatusWithDetails(currentIntake, nutrientKey)
    return {
      ...details,
      level: STATUS_LEVELS[details.status],
    }
  }

  assessAllNutrientStatusWithDetails(intakeData) {
    const detailedResults = {}

    Object.entries(intakeData).forEach(([nutrientKey, intake]) => {
      detailedResults[nutrientKey] = this.assessNutrientStatusWithDetails(intake, nutrientKey)
    })

    return detailedResults
  }

  generateNutritionReport(meals, options = {}) {
    const {
      includeRecommendations = true,
      includeDetails = true,
      includeStatistics = true,
      timeRange = 'daily',
    } = options

    const overview = generateNutritionOverview(meals)
    const detailedAssessments = this.assessAllNutrientStatusWithDetails(overview.totalIntake)

    const report = {
      timestamp: new Date().toISOString(),
      timeRange,
      summary: this.generateSummary(detailedAssessments),
      statistics: includeStatistics ? this.generateStatistics(detailedAssessments, overview) : null,
      details: includeDetails ? detailedAssessments : null,
      recommendations: includeRecommendations
        ? this.generateRecommendations(detailedAssessments)
        : null,
    }

    return report
  }

  generateSummary(detailedAssessments) {
    const summary = {
      totalNutrients: Object.keys(detailedAssessments).length,
      statusCounts: {
        [NUTRITION_STATUS.DEFICIENT]: 0,
        [NUTRITION_STATUS.INSUFFICIENT]: 0,
        [NUTRITION_STATUS.ADEQUATE]: 0,
        [NUTRITION_STATUS.EXCESSIVE]: 0,
      },
      overallStatus: NUTRITION_STATUS.ADEQUATE,
      criticalIssues: [],
      warnings: [],
    }

    Object.entries(detailedAssessments).forEach(([nutrientKey, assessment]) => {
      const status = assessment.status
      if (Object.prototype.hasOwnProperty.call(summary.statusCounts, status)) {
        summary.statusCounts[status]++
      }

      if (status === NUTRITION_STATUS.DEFICIENT) {
        summary.criticalIssues.push({
          nutrient: nutrientKey,
          nutrientName: assessment.nutrientName,
          percentage: assessment.percentage,
          intake: assessment.intake,
          standard: assessment.standard,
        })
      } else if (status === NUTRITION_STATUS.EXCESSIVE) {
        summary.criticalIssues.push({
          nutrient: nutrientKey,
          nutrientName: assessment.nutrientName,
          percentage: assessment.percentage,
          intake: assessment.intake,
          standard: assessment.standard,
        })
      } else if (status === NUTRITION_STATUS.INSUFFICIENT) {
        summary.warnings.push({
          nutrient: nutrientKey,
          nutrientName: assessment.nutrientName,
          percentage: assessment.percentage,
          intake: assessment.intake,
          standard: assessment.standard,
        })
      }
    })

    if (summary.statusCounts[NUTRITION_STATUS.DEFICIENT] > 0) {
      summary.overallStatus = NUTRITION_STATUS.DEFICIENT
    } else if (summary.statusCounts[NUTRITION_STATUS.EXCESSIVE] > 0) {
      summary.overallStatus = NUTRITION_STATUS.EXCESSIVE
    } else if (summary.statusCounts[NUTRITION_STATUS.INSUFFICIENT] > 0) {
      summary.overallStatus = NUTRITION_STATUS.INSUFFICIENT
    }

    return summary
  }

  generateStatistics(detailedAssessments, overview) {
    const statistics = {
      averageIntakePercentage: 0,
      medianIntakePercentage: 0,
      nutrientStatusDistribution: {},
      energyDistribution: overview.energyDistribution || {},
      totalEnergy: overview.totalEnergy || 0,
      mealCount: overview.mealCount || 0,
      healthScore: 0,
    }

    const percentages = Object.values(detailedAssessments).map(
      (assessment) => assessment.percentage,
    )
    const totalPercentage = percentages.reduce((sum, p) => sum + p, 0)
    statistics.averageIntakePercentage =
      percentages.length > 0 ? totalPercentage / percentages.length : 0

    const sortedPercentages = [...percentages].sort((a, b) => a - b)
    const mid = Math.floor(sortedPercentages.length / 2)
    statistics.medianIntakePercentage =
      sortedPercentages.length % 2 !== 0
        ? sortedPercentages[mid]
        : (sortedPercentages[mid - 1] + sortedPercentages[mid]) / 2

    statistics.nutrientStatusDistribution = overview.statusDistribution || {}

    const adequateCount = statistics.nutrientStatusDistribution[NUTRITION_STATUS.ADEQUATE] || 0
    const totalNutrients = Object.keys(detailedAssessments).length
    statistics.healthScore =
      totalNutrients > 0 ? Math.round((adequateCount / totalNutrients) * 100) : 0

    return statistics
  }

  generateRecommendations(detailedAssessments) {
    const recommendations = {
      priority: [],
      general: [],
      dietary: [],
    }

    Object.entries(detailedAssessments).forEach(([nutrientKey, assessment]) => {
      const status = assessment.status
      const nutrientName = assessment.nutrientName

      if (status === NUTRITION_STATUS.DEFICIENT) {
        recommendations.priority.push({
          type: 'critical',
          nutrient: nutrientKey,
          nutrientName,
          message: `${nutrientName}严重缺乏（${assessment.percentage}%）`,
          action: assessment.level.recommendation,
          severity: 'high',
        })
      } else if (status === NUTRITION_STATUS.EXCESSIVE) {
        recommendations.priority.push({
          type: 'warning',
          nutrient: nutrientKey,
          nutrientName,
          message: `${nutrientName}摄入过量（${assessment.percentage}%）`,
          action: assessment.level.recommendation,
          severity: 'high',
        })
      } else if (status === NUTRITION_STATUS.INSUFFICIENT) {
        recommendations.general.push({
          type: 'info',
          nutrient: nutrientKey,
          nutrientName,
          message: `${nutrientName}摄入不足（${assessment.percentage}%）`,
          action: assessment.level.recommendation,
          severity: 'medium',
        })
      }
    })

    recommendations.general.push({
      type: 'info',
      message: '保持均衡饮食，多样化食物摄入',
      action: '建议每日摄入多种类食物，包括谷物、蔬菜、水果、蛋白质和乳制品',
    })

    recommendations.dietary.push({
      type: 'tip',
      message: '控制总能量摄入，保持健康体重',
      action: '根据个人活动量调整每日能量摄入，避免过量',
    })

    recommendations.dietary.push({
      type: 'tip',
      message: '保持充足的水分摄入',
      action: '建议每日饮水1500-2000毫升',
    })

    return recommendations
  }

  calculateNutrientScore(assessment) {
    const statusScores = {
      [NUTRITION_STATUS.DEFICIENT]: 0,
      [NUTRITION_STATUS.INSUFFICIENT]: 50,
      [NUTRITION_STATUS.ADEQUATE]: 100,
      [NUTRITION_STATUS.EXCESSIVE]: 0,
    }

    const baseScore = statusScores[assessment.status] || 50

    if (assessment.status === NUTRITION_STATUS.ADEQUATE) {
      if (assessment.percentage >= 90 && assessment.percentage <= 110) {
        return 100
      } else if (assessment.percentage >= 80 && assessment.percentage < 90) {
        return 90
      } else if (assessment.percentage > 110 && assessment.percentage <= 120) {
        return 85
      }
    } else if (assessment.status === NUTRITION_STATUS.INSUFFICIENT) {
      if (assessment.percentage >= 60) {
        return 60
      } else if (assessment.percentage >= 40) {
        return 40
      } else {
        return 20
      }
    }

    return baseScore
  }

  generateNutrientScores(detailedAssessments) {
    const scores = {}

    Object.entries(detailedAssessments).forEach(([nutrientKey, assessment]) => {
      scores[nutrientKey] = this.calculateNutrientScore(assessment)
    })

    return scores
  }

  compareWithPrevious(currentAssessment, previousAssessment) {
    const comparison = {
      improved: [],
      worsened: [],
      unchanged: [],
      newNutrients: [],
      removedNutrients: [],
    }

    const currentKeys = Object.keys(currentAssessment)
    const previousKeys = Object.keys(previousAssessment)

    comparison.newNutrients = currentKeys.filter((key) => !previousKeys.includes(key))
    comparison.removedNutrients = previousKeys.filter((key) => !currentKeys.includes(key))

    const commonKeys = currentKeys.filter((key) => previousKeys.includes(key))

    commonKeys.forEach((nutrientKey) => {
      const current = currentAssessment[nutrientKey]
      const previous = previousAssessment[nutrientKey]

      const currentScore = this.calculateNutrientScore(current)
      const previousScore = this.calculateNutrientScore(previous)

      if (currentScore > previousScore) {
        comparison.improved.push({
          nutrient: nutrientKey,
          nutrientName: current.nutrientName,
          previousScore,
          currentScore,
          change: currentScore - previousScore,
        })
      } else if (currentScore < previousScore) {
        comparison.worsened.push({
          nutrient: nutrientKey,
          nutrientName: current.nutrientName,
          previousScore,
          currentScore,
          change: previousScore - currentScore,
        })
      } else {
        comparison.unchanged.push({
          nutrient: nutrientKey,
          nutrientName: current.nutrientName,
          score: currentScore,
        })
      }
    })

    return comparison
  }

  exportReportToJSON(report) {
    return JSON.stringify(report, null, 2)
  }

  exportReportToText(report) {
    let text = '营养状态评估报告\n'
    text += '='.repeat(50) + '\n\n'
    text += `评估时间: ${new Date(report.timestamp).toLocaleString('zh-CN')}\n`
    text += `评估范围: ${report.timeRange}\n\n`

    text += '总体概况\n'
    text += '-'.repeat(30) + '\n'
    text += `总营养素数量: ${report.summary.totalNutrients}\n`
    text += `整体状态: ${STATUS_LEVELS[report.summary.overallStatus].name}\n`
    text += `健康评分: ${report.statistics.healthScore}分\n\n`

    text += '营养状态分布\n'
    text += '-'.repeat(30) + '\n'
    Object.entries(report.summary.statusCounts).forEach(([status, count]) => {
      text += `${STATUS_LEVELS[status].name}: ${count}种\n`
    })
    text += '\n'

    if (report.summary.criticalIssues.length > 0) {
      text += '严重问题\n'
      text += '-'.repeat(30) + '\n'
      report.summary.criticalIssues.forEach((issue) => {
        text += `- ${issue.nutrientName}: ${issue.percentage}% (摄入: ${issue.intake}${issue.unit}, 标准: ${issue.standard}${issue.unit})\n`
      })
      text += '\n'
    }

    if (report.summary.warnings.length > 0) {
      text += '注意事项\n'
      text += '-'.repeat(30) + '\n'
      report.summary.warnings.forEach((warning) => {
        text += `- ${warning.nutrientName}: ${warning.percentage}%\n`
      })
      text += '\n'
    }

    if (report.recommendations) {
      text += '建议\n'
      text += '-'.repeat(30) + '\n'
      report.recommendations.priority.forEach((rec) => {
        text += `【${rec.severity === 'high' ? '重要' : '一般'}】${rec.message}\n`
        text += `  ${rec.action}\n\n`
      })
    }

    return text
  }

  getNutrientCategories() {
    return {
      macronutrients: ['energy', 'protein', 'fat', 'carbohydrate', 'fiber'],
      vitamins: [
        'vitaminA',
        'vitaminC',
        'vitaminD',
        'vitaminE',
        'vitaminK',
        'vitaminB1',
        'vitaminB2',
        'vitaminB6',
        'vitaminB12',
        'niacin',
        'folate',
      ],
      minerals: [
        'calcium',
        'iron',
        'zinc',
        'magnesium',
        'potassium',
        'sodium',
        'phosphorus',
        'iodine',
        'selenium',
      ],
    }
  }

  assessByCategory(intakeData) {
    const categories = this.getNutrientCategories()
    const categoryResults = {}

    Object.entries(categories).forEach(([categoryName, nutrientKeys]) => {
      categoryResults[categoryName] = {
        nutrients: {},
        summary: {
          total: 0,
          adequate: 0,
          insufficient: 0,
          deficient: 0,
          excessive: 0,
        },
      }

      nutrientKeys.forEach((nutrientKey) => {
        if (intakeData[nutrientKey] != null) {
          const assessment = this.assessNutrientStatusWithDetails(
            intakeData[nutrientKey],
            nutrientKey,
          )
          categoryResults[categoryName].nutrients[nutrientKey] = assessment
          categoryResults[categoryName].summary.total++

          const status = assessment.status
          if (status === NUTRITION_STATUS.ADEQUATE) {
            categoryResults[categoryName].summary.adequate++
          } else if (status === NUTRITION_STATUS.INSUFFICIENT) {
            categoryResults[categoryName].summary.insufficient++
          } else if (status === NUTRITION_STATUS.DEFICIENT) {
            categoryResults[categoryName].summary.deficient++
          } else if (status === NUTRITION_STATUS.EXCESSIVE) {
            categoryResults[categoryName].summary.excessive++
          }
        }
      })
    })

    return categoryResults
  }
}

export default new NutritionAssessment()
export { NutritionAssessment, STATUS_LEVELS, NUTRITION_STATUS }
