<template>
  <div class="question-container">
    <!-- 顶部导航 -->
    <nav class="navbar">
      <div class="logo">AI面试平台</div>
      <div class="nav-links">
        <router-link to="/user-home" class="nav-link">首页</router-link>
        <router-link to="/interview-prepare" class="nav-link"
          >面试准备</router-link
        >
        <router-link to="/aicoach" class="nav-link">ai教练</router-link>
        <router-link to="/user-question" class="nav-link">题目库</router-link>
        <router-link to="/user" class="nav-link">用户</router-link>
        <button @click="handleLogout" class="logout-btn">退出登录</button>
      </div>
    </nav>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 搜索栏（如果有搜索关键词则显示） -->
      <div v-if="searchKeyword" class="search-info">
        <span>搜索关键词：</span>
        <strong>{{ searchKeyword }}</strong>
        <button @click="clearSearch" class="clear-search">清空搜索</button>
      </div>

      <!-- 标签切换 -->
      <div class="tab-header">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'knowledge' }"
          @click="activeTab = 'knowledge'"
        >
          📚 面试知识点
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'flashcard' }"
          @click="activeTab = 'flashcard'"
        >
          🎴 速记卡
        </div>
      </div>

      <!-- 面试知识点内容 -->
      <div v-if="activeTab === 'knowledge'" class="knowledge-content">
        <!-- 搜索 + 筛选区域 -->
        <div class="query-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索题目关键词"
            style="width: 240px"
            clearable
            @keyup.enter="handleSearch"
          />

          <el-select
            v-model="searchTag"
            placeholder="按标签筛选"
            style="width: 180px"
            clearable
          >
            <el-option label="Spring" value="Spring" />
            <el-option label="设计模式" value="设计模式" />
            <el-option label="API" value="API" />
            <el-option label="数据库" value="数据库" />
            <el-option label="架构" value="架构" />
            <el-option label="事务" value="事务" />
            <el-option label="REST" value="REST" />
            <el-option label="JWT" value="JWT" />
            <el-option label="认证" value="认证" />
            <el-option label="安全" value="安全" />
          </el-select>

          <el-select
            v-model="searchJob"
            placeholder="按岗位筛选"
            style="width: 180px"
            clearable
          >
            <el-option label="后端开发工程师" value="后端开发工程师" />
            <el-option label="前端开发工程师" value="前端开发工程师" />
            <el-option label="测试工程师" value="测试工程师" />
            <el-option label="产品经理" value="产品经理" />
          </el-select>

          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>

        <!-- 添加题目表单 -->
        <el-form
          :model="questionForm"
          :rules="questionRules"
          ref="questionFormRef"
          label-width="120px"
          class="question-form"
        >
          <el-form-item label="题目标题" prop="questionContent">
            <el-input
              v-model="questionForm.questionContent"
              type="textarea"
              :rows="3"
              placeholder="请输入题目内容"
            />
          </el-form-item>

          <el-form-item label="参考答案" prop="referenceAnswer">
            <el-input
              v-model="questionForm.referenceAnswer"
              type="textarea"
              :rows="3"
              placeholder="请输入参考答案"
            />
          </el-form-item>

          <el-form-item label="评分准则" prop="evaluationCriteria">
            <el-input
              v-model="questionForm.evaluationCriteria"
              type="textarea"
              :rows="2"
              placeholder="请输入评分准则"
            />
          </el-form-item>

          <el-form-item label="难度等级" prop="difficultyLevel">
            <el-radio-group v-model="questionForm.difficultyLevel">
              <el-radio label="1">简单</el-radio>
              <el-radio label="2">中等</el-radio>
              <el-radio label="3">困难</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="适用岗位" prop="jobRole">
            <el-select v-model="questionForm.jobRole" placeholder="请选择岗位">
              <el-option label="后端开发工程师" value="后端开发工程师" />
              <el-option label="前端开发工程师" value="前端开发工程师" />
              <el-option label="测试工程师" value="测试工程师" />
              <el-option label="产品经理" value="产品经理" />
            </el-select>
          </el-form-item>

          <el-form-item label="知识点标签" prop="tags">
            <el-select
              v-model="questionForm.tags"
              multiple
              placeholder="请选择或输入标签"
              style="width: 100%"
              filterable
              allow-create
            >
              <el-option label="Spring" value="Spring" />
              <el-option label="设计模式" value="设计模式" />
              <el-option label="API" value="API" />
              <el-option label="数据库" value="数据库" />
              <el-option label="架构" value="架构" />
              <el-option label="事务" value="事务" />
              <el-option label="REST" value="REST" />
              <el-option label="JWT" value="JWT" />
              <el-option label="认证" value="认证" />
              <el-option label="安全" value="安全" />
            </el-select>
          </el-form-item>

          <el-form-item label="题目来源" prop="source">
            <el-radio-group v-model="questionForm.source">
              <el-radio label="0">公共题目</el-radio>
              <el-radio label="1">企业专用题库</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleAddQuestion"
              :loading="addLoading"
            >
              提交题目
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 题目列表 -->
        <div class="question-list">
          <!-- 表格独立表头 -->
          <div class="table-header">
            <div class="header-item">题目内容</div>
            <div class="header-item">难度等级</div>
            <div class="header-item">适用岗位</div>
            <div class="header-item">知识点标签</div>
            <div class="header-item">操作功能</div>
          </div>

          <!-- 题目列表表格 -->
          <el-table
            :data="questionList"
            style="width: 100%"
            :loading="loading"
            row-key="id"
            empty-text="暂无题目数据"
            stripe
            border
          >
            <!-- 题目内容列 -->
            <el-table-column
              prop="questionContent"
              width="432"
              show-overflow-tooltip
              align="left"
            />

            <!-- 难度等级列 -->
            <el-table-column width="135" align="center">
              <template #default="scope">
                <el-tag
                  :type="
                    scope.row.difficultyLevel === 1
                      ? 'success'
                      : scope.row.difficultyLevel === 2
                      ? 'warning'
                      : 'danger'
                  "
                  size="small"
                >
                  {{
                    scope.row.difficultyLevel === 1
                      ? "简单"
                      : scope.row.difficultyLevel === 2
                      ? "中等"
                      : scope.row.difficultyLevel === 3
                      ? "困难"
                      : "未知"
                  }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 适用岗位列 -->
            <el-table-column
              prop="jobRole"
              width="170"
              align="center"
              show-overflow-tooltip
            />

            <!-- 知识点标签列 -->
            <el-table-column
              prop="tags"
              width="200"
              show-overflow-tooltip
              align="center"
            />

            <!-- 操作功能列 -->
            <el-table-column width="360" align="center">
              <template #default="scope">
                <div class="action-buttons">
                  <el-button
                    size="small"
                    :type="scope.row.isLiked ? 'primary' : 'default'"
                    @click="handleLike(scope.row.id)"
                  >
                    {{ scope.row.isLiked ? "已点赞" : "点赞" }}
                  </el-button>

                  <el-button
                    size="small"
                    :type="scope.row.isCollected ? 'success' : 'default'"
                    @click="handleCollect(scope.row.id)"
                  >
                    {{ scope.row.isCollected ? "已收藏" : "收藏" }}
                  </el-button>

                  <el-button
                    size="small"
                    type="info"
                    @click="handleSimilar(scope.row.id)"
                  >
                    相似题目
                  </el-button>

                  <el-button
                    size="small"
                    type="primary"
                    @click="handleViewDetail(scope.row.id)"
                  >
                    查看详情
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          style="margin-top: 20px; text-align: right"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />

        <!-- 面试知识点详情弹窗 -->
        <el-dialog
          v-model="detailDialogVisible"
          title="面试知识点详情"
          width="900px"
          destroy-on-close
          :close-on-click-modal="false"
          :close-on-press-escape="false"
        >
          <el-descriptions
            v-if="currentQuestionDetail.id"
            :column="4"
            border
            style="width: 100%; font-size: 14px"
            :label-style="{
              background: '#f5f7fa',
              fontWeight: 600,
              color: '#303133',
              width: '120px',
              textAlign: 'right',
            }"
            :content-style="{
              padding: '12px 16px',
              color: '#606266',
            }"
          >
            <!-- 1. 题目ID + 难度等级 -->
            <el-descriptions-item label="题目ID" span="1">
              {{ currentQuestionDetail.id || "暂无数据" }}
            </el-descriptions-item>
            <el-descriptions-item label="难度等级" span="3">
              <el-tag
                :type="
                  currentQuestionDetail.difficultyLevel === 1
                    ? 'success'
                    : currentQuestionDetail.difficultyLevel === 2
                    ? 'warning'
                    : 'danger'
                "
                size="small"
              >
                {{
                  currentQuestionDetail.difficultyLevel === 1
                    ? "简单"
                    : currentQuestionDetail.difficultyLevel === 2
                    ? "中等"
                    : currentQuestionDetail.difficultyLevel === 3
                    ? "困难"
                    : "暂无数据"
                }}
              </el-tag>
            </el-descriptions-item>

            <!-- 2. 适用岗位 -->
            <el-descriptions-item label="适用岗位" span="1">
              {{ currentQuestionDetail.jobRole || "暂无数据" }}
            </el-descriptions-item>

            <!-- 3. 题目内容 -->
            <el-descriptions-item label="题目内容" span="4">
              <div class="detail-content">
                {{ currentQuestionDetail.questionContent || "暂无数据" }}
              </div>
            </el-descriptions-item>

            <!-- 4. 参考答案 -->
            <el-descriptions-item label="参考答案" span="4">
              <div class="detail-content">
                {{ currentQuestionDetail.referenceAnswer || "暂无数据" }}
              </div>
            </el-descriptions-item>

            <!-- 5. 评分准则 -->
            <el-descriptions-item label="评分准则" span="4">
              <div class="detail-content">
                {{ currentQuestionDetail.evaluationCriteria || "暂无数据" }}
              </div>
            </el-descriptions-item>

            <!-- 6. 知识点标签 + 题目来源 -->
            <el-descriptions-item label="知识点标签" span="1">
              <el-tag
                v-for="tag in tagList"
                :key="tag"
                size="small"
                style="margin: 0 4px 4px 0"
              >
                {{ tag }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="题目来源" span="3">
              <el-tag
                :type="currentQuestionDetail.source === 0 ? 'primary' : 'info'"
                size="small"
              >
                {{
                  currentQuestionDetail.source === 0
                    ? "公共题目"
                    : currentQuestionDetail.source === 1
                    ? "企业专用题库"
                    : "暂无数据"
                }}
              </el-tag>
            </el-descriptions-item>

            <!-- 7. 创建时间 + 更新时间 -->
            <el-descriptions-item label="创建时间" span="1">
              {{ formatTime(currentQuestionDetail.createTime) || "暂无数据" }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间" span="3">
              {{ formatTime(currentQuestionDetail.updateTime) || "暂无数据" }}
            </el-descriptions-item>

            <!-- 9. 点赞数 + 收藏数 -->
            <el-descriptions-item label="点赞数" span="1">
              <span class="count">{{ currentQuestionDetail.like || 0 }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="收藏数" span="3">
              <span class="count">{{
                currentQuestionDetail.collect || 0
              }}</span>
            </el-descriptions-item>
          </el-descriptions>

          <!-- 弹窗底部按钮 -->
          <template #footer>
            <el-button @click="detailDialogVisible = false">关闭</el-button>
          </template>
        </el-dialog>

        <!-- 相似题弹窗 -->
        <el-dialog v-model="similarDialogVisible" title="相似性搜索(最近的5条)">
          <el-table
            :data="similarQuestionList"
            border
            empty-text="暂无相似题目"
            style="width: 100%"
          >
            <el-table-column
              prop="questionContent"
              label="题目内容"
              min-width="300"
              show-overflow-tooltip
            />
            <el-table-column label="难度等级" width="100">
              <template #default="scope">
                {{
                  scope.row.difficultyLevel === 1
                    ? "简单"
                    : scope.row.difficultyLevel === 2
                    ? "中等"
                    : scope.row.difficultyLevel === 3
                    ? "困难"
                    : "未知"
                }}
              </template>
            </el-table-column>
            <el-table-column prop="jobRole" label="适用岗位" width="160" />
            <el-table-column prop="tags" label="知识点标签" width="200" />
          </el-table>
        </el-dialog>
      </div>

      <!-- 速记卡内容 -->
      <div v-else class="flashcard-content">
        <!-- 子标签切换：创建 / 做题 -->
        <div class="sub-tabs">
          <button
            class="sub-tab"
            :class="{ active: currentMode === 'create' }"
            @click="currentMode = 'create'"
          >
            ✍️ 创建速记卡
          </button>
          <button
            class="sub-tab"
            :class="{ active: currentMode === 'practice' }"
            @click="currentMode = 'practice'"
          >
            🎯 开始做题
          </button>
        </div>

        <!-- 创建速记卡组件 -->
        <CreateCard
          v-if="currentMode === 'create'"
          @card-created="handleCardCreated"
        />

        <!-- 做题组件 -->
        <PracticeCard
          v-else
          ref="practiceRef"
          :list="cardList"
          @practice-complete="handlePracticeComplete"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import CreateCard from "./CreateCard.vue";
import PracticeCard from "./PracticeCard.vue";
import { getCardList } from "@/api/flashcard";
import {
  getTagList,
  getJobRoleList,
  getQuestionList,
  addQuestion,
  getSimilarQuestion,
  collectQuestion,
  likeQuestion,
} from "../../api/request";

export default {
  name: "QuestionPage",
  components: {
    CreateCard,
    PracticeCard,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    const activeTab = ref("flashcard");
    const currentMode = ref("create");
    const cardList = ref([]);
    const practiceRef = ref(null);
    const searchKeyword = ref("");

    // 面试知识点相关状态
    const searchTag = ref("");
    const searchJob = ref("");
    const pageNum = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    const loading = ref(false);
    const addLoading = ref(false);
    const questionList = ref([]);
    const questionFormRef = ref(null);
    const detailDialogVisible = ref(false);
    const similarDialogVisible = ref(false);
    const currentQuestionDetail = ref({});
    const similarQuestionList = ref([]);

    const jobRoleList = ref([]);
    const tagOptions = ref([]);

    // 提交题目表单
    const questionForm = ref({
      questionContent: "",
      referenceAnswer: "",
      evaluationCriteria: "",
      difficultyLevel: "",
      jobRole: "",
      tags: [],
      source: "0",
    });

    // 表单校验规则
    const questionRules = ref({
      questionContent: [
        { required: true, message: "请输入题目内容", trigger: "blur" },
      ],
      referenceAnswer: [
        { required: true, message: "请输入参考答案", trigger: "blur" },
      ],
      difficultyLevel: [
        { required: true, message: "请选择难度等级", trigger: "change" },
      ],
      jobRole: [
        { required: true, message: "请选择适用岗位", trigger: "change" },
      ],
      tags: [
        { required: true, message: "请选择知识点标签", trigger: "change" },
      ],
    });

    // 标签列表
    const tagList = computed(() => {
      const tags = currentQuestionDetail.value?.tags;
      if (Array.isArray(tags)) return tags;
      if (typeof tags === "string")
        return tags.split(",").filter((t) => t.trim());
      return [];
    });

    const loadJobRoleList = async () => {
      try {
        const res = await getJobRoleList();
        console.log("✅ 岗位接口请求成功：", res);
        jobRoleList.value = res.data || [];
      } catch (err) {
        console.error("❌ 岗位接口请求失败：", err);
        ElMessage.error("岗位加载失败");
      }
    };

    const loadTagList = async () => {
      try {
        const res = await getTagList();
        console.log("✅ 标签接口请求成功：", res);
        tagOptions.value = res.data || [];
      } catch (err) {
        console.error("❌ 标签接口请求失败：", err);
        ElMessage.error("标签加载失败");
      }
    };

    // 获取速记卡列表
    const loadCardList = async () => {
      try {
        const response = await getCardList();
        cardList.value = response.data || [];
      } catch (error) {
        console.error("加载速记卡失败", error);
        // 模拟数据
        cardList.value = [
          {
            id: 1,
            question: "Vue 3 的响应式原理是什么？",
            answer:
              "Vue 3 使用 Proxy 代理对象实现响应式，相比 Vue 2 的 Object.defineProperty，可以监听数组变化和对象属性的增删。",
            options: [
              "使用 Object.defineProperty",
              "使用 Proxy 代理",
              "使用 Object.observe",
              "使用 Reflect API",
            ],
            correctOption: 1,
            type: "ai",
          },
          {
            id: 2,
            question: "以下哪个是 CSS 中用于创建弹性布局的属性？",
            answer:
              "display: flex 用于创建弹性盒模型布局，可以让子元素灵活排列。",
            options: [
              "display: block",
              "display: inline",
              "display: flex",
              "display: grid",
            ],
            correctOption: 2,
            type: "manual",
          },
        ];
      }
    };

    // 加载题目列表
    const loadQuestionList = async () => {
      loading.value = true;
      try {
        const params = {
          pageNum: pageNum.value,
          pageSize: pageSize.value,
          keyword: searchKeyword.value,
          tag: searchTag.value,
          jobRole: searchJob.value,
        };
        const res = await getQuestionList(params);
        console.log("✅ 题目列表接口请求成功：", res);

        // 统一格式化 tags 为数组
        questionList.value = (res.data.records || []).map((item) => {
          let tags = [];
          if (Array.isArray(item.tags)) {
            tags = item.tags;
          } else if (typeof item.tags === "string") {
            tags = item.tags
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t);
          }
          return { ...item, tags };
        });

        total.value = res.data.total || 0;
      } catch (error) {
        console.error("❌ 题目列表接口请求失败：", error);
        ElMessage.error("加载失败");
      } finally {
        loading.value = false;
      }
    };

    // 添加题目
    const handleAddQuestion = async () => {
      if (!questionFormRef.value) return;
      addLoading.value = true;
      try {
        await questionFormRef.value.validate();
        const res = await addQuestion(questionForm.value);
        console.log("✅ 添加题目接口成功：", res);
        ElMessage.success("题目添加成功！");
        questionFormRef.value.resetFields();
        loadQuestionList();
      } catch (error) {
        console.error("❌ 添加题目接口失败：", error);
        ElMessage.error("提交失败：" + (error.message || "请检查表单"));
      } finally {
        addLoading.value = false;
      }
    };

    // 搜索题目
    const handleSearch = () => {
      pageNum.value = 1;
      loadQuestionList();
    };

    // 重置搜索
    const resetSearch = () => {
      searchKeyword.value = "";
      searchTag.value = "";
      searchJob.value = "";
      pageNum.value = 1;
      loadQuestionList();
    };

    // 分页处理
    const handleSizeChange = (val) => {
      pageSize.value = val;
      loadQuestionList();
    };

    const handleCurrentChange = (val) => {
      pageNum.value = val;
      loadQuestionList();
    };

    // 收藏题目
    const handleCollect = async (id) => {
      try {
        const res = await collectQuestion(id);
        console.log(`✅ 收藏接口请求成功 (ID:${id})：`, res);
        const item = questionList.value.find((x) => x.id === id);
        if (item) {
          item.isCollected = !item.isCollected;
          item.collect += item.isCollected ? 1 : -1;
          ElMessage.success(item.isCollected ? "收藏成功" : "取消收藏");
        }
      } catch (e) {
        console.error(`❌ 收藏接口失败 (ID:${id})：`, e);
        ElMessage.error("操作失败");
      }
    };

    // 点赞题目
    const handleLike = async (id) => {
      try {
        const res = await likeQuestion(id);
        console.log(`✅ 点赞接口请求成功 (ID:${id})：`, res);
        const item = questionList.value.find((x) => x.id === id);
        if (item) {
          item.isLiked = !item.isLiked;
          item.like += item.isLiked ? 1 : -1;
          ElMessage.success(item.isLiked ? "点赞成功" : "取消点赞");
        }
      } catch (e) {
        console.error(`❌ 点赞接口失败 (ID:${id})：`, e);
        ElMessage.error("操作失败");
      }
    };

    // 查看相似题目
    const handleSimilar = async (id) => {
      try {
        const res = await getSimilarQuestion(id);
        console.log(`✅ 相似题接口成功 (ID:${id})：`, res);
        similarQuestionList.value = res.data || [];
        similarDialogVisible.value = true;
      } catch (e) {
        console.error(`❌ 相似题接口失败 (ID:${id})：`, e);
        ElMessage.error("获取相似题失败");
      }
    };

    // 查看题目详情
    const handleViewDetail = async (id) => {
      try {
        const question = questionList.value.find((q) => q.id === id);
        if (question) {
          currentQuestionDetail.value = { ...question };
          detailDialogVisible.value = true;
        } else {
          ElMessage.warning("未找到该题目");
        }
      } catch (error) {
        console.error("加载题目详情失败:", error);
        ElMessage.error("加载失败，请稍后重试");
      }
    };

    // 格式化时间
    const formatTime = (timestamp) => {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return (
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0") +
        " " +
        String(date.getHours()).padStart(2, "0") +
        ":" +
        String(date.getMinutes()).padStart(2, "0") +
        ":" +
        String(date.getSeconds()).padStart(2, "0")
      );
    };

    const handleCardCreated = (newCard) => {
      cardList.value.unshift(newCard);
      ElMessage.success("速记卡创建成功！");
    };

    const handlePracticeComplete = (result) => {
      console.log("练习完成", result);
      ElMessage.success(`练习完成！正确率：${result.percentage}%`);
    };

    const clearSearch = () => {
      searchKeyword.value = "";
      router.push("/user-question");
    };

    const handleLogout = () => {
      localStorage.removeItem("userToken");
      router.push("/login");
    };

    onMounted(() => {
      if (route.query.keyword) {
        searchKeyword.value = route.query.keyword;
        activeTab.value = "knowledge";
      }
      loadCardList();
      loadQuestionList();
      loadJobRoleList();
      loadTagList();
    });

    return {
      activeTab,
      currentMode,
      cardList,
      practiceRef,
      searchKeyword,
      searchTag,
      searchJob,
      pageNum,
      pageSize,
      total,
      loading,
      addLoading,
      questionList,
      questionForm,
      questionRules,
      questionFormRef,
      detailDialogVisible,
      similarDialogVisible,
      currentQuestionDetail,
      similarQuestionList,
      tagList,
      jobRoleList,
      handleCardCreated,
      handlePracticeComplete,
      handleAddQuestion,
      handleSearch,
      resetSearch,
      handleSizeChange,
      handleCurrentChange,
      handleCollect,
      handleLike,
      handleSimilar,
      handleViewDetail,
      formatTime,
      clearSearch,
      handleLogout,
      loadCardList,
    };
  },
};
</script>

<style scoped>
.question-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 24px;
  font-weight: bold;
  padding: 15px 0;
}

.nav-links {
  display: flex;
  gap: 30px;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-size: 16px;
  transition: opacity 0.3s;
}

.nav-link.active {
  font-weight: bold;
  border-bottom: 2px solid white;
}

.nav-link:hover {
  opacity: 0.8;
}

.logout-btn {
  padding: 8px 16px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.logout-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.search-info {
  background: #e8f0fe;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.clear-search {
  margin-left: auto;
  padding: 4px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.tab-header {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e0e0e0;
}

.tab-item {
  padding: 12px 24px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  color: #666;
  transition: all 0.3s;
  position: relative;
}

.tab-item.active {
  color: #667eea;
}

.tab-item.active::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #667eea;
}

.tab-item:hover {
  color: #667eea;
}

/* 面试知识点相关样式 */
.knowledge-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.query-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.question-form {
  margin-bottom: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.question-list {
  margin-top: 20px;
}

.table-header {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border: 1px solid #e6e6e6;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  padding: 0 10px;
  height: 55px;
  font-weight: 600;
  color: #303133;
  width: 100%;
  box-sizing: border-box;
}

.header-item {
  flex: 1;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.detail-content {
  white-space: pre-wrap;
  line-height: 1.8;
  padding: 8px;
  background: #fafafa;
  border-radius: 4px;
}

.count {
  color: #409eff;
  font-weight: 600;
}

/* 速记卡相关样式 */
.flashcard-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.sub-tabs {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 15px;
}

.sub-tab {
  padding: 8px 20px;
  font-size: 15px;
  font-weight: 500;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #666;
  border-radius: 20px;
  transition: all 0.3s;
}

.sub-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.sub-tab:hover:not(.active) {
  background: #f0f0f0;
  color: #667eea;
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 20px;
  }

  .logo {
    font-size: 18px;
  }

  .nav-links {
    gap: 15px;
  }

  .nav-link {
    font-size: 14px;
  }

  .content-wrapper {
    padding: 20px 15px;
  }

  .tab-item {
    padding: 10px 16px;
    font-size: 16px;
  }

  .query-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .query-bar > * {
    width: 100% !important;
  }

  .action-buttons {
    flex-wrap: wrap;
  }

  .flashcard-content {
    padding: 16px;
  }
}
</style>
