<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['submit', 'cancel'])

const formRef = ref(null)
const loading = ref(false)

const formData = reactive({
  title: '',
  imageUrl: '',
  energy: '',
  protein: '',
  transFat: '',
  saturatedFat: '',
  carbohydrate: '',
  addedSugar: '',
  salt: '',
  dietaryFiber: '',
})

const rules = {
  title: [
    { required: true, message: '请输入餐品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  energy: [
    { required: true, message: '请输入能量值', trigger: 'blur' },
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入有效的数字', trigger: 'blur' },
  ],
  protein: [
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入有效的数字', trigger: 'blur' },
  ],
  transFat: [
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入有效的数字', trigger: 'blur' },
  ],
  saturatedFat: [
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入有效的数字', trigger: 'blur' },
  ],
  carbohydrate: [
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入有效的数字', trigger: 'blur' },
  ],
  addedSugar: [
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入有效的数字', trigger: 'blur' },
  ],
  salt: [
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入有效的数字', trigger: 'blur' },
  ],
  dietaryFiber: [
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入有效的数字', trigger: 'blur' },
  ],
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    const mealData = {
      title: formData.title,
      image_url: formData.imageUrl,
      energy: parseFloat(formData.energy) || 0,
      protein: parseFloat(formData.protein) || 0,
      trans_fat: parseFloat(formData.transFat) || 0,
      saturated_fat: parseFloat(formData.saturatedFat) || 0,
      carbohydrate: parseFloat(formData.carbohydrate) || 0,
      added_sugar: parseFloat(formData.addedSugar) || 0,
      salt: parseFloat(formData.salt) || 0,
      dietary_fiber: parseFloat(formData.dietaryFiber) || 0,
    }

    emit('submit', mealData)
  } catch (error) {
    if (error !== false) {
      ElMessage.error('表单验证失败，请检查输入')
    }
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}

const resetForm = () => {
  formRef.value?.resetFields()
}

defineExpose({
  resetForm,
})
</script>

<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
    <el-form-item label="餐品名称" prop="title">
      <el-input v-model="formData.title" placeholder="请输入餐品名称" clearable />
    </el-form-item>

    <el-form-item label="图片URL" prop="imageUrl">
      <el-input v-model="formData.imageUrl" placeholder="请输入图片URL" clearable />
    </el-form-item>

    <el-divider content-position="left">营养成分</el-divider>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="能量" prop="energy">
          <el-input v-model.number="formData.energy" placeholder="kcal">
            <template #suffix>kcal</template>
          </el-input>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="蛋白质" prop="protein">
          <el-input v-model.number="formData.protein" placeholder="g">
            <template #suffix>g</template>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="反式脂肪" prop="transFat">
          <el-input v-model.number="formData.transFat" placeholder="g">
            <template #suffix>g</template>
          </el-input>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="饱和脂肪" prop="saturatedFat">
          <el-input v-model.number="formData.saturatedFat" placeholder="g">
            <template #suffix>g</template>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="碳水化合物" prop="carbohydrate">
          <el-input v-model.number="formData.carbohydrate" placeholder="g">
            <template #suffix>g</template>
          </el-input>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="添加糖" prop="addedSugar">
          <el-input v-model.number="formData.addedSugar" placeholder="g">
            <template #suffix>g</template>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="盐" prop="salt">
          <el-input v-model.number="formData.salt" placeholder="g">
            <template #suffix>g</template>
          </el-input>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="膳食纤维" prop="dietaryFiber">
          <el-input v-model.number="formData.dietaryFiber" placeholder="g">
            <template #suffix>g</template>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        提交
      </el-button>
      <el-button @click="handleCancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.el-divider {
  margin: 20px 0;
}
</style>
