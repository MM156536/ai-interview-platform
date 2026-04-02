import { defineStore } from "pinia";
 
export const useInterviewStore = defineStore("interview", { 
  state: () => ({ 
    chatId: null, 
    resumeFile: null, 
    jobRole: "", 
    userAnswers: [], 
    reportData: null, 

    // 👇 讯飞配置 
    xunfeiConfig: { 
      APPID: "511f290a", 
      API_KEY: "241deade5e2074f3d7726abe057a2938", 
      API_SECRET: "NWMyNWFlOWU1MzA0NjM4ZGZiNmQwNTdj", 
    }, 

    // 👇 接口基础地址 
    baseUrl: "http://127.0.0.1:4523/m1/7900134-7650835-default", 
  }), 

  getters: { 
    // 👇 自动从 localStorage 拿 token 
    token(state) { 
      return ( 
        localStorage.getItem("token") || 
        "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyTmFtZSI6IndkajIwMDYxIiwidXNlSWQiOjEsImV4cCI6MTczNzg4MTMxNn0.jxnOVylUlCV_PnOTAV-O-OaexH3eARz3P2gSSjJMDxo" 
      ); 
    }, 
    // const TOKEN = 
    //   "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyTmFtZSI6IndkajIwMDYxIiwidXNlSWQiOjEsImV4cCI6MTczNzg4MTMxNn0.jxnOVylUlCV_PnOTAV-O-OaexH3eARz3P2gSSjJMDxo";
    // 👇 完整接口地址（自动拼接） 
    apiConfig(state) { 
      const base = `${state.baseUrl}/user/aiInter`; 
      const BASE_URL = `${state.baseUrl}/user/aiSummary`; 

      return { 
        INTERVIEW: `${base}/getInterSummary`, 
        END_INTERVIEW: `${base}/endInter`, 
        startInterview: `${base}/getInter`, 
        AVG_ALL: `${BASE_URL}/average`, 
        AVG_PERSONAL: `${BASE_URL}/myAverage`, 
      }; 
    }, 
  }, 

  actions: { 
    setInterviewData(data) { 
      this.chatId = data.chatId; 
      this.resumeFile = data.resumeFile; 
      this.jobRole = data.jobRole; 
      this.reportData = data; 
    }, 
  }, 
});