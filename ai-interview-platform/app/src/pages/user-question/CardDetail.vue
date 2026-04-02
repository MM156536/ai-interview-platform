<template>
  <div class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ showAll ? '📋 所有题目解析' : '🔍 题目详情' }}</h3>
        <span class="close" @click="handleClose">×</span>
      </div>
      
      <div class="modal-body">
        <!-- 单个题目详情 -->
        <div v-if="!showAll" class="single-detail">
          <div class="detail-section">
            <div class="detail-label">📝 题目：</div>
            <div class="detail-content">{{ card.question }}</div>
          </div>
          
          <div class="detail-section">
            <div class="detail-label">🔘 选项：</div>
            <div class="options-detail">
              <div 
                v-for="(option, idx) in card.options" 
                :key="idx" 
                class="option-detail"
                :class="{ 
                  'correct-option': idx === card.correctOption,
                  'user-option': userAnswer === idx && userAnswer !== null
                }"
              >
                <span class="option-letter">{{ String.fromCharCode(65 + idx) }}.</span>
                <span class="option-text">{{ option }}</span>
                <span v-if="idx === card.correctOption" class="badge correct-badge">正确答案</span>
                <span v-if="userAnswer === idx && idx !== card.correctOption" class="badge wrong-badge">你的答案</span>
                <span v-if="userAnswer === idx && idx === card.correctOption" class="badge correct-badge">你的答案 ✓</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <div class="detail-label">✅ 正确答案：</div>
            <div class="detail-content correct-answer">
              {{ String.fromCharCode(65 + card.correctOption) }}. {{ card.options[card.correctOption] }}
            </div>
          </div>
          
          <div class="detail-section">
            <div class="detail-label">📖 答案解析：</div>
            <div class="detail-content answer-content">{{ card.answer }}</div>
          </div>
          
          <div class="detail-section" v-if="userAnswer !== undefined && userAnswer !== null">
            <div class="detail-label">🎯 你的答案：</div>
            <div class="detail-content" :class="{ 'correct-text': isCorrect, 'wrong-text': !isCorrect }">
              {{ userAnswer !== null ? String.fromCharCode(65 + userAnswer) + '. ' + card.options[userAnswer] : '未作答' }}
              <span class="result-badge">{{ isCorrect ? '✓ 回答正确' : '✗ 回答错误' }}</span>
            </div>
          </div>
        </div>
        
        <!-- 所有题目详情 -->
        <div v-else class="all-details">
          <div v-for="(item, index) in cards" :key="index" class="detail-item">
            <div class="item-header">
              <span class="item-number">第 {{ index + 1 }} 题</span>
              <span class="item-status" :class="{ 'status-correct': item.isCorrect, 'status-wrong': !item.isCorrect }">
                {{ item.isCorrect ? '✓ 正确' : '✗ 错误' }}
              </span>
            </div>
            <div class="item-question">{{ item.question }}</div>
            <div class="item-answer">
              <strong>正确答案：</strong>{{ String.fromCharCode(65 + item.correctOption) }}. {{ item.options[item.correctOption] }}
            </div>
            <div class="item-user-answer" v-if="item.userAnswer !== undefined && item.userAnswer !== null">
              <strong>你的答案：</strong>
              <span :class="{ 'correct-text': item.isCorrect, 'wrong-text': !item.isCorrect }">
                {{ String.fromCharCode(65 + item.userAnswer) }}. {{ item.options[item.userAnswer] }}
              </span>
            </div>
            <div class="item-explanation">
              <strong>解析：</strong>{{ item.answer }}
            </div>
            <div class="item-divider" v-if="index < cards.length - 1"></div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="close-btn" @click="handleClose">关 闭</button>
        <button v-if="showAll && hasWrongQuestions" class="review-btn" @click="reviewWrongQuestions">
          复习错题
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'CardDetail',
  props: {
    // 单个题目模式
    card: {
      type: Object,
      default: () => ({})
    },
    userAnswer: {
      type: Number,
      default: null
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    // 所有题目模式
    cards: {
      type: Array,
      default: () => []
    },
    showAll: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'review-wrong'],
  setup(props, { emit }) {
    const hasWrongQuestions = computed(() => {
      return props.cards.some(card => card.isCorrect === false)
    })
    
    const handleClose = () => {
      emit('close')
    }
    
    const reviewWrongQuestions = () => {
      emit('review-wrong')
      handleClose()
    }
    
    return {
      hasWrongQuestions,
      handleClose,
      reviewWrongQuestions
    }
  }
}
</script>

<style scoped>
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
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: white;
  font-size: 18px;
}

.close {
  font-size: 28px;
  cursor: pointer;
  color: white;
  transition: all 0.3s;
  line-height: 1;
}

.close:hover {
  transform: scale(1.1);
  opacity: 0.8;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* 单个题目详情样式 */
.detail-section {
  margin-bottom: 24px;
}

.detail-label {
  font-weight: bold;
  color: #667eea;
  margin-bottom: 10px;
  font-size: 14px;
}

.detail-content {
  color: #333;
  line-height: 1.6;
  font-size: 14px;
}

.options-detail {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.option-detail {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s;
}

.option-detail:last-child {
  border-bottom: none;
}

.option-detail.correct-option {
  background: rgba(82, 196, 26, 0.1);
  border-left: 3px solid #52c41a;
}

.option-detail.user-option {
  background: rgba(102, 126, 234, 0.1);
  border-left: 3px solid #667eea;
}

.option-letter {
  font-weight: bold;
  min-width: 30px;
  color: #666;
}

.option-text {
  flex: 1;
  color: #333;
}

.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.correct-badge {
  background: #52c41a;
  color: white;
}

.wrong-badge {
  background: #ff4757;
  color: white;
}

.correct-answer {
  color: #52c41a;
  font-weight: 500;
  padding: 8px 12px;
  background: rgba(82, 196, 26, 0.1);
  border-radius: 6px;
}

.answer-content {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  line-height: 1.6;
}

.correct-text {
  color: #52c41a;
  font-weight: 500;
}

.wrong-text {
  color: #ff4757;
  font-weight: 500;
}

.result-badge {
  margin-left: 10px;
  font-size: 12px;
  font-weight: normal;
}

/* 所有题目详情样式 */
.all-details {
  max-height: 500px;
  overflow-y: auto;
}

.detail-item {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s;
}

.detail-item:hover {
  background: #f0f2f5;
  transform: translateX(2px);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.item-number {
  font-weight: bold;
  color: #667eea;
  font-size: 14px;
}

.item-status {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-correct {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.status-wrong {
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
}

.item-question {
  font-weight: 500;
  margin-bottom: 12px;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
}

.item-answer,
.item-user-answer,
.item-explanation {
  font-size: 13px;
  color: #666;
  margin-top: 8px;
  line-height: 1.5;
}

.item-answer strong,
.item-user-answer strong,
.item-explanation strong {
  color: #333;
  margin-right: 5px;
}

.item-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #e0e0e0, transparent);
  margin: 16px 0 8px;
}

/* 底部按钮 */
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.close-btn,
.review-btn {
  padding: 8px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.close-btn {
  background: #f0f0f0;
  color: #666;
}

.close-btn:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
}

.review-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.review-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

/* 滚动条样式 */
.modal-body::-webkit-scrollbar,
.all-details::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track,
.all-details::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb,
.all-details::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover,
.all-details::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 90vh;
  }
  
  .modal-header {
    padding: 15px 20px;
  }
  
  .modal-body {
    padding: 16px;
  }
  
  .option-detail {
    padding: 10px 12px;
  }
  
  .detail-item {
    padding: 12px;
  }
  
  .modal-footer {
    padding: 12px 20px;
  }
  
  .close-btn,
  .review-btn {
    padding: 6px 20px;
  }
}
</style>