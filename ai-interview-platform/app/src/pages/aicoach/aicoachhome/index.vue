<template>
  <div class="ai-coach-landing">
    <el-header class="navbar">
      <div class="nav-container">
        <div class="logo">
          <span class="logo-text">AI 教练</span>
        </div>
        <div class="nav-actions">
          <el-button type="text">获取 App</el-button>
          <el-button type="text">English</el-button>
        </div>
      </div>
    </el-header>

    <main class="content">
      <div class="hero-section">
        <h1 class="title">AI 教练</h1>
        <p class="subtitle">你的专属智能面试训练伙伴</p>

        <el-button
          type="primary"
          size="large"
          class="start-button"
          :loading="loading"
          @click="goToChat"
        >
          {{ loading ? "正在进入..." : "开始体验" }}
        </el-button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useChatStore } from "@/store/chatstore";

const router = useRouter();
const chatStore = useChatStore();
const loading = ref(false);

const TOKEN = chatStore.token;
const API = chatStore.apiConfig;

const goToChat = async () => {
  loading.value = true;

  try {
    const res = await fetch(API.CREATE, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    if (!res.ok) {
      console.error("请求失败，状态码:", res.status);
      ElMessage.warning("网络异常，正在跳转...");
      router.push("/aichat");
      return;
    }

    const data = await res.json();
    console.log("📥 创建响应:", data);

    if (data.data && typeof data.data === "object") {
      const hasRequiredFields =
        data.data.sessionId || data.data.id || data.data._id;

      if (hasRequiredFields) {
        chatStore.setCurrentSession(data.data);
        router.push("/aichat");
      } else {
        console.warn("响应数据结构异常:", data.data);
        ElMessage.warning("会话创建异常，正在跳转...");
        router.push("/aichat");
      }
    } else {
      console.warn("响应数据格式异常:", data);
      ElMessage.warning("服务异常，正在跳转...");
      router.push("/aichat");
    }
  } catch (err) {
    console.error("创建对话失败:", err.message);
    ElMessage.warning("连接失败，正在跳转...");
    router.push("/aichat");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.ai-coach-landing {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}
.navbar {
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  height: 64px;
}
.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo-text {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}
.content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-section {
  text-align: center;
}
.title {
  font-size: 48px;
  font-weight: 500;
  color: #333;
}
.subtitle {
  font-size: 18px;
  color: #999;
  margin-bottom: 40px;
}
.start-button {
  width: 280px;
  height: 60px;
  font-size: 18px;
  border-radius: 8px;
  background: #333;
  border: none;
}
</style>
