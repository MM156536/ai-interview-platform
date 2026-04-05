import axios from "axios";
import { ElMessage } from "element-plus";
import router from "@/router";

// 创建 axios 实例
const request = axios.create({
  baseURL: "http://127.0.0.1:4523/m1/7900134-7650835-default", // 后端基础地址
  timeout: 5000, // 请求超时时间
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem("token");
    if (token) {
      // 添加到请求头
      config.headers["token"] = token; // 根据后端要求调整
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    // 统一校验业务 code
    if (res.code !== 200) {
      ElMessage.error(res.message || "请求失败");
      // 抛出错误，让前端进入 catch
      return Promise.reject(new Error(res.message || "Error"));
    }
    // 只有 code=200 才返回数据
    return res;
  },
  (error) => {
    ElMessage.error("网络错误");
    return Promise.reject(error);
  },
);

const baseUrl = "http://127.0.0.1:4523/m1/7900134-7650835-default";

export const addQuestion = (data) =>
  request.post(`${baseUrl}/admin/question/add`, data);
export const batchAddQuestion = (data) =>
  request.post("/admin/question/addBatch", { question: data });
export const getUnreviewed = () => request.get("/admin/question/search");
export const getApproved = () => request.get("/admin/question/approved");
export const batchApprove = (ids) =>
  request.post("/admin/question/audit", { ids: ids.filter((id) => id) });
export const vectorImport = () => request.post("/admin/question/vector");
export const deleteQuestion = (id) =>
  request.post("/admin/question/delete", { id });

// 面试记录相关接口
export const getHistoryInterviewList = () =>
  request.get("/user/aiSummary/search");
export const getInterviewList = () => request.get("/user/diary/search");
export function addInterview(data) {
  return request({
    url: "/user/diary/add",
    method: "post",
    data: data,
  });
}
export function polishInterview(data) {
  return request({
    url: "/user/diary/runse",
    method: "post",
    data: data,
  });
}
export const deleteInterview = (id) =>
  request.post("/user/diary/delete", { id });
export const updateInterview = (data) =>
  request.post("/user/diary/update", data);

// 其他业务接口
export const updateUserInfo = (data) => request.post("/user/user/update", data);
export const getAbilityData = () =>
  request.get("/user/SkillsShowcase/getSkillsShowcase");
export const getAnswerList = () => request.get("/user/card/getHistory");
export const getCollectList = () =>
  request.get("/user/SkillsShowcase/getCollection");

// 面试知识点核心接口
// 用户添加题目
export const addQuestionAgain = (data) => {
  return request({
    url: "/user/question/add",
    method: "POST",
    data,
  });
};

// 返回标签列表
export const getTagList = (params) => {
  return request({
    url: "/user/question/tag",
    method: "GET",
    params,
  });
};

// 返回应聘职业列表
export const getJobRoleList = (params) => {
  return request({
    url: "/user/question/jobRole",
    method: "GET",
    params,
  });
};

// 首页查题(题目列表-分页/筛选)
export const getQuestionList = (params) => {
  return request({
    url: "/user/question/search",
    method: "GET",
    params,
  });
};

// 相似性搜索
export const getSimilarQuestion = (questionId) => {
  return request({
    url: "/user/question/vectorSearch",
    method: "GET",
    params: { questionId },
  });
};

// 知识点收藏
export const collectQuestion = (questionId) => {
  return request({
    url: "/user/question/collect",
    method: "GET",
    params: { questionId },
  });
};

// 点赞
export const likeQuestion = (questionId) => {
  return request({
    url: "/user/question/like",
    method: "GET",
    params: { questionId },
  });
};

export default request;
