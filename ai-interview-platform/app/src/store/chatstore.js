import { defineStore } from "pinia";

export const useChatStore = defineStore("chat", {
  state: () => ({
    currentSession: null, // 当前对话（首页创建的存在这里）
    sessionList: [], // 历史列表
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

    apiConfig(state) {
      const base = `${state.baseUrl}/user/aiCoach`;

      return {
        LIST: `${base}/list`,
        CREATE: `${base}/create`,
        ANSWER: `${base}/answer`,
        RESUME: `${base}/resume`,
        HISTORY: `${base}/history`,
      };
    },
  },
  actions: {
    // 保存当前对话
    setCurrentSession(session) {
      this.currentSession = session;
    },

    // 保存列表
    setSessionList(list) {
      this.sessionList = list;
    },
  },
});
