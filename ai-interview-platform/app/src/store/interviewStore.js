import { ref, reactive } from 'vue'

export function useInterviewStore() {
  // 面试相关数据
  const chatId = ref('')
  const jobRole = ref('')
  const reportData = ref({})
  const resumeFile = ref(null)
  
  // API 配置
  const apiConfig = reactive({
    startInterview: '/api/interview/start',
    INTERVIEW: '/api/interview/stream',
    END_INTERVIEW: '/api/interview/end',
    AVG_ALL: '/api/avg/all',
    AVG_PERSONAL: '/api/avg/personal'
  })
  
  // 讯飞配置
  const xunfeiConfig = reactive({
    APPID: 'your_app_id',
    API_KEY: 'your_api_key',
    API_SECRET: 'your_api_secret'
  })
  
  // Token
  const token = ref(localStorage.getItem('userToken') || '')
  
  // 设置面试数据
  const setInterviewData = (data) => {
    if (data.chatId) chatId.value = data.chatId
    if (data.jobRole) jobRole.value = data.jobRole
    if (data.resumeFile) resumeFile.value = data.resumeFile
  }
  
  // 设置报告数据
  const setReportData = (data) => {
    reportData.value = data
  }
  
  return {
    chatId,
    jobRole,
    reportData,
    resumeFile,
    apiConfig,
    xunfeiConfig,
    token,
    setInterviewData,
    setReportData
  }
}