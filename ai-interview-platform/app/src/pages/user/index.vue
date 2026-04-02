<template>
  <div class="user-center">
    <!-- 顶部用户操作 -->
    <div class="user-header">
      <el-button
        type="primary"
        @click="showUpdateInfo = true"
        style="margin-bottom: 1%"
        >修改个人信息</el-button
      >
      <el-button
        type="danger"
        @click="handleLogout"
        style="margin-left: 10px; margin-bottom: 1%"
        >退出登录</el-button
      >
    </div>

    <!-- 核心功能标签页 -->
    <el-tabs
      v-model="activeTab"
      type="border-card"
      @tab-change="handleTabChange"
    >
      <!-- 1. 历史面试记录 -->
      <el-tab-pane label="历史面试记录" name="history-interview">
        <el-table
          :data="dataList.historyInterview"
          border
          stripe
          :loading="loading"
          row-key="id"
        >
          <el-table-column prop="title" label="记录标题" min-width="150" />
          <el-table-column
            prop="jobRole"
            label="适用岗位"
            width="120"
            align="center"
          />
          <el-table-column
            prop="aiSummary"
            label="AI总结"
            min-width="300"
            show-overflow-tooltip
          />
          <el-table-column label="核心能力" width="350">
            <template #default="scope">
              <el-tag size="small" style="margin: 0 2px">
                技术深度：{{ scope.row.radarData?.technical_depth || 0 }}
              </el-tag>
              <el-tag size="small" style="margin: 0 2px">
                沟通能力：{{ scope.row.radarData?.communication || 0 }}
              </el-tag>
              <el-tag size="small" style="margin: 0 2px">
                团队协作：{{ scope.row.radarData?.teamwork || 0 }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="score"
            label="面试评分"
            width="100"
            align="center"
          />
          <el-table-column
            prop="createTime"
            label="创建时间"
            width="180"
            align="center"
          />
          <el-table-column label="操作" width="100" align="center">
            <template #default="scope">
              <el-button
                size="small"
                type="info"
                @click="viewHistoryDetail(scope.row)"
                >查看</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 2. 正式面试记录 -->
      <el-tab-pane label="正式面试记录" name="interview">
        <div class="interview-actions" style="margin-bottom: 10px">
          <el-button type="primary" @click="openInterviewDialog()"
            >新增记录</el-button
          >
        </div>
        <el-table
          :data="dataList.interview"
          border
          stripe
          :loading="loading"
          row-key="id"
        >
          <el-table-column prop="title" label="记录标题" min-width="150" />
          <el-table-column
            prop="content"
            label="面试内容"
            min-width="300"
            show-overflow-tooltip
          />
          <el-table-column label="操作" width="300" align="center">
            <template #default="scope">
              <el-button
                size="small"
                type="info"
                @click="viewInterviewDetail(scope.row)"
                style="margin-right: 5px"
                >查看</el-button
              >
              <el-button
                size="small"
                type="primary"
                @click="openInterviewDialog(scope.row)"
                style="margin: 0 5px"
                >修改</el-button
              >
              <el-button
                size="small"
                type="danger"
                @click="handleDeleteInterview(scope.row.id)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 3.能力数据展示 -->
      <el-tab-pane label="能力数据展示" name="ability-data">
        <div class="ability-chart-container" ref="abilityChart"></div>
        <div class="ability-data-table">
          <el-table :data="abilityDataTable" border stripe>
            <el-table-column prop="name" label="指标名称" width="180" />
            <el-table-column
              prop="avgValue"
              label="平均值"
              width="120"
              align="center"
            />
            <el-table-column
              prop="latestValue"
              label="最新值"
              width="120"
              align="center"
            />
            <el-table-column
              prop="unit"
              label="单位"
              width="80"
              align="center"
            />
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 4. 答题记录 -->
      <el-tab-pane label="答题记录" name="answer">
        <el-table
          :data="dataList.answer"
          border
          stripe
          :loading="loading"
          row-key="id"
          width="100%"
          style="width: 100%"
        >
          <el-table-column
            prop="cardId"
            label="卡片ID"
            min-width="100"
            align="center"
          />
          <el-table-column
            prop="startTime"
            label="开始时间"
            min-width="180"
            align="center"
          />
          <el-table-column
            prop="endTime"
            label="结束时间"
            min-width="180"
            align="center"
          />
          <el-table-column
            prop="status"
            label="答题状态"
            min-width="100"
            align="center"
          >
            <template #default="scope">
              <el-tag
                :type="
                  scope.row.status === 1
                    ? 'success'
                    : scope.row.status === 2
                      ? 'warning'
                      : 'danger'
                "
              >
                {{
                  scope.row.status === 1
                    ? "已完成"
                    : scope.row.status === 2
                      ? "进行中"
                      : "已取消"
                }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="accuracy"
            label="正确率(%)"
            min-width="100"
            align="center"
          />
          <el-table-column label="操作" min-width="100" align="center">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="viewDetail('answer', scope.row)"
                >查看详情</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 5. 收藏题目 -->
      <el-tab-pane label="收藏题目" name="collect">
        <el-table
          :data="dataList.collect"
          border
          stripe
          :loading="loading"
          row-key="id"
        >
          <el-table-column
            prop="questionContent"
            label="题目内容"
            min-width="300"
            show-overflow-tooltip
          />
          <el-table-column
            prop="difficultyLevel"
            label="难度"
            width="80"
            align="center"
          >
            <template #default="scope">
              {{ ["", "简单", "中等", "困难"][scope.row.difficultyLevel] }}
            </template>
          </el-table-column>
          <el-table-column
            prop="jobRole"
            label="适用岗位"
            width="100"
            align="center"
          />
          <el-table-column prop="tags" label="知识点标签" min-width="150" />
          <el-table-column
            prop="createTime"
            label="收藏时间"
            width="180"
            align="center"
          />
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 历史面试详情弹窗 -->
    <el-dialog
      v-model="showHistoryDetail"
      title="历史面试详情"
      width="700px"
      destroy-on-close
    >
      <div class="history-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="应聘岗位" prop="jobRole">{{
            currentHistoryDetail.jobRole
          }}</el-descriptions-item>
          <el-descriptions-item label="面试评分" prop="score"
            >{{ currentHistoryDetail.score }} 分</el-descriptions-item
          >
          <el-descriptions-item label="创建时间" prop="createTime">{{
            currentHistoryDetail.createTime
          }}</el-descriptions-item>
          <el-descriptions-item label="用户ID" prop="userId">{{
            currentHistoryDetail.userId
          }}</el-descriptions-item>
          <el-descriptions-item label="AI面试总结" :span="2">
            <div
              style="
                padding: 10px;
                background: #f5f7fa;
                border-radius: 4px;
                line-height: 1.8;
              "
            >
              {{ currentHistoryDetail.aiSummary }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="面试内容" :span="2">
            <div
              style="
                padding: 10px;
                background: #f9f9f9;
                border-radius: 4px;
                line-height: 1.8;
                white-space: pre-wrap;
              "
            >
              {{ currentHistoryDetail.content }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer
        ><el-button @click="showHistoryDetail = false"
          >关闭</el-button
        ></template
      >
    </el-dialog>

    <!-- 面试记录详情弹窗 -->
    <el-dialog
      v-model="showInterviewDetail"
      title="面试记录详情"
      width="700px"
      destroy-on-close
    >
      <div class="interview-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="记录标题">{{
            currentInterviewDetail.title
          }}</el-descriptions-item>
          <el-descriptions-item
            label="适用岗位"
            v-if="currentInterviewDetail.jobRole"
            >{{ currentInterviewDetail.jobRole }}</el-descriptions-item
          >
          <el-descriptions-item label="面试内容">
            <div
              class="content-box"
              v-html="currentInterviewDetail.content"
            ></div>
          </el-descriptions-item>
          <el-descriptions-item
            label="面试评分"
            v-if="currentInterviewDetail.score"
            >{{ currentInterviewDetail.score }} 分</el-descriptions-item
          >
          <el-descriptions-item label="创建时间">{{
            currentInterviewDetail.createTime
          }}</el-descriptions-item>
          <el-descriptions-item
            label="更新时间"
            v-if="currentInterviewDetail.updateTime"
            >{{ currentInterviewDetail.updateTime }}</el-descriptions-item
          >
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="showInterviewDetail = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增/修改面试记录弹窗 -->
    <el-dialog
      v-model="showAddInterview"
      :title="isEdit ? '修改面试记录' : '新增面试记录'"
      width="600px"
    >
      <el-form
        :model="interviewForm"
        label-width="80px"
        :rules="interviewRules"
        ref="interviewFormRef"
      >
        <el-form-item label="记录标题" prop="title">
          <el-input
            v-model="interviewForm.title"
            placeholder="请输入记录标题"
          />
        </el-form-item>
        <el-form-item label="面试内容" prop="content">
          <el-input
            type="textarea"
            v-model="interviewForm.content"
            :rows="6"
            placeholder="请输入面试内容"
          />
          <div style="margin-top: 10px; text-align: left">
            <el-button
              type="success"
              size="small"
              @click="handleFormPolish"
              :loading="polishFormLoading"
            >
              AI润色
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddInterview = false">取消</el-button>
        <el-button type="primary" @click="submitInterviewForm">
          {{ isEdit ? "确认修改" : "确认新增" }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 修改个人信息弹窗 -->
    <el-dialog v-model="showUpdateInfo" title="修改个人信息" width="500px">
      <el-form
        ref="userFormRef"
        :model="userInfo"
        :rules="userRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model.trim="userInfo.username"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model.trim="userInfo.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="userInfo.password"
            type="password"
            placeholder="留空则不修改密码"
            show-password
          />
        </el-form-item>
        <el-form-item
          v-if="userInfo.password"
          label="确认密码"
          prop="confirmPassword"
        >
          <el-input
            v-model="userInfo.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action=""
            :show-file-list="false"
            :on-change="handleAvatarChange"
            :auto-upload="false"
          >
            <img v-if="userInfo.avatar" :src="userInfo.avatar" class="avatar" />
            <div v-else class="avatar-uploader-placeholder">点击上传头像</div>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitUserInfo">保存</el-button>
          <el-button @click="showUpdateInfo = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 通用详情弹窗 -->
    <el-dialog v-model="showDetailDialog" :title="detailTitle" width="500px">
      <div v-if="currentDetail" class="detail-content">
        <template v-if="detailType === 'answer'">
          <p><strong>卡片ID:</strong>{{ currentDetail.cardId }}</p>
          <p><strong>用户ID:</strong>{{ currentDetail.userId }}</p>
          <p><strong>开始时间：</strong>{{ currentDetail.startTime }}</p>
          <p><strong>结束时间：</strong>{{ currentDetail.endTime }}</p>
          <p>
            <strong>答题状态：</strong>
            {{
              currentDetail.status === 1
                ? "已完成"
                : currentDetail.status === 2
                  ? "进行中"
                  : "已取消"
            }}
          </p>
          <p><strong>正确率：</strong>{{ currentDetail.accuracy }}%</p>
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from "vue";
import {
  ElMessage,
  ElMessageBox,
  ElDialog,
  ElTable,
  ElTableColumn,
  ElDescriptions,
  ElDescriptionsItem,
} from "element-plus";
import * as echarts from "echarts";
import {
  getHistoryInterviewList,
  getInterviewList,
  addInterview,
  polishInterview,
  deleteInterview,
  updateInterview,
  getAnswerList,
  getCollectList,
  getAbilityData,
  updateUserInfo,
  getQuestionList,
  getTagList,
  getJobRoleList,
} from "../../api/request";

// 基础
const activeTab = ref("interview");
const showAddInterview = ref(false);
const showUpdateInfo = ref(false);
const showDetailDialog = ref(false);
const showInterviewDetail = ref(false);
const showHistoryDetail = ref(false);
const isEdit = ref(false);

// 表单ref
const interviewFormRef = ref();
const userFormRef = ref();
const abilityChart = ref(null);

// 列表
const dataList = ref({
  interview: [],
  historyInterview: [],
  answer: [],
  collect: [],
});
const currentInterviewDetail = ref({});
const currentHistoryDetail = ref({});

// 图表
let chartInstance = null;
let resizeHandler = null;

// 知识点题目
const jobRoleList = ref([]);
const polishFormLoading = ref(false);

// 能力数据
const abilityData = ref({
  interviewAvgScore: 85,
  interviewLatestScore: 90,
  answerAvgAccuracy: 78,
  answerLatestAccuracy: 88,
});
const abilityDataTable = ref([
  { name: "面试分数", avgValue: 85, latestValue: 90, unit: "分" },
  { name: "刷题正确率", avgValue: 78, latestValue: 88, unit: "%" },
]);

// 详情
const currentDetail = ref(null);
const detailType = ref("");
const detailTitle = ref("");

// 面试表单
const interviewForm = reactive({ id: "", title: "", content: "" });

// 用户信息
const userInfo = reactive({
  username: "",
  phone: "",
  password: "",
  confirmPassword: "",
  avatar: "",
});

// 校验规则
const interviewRules = {
  title: [{ required: true, message: "请输入记录标题", trigger: "blur" }],
  content: [{ required: true, message: "请输入面试内容", trigger: "blur" }],
};

const validateConfirmPassword = (rule, value, callback) => {
  if (userInfo.password && value !== userInfo.password) {
    callback(new Error("两次密码不一致"));
  } else callback();
};

const userRules = reactive({
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "手机号格式错误", trigger: "blur" },
  ],
  password: [{ min: 6, message: "密码至少6位", trigger: "blur" }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: "blur" }],
});

// 统一加载
const loadData = async (api, key, params) => {
  loading.value = true;
  try {
    const res = await api(params);
    dataList.value[key] =
      res.data?.records || (Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
};

// 能力图表
const loadAbilityData = async () => {
  loading.value = true;
  try {
    const res = await getAbilityData();
    if (res?.data) abilityData.value = res.data;
    updateAbilityTable();
  } catch {
    ElMessage.warning("使用默认能力数据");
  } finally {
    loading.value = false;
    nextTick(renderAbilityChart);
  }
};

const updateAbilityTable = () => {
  abilityDataTable.value = [
    {
      name: "面试分数",
      avgValue: abilityData.value.interviewAvgScore,
      latestValue: abilityData.value.interviewLatestScore,
      unit: "分",
    },
    {
      name: "刷题正确率",
      avgValue: abilityData.value.answerAvgAccuracy,
      latestValue: abilityData.value.answerLatestAccuracy,
      unit: "%",
    },
  ];
};

const renderAbilityChart = () => {
  if (chartInstance) chartInstance.dispose();
  if (!abilityChart.value) return;
  chartInstance = echarts.init(abilityChart.value);
  const option = {
    title: { text: "能力数据统计", left: "center" },
    tooltip: { trigger: "axis" },
    legend: { data: ["平均值", "最新值"], top: 40 },
    xAxis: { data: ["面试分数", "刷题正确率"] },
    yAxis: { type: "value" },
    series: [
      {
        name: "平均值",
        type: "bar",
        data: [
          abilityData.value.interviewAvgScore,
          abilityData.value.answerAvgAccuracy,
        ],
        itemStyle: { color: "#409EFF" },
        label: { show: true, position: "top" },
      },
      {
        name: "最新值",
        type: "bar",
        data: [
          abilityData.value.interviewLatestScore,
          abilityData.value.answerLatestAccuracy,
        ],
        itemStyle: { color: "#67C23A" },
        label: { show: true, position: "top" },
      },
    ],
  };
  chartInstance.setOption(option);
  resizeHandler = () => chartInstance.resize();
  window.addEventListener("resize", resizeHandler);
};

const loadJobRoleList = async () => {
  try {
    const res = await getJobRoleList();
    jobRoleList.value = res.data || [];
  } catch {
    ElMessage.error("岗位加载失败");
  }
};

// 面试弹窗
const openInterviewDialog = (row = null) => {
  isEdit.value = !!row;
  showAddInterview.value = true;
  nextTick(() => {
    interviewFormRef.value?.clearValidate();
    if (row) Object.assign(interviewForm, row);
    else Object.assign(interviewForm, { id: "", title: "", content: "" });
  });
};

// 提交面试
const submitInterviewForm = async () => {
  try {
    await interviewFormRef.value.validate();
    const data = { title: interviewForm.title, content: interviewForm.content };
    if (isEdit.value) data.id = interviewForm.id;
    const res = isEdit.value
      ? await updateInterview(data)
      : await addInterview(data);
    if (res.code === 200) {
      ElMessage.success("操作成功");
      showAddInterview.value = false;
      loadData(getInterviewList, "interview");
    }
  } catch {
    ElMessage.error("提交失败");
  }
};

// 删除面试
const handleDeleteInterview = async (id) => {
  try {
    await ElMessageBox.confirm("确定删除？");
    await deleteInterview(id);
    ElMessage.success("删除成功");
    loadData(getInterviewList, "interview");
  } catch {
    ElMessage.error("删除失败");
  }
};

// AI润色
const handleFormPolish = async () => {
  if (!interviewForm.content) return ElMessage.warning("请输入内容");
  polishFormLoading.value = true;
  try {
    const res = await polishInterview({ content: interviewForm.content });
    interviewForm.content = res.data?.polishContent || interviewForm.content;
    ElMessage.success("润色完成");
  } finally {
    polishFormLoading.value = false;
  }
};

// 查看详情
const viewHistoryDetail = (row) => {
  currentHistoryDetail.value = { ...row };
  showHistoryDetail.value = true;
};

const viewInterviewDetail = (row) => {
  currentInterviewDetail.value = { ...row };
  showInterviewDetail.value = true;
};

// 用户信息
const submitUserInfo = async () => {
  try {
    await userFormRef.value.validate();
    const data = {
      username: userInfo.username,
      phone: userInfo.phone,
      avatar: userInfo.avatar,
    };
    if (userInfo.password) data.password = userInfo.password;
    const res = await updateUserInfo(data);
    if (res.code === 200) {
      ElMessage.success("保存成功");
      showUpdateInfo.value = false;
    }
  } catch {
    ElMessage.error("保存失败");
  }
};

// 头像
const handleAvatarChange = (file) => {
  const img = file.raw;
  if (!img.type.startsWith("image/")) return ElMessage.error("只能上传图片");
  if (img.size > 2 * 1024 * 1024) return ElMessage.error("最大2MB");
  const reader = new FileReader();
  reader.onload = (e) => (userInfo.avatar = e.target.result);
  reader.readAsDataURL(img);
};

// 退出
const handleLogout = async () => {
  await ElMessageBox.confirm("确定退出登录？");
  localStorage.removeItem("token");
  ElMessage.success("退出成功");
  window.location.href = "/login";
};

// 通用详情
const viewDetail = (type, row) => {
  detailType.value = type;
  currentDetail.value = row;
  showDetailDialog.value = true;
  detailTitle.value = type === "answer" ? "答题详情" : "知识点详情";
};

// 初始化
const initQuestionData = async () => {
  await Promise.all([loadTagList(), loadJobRoleList()]);
  loadQuestionList();
};

const handleTabChange = (tab) => {
  if (tab === "ability-data") nextTick(renderAbilityChart);
  if (tab === "question") initQuestionData();
};

const initLoad = async () => {
  await Promise.all([
    loadData(getHistoryInterviewList, "historyInterview"),
    loadData(getInterviewList, "interview"),
    loadData(getAnswerList, "answer"),
    loadData(getCollectList, "collect"),
    loadAbilityData(),
  ]);
};

// 加载标签
const loadTagList = async () => {
  try {
    const res = await getTagList();
    tagList.value = res.data || [];
  } catch (e) {
    ElMessage.error("标签加载失败");
  }
};

// ======== 初始化数据 ========
const searchKeyword = ref("");
const searchTag = ref("");
const searchJob = ref("");
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);
const questionList = ref([]);

const loadQuestionList = async () => {
  loading.value = true;
  try {
    const res = await getQuestionList({
      keyword: searchKeyword.value,
      tag: searchTag.value,
      jobRole: searchJob.value,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    });
    if (res.code === 200) {
      questionList.value = res.data.records;
      total.value = res.data.total;
    }
  } catch (error) {
    console.error("加载题目列表失败：", error);
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
};

// 响应式变量：控制弹窗显示 & 存储当前题目详情
const currentQuestionDetail = ref({});

const tagList = computed(() => {
  const tags = currentQuestionDetail.value?.tags;
  if (Array.isArray(tags)) return tags;
  if (typeof tags === "string") return tags.split(",").filter((t) => t.trim());
  return [];
});
// 4. 页面加载时初始化列表
onMounted(() => {
  loadQuestionList();
});

onMounted(() => {
  initLoad();
  initQuestionData();
});

onUnmounted(() => {
  if (chartInstance) chartInstance.dispose();
  if (resizeHandler) window.removeEventListener("resize", resizeHandler);
});
</script>

<style scoped>
.user-center {
  padding: 20px;
}
.user-header {
  text-align: right;
}
.ability-chart-container {
  width: 100%;
  height: 450px;
  margin: 20px 0;
}
.ability-data-table {
  margin: 20px auto;
  max-width: 600px;
}
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-uploader-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 1px dashed #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
}
.content-box {
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  line-height: 1.8;
  max-height: 400px;
  overflow-y: auto;
}
:deep(.el-table) {
  width: 100% !important;
}
/* 详情弹窗样式优化 */
:deep(.el-dialog__body) {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto; /* 内容过多时滚动 */
}

:deep(.el-descriptions__cell) {
  padding: 10px 0;
}

/* 标签样式优化 */
:deep(.el-tag) {
  margin-bottom: 4px;
}
</style>
