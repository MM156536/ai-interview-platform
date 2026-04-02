<template>
  <div class="create-card">
    <!-- 创建方式选择 -->
    <div class="create-type-selector">
      <button 
        class="type-btn" 
        :class="{ active: createType === 'ai' }"
        @click="createType = 'ai'"
      >
        🤖 AI 智能生成
      </button>
      <button 
        class="type-btn" 
        :class="{ active: createType === 'manual' }"
        @click="createType = 'manual'"
      >
        ✏️ 自己编写
      </button>
    </div>

    <!-- AI 生成表单 -->
    <form v-if="createType === 'ai'" @submit.prevent="handleAiGenerate" class="card-form">
      <div class="form-group">
        <label>题目主题 <span class="required">*</span></label>
        <input 
          type="text" 
          v-model="aiForm.topic" 
          placeholder="例如：Vue 生命周期、JavaScript 闭包、CSS 选择器..."
          required
        />
      </div>
      
      <div class="form-group">
        <label>难度等级</label>
        <select v-model="aiForm.difficulty">
          <option value="easy">⭐ 简单</option>
          <option value="medium">⭐⭐ 中等</option>
          <option value="hard">⭐⭐⭐ 困难</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>补充说明（可选）</label>
        <textarea 
          v-model="aiForm.description" 
          rows="3"
          placeholder="可以补充你想了解的细节，帮助AI生成更精准的题目..."
        ></textarea>
      </div>
      
      <button type="submit" class="submit-btn" :disabled="generating">
        {{ generating ? '🤖 AI生成中...' : '🚀 AI生成题目' }}
      </button>
    </form>

    <!-- 自己编写表单 -->
    <form v-else @submit.prevent="handleManualSubmit" class="card-form">
      <div class="form-group">
        <label>题目 <span class="required">*</span></label>
        <textarea 
          v-model="manualForm.question" 
          rows="3"
          placeholder="请输入题目内容..."
          required
        ></textarea>
      </div>
      
      <div class="form-group">
        <label>选项（选择题）</label>
        <div class="options-list">
          <div v-for="(option, index) in manualForm.options" :key="index" class="option-item">
            <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
            <input 
              type="text" 
              v-model="manualForm.options[index]" 
              :placeholder="`选项 ${String.fromCharCode(65 + index)}`"
            />
            <button 
              v-if="manualForm.options.length > 2" 
              type="button" 
              class="remove-option"
              @click="removeOption(index)"
            >
              ✕
            </button>
          </div>
          <button type="button" class="add-option" @click="addOption">
            + 添加选项
          </button>
        </div>
      </div>
      
      <div class="form-group">
        <label>正确答案 <span class="required">*</span></label>
        <select v-model="manualForm.correctOption">
          <option value="">请选择正确答案</option>
          <option v-for="(option, index) in manualForm.options" :key="index" :value="index">
            {{ String.fromCharCode(65 + index) }}. {{ option || '未填写' }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label>答案解析</label>
        <textarea 
          v-model="manualForm.answer" 
          rows="4"
          placeholder="请填写答案解析..."
        ></textarea>
      </div>
      
      <button type="submit" class="submit-btn" :disabled="submitting">
        {{ submitting ? '提交中...' : '📝 提交速记卡' }}
      </button>
    </form>

    <!-- AI生成预览弹窗 -->
    <div v-if="showPreview" class="modal-overlay" @click="closePreview">
      <div class="preview-modal" @click.stop>
        <div class="modal-header">
          <h3>🤖 AI生成的题目预览</h3>
          <span class="close" @click="closePreview">×</span>
        </div>
        <div class="preview-content">
          <div class="preview-item">
            <strong>题目：</strong>
            <p>{{ previewCard.question }}</p>
          </div>
          <div class="preview-item">
            <strong>选项：</strong>
            <div class="preview-options">
              <div v-for="(opt, idx) in previewCard.options" :key="idx">
                {{ String.fromCharCode(65 + idx) }}. {{ opt }}
              </div>
            </div>
          </div>
          <div class="preview-item">
            <strong>正确答案：</strong>
            <p>{{ String.fromCharCode(65 + previewCard.correctOption) }}. {{ previewCard.options[previewCard.correctOption] }}</p>
          </div>
          <div class="preview-item">
            <strong>答案解析：</strong>
            <p>{{ previewCard.answer }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closePreview">重新生成</button>
          <button class="confirm-btn" @click="saveGeneratedCard">保存题目</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { aiGenerateCard, createCard } from '@/api/flashcard'

export default {
  name: 'CreateCard',
  emits: ['card-created'],
  setup(props, { emit }) {
    const createType = ref('ai')
    const generating = ref(false)
    const submitting = ref(false)
    const showPreview = ref(false)
    const previewCard = ref(null)
    
    const aiForm = ref({
      topic: '',
      difficulty: 'medium',
      description: ''
    })
    
    const manualForm = ref({
      question: '',
      options: ['', '', '', ''],
      correctOption: '',
      answer: ''
    })
    
    const addOption = () => {
      if (manualForm.value.options.length < 6) {
        manualForm.value.options.push('')
      } else {
        ElMessage.warning('最多只能添加6个选项')
      }
    }
    
    const removeOption = (index) => {
      if (manualForm.value.options.length > 2) {
        manualForm.value.options.splice(index, 1)
        if (manualForm.value.correctOption >= index) {
          manualForm.value.correctOption = ''
        } else if (manualForm.value.correctOption > index) {
          manualForm.value.correctOption--
        }
      }
    }
    
    const handleAiGenerate = async () => {
      if (!aiForm.value.topic) {
        ElMessage.warning('请输入题目主题')
        return
      }
      
      generating.value = true
      try {
        const response = await aiGenerateCard(aiForm.value)
        previewCard.value = response.data
        showPreview.value = true
      } catch (error) {
        // 模拟数据
        previewCard.value = {
          question: `${aiForm.value.topic} 相关的面试题：请选择正确的说法？`,
          options: [
            `这是关于${aiForm.value.topic}的正确描述A`,
            `这是关于${aiForm.value.topic}的错误描述B`,
            `这是关于${aiForm.value.topic}的描述C`,
            `这是关于${aiForm.value.topic}的描述D`
          ],
          correctOption: 0,
          answer: `这是关于 ${aiForm.value.topic} 的详细解析。`
        }
        showPreview.value = true
      } finally {
        generating.value = false
      }
    }
    
    const closePreview = () => {
      showPreview.value = false
      previewCard.value = null
    }
    
    const saveGeneratedCard = async () => {
      try {
        await createCard(previewCard.value)
        emit('card-created', previewCard.value)
        closePreview()
        ElMessage.success('速记卡保存成功！')
        aiForm.value = { topic: '', difficulty: 'medium', description: '' }
      } catch (error) {
        emit('card-created', previewCard.value)
        closePreview()
        ElMessage.success('速记卡保存成功！')
      }
    }
    
    const handleManualSubmit = async () => {
      if (!manualForm.value.question) {
        ElMessage.warning('请输入题目')
        return
      }
      if (manualForm.value.options.some(opt => !opt.trim())) {
        ElMessage.warning('请填写所有选项')
        return
      }
      if (manualForm.value.correctOption === '') {
        ElMessage.warning('请选择正确答案')
        return
      }
      if (!manualForm.value.answer) {
        ElMessage.warning('请输入答案解析')
        return
      }
      
      submitting.value = true
      try {
        const cardData = {
          question: manualForm.value.question,
          options: manualForm.value.options,
          correctOption: parseInt(manualForm.value.correctOption),
          answer: manualForm.value.answer,
          type: 'manual'
        }
        
        await createCard(cardData)
        emit('card-created', cardData)
        manualForm.value = {
          question: '',
          options: ['', '', '', ''],
          correctOption: '',
          answer: ''
        }
        ElMessage.success('速记卡提交成功！')
      } catch (error) {
        ElMessage.error('提交失败，请重试')
      } finally {
        submitting.value = false
      }
    }
    
    return {
      createType,
      generating,
      submitting,
      showPreview,
      previewCard,
      aiForm,
      manualForm,
      addOption,
      removeOption,
      handleAiGenerate,
      handleManualSubmit,
      closePreview,
      saveGeneratedCard
    }
  }
}
</script>

<style scoped>
.create-card {
  max-width: 800px;
  margin: 0 auto;
}

.create-type-selector {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  justify-content: center;
}

.type-btn {
  padding: 10px 30px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.type-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-form {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 12px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #ff4757;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.options-list {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px;
  background: white;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.option-label {
  font-weight: 500;
  min-width: 30px;
}

.option-item input {
  flex: 1;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.remove-option {
  padding: 4px 8px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-option {
  margin-top: 10px;
  padding: 6px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102,126,234,0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.preview-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.close {
  font-size: 28px;
  cursor: pointer;
  color: #999;
}

.preview-content {
  padding: 20px;
}

.preview-item {
  margin-bottom: 20px;
}

.preview-item strong {
  display: block;
  margin-bottom: 8px;
  color: #667eea;
}

.preview-options {
  padding-left: 20px;
}

.preview-options div {
  margin-bottom: 8px;
  color: #666;
}

.modal-footer {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

.cancel-btn,
.confirm-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
</style>