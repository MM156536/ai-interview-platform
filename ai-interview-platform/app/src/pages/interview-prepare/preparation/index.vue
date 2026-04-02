<template>
  <div class="interview-prep-page">
    <el-card class="prep-card" shadow="hover">
      <div class="card-header">
        <h2 class="title">面试准备</h2>
        <p class="subtitle">上传简历，选择岗位，开启智能面试模拟</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="prep-form"
      >
        <!-- 岗位选择 -->
        <el-form-item label="应聘岗位" prop="position">
          <el-select
            v-model="form.position"
            placeholder="请选择目标岗位"
            class="full-width"
          >
            <el-option label="前端开发工程师" value="frontend" />
            <el-option label="后端开发工程师" value="backend" />
            <el-option label="全栈开发工程师" value="fullstack" />
            <el-option label="移动端开发工程师" value="mobile" />
            <el-option label="算法工程师" value="algorithm" />
            <el-option label="产品经理" value="product" />
          </el-select>
        </el-form-item>

        <!-- 简历上传 -->
        <el-form-item label="个人简历" prop="resume">
          <el-upload
            v-model:file-list="form.resume"
            drag
            :auto-upload="false"
            :limit="1"
            accept=".pdf,.txt"
            class="full-upload-width"
          >
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <div class="upload-text">
              拖拽简历至此区域，或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="upload-tip">支持 .pdf、.txt 格式</div>
            </template>
          </el-upload>
        </el-form-item>

        <!-- 按钮 -->
        <el-form-item class="action-item">
          <div class="button-group">
            <el-button size="large" @click="resetForm" class="reset-btn">
              <el-icon><RefreshRight /></el-icon>
              重置
            </el-button>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="startInterview"
              class="start-btn"
            >
              <el-icon><Avatar /></el-icon>
              开始面试
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { UploadFilled, Avatar, RefreshRight } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { useInterviewStore } from "@/store/interview";

const interviewStore = useInterviewStore();
const TOKEN = interviewStore.token;
const API_CONFIG = interviewStore.apiConfig;
const formRef = ref(null);
const loading = ref(false);
const router = useRouter();

// 表单数据
const form = reactive({
  position: "",
  resume: [],
});

// 校验规则
const rules = {
  position: [{ required: true, message: "请选择应聘岗位", trigger: "change" }],
  resume: [{ required: true, message: "请上传个人简历", trigger: "change" }],
};

// 岗位映射
const JOB_MAP = {
  frontend: "前端开发工程师",
  backend: "后端开发工程师",
  fullstack: "全栈开发工程师",
  mobile: "移动端开发工程师",
  algorithm: "算法工程师",
  product: "产品经理",
};

// ===================== 接口请求方法（单独封装）=====================
/**
 * 开始面试接口
 * @param {File} file - 简历文件
 * @param {string} position - 岗位编码
 * @returns {Promise<any>} 接口返回数据
 */
const requestStartInterview = async (file, position) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("jobRole", JOB_MAP[position]);

  const res = await fetch(API_CONFIG.startInterview, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: formData,
  });

  return await res.json();
};

// ===================== 业务逻辑 =====================
const startInterview = async () => {
  const valid = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  const startTime = Date.now();

  try {
    const file = form.resume[0]?.raw;
    // 调用封装好的接口
    const result = await requestStartInterview(file, form.position);

    console.log("接口返回:", result);

    if (result.data) {
      interviewStore.setInterviewData({
        chatId: result.data,
        resumeFile: form.resume[0],
        jobRole: JOB_MAP[form.position],
      });

      ElMessage.success("面试创建成功！");

      // 最小 loading 时间
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 800 - elapsed);

      setTimeout(() => {
        loading.value = false;
        router.push("/interview");
      }, remainingTime);
    } else {
      ElMessage.error(result.msg || "创建失败");
      loading.value = false;
    }
  } catch (err) {
    console.error("请求失败：", err);
    ElMessage.error("网络或接口异常，请检查");
    loading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  form.position = "";
  form.resume = [];
  formRef.value?.clearValidate();
  ElMessage.info("表单已重置");
};
</script>

<style scoped>
.interview-prep-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: "Inter", system-ui, sans-serif;
}

.prep-card {
  max-width: 880px;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  background: #ffffff;
}

.card-header {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #e5e5e5;
}

.title {
  font-size: 26px;
  font-weight: 500;
  color: #333;
}

.subtitle {
  color: #999;
  font-size: 14px;
}

.prep-form {
  padding: 20px;
}

.full-width {
  width: 100%;
}

.full-upload-width {
  width: 100%;
}
:deep(.el-upload-dragger) {
  width: 100% !important;
}

.upload-icon {
  font-size: 40px;
  color: #999;
}

.action-item {
  text-align: center;
  margin-top: 30px;
}

.button-group {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.reset-btn {
  width: 140px;
  height: 48px;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  background: #fff;
}

.start-btn {
  width: 200px;
  height: 48px;
  border-radius: 8px;
  background: #333;
  border: none;
  color: white;
  font-weight: 500;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #e5e5e5;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
