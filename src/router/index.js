import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'introduction',
      component: () => import('@/views/introductionPage.vue'),
      meta: {
        title: '介绍',
      },
    },
    {
      path: '/nutrition',
      name: 'nutrition',
      component: () => import('@/views/nutritionLayout.vue'),
      meta: {
        title: '营养',
      },
      children: [
        {
          path: '/mealRecords',
          name: 'mealRecords',
          component: () => import('@/views/Nutrition/mealRecords.vue'),
          meta: {
            title: '餐品记录',
          },
        },
        {
          path: '/nutrientIntake',
          name: 'nutrientIntake',
          component: () => import('@/views/Nutrition/nutrientIntake.vue'),
          meta: {
            title: '营养摄入',
          },
        },
        {
          path: '/nutritionVisualization',
          name: 'nutritionVisualization',
          component: () => import('@/views/Nutrition/nutritionVisualization.vue'),
          meta: {
            title: '营养视图',
          },
        },
      ],
    },
  ],
})

export default router
