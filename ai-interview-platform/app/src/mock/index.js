import Mock from "mockjs";

// 设置请求延迟，模拟网络环境
Mock.setup({ timeout: "200-600" });

// 统一存储数据
const data = Mock.mock({
  unreviewedList: [
    {
      id: 1,
      difficultyLevel: "1",
      questionContent: "请简述Vue3响应式原理",
      jobRole: "前端开发",
      referenceAnswer: "Proxy 实现...",
      evaluationCriteria: "能清晰解释概念，举例说明。",
      tags: "Spring,设计模式",
      status: 0,
      createTime: "@datetime",
    },
    {
      id: 2,
      difficultyLevel: "1",
      questionContent: "MySQL索引优化",
      jobRole: "后端开发",
      referenceAnswer: "避免索引失效...",
      evaluationCriteria: "能清晰解释概念，举例说明。",
      tags: "Spring,设计模式",
      status: 0,
      createTime: "@datetime",
    },
  ],
  approvedList: [],
});

// 工具函数：生成新题目
const createQuestion = (item, id) => ({
  id,
  difficultyLevel: Number(item.difficultyLevel) || 1,
  jobRole: item.jobRole?.trim() || "",
  questionContent: item.questionContent?.trim() || "",
  referenceAnswer: item.referenceAnswer?.trim() || "",
  evaluationCriteria: item.evaluationCriteria?.trim() || "",
  tags: item.tags?.trim() || "",
  source: Number(item.source) || 0,
});

const baseUrl = "http://127.0.0.1:4523/m1/7900134-7650835-default";

Mock.mock(`${baseUrl}/admin/question/delete`, "post", ({ body }) => {
  const { id } = JSON.parse(body);
  data.unreviewedList = data.unreviewedList.filter((item) => item.id !== id);
  data.approvedList = data.approvedList.filter((item) => item.id !== id);
  return { code: 200, message: "删除成功", data: null };
});

// 新增题目（无需审核）
Mock.mock(`${baseUrl}/admin/question/add`, "post", ({ body }) => {
  // 1. 解析前端传来的 JSON 数据
  const reqData = JSON.parse(body);

  // 3. 生成新题目（注意：这里不要强行 push 到本地 data，那是后端的事）
  const newId = 100; // 模拟一个 ID
  const newQuestion = createQuestion(reqData, newId);

  // 4. 返回成功，把数据带回去
  return {
    code: 200,
    message: "题目添加成功",
    data: newQuestion,
  };
});

// 批量新增题目
Mock.mock(`${baseUrl}/admin/question/addBatch`, "post", ({ body }) => {
  const list = JSON.parse(body).question;
  if (!Array.isArray(list))
    return { code: 400, message: "必须传数组", data: null };

  const validList = list.filter((item) =>
    ["questionContent", "jobRole", "referenceAnswer"].every((k) =>
      item[k]?.trim(),
    ),
  );
  if (!validList.length)
    return { code: 400, message: "无有效数据", data: null };

  const newQuestions = validList.map((item, index) => ({
    id: Date.now() + index, // 唯一ID
    ...item,
    status: "待审核",
    createTime: new Date().toLocaleString(),
  }));

  return {
    code: 200,
    message: `批量添加${newQuestions.length}道题`,
    data: newQuestions,
  };
});

// 查看未过审题目
Mock.mock(`${baseUrl}/admin/question/search`, "get", () => {
  return {
    code: 200,
    message: "获取未过审题目成功",
    data: data.unreviewedList, // 直接返回模拟列表
  };
});

// 批量通过审核
Mock.mock(`${baseUrl}/admin/question/audit`, "post", ({ body }) => {
  const { ids } = JSON.parse(body);
  const moveItems = data.unreviewedList.filter((item) => ids.includes(item.id));
  data.unreviewedList = data.unreviewedList.filter(
    (item) => !ids.includes(item.id),
  );
  data.approvedList.push(...moveItems);
  return { code: 200, message: "审核成功", data: null };
});

// 获取已过审题目
Mock.mock(`${baseUrl}/admin/question/vec`, "get", () => {
  return { code: 200, message: "成功", data: data.approvedList };
});

// 向量化导入
Mock.mock(`${baseUrl}/admin/question/vector`, "post", () => {
  console.log("✅ 向量化完成 → 清空所有题目");

  data.approvedList = [];

  return { code: 200, message: "向量化成功", data: null };
});

// ==================== 登录注册相关接口（补上这一段！） ====================

// 1. 管理员登录
Mock.mock(`${baseUrl}/admin/admin/login`, "post", () => {
  return {
    code: 200,
    token: "admin-token-123456",
    message: "管理员登录成功",
  };
});

// 2. 用户登录
Mock.mock(`${baseUrl}/user/login`, "post", () => {
  return {
    code: 200,
    token: "user-token-123456",
    message: "用户登录成功",
  };
});

// 3. 发送验证码
Mock.mock(`${baseUrl}/user/sendCode`, "get", () => {
  return {
    code: 200,
    message: "验证码发送成功",
  };
});

// 4. 用户注册
Mock.mock(`${baseUrl}/user/register`, "post", () => {
  return {
    code: 200,
    message: "注册成功",
  };
});

// ==================== 面试相关接口 ====================

// 开始面试
Mock.mock(`${baseUrl}/user/aiInter/getInter`, "post", () => {
  return {
    code: 200,
    message: "面试创建成功",
    data: "mock-chat-id-123",
  };
});

// 面试流式接口
Mock.mock(`${baseUrl}/user/aiInter/getInterSummary`, "get", () => {
  return "你好！我是 AI 面试官，很高兴见到你。首先，请做一个简单的自我介绍。";
});

// 结束面试
Mock.mock(`${baseUrl}/user/aiInter/endInter`, "post", () => {
  return {
    code: 200,
    message: "面试结束成功",
    data: {
      jobRole: "前端开发工程师",
      createTime: new Date().toLocaleString(),
      aiSummary: "整体表现良好，技术基础扎实，沟通能力强。",
      radarData: {
        communication: 85,
        technical_depth: 90,
        problem_solving: 80,
        learning_ability: 88,
        teamwork: 75,
        initiative: 82,
      },
    },
  };
});

// 获取所有人平均值
Mock.mock(`${baseUrl}/user/aiSummary/average`, "get", () => {
  return {
    code: 200,
    message: "获取成功",
    data: {
      avgCommunication: 75,
      avgTechnicalDepth: 70,
      avgProblemSolving: 65,
      avgLearningAbility: 72,
      avgTeamwork: 68,
      avgInitiative: 60,
    },
  };
});

// 获取个人平均值
Mock.mock(`${baseUrl}/user/aiSummary/myAverage`, "get", () => {
  return {
    code: 200,
    message: "获取成功",
    data: {
      avgCommunication: 85,
      avgTechnicalDepth: 90,
      avgProblemSolving: 80,
      avgLearningAbility: 88,
      avgTeamwork: 75,
      avgInitiative: 82,
    },
  };
});
