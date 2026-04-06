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
  tags: Array.isArray(item.tags)
    ? item.tags.join(",").trim()
    : item.tags?.toString().trim() || "",
  source: Number(item.source) || 0,
});

const baseUrl = "http://127.0.0.1:4523/m1/7900134-7650835-default";

Mock.mock(`${baseUrl}/admin/question/aicreate`, "post", (option) => {
  const params = JSON.parse(option.body || "{}");

  const jobRole = params.jobRole || "通用岗位";
  const difficulty = parseInt(params.difficultyLevel || 2);
  let count = parseInt(params.count || 1);

  // 安全限制
  count = Math.max(1, Math.min(5, count));

  // 题库模板
  const questionBank = {
    前端开发: [
      "Vue3 Composition API 与 Options API 的区别",
      "前端性能优化的常见方案",
      "虚拟 DOM 的原理与作用",
      "Webpack 构建流程与优化",
      "前端如何防范 XSS 攻击",
    ],
    后端开发: [
      "MySQL 索引失效场景",
      "高并发秒杀系统设计",
      "Spring Boot 自动配置原理",
      "Redis 三大问题及解决方案",
      "分布式事务理解",
    ],
  };

  // 随机取不重复题目
  const list =
    questionBank[jobRole] ||
    Array.from({ length: 5 }, (_, i) => `【${jobRole}】AI 生成题目 ${i + 1}`);
  const selected = [...Array(list.length).keys()]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

  // 返回数据
  return {
    code: 200,
    message: `成功生成 ${count} 道 AI 题目`,
    data: selected.map((idx) => ({
      id: null,
      jobRole,
      difficultyLevel: difficulty,
      questionContent: list[idx],
      referenceAnswer: "请根据岗位与难度提供专业参考答案",
      evaluationCriteria: "回答逻辑清晰、要点完整",
      tags:
        jobRole === "前端开发"
          ? "Vue,React,性能优化"
          : jobRole === "后端开发"
          ? "MySQL,Redis,Spring"
          : "AI生成",
      source: 1,
      status: "待提交",
      createTime: new Date().toLocaleString(),
    })),
  };
});

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

// ==================== 用户、题目相关接口 ====================
// 全局数据存储
const userData = {
  interviewRecords: [
    {
      id: 1,
      title: "初始记录",
      content: "初始内容",
      score: 80,
      createTime: "2026-03-26 10:00:00",
    },
  ],
  answerRecords: Mock.mock({
    "list|3-8": [
      {
        "id|+1": 1,
        "cardId|1-10": 1,
        "userId|1-20": 1,
        startTime: "@datetime",
        endTime: "@datetime",
        "status|1": [1, 2, 3],
        "accuracy|0-100": 1,
      },
    ],
  }).list,
  collectQuestions: Mock.mock({
    "list|2-6": [
      {
        "id|+1": 1,
        "difficultyLevel|1": [1, 2, 3],
        "jobRole|1": ["后端", "前端"],
        questionContent: "@csentence",
        referenceAnswer: "@csentence",
        tags: "@cword(6,12)",
        createTime: "@datetime",
      },
    ],
  }).list,
  interviewTags: Mock.mock({
    "list|5-10": [{ "id|+1": 1, name: "@cword(4,8)", desc: "@cparagraph" }],
  }).list,
  historyinterviews: Mock.mock({
    "list|2-4": [
      {
        id: "@increment",
        aiSummary: "@cparagraph(3, 5)",
        radarData: {
          teamwork: "@integer(50, 95)",
          initiative: "@integer(50, 95)",
          communication: "@integer(50, 95)",
          problem_solving: "@integer(50, 95)",
          technical_depth: "@integer(50, 95)",
          learning_ability: "@integer(50, 95)",
        },
        createTime: "@datetime",
        userId: "@integer(1, 20)",
        jobRole:
          "@pick(['后端开发工程师', '前端开发工程师', '全栈工程师', '测试工程师'])",
        title: "@ctitle(8, 15)",
        content: "@cparagraph(2, 4)",
        score: "@integer(70, 95)",
      },
    ],
  }).list,
  questionList: Mock.mock({
    "list|20-50": [
      {
        "id|+1": 1,
        questionContent: "@csentence(10, 30)",
        referenceAnswer: "@csentence(20, 50)",
        evaluationCriteria: "@csentence(10, 30)",
        difficultyLevel: "@pick([1,2,3])",
        jobRole:
          "@pick(['后端开发工程师', '前端开发工程师', '测试工程师', '产品经理'])",
        tags: "@pick(['Spring', '设计模式', 'API', '数据库', '架构'])",
        "source|1": [0, 1],
        like: 0,
        collect: 0,
        isCollected: false,
        isLiked: false,
        createTime: "@datetime",
        updateTime: "@datetime",
      },
    ],
  }).list,
};

// 1. 历史面试记录
Mock.mock(`${baseUrl}/user/aiSummary/search`, "get", () => ({
  code: 200,
  message: "success",
  data: {
    total: userData.historyinterviews.length, // 总条数
    records: userData.historyinterviews,
  },
}));

// 2. 查询面试记录
Mock.mock(`${baseUrl}/user/diary/search`, "get", () => ({
  code: 200,
  message: "success",
  data: userData.interviewRecords,
}));

// 3. 新增面试记录
Mock.mock(`${baseUrl}/user/diary/add`, "post", (options) => {
  const params = JSON.parse(options.body || "{}");
  const { title, content } = params;

  // 校验标题和内容非空
  if (!title?.trim() || !content?.trim()) {
    return { code: 400, msg: "标题和内容不能为空", data: null };
  }

  // 生成新记录
  const newRecord = {
    id: Date.now(),
    title: title.trim(),
    content: content.trim(),
    score: Math.floor(Math.random() * 21) + 80, // 80~100分
    createTime: new Date().toLocaleString(),
  };

  // 新增到数据列表
  userData.interviewRecords.push(newRecord);
  console.log("新增面试记录成功:", newRecord);

  // 返回成功响应
  return { code: 200, msg: "添加成功", data: newRecord };
});

// 4. AI润色
Mock.mock(`${baseUrl}/user/diary/runse`, "post", (options) => {
  const params = JSON.parse(options.body || "{}");
  const { id, content } = params;

  let polishContent = "";
  if (!content.trim()) {
    polishContent = "【AI润色后】暂无有效内容";
  } else {
    // 执行润色逻辑（示例：替换关键词）
    polishContent = `【AI润色后】\n${content.replace(/自我介绍/g, "个人介绍")}`;
  }

  return {
    code: 200,
    msg: "润色成功",
    data: { id, originalContent: content, polishContent },
  };
});

// 5. 删除面试记录
Mock.mock(`${baseUrl}/user/diary/delete`, "post", ({ body }) => {
  const { id } = JSON.parse(body);
  const index = userData.interviewRecords.findIndex((item) => item.id === id);

  if (index > -1) {
    userData.interviewRecords.splice(index, 1);
    return { code: 200, message: "删除成功", data: null };
  }
  return { code: 400, message: "记录不存在", data: null };
});

// 6. 修改面试记录
Mock.mock(`${baseUrl}/user/diary/update`, "post", ({ body }) => {
  const { id, title, content } = JSON.parse(body);
  const record = userData.interviewRecords.find((item) => item.id === id);

  if (record) {
    record.title = title;
    record.content = content;
    record.updateTime = new Date().toLocaleString();
    return { code: 200, message: "修改成功", data: record };
  }
  return { code: 400, message: "记录不存在", data: null };
});

// 7. 能力数据展示
Mock.mock(`${baseUrl}/user/SkillsShowcase/getSkillsShowcase`, "get", () => ({
  code: 200,
  message: "success",
  data: {
    interviewAvgScore: 85,
    interviewLatestScore: 90,
    answerAvgAccuracy: 78,
    answerLatestAccuracy: 88,
  },
}));

// 8. 答题记录
Mock.mock(`${baseUrl}/user/card/getHistory`, "get", () => ({
  code: 200,
  message: "success",
  data: userData.answerRecords,
}));

// 9. 收藏题目
Mock.mock(`${baseUrl}/user/SkillsShowcase/getCollection`, "get", () => ({
  code: 200,
  message: "success",
  data: userData.collectQuestions,
}));

// 修改个人信息接口
Mock.mock(`${baseUrl}/user/user/update`, "post", (rep) => {
  const body = JSON.parse(rep.body);
  // 简单校验手机号格式（和前端规则一致）
  const phoneReg = /^1[3-9]\d{9}$/;
  if (!phoneReg.test(body.phone)) {
    // 失败：code≠200 + 有明确的msg
    return {
      code: 500,
      msg: "手机号格式错误(需11位有效手机号)",
      data: null,
    };
  } else {
    // 成功：code=200 + 有成功提示
    return {
      code: 200,
      msg: "个人信息修改成功",
      data: {
        username: body.username,
        phone: body.phone,
        password: body.password ? "已更新" : undefined,
        avatar: body.avatar,
      },
    };
  }
});

//  面试知识点
// 标签列表
Mock.mock(`${baseUrl}/user/question/tag`, "get", () => {
  return {
    code: 200,
    data: [
      { id: 1, name: "Spring" },
      { id: 2, name: "设计模式" },
      { id: 3, name: "API" },
      { id: 4, name: "数据库" },
      { id: 5, name: "架构" },
      { id: 6, name: "事务" },
      { id: 7, name: "REST" },
      { id: 8, name: "JWT" },
      { id: 9, name: "认证" },
      { id: 10, name: "安全" },
    ],
    message: "获取成功",
  };
});

// 职业列表
Mock.mock(`${baseUrl}/user/question/jobRole`, "get", () => {
  return {
    code: 200,
    data: [
      { id: 1, name: "前端开发工程师" },
      { id: 2, name: "后端开发工程师" },
      { id: 3, name: "测试工程师" },
      { id: 4, name: "产品经理" },
    ],
    message: "获取成功",
  };
});

// 首页查题
Mock.mock(new RegExp(`${baseUrl}/user/question/search`), "get", (options) => {
  const urlParams = new URLSearchParams(options.url.split("?")[1]);
  const tag = urlParams.get("tag");
  const jobRole = urlParams.get("jobRole");
  const keyword = urlParams.get("keyword") || "";
  const pageNum = parseInt(urlParams.get("pageNum")) || 1;
  const pageSize = parseInt(urlParams.get("pageSize")) || 10;

  let filteredData = userData.questionList.filter(
    (item) =>
      item.questionContent.includes(keyword) || item.tags.includes(keyword),
  );
  if (tag) {
    filteredData = filteredData.filter((item) => item.tags.includes(tag));
  }
  if (jobRole) {
    filteredData = filteredData.filter((item) => item.jobRole === jobRole);
  }

  // 分页处理
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = filteredData.slice(start, end);

  return {
    code: 200,
    data: {
      total: filteredData.length,
      pageNum,
      pageSize,
      records: paginatedData,
    },
    message: "获取成功",
  };
});

// 相似题搜索
Mock.mock(
  new RegExp(`${baseUrl}/user/question/vectorSearch\\?questionId=\\d+`),
  "get",
  (options) => {
    const urlParams = new URLSearchParams(options.url.split("?")[1]);
    const questionId = parseInt(urlParams.get("questionId"));

    if (!questionId) {
      return { code: 400, data: [], message: "题目ID不能为空" };
    }

    const currentQuestion = userData.questionList.find(
      (q) => q.id === questionId,
    );
    if (!currentQuestion) {
      return { code: 404, data: [], message: "题目不存在" };
    }

    //  筛选相似题：
    //    - 排除自身
    //    - 标签包含（取第一个标签匹配）
    //    - 难度相同
    const tagsArray = Array.isArray(currentQuestion.tags)
      ? currentQuestion.tags
      : currentQuestion.tags.split(",");

    const coreTag = tagsArray[0] || "";

    const similarQuestions = userData.questionList
      .filter((q) => {
        if (q.id === questionId) return false; // 排除自己
        if (q.difficultyLevel !== currentQuestion.difficultyLevel) return false; // 同难度

        // 标签匹配（支持字符串或数组）
        const qTags = Array.isArray(q.tags) ? q.tags : q.tags.split(",");
        return qTags.includes(coreTag);
      })
      .slice(-5) // 取最后5条（模拟“最近”）
      .reverse(); // 最近的在前面

    return {
      code: 200,
      data: similarQuestions,
      message: "相似性搜索(最近的5条)", // 匹配前端弹窗标题
    };
  },
);

// 收藏
Mock.mock(new RegExp(`${baseUrl}/user/question/collect`), "get", (options) => {
  const urlParams = new URLSearchParams(options.url.split("?")[1]);
  const id = parseInt(urlParams.get("id"));

  const question = userData.questionList.find((q) => q.id === id);
  if (question) {
    question.isCollected = !question.isCollected;
    question.collect += question.isCollected ? 1 : -1;
  }

  return {
    code: 200,
    data: { collected: question?.isCollected },
    message: question?.isCollected ? "收藏成功" : "取消收藏",
  };
});

// 点赞
Mock.mock(new RegExp(`${baseUrl}/user/question/like`), "get", (options) => {
  const urlParams = new URLSearchParams(options.url.split("?")[1]);
  const id = parseInt(urlParams.get("id"));

  const question = userData.questionList.find((q) => q.id === id);
  if (question) {
    question.isLiked = !question.isLiked;
    question.like += question.isLiked ? 1 : -1;
  }

  return {
    code: 200,
    data: { liked: question?.isLiked },
    message: question?.isLiked ? "点赞成功" : "取消点赞",
  };
});

// 添加题目
Mock.mock(`${baseUrl}/user/question/add`, "post", (options) => {
  const data = JSON.parse(options.body);
  // 生成新题目ID（保证唯一）
  const newQuestionId = Mock.Random.natural(100, 999);
  // 构造新题目数据（匹配列表字段）
  const newQuestion = {
    id: newQuestionId,
    questionContent: data.questionContent,
    referenceAnswer: data.referenceAnswer,
    evaluationCriteria: data.evaluationCriteria,
    difficultyLevel: parseInt(data.difficultyLevel),
    jobRole: data.jobRole,
    tags: Array.isArray(data.tags) ? data.tags.join(",") : data.tags,
    source: data.source,
    like: 0,
    collect: 0,
    isCollected: false,
    isLiked: false,
    createTime: new Date().toLocaleString(),
  };
  // 新增题目加入Mock数据
  userData.questionList.unshift(newQuestion);
  // 返回成功响应
  return {
    code: 200,
    data: newQuestion,
    message: "题目添加成功",
  };
});
