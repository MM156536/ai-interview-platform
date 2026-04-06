<template>
  <div class="question-manage">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 单题新增 -->
      <el-tab-pane label="增加题目" name="add">
        <el-form :model="form" label-width="8%" :rules="rules" ref="formRef">
          <el-form-item label="难度等级" prop="difficultyLevel">
            <el-radio-group v-model="form.difficultyLevel">
              <el-radio :value="1">简单</el-radio>
              <el-radio :value="2">中等</el-radio>
              <el-radio :value="3">困难</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="岗位" prop="jobRole"
            ><el-input v-model="form.jobRole" placeholder="请输入岗位名称"
          /></el-form-item>
          <el-form-item label="题目内容" prop="questionContent"
            ><el-input
              type="textarea"
              v-model="form.questionContent"
              :rows="4"
              placeholder="请输入题目内容"
          /></el-form-item>
          <el-form-item label="参考答案" prop="referenceAnswer"
            ><el-input
              type="textarea"
              v-model="form.referenceAnswer"
              :rows="3"
              placeholder="请输入参考答案"
          /></el-form-item>
          <el-form-item label="评分准则"
            ><el-input
              v-model="form.evaluationCriteria"
              placeholder="请输入评分依据"
          /></el-form-item>
          <el-form-item label="知识点标签"
            ><el-input v-model="form.tags" placeholder="多个用逗号分隔"
          /></el-form-item>
          <el-form-item label="题目来源" prop="source">
            <el-radio-group v-model="form.source">
              <el-radio :value="0">公共题库</el-radio>
              <el-radio :value="1">企业专用题库</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSubmit">提交题目</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 批量新增 -->
      <el-tab-pane label="批量增加题目" name="batchAdd">
        <div class="batch-form-wrap">
          <div
            v-for="(item, index) in batchForms"
            :key="index"
            class="batch-form-item"
          >
            <el-row :gutter="16" style="margin-bottom: 8px">
              <el-col :span="6"
                ><el-radio-group v-model="item.difficultyLevel"
                  ><el-radio :value="1">简单</el-radio
                  ><el-radio :value="2">中等</el-radio
                  ><el-radio :value="3">困难</el-radio></el-radio-group
                ></el-col
              >
              <el-col :span="8"
                ><el-input v-model="item.jobRole" placeholder="岗位"
              /></el-col>
              <el-col :span="8"
                ><el-radio-group v-model="item.source"
                  ><el-radio :value="0">公共</el-radio
                  ><el-radio :value="1">企业</el-radio></el-radio-group
                ></el-col
              >
              <el-col :span="2"
                ><el-button type="danger" @click="removeBatchForm(index)" circle
                  >-</el-button
                ></el-col
              >
            </el-row>
            <el-input
              type="textarea"
              v-model="item.questionContent"
              :rows="2"
              placeholder="题目内容"
              style="margin-bottom: 8px"
            />
            <el-input
              type="textarea"
              v-model="item.referenceAnswer"
              :rows="2"
              placeholder="参考答案"
              style="margin-bottom: 8px"
            />
            <el-input
              v-model="item.evaluationCriteria"
              placeholder="评分准则"
              style="margin-bottom: 8px"
            />
            <el-input
              v-model="item.tags"
              placeholder="标签，逗号分隔"
              style="margin-bottom: 8px"
            />
            <el-divider />
          </div>
          <el-button type="primary" @click="addBatchForm">新增一行</el-button>
          <el-button
            type="success"
            style="margin-left: 16px"
            @click="submitBatchForm"
            :disabled="!batchForms.length"
            >批量提交</el-button
          >
          <el-alert
            v-if="batchResult.show"
            :title="batchResult.title"
            :type="batchResult.type"
            style="margin-top: 20px"
            closable
          />
        </div>
      </el-tab-pane>

      <!-- 未过审列表 -->
      <el-tab-pane label="未过审题目" name="unreviewed">
        <el-table
          :data="unreviewedList"
          border
          stripe
          :loading="loading"
          row-key="id"
        >
          <el-table-column
            prop="difficultyLevel"
            label="难度"
            width="80"
            align="center"
            :formatter="formatStatus"
          />
          <el-table-column prop="jobRole" label="岗位" min-width="120" />
          <el-table-column
            prop="questionContent"
            label="题目内容"
            min-width="300"
            show-overflow-tooltip
          />
          <el-table-column
            prop="referenceAnswer"
            label="参考答案"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            prop="evaluationCriteria"
            label="评价标准"
            min-width="180"
            show-overflow-tooltip
          />
          <el-table-column
            prop="tags"
            label="知识点标签"
            min-width="150"
            show-overflow-tooltip
          />
          <el-table-column
            prop="source"
            label="来源"
            width="100"
            align="center"
            :formatter="formatStatus"
          />
          <el-table-column
            prop="createTime"
            label="创建时间"
            width="180"
            align="center"
            :formatter="formatTime"
          />
          <el-table-column label="操作" width="100" align="center">
            <template #default="scope">
              <el-button
                type="danger"
                size="small"
                icon="el-icon-delete"
                @click="handleDelete(scope.row.id, 'unreviewed')"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          style="margin-top: 2%"
          type="success"
          @click="handleBatchApprove"
          :disabled="!unreviewedList.length"
          >批量通过审核</el-button
        >
      </el-tab-pane>

      <!-- 向量化导入 -->
      <el-tab-pane label="向量化导入" name="vector">
        <el-button
          type="primary"
          @click="handleVector"
          style="margin-bottom: 12px"
          >批量导入向量数据库</el-button
        >
        <el-table
          :data="allQuestions"
          border
          stripe
          :loading="loading"
          row-key="id"
        >
          <el-table-column
            prop="difficultyLevel"
            label="难度"
            width="80"
            align="center"
            :formatter="formatStatus"
          />
          <el-table-column prop="jobRole" label="岗位" min-width="120" />
          <el-table-column
            prop="questionContent"
            label="题目内容"
            min-width="300"
            show-overflow-tooltip
          />
          <el-table-column
            prop="source"
            label="来源"
            width="100"
            align="center"
            :formatter="formatStatus"
          />
          <el-table-column
            prop="createTime"
            label="创建时间"
            width="180"
            align="center"
            :formatter="formatTime"
          />
          <el-table-column label="操作" width="100" align="center">
            <template #default="scope">
              <el-button
                type="danger"
                size="small"
                icon="el-icon-delete"
                @click="handleDelete(scope.row.id, 'vector')"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-alert title="提示" type="info" style="margin-top: 3%" closable
          >(将已通过审核的题目向量化，用于智能检索)</el-alert
        >
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  addQuestion,
  batchAddQuestion,
  getUnreviewed,
  getApproved,
  batchApprove,
  vectorImport,
  deleteQuestion,
} from "@/api/request";

// 基础变量
const activeTab = ref("add");
const formRef = ref();
const loading = ref(false);
const unreviewedList = ref([]);
const approvedList = ref([]);
const batchForms = ref([
  {
    difficultyLevel: 2,
    jobRole: "",
    questionContent: "",
    referenceAnswer: "",
    evaluationCriteria: "",
    tags: "",
    source: 0,
  },
]);
const batchResult = ref({ show: false, title: "", type: "" });

// 合并列表
const allQuestions = computed(() => [
  ...approvedList.value.map((item) => ({ ...item, statusText: "已审核" })),
]);

// 格式化工具函数（精简整合）
const formatters = {
  difficulty: (v) => ({ 1: "简单", 2: "中等", 3: "困难" }[v] || "未知"),
  source: (v) => (v === 0 ? "公共题库" : "企业专用题库"),
  status: (v) => v || "未审核",
  time: (v) => (v ? new Date(v).toLocaleString() : "-"),
  vector: (v) => (v === 0 ? "未向量化" : "已向量化"),
};

// 统一格式化
const formatStatus = (row, column) => {
  const prop = column.property;
  if (prop === "difficultyLevel") return formatters.difficulty(row[prop]);
  if (prop === "source") return formatters.source(row[prop]);
  if (prop === "statusText") return formatters.status(row[prop]);
  return row[prop] || "-";
};
const formatTime = (row) => formatters.time(row.createTime);

// 批量表单操作
const addBatchForm = () =>
  batchForms.value.push({
    ...batchForms.value[0],
    jobRole: "",
    questionContent: "",
    referenceAnswer: "",
  });
const removeBatchForm = (index) => {
  if (batchForms.value.length <= 1) return ElMessage.warning("至少保留一条");
  batchForms.value.splice(index, 1);
};

// 批量提交逻辑
const submitBatchForm = async () => {
  console.log("点击提交了");

  const validData = batchForms.value.filter((item) =>
    item.questionContent?.trim(),
  );
  if (!validData.length) return ElMessage.warning("请填写有效题目");

  console.log("🟢 发送给接口的数据: ", validData);

  try {
    const res = await batchAddQuestion(validData);
    console.log("✅ 业务请求成功: ", res);
    ElMessage.success(res.message);
    batchForms.value = [
      {
        difficultyLevel: 2,
        jobRole: "",
        questionContent: "",
        referenceAnswer: "",
        evaluationCriteria: "",
        tags: "",
        source: 0,
      },
    ];
    loadAllQuestions();
  } catch (err) {
    console.log("❌ 请求失败: ", err);
    ElMessage.error(err.message || "批量提交失败");
  }
};

// 单题表单
const form = reactive({
  difficultyLevel: 2,
  jobRole: "",
  questionContent: "",
  referenceAnswer: "",
  evaluationCriteria: "",
  tags: "",
  source: 0,
});
const rules = {
  difficultyLevel: [
    { required: true, message: "请选择难度", trigger: "change" },
  ],
  jobRole: [{ required: true, message: "请输入岗位", trigger: "blur" }],
  questionContent: [
    { required: true, message: "请输入题目内容", trigger: "blur" },
  ],
  referenceAnswer: [
    { required: true, message: "请输入参考答案", trigger: "blur" },
  ],
  source: [{ required: true, message: "请选择来源", trigger: "change" }],
};

// 单题提交
const handleSubmit = async () => {
  console.log("点击提交了");
  // 表单校验
  try {
    await formRef.value.validate();
  } catch (err) {
    ElMessage.error("表单校验失败");
    return;
  }

  // 处理提交数据
  const submitData = Object.fromEntries(
    Object.entries(form).map(([k, v]) => [
      k,
      typeof v === "string" ? v.trim() : v,
    ]),
  );
  console.log("🟢 发送给接口的数据: ", submitData);

  try {
    // 发起请求：只有 code=200 才会走到这里
    const res = await addQuestion(submitData);
    console.log("✅ 业务请求成功: ", res);
    ElMessage.success("提交成功");
    handleReset();
    loadAllQuestions();
    activeTab.value = "unreviewed";
  } catch (err) {
    // 网络错误 / code≠200 都会走到这里
    console.log("❌ 请求失败: ", err);
    ElMessage.error("提交失败");
  }
};

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields();
  Object.assign(form, {
    difficultyLevel: 2,
    jobRole: "",
    questionContent: "",
    referenceAnswer: "",
    evaluationCriteria: "",
    tags: "",
    source: 0,
  });
};

// 加载未过审数据
const loadUnreviewed = async () => {
  loading.value = true;
  try {
    const res = await getUnreviewed();
    console.log("【加载未过审题目】✅ 接口请求成功，返回数据: ", res);
    unreviewedList.value = res.data || [];
    console.log(
      "【加载未过审题目】✅ 本地列表更新完成，数量: ",
      unreviewedList.value.length,
    );
  } catch (err) {
    console.log("【加载未过审题目】❌ 接口请求失败，错误信息: ", err);
    ElMessage.error("加载未过审题目失败");
  } finally {
    loading.value = false;
  }
};

// 审核
const handleBatchApprove = async () => {
  if (!unreviewedList.value.length) {
    console.log("【批量过审】❌ 无未过审题目，终止操作");
    return ElMessage.warning("无未过审题目");
  }
  const approveIds = unreviewedList.value.map((i) => i.id);
  console.log("【批量过审】🟢 准备过审的题目ID: ", approveIds);
  try {
    const res = await batchApprove(approveIds);
    console.log("【批量过审】✅ 接口请求成功，返回数据: ", res);
    ElMessage.success("批量通过成功");
    loadAllQuestions();
  } catch (err) {
    console.log("【批量过审】❌ 接口请求失败，错误信息: ", err);
    ElMessage.error("批量审核失败");
  }
};

//加载已过审数据
const loadApproved = async () => {
  loading.value = true;
  try {
    const res = await getApproved();
    console.log("【加载已过审题目】✅ 接口请求成功，返回数据: ", res);
    approvedList.value = res.data || [];
    console.log(
      "【加载已过审题目】✅ 本地列表更新完成，数量: ",
      approvedList.value.length,
    );
  } catch (err) {
    console.log("【加载已过审题目】❌ 接口请求失败，错误信息: ", err);
    ElMessage.error("加载已过审题目失败");
  } finally {
    loading.value = false;
  }
};

//统一同步所有数据
const loadAllQuestions = async () =>
  await Promise.all([loadUnreviewed(), loadApproved()]);

// 初始化时同步数据
onMounted(loadAllQuestions);

//向量化导入
const handleVector = async () => {
  if (!approvedList.value.length) {
    console.log("【批量向量化】❌ 无已过审题目，终止操作");
    return ElMessage.warning("无已审核题目可向量化");
  }
  const vectorIds = approvedList.value.map((i) => i.id);
  console.log("【批量向量化】🟢 准备向量化的题目ID: ", vectorIds);
  try {
    const res = await vectorImport({ ids: vectorIds });
    console.log("【批量向量化】✅ 接口请求成功，返回数据: ", res);
    ElMessage.success("向量化成功");
    loadAllQuestions();
  } catch (err) {
    console.log("【批量向量化】❌ 接口请求失败，错误信息: ", err);
    ElMessage.error("向量化失败");
  }
};

//删除题目
const handleDelete = async (id, type) => {
  console.log(
    `【删除题目】🔍 准备删除ID为 ${id} 的${
      type === "unreviewed" ? "未过审" : "向量化"
    }题目`,
  );
  // 弹出确认框
  try {
    await ElMessageBox.confirm(
      `确定要删除这道${type === "unreviewed" ? "未过审" : "向量化"}题目吗？`,
      "删除确认",
      {
        confirmButtonText: "确认删除",
        cancelButtonText: "取消",
        type: "warning",
      },
    );
    console.log("【删除题目】🟢 用户确认删除，开始调用接口");
    // 调用删除接口
    loading.value = true;
    const res = await deleteQuestion(id);
    console.log("【删除题目】✅ 接口请求成功，返回数据: ", res);
    ElMessage.success(res.message);
    // 刷新列表
    loadAllQuestions();
  } catch (err) {
    // 取消删除或删除失败
    if (err === "cancel") {
      console.log("【删除题目】ℹ️ 用户取消删除");
    } else {
      console.log("【删除题目】❌ 接口请求失败，错误信息: ", err);
      ElMessage.error(err.message || "删除失败");
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 外层容器：铺满整个视口，背景和你首页保持一致 */
.question-manage {
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* Tabs 容器：占满剩余空间，白色背景 + 圆角 */
:deep(.el-tabs) {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: auto;
}

/* 表单标签宽度自适应，避免小屏幕挤变形 */
:deep(.el-form-item__label) {
  width: auto !important;
  min-width: 80px;
  padding-right: 12px;
}

/* 表单输入框：自适应宽度，避免溢出 */
:deep(.el-form-item__content) {
  flex: 1;
}

/* 批量表单区域：自适应布局 */
.batch-form-wrap {
  margin-bottom: 16px;
}
.batch-form-item {
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background-color: #fafafa;
}

/* 表格单元格：紧凑布局，自适应内容 */
:deep(.el-table__cell) {
  padding: 8px 6px;
}

/* 响应式：小屏幕下表格自动横向滚动 */
:deep(.el-table) {
  min-width: 800px;
}
</style>
