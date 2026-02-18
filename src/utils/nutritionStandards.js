/**
 * 中国营养摄入标准值
 * 基于中国营养学会的推荐摄入量
 */

export const nutritionStandards = {
  能量: '2200卡',
  蛋白质: '70g',
  反式脂肪酸: '2g',
  饱和脂肪: '22g',
  碳水: '300g',
  添加糖: '50g',
  食盐: '5g',
  膳食纤维: '25g',
}

export const nutritionStatus = {
  缺乏: 0.6,
  不足: 0.8,
  过量: 1.2,
}

export function calculateNutritionPercentage(intake, standard) {
  const intakeValue = parseFloat(intake.replace(/[^\d.]/g, ''))
  const standardValue = parseFloat(standard.replace(/[^\d.]/g, ''))

  if (standardValue === 0) return 0
  return intakeValue / standardValue
}

export function assessNutritionStatus(percentage) {
  if (percentage < nutritionStatus.缺乏) return '缺乏'
  if (percentage < nutritionStatus.不足) return '不足'
  if (percentage <= nutritionStatus.过量) return '适宜'
  return '过量'
}

export function getStatusColor(status) {
  const colors = {
    缺乏: '#F56C6C',
    不足: '#E6A23C',
    适宜: '#67C23A',
    过量: '#409EFF',
  }
  return colors[status] || '#909399'
}
