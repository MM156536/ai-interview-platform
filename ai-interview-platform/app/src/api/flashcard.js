import request from './request'

// 获取速记卡列表
export const getCardList = () => {
  return request.get('/flashcard/list')
}

// AI生成题目
export const aiGenerateCard = (data) => {
  return request.post('/flashcard/ai-generate', data)
}

// 创建速记卡
export const createCard = (data) => {
  return request.post('/flashcard/create', data)
}

// 提交答案
export const submitAnswer = (data) => {
  return request.post('/flashcard/submit', data)
}

// 删除速记卡
export const deleteCard = (id) => {
  return request.delete(`/flashcard/delete/${id}`)
}

// 更新速记卡
export const updateCard = (id, data) => {
  return request.put(`/flashcard/update/${id}`, data)
}

// 获取单个速记卡详情
export const getCardDetail = (id) => {
  return request.get(`/flashcard/detail/${id}`)
}