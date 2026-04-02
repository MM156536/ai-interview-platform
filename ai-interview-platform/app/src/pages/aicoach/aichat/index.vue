<template>
  <div class="ai-chat-page">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ collapsed: isSidebarCollapsed }">
      <div class="sidebar-header" v-show="!isSidebarCollapsed">
        <div class="logo">
          <div class="logo-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="url(#logo-gradient-sidebar)"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="url(#logo-gradient-sidebar)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <defs>
                <linearGradient
                  id="logo-gradient-sidebar"
                  x1="2"
                  y1="2"
                  x2="22"
                  y2="22"
                >
                  <stop stop-color="#667eea" />
                  <stop offset="1" stop-color="#764ba2" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span class="logo-text">AI Coach</span>
        </div>
      </div>

      <div class="sidebar-content" v-show="!isSidebarCollapsed">
        <button class="new-chat-btn" @click="createNew">
          <el-icon><Plus /></el-icon>
          <span>开启新对话</span>
        </button>

        <div class="history-section">
          <div
            class="history-group"
            v-for="group in groupedChats"
            :key="group.label"
          >
            <p class="group-title">{{ group.label }}</p>
            <div
              class="history-item"
              :class="{ active: currentSession?.id === item.id }"
              @click="selectChat(item)"
              v-for="item in group.list"
              :key="item.id"
            >
              <el-icon><ChatRound /></el-icon>
              <span class="history-title">{{ item.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 聊天主区域（预览时收缩） -->
    <div class="chat-container" :class="{ 'preview-shrink': showFileViewer }">
      <!-- 顶部导航 -->
      <div class="chat-header">
        <div class="left-icons">
          <div
            class="icon-btn"
            @click="isSidebarCollapsed = !isSidebarCollapsed"
            :title="isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
          >
            <el-icon v-if="!isSidebarCollapsed"><Fold /></el-icon>
            <el-icon v-else><Expand /></el-icon>
          </div>
          <div class="icon-btn" @click="createNew" title="新建对话">
            <el-icon><Plus /></el-icon>
          </div>
        </div>
        <div class="header-title">
          <el-icon><ChatDotRound /></el-icon>
          <span>{{ currentSession?.title || "新对话" }}</span>
        </div>
      </div>

      <!-- 消息列表 -->
      <div class="message-list" ref="messageListRef">
        <div v-if="messages.length === 0" class="welcome-message">
          <div class="welcome-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="url(#welcome-gradient)"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="url(#welcome-gradient)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <defs>
                <linearGradient
                  id="welcome-gradient"
                  x1="2"
                  y1="2"
                  x2="22"
                  y2="22"
                >
                  <stop stop-color="#667eea" />
                  <stop offset="1" stop-color="#764ba2" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2>你好！我是 AI 教练</h2>
          <p>我可以帮你解答面试问题、润色简历，或进行模拟面试练习</p>
        </div>

        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="message"
          :class="{ user: msg.role === 'user', ai: msg.role === 'ai' }"
        >
          <div class="avatar" :class="msg.role">
            <el-icon v-if="msg.role === 'ai'"><Service /></el-icon>
            <el-icon v-else><User /></el-icon>
          </div>
          <div class="message-content">
            <!-- 图片消息 -->
            <div v-if="msg.type === 'image'" class="sent-image">
              <img :src="msg.url" @click="openImagePreview(msg.url)" />
            </div>

            <!-- 用户文件：点击预览；AI文件：点击直接下载 -->
            <div
              v-else-if="msg.type === 'file'"
              class="sent-file"
              @click.stop="
                msg.role === 'user'
                  ? openFilePreview(msg.url, msg.name)
                  : downloadFile(msg.url, msg.name)
              "
            >
              <div class="file-icon">
                <el-icon><Document /></el-icon>
              </div>
              <span class="file-name">{{ msg.name }}</span>
            </div>

            <!-- 文本消息 -->
            <div v-else class="bubble" :class="msg.role">
              <div
                class="bubble-content"
                v-if="msg.content"
                v-html="renderMarkdown(msg.content)"
              ></div>
              <div
                v-else-if="msg.role === 'ai' && sending"
                class="typing-indicator"
              >
                <span></span><span></span><span></span>
              </div>
              <div v-else class="bubble-content"></div>

              <div v-if="msg.role === 'ai' && msg.content" class="msg-actions">
                <button class="action-btn" @click="copyText(msg.content)">
                  <el-icon><CopyDocument /></el-icon>
                  <span>复制</span>
                </button>
                <button class="action-btn" @click="exportPDF(msg.content)">
                  <el-icon><Download /></el-icon>
                  <span>导出PDF</span>
                </button>
              </div>
            </div>

            <div
              v-if="msg.role === 'ai' && msg.type === 'file'"
              class="msg-actions"
            >
              <button
                class="action-btn"
                @click.stop="downloadFile(msg.url, msg.name)"
              >
                <el-icon><Download /></el-icon>
                <span>下载文件</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-box">
        <div v-if="previewList.length > 0" class="preview-list">
          <div
            v-for="(item, idx) in previewList"
            :key="idx"
            class="preview-item"
          >
            <img v-if="item.type === 'image'" :src="item.url" />
            <div v-else class="file-preview">
              <el-icon><Document /></el-icon>
              <span class="file-name">{{ item.name }}</span>
            </div>
            <div class="preview-delete" @click="removePreview(idx)">
              <el-icon><Close /></el-icon>
            </div>
          </div>
        </div>

        <div class="input-wrapper">
          <div class="input-toolbar">
            <el-upload
              v-if="chatMode === 'question'"
              :auto-upload="false"
              accept="image/*"
              :show-file-list="false"
              @change="handleUpload"
              class="toolbar-btn"
            >
              <el-tooltip content="发送图片" placement="top">
                <el-icon><Picture /></el-icon>
              </el-tooltip>
            </el-upload>

            <el-upload
              v-else
              :auto-upload="false"
              accept=".pdf,.txt"
              :show-file-list="false"
              @change="handleUpload"
              class="toolbar-btn"
            >
              <el-tooltip content="上传简历文件" placement="top">
                <el-icon><Document /></el-icon>
              </el-tooltip>
            </el-upload>

            <el-select v-model="chatMode" class="mode-select" size="small">
              <el-option label="💬 解答问题" value="question" />
              <el-option label="📄 简历润色" value="resume" />
            </el-select>
          </div>

          <div class="input-row">
            <el-input
              ref="inputRef"
              v-model="input"
              type="textarea"
              :placeholder="getPlaceholder()"
              @keydown.enter.exact.prevent="handleEnterSend"
              class="chat-input"
              :disabled="sending"
              :rows="2"
            />
            <el-button
              class="send-btn"
              @click="send"
              :disabled="isSendDisabled"
              :class="{ active: isSendActive }"
            >
              <el-icon v-if="!sending"><Promotion /></el-icon>
              <el-icon v-else><Loading /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧文件预览面板 -->
    <div class="file-preview-panel" :class="{ show: showFileViewer }">
      <div class="panel-header">
        <span class="panel-title">{{ previewFileName }}</span>
        <div class="panel-actions">
          <button
            class="action-btn"
            @click="downloadFile(previewFileUrl, previewFileName)"
          >
            <el-icon><Download /></el-icon>
            <span>下载</span>
          </button>
          <button class="action-btn close-btn" @click="closeFilePreview">
            <el-icon><Close /></el-icon>
          </button>
        </div>
      </div>
      <div class="panel-content">
        <iframe
          ref="pdfViewer"
          width="100%"
          height="100%"
          frameborder="0"
          style="border: none"
        ></iframe>
      </div>
    </div>

    <!-- 图片预览 -->
    <div v-if="showImageViewer" class="image-viewer" @click="closeImagePreview">
      <img :src="previewImageUrl" class="viewer-img" />
      <div class="viewer-close">
        <el-icon><Close /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, onBeforeUnmount, watch } from "vue";
import { useChatStore } from "@/store/chatstore";
import {
  Plus,
  Fold,
  Expand,
  CopyDocument,
  Download,
  Picture,
  Document,
  Close,
  ChatRound,
  ChatDotRound,
  Service,
  User,
  Promotion,
  Loading,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { jsPDF } from "jspdf";
import { marked } from "marked";
import DOMPurify from "dompurify";

const chatStore = useChatStore();
const TOKEN = chatStore.token;
const API = chatStore.apiConfig;

// 配置 marked
marked.setOptions({ breaks: true, gfm: true });

// Markdown 渲染
const renderMarkdown = (text) => {
  if (!text) return "";
  const rawHtml = marked(text);
  return DOMPurify.sanitize(rawHtml);
};

const isSidebarCollapsed = ref(false);
const chatMode = ref("question");
const input = ref("");
const previewList = ref([]);
const messages = ref([]);
const sending = ref(false);
let currentController = null;

// 存储所有生成的 blob URL，用于统一清理
const blobUrls = ref([]);

// 图片预览
const showImageViewer = ref(false);
const previewImageUrl = ref("");
const messageListRef = ref(null);

// 文件预览（右侧面板）
const showFileViewer = ref(false);
const previewFileUrl = ref("");
const previewFileName = ref("");
const pdfViewer = ref(null);

// 输入框引用
const inputRef = ref(null);

// 计算发送按钮是否禁用
const isSendDisabled = computed(() => {
  if (sending.value) return true;
  if (chatMode.value === "resume" && previewList.value.length === 0) return true;
  if (!input.value.trim() && previewList.value.length === 0) return true;
  return false;
});

// 计算发送按钮是否高亮
const isSendActive = computed(() => {
  if (sending.value) return false;
  if (chatMode.value === "resume" && previewList.value.length > 0) return true;
  if (input.value.trim() || previewList.value.length > 0) return true;
  return false;
});

// 动态占位符
const getPlaceholder = () => {
  if (chatMode.value === "question") {
    return "输入你想问的问题...";
  } else {
    return previewList.value.length === 0
      ? "请先上传简历文件（PDF/TXT）..."
      : "输入补充说明（可选）...";
  }
};

const openImagePreview = (url) => {
  previewImageUrl.value = url;
  showImageViewer.value = true;
};

const closeImagePreview = () => {
  showImageViewer.value = false;
  previewImageUrl.value = "";
};

const openFilePreview = (url, name) => {
  if (!name.toLowerCase().endsWith(".pdf")) {
    ElMessage.warning("仅支持预览 PDF 文件");
    return;
  }

  previewFileName.value = name;
  previewFileUrl.value = url;
  showFileViewer.value = true;

  nextTick(() => {
    if (pdfViewer.value) {
      pdfViewer.value.src = url;
    }
  });
};

const closeFilePreview = () => {
  showFileViewer.value = false;
  previewFileName.value = "";
  previewFileUrl.value = "";
  if (pdfViewer.value) pdfViewer.value.src = "";
};

const downloadFile = async (url, fileName = "简历.pdf") => {
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    ElMessage.success("下载成功");
  } catch (err) {
    ElMessage.error("下载失败，请重试");
  }
};

const currentSession = computed(() => chatStore.currentSession);
const chatList = computed(() => chatStore.sessionList);

onMounted(() => {
  getChatList();
  // 页面加载完成后聚焦输入框
  nextTick(() => {
    if (inputRef.value) {
      const textarea = inputRef.value.$el.querySelector('textarea');
      if (textarea) textarea.focus();
    }
  });
});

// 统一清理所有 blob URL
const clearBlobUrls = () => {
  blobUrls.value.forEach((url) => {
    URL.revokeObjectURL(url);
  });
  blobUrls.value = [];
};

// 获取对话列表
const getChatList = async () => {
  try {
    const res = await fetch(API.LIST, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const data = await res.json();
    if (data.data) chatStore.setSessionList(data.data);
  } catch (e) {
    console.error("获取列表失败", e);
  }
};

// 新建对话
const createNew = async () => {
  try {
    const res = await fetch(API.CREATE, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const data = await res.json();
    await getChatList();
    chatStore.setCurrentSession(data.data);
    messages.value = [];
    previewList.value = [];
    input.value = "";
    scrollToBottom();
    clearBlobUrls();
    closeFilePreview();
    // 恢复焦点
    await nextTick();
    if (inputRef.value) {
      const textarea = inputRef.value.$el.querySelector('textarea');
      if (textarea) textarea.focus();
    }
  } catch (err) {
    console.error("新建失败", err);
  }
};

// 选择对话
const selectChat = async (item) => {
  if (currentController) {
    currentController.abort();
    currentController = null;
  }
  messages.value = [];
  previewList.value = [];
  input.value = "";
  closeFilePreview();
  clearBlobUrls();
  chatStore.setCurrentSession(item);
  await getHistoryMessages(item.id);
  // 恢复焦点
  await nextTick();
  if (inputRef.value) {
    const textarea = inputRef.value.$el.querySelector('textarea');
    if (textarea) textarea.focus();
  }
};

// 获取历史消息
const getHistoryMessages = async (chatId) => {
  try {
    const url = `${API.HISTORY}?${new URLSearchParams({ chatId })}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const data = await res.json();
    let raw = data.data || [];
    raw.sort((a, b) => new Date(a.sendTime) - new Date(b.sendTime));

    const mapMsg = raw.map((msg) => {
      const role = msg.fromUserId === 1 ? "user" : "ai";
      if (msg.msgType === 2) {
        const url = msg.content;
        const exts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"];
        const isImg = exts.some((e) => url.toLowerCase().endsWith(e));

        const getFileNameFromUrl = (url) => {
          try {
            const arr = url.split("/");
            let name = arr[arr.length - 1];
            name = name.split("?")[0];
            return name || "简历.pdf";
          } catch {
            return "简历.pdf";
          }
        };

        if (isImg) {
          return { role, type: "image", url };
        } else {
          return {
            role,
            type: "file",
            url,
            name: getFileNameFromUrl(url),
          };
        }
      }
      return { role, content: msg.content };
    });

    messages.value = mapMsg;
    scrollToBottom();
  } catch (err) {
    console.error("历史消息失败", err);
  }
};

// 分组会话
const groupedChats = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const groups = {
    today: { label: "今天", list: [] },
    yesterday: { label: "昨天", list: [] },
    week: { label: "7天内", list: [] },
    older: { label: "更早", list: [] },
  };
  if (Array.isArray(chatList.value)) {
    chatList.value.forEach((i) => {
      const t = new Date(i.createTime || Date.now()).getTime();
      if (t >= today) groups.today.list.push(i);
      else if (t >= today - 86400000) groups.yesterday.list.push(i);
      else if (t >= today - 7 * 86400000) groups.week.list.push(i);
      else groups.older.list.push(i);
    });
  }
  return [groups.today, groups.yesterday, groups.week, groups.older].filter(
    (g) => g.list.length,
  );
});

// 文件上传预览
const handleUpload = (file) => {
  const local = URL.createObjectURL(file.raw);
  blobUrls.value.push(local);
  previewList.value.push({
    type: file.raw.type.startsWith("image/") ? "image" : "file",
    url: local,
    name: file.raw.name,
    file: file.raw,
  });
};

// 移除预览
const removePreview = (idx) => {
  const item = previewList.value[idx];
  if (item && item.url.startsWith("blob:")) {
    URL.revokeObjectURL(item.url);
    const index = blobUrls.value.indexOf(item.url);
    if (index !== -1) blobUrls.value.splice(index, 1);
  }
  previewList.value.splice(idx, 1);
};

// 处理回车发送
const handleEnterSend = (event) => {
  if (sending.value) {
    event.preventDefault();
    return;
  }
  
  // 如果有 Shift 键，允许换行
  if (event.shiftKey) {
    return;
  }
  
  event.preventDefault();
  send();
};

// 发送消息
const send = async () => {
  if (chatMode.value === "resume" && previewList.value.length === 0) {
    ElMessage.warning("简历润色模式必须先上传简历文件（PDF或TXT）");
    return;
  }
  
  if (sending.value) return;
  
  const hasTxt = input.value?.trim();
  const hasFile = previewList.value.length > 0;
  if (!hasTxt && !hasFile) {
    ElMessage.warning("请输入内容或上传文件");
    return;
  }

  sending.value = true;
  
  if (currentController) {
    currentController.abort();
  }
  currentController = new AbortController();

  const content = input.value.trim();
  const files = [...previewList.value];
  const mode = chatMode.value;
  const chatId = currentSession.value?.id || "";

  // 插入用户消息
  files.forEach((item) => {
    messages.value.push({
      role: "user",
      type: item.type,
      url: item.url,
      name: item.name,
    });
  });
  if (content) {
    messages.value.push({ role: "user", content });
  }

  // 清空输入和预览
  input.value = "";
  previewList.value = [];
  await nextTick();
  scrollToBottom();

  // AI消息占位
  const aiMsg = { role: "ai", content: "" };
  messages.value.push(aiMsg);
  const lastMsgIndex = messages.value.length - 1;
  scrollToBottom();

  try {
    const fd = new FormData();
    if (content) fd.append("question", content);
    if (chatId) fd.append("chatId", chatId);
    if (files[0]?.file) fd.append("file", files[0].file);

    const res = await fetch(mode === "resume" ? API.RESUME : API.ANSWER, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: fd,
      signal: currentController.signal,
    });

    if (!res.ok) throw new Error(`服务器错误 ${res.status}`);

    if (mode === "resume") {
      const json = await res.json();
      if (json.data) {
        const pdfUrl = json.data;
        const pdfFileName = "修改后的简历.pdf";
        messages.value.splice(lastMsgIndex, 1, {
          role: "ai",
          type: "file",
          url: pdfUrl,
          name: pdfFileName,
        });
      } else {
        throw new Error(json.msg || "简历润色失败，请稍后重试");
      }
    } else {
      // 解答问题模式 - 流式返回
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullContent = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        messages.value.splice(lastMsgIndex, 1, {
          ...aiMsg,
          content: fullContent,
        });
        await nextTick();
        scrollToBottom();
      }

      if (!fullContent) {
        messages.value.splice(lastMsgIndex, 1, {
          ...aiMsg,
          content: "未获取到有效解答内容",
        });
      }
    }
  } catch (err) {
    console.error("请求失败：", err);
    const errText =
      err.name === "AbortError"
        ? "⏸️ 请求已取消"
        : `❌ ${err.message || "请求失败，请稍后重试"}`;
    messages.value.splice(lastMsgIndex, 1, { ...aiMsg, content: errText });
    ElMessage.error(errText);
  } finally {
    sending.value = false;
    currentController = null;
    
    // 恢复焦点
    await nextTick();
    setTimeout(() => {
      if (inputRef.value) {
        const textarea = inputRef.value.$el.querySelector('textarea');
        if (textarea) {
          textarea.focus();
        }
      }
    }, 100);
  }
};

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
  });
};

// 复制文本
const copyText = (t) => {
  navigator.clipboard.writeText(t).then(() => ElMessage.success("内容已复制"));
};

// 导出文本为PDF
const exportPDF = (t) => {
  const doc = new jsPDF();
  doc.text(doc.splitTextToSize(t, 180), 10, 10);
  doc.save("AI回答_" + Date.now() + ".pdf");
  ElMessage.success("PDF导出成功");
};

// 组件卸载时清理
onBeforeUnmount(() => {
  clearBlobUrls();
});
</script>

<style scoped>
/* 所有样式保持不变 */
.ai-chat-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  background: #ffffff;
  overflow: hidden;
  position: relative;
}

/* 侧边栏样式 */
.sidebar {
  width: 280px;
  background: #fafafa;
  border-right: 1px solid #e5e5e5;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}
.sidebar.collapsed {
  width: 0;
  border: none;
  overflow: hidden;
}
.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #e5e5e5;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo-icon {
  width: 32px;
  height: 32px;
}
.logo-icon svg {
  width: 100%;
  height: 100%;
}
.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
.new-chat-btn {
  width: 100%;
  padding: 12px 16px;
  background: #333;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s ease;
  margin-bottom: 20px;
}
.new-chat-btn:hover {
  background: #555;
}
.history-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.history-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.group-title {
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s ease;
}
.history-item .el-icon {
  font-size: 16px;
  color: #999;
  flex-shrink: 0;
}
.history-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.history-item:hover {
  background: #f5f5f5;
  color: #333;
}
.history-item:hover .el-icon {
  color: #333;
}
.history-item.active {
  background: #e8e8e8;
  color: #333;
}
.history-item.active .el-icon {
  color: #333;
}

/* 聊天容器 - 预览时收缩 */
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: #ffffff;
  transition: width 0.3s ease;
}
.chat-container.preview-shrink {
  width: calc(100% - 500px);
  flex: none;
}

/* 聊天头部 */
.chat-header {
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}
.left-icons {
  display: flex;
  gap: 8px;
  flex: 1;
}
.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #999;
  transition: all 0.2s ease;
}
.icon-btn:hover {
  background: #f5f5f5;
  color: #333;
}
.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.header-title .el-icon {
  color: #333;
}

/* 消息列表 */
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  min-height: 0;
  scroll-behavior: smooth;
}
.welcome-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}
.welcome-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
}
.welcome-icon svg {
  width: 100%;
  height: 100%;
}
.welcome-message h2 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}
.welcome-message p {
  font-size: 16px;
  color: #999;
  max-width: 400px;
}
.message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: flex-start;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.message.user {
  flex-direction: row-reverse;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
}
.avatar.ai {
  background: #333;
  color: white;
}
.avatar.user {
  background: #e5e5e5;
  color: #999;
}
.message-content {
  max-width: 70%;
}
.bubble {
  padding: 14px 18px 0 14px;
  border-radius: 8px;
  word-break: break-word;
  white-space: pre-wrap;
  font-size: 15px;
  line-height: 1.2;
}
.bubble-content {
  line-height: 1.2;
}
.bubble.ai {
  background: #f5f5f5;
  color: #333;
  border-bottom-left-radius: 4px;
}
.bubble.user {
  background: #333;
  color: white;
  border-bottom-right-radius: 4px;
}
.sent-image {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
}
.sent-image img {
  max-width: 300px;
  max-height: 200px;
  object-fit: cover;
  display: block;
}
.sent-file {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.sent-file:hover {
  background: #e8e8e8;
}
.file-icon {
  width: 40px;
  height: 40px;
  background: #333;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}
.file-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
.msg-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e5e5;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #999;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.action-btn:hover {
  background: #f5f5f5;
  color: #333;
}

/* 输入区域 */
.input-box {
  padding: 20px 24px 24px;
  background: #ffffff;
  border-top: 1px solid #e5e5e5;
  flex-shrink: 0;
}
.preview-list {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.preview-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
}
.preview-item img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
}
.file-preview {
  display: flex;
  align-items: center;
  gap: 8px;
}
.file-preview .el-icon {
  font-size: 20px;
  color: #333;
}
.preview-delete {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  background: #999;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
}
.preview-delete:hover {
  background: #666;
}
.input-wrapper {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid #e5e5e5;
}
.input-wrapper:focus-within {
  border-color: #333;
}
.input-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e5e5;
}
.toolbar-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  color: #999;
}
.toolbar-btn:hover {
  background: #fff;
  color: #333;
}
.mode-select {
  width: 140px;
}
:deep(.mode-select .el-input__wrapper) {
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e5e5e5;
  height: 36px;
}
.input-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}
.chat-input {
  flex: 1;
}
:deep(.chat-input .el-textarea__inner) {
  resize: none;
  background: transparent;
  border: none;
  padding: 8px 0;
  font-size: 15px;
  box-shadow: none !important;
}
.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: #e5e5e5;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.send-btn.active {
  background: #333;
  color: white;
}
.send-btn.active:hover {
  background: #555;
}
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 8px;
}
.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}
.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}
.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}
@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 右侧PDF预览面板 */
.file-preview-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 500px;
  height: 100vh;
  background: #fff;
  border-left: 1px solid #e5e5e5;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 10;
  display: flex;
  flex-direction: column;
}
.file-preview-panel.show {
  transform: translateX(0);
}
.panel-header {
  height: 64px;
  padding: 0 20px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.panel-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}
.panel-actions {
  display: flex;
  gap: 8px;
}
.close-btn {
  color: #ff4d4f;
}
.close-btn:hover {
  background: #fff2f0;
}
.panel-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

/* 图片预览 */
.image-viewer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: zoom-out;
}
.viewer-img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}
.viewer-close {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
}
.viewer-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 滚动条样式统一 */
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

/* 响应式适配 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 100;
  }
  .sidebar.collapsed {
    transform: translateX(-100%);
    width: 280px;
  }
  .message-content {
    max-width: 85%;
  }
  .file-preview-panel {
    width: 100%;
  }
  .chat-container.preview-shrink {
    width: 100%;
    opacity: 0.3;
    pointer-events: none;
  }
  .panel-title {
    max-width: 200px;
  }
}
.bubble-content :deep(h1),
.bubble-content :deep(h2),
.bubble-content :deep(h3),
.bubble-content :deep(h4),
.bubble-content :deep(h5),
.bubble-content :deep(h6) {
  margin: 0.5em 0 0.25em;
  font-weight: 600;
}

.bubble-content :deep(h1) {
  font-size: 1.8em;
}
.bubble-content :deep(h2) {
  font-size: 1.5em;
}
.bubble-content :deep(h3) {
  font-size: 1.3em;
}
.bubble-content :deep(h4) {
  font-size: 1.1em;
}

.bubble-content :deep(p) {
  margin: 0.5em 0;
}

.bubble-content :deep(ul),
.bubble-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.bubble-content :deep(li) {
  margin: 0.2em 0;
}

.bubble-content :deep(code) {
  font-family: monospace;
  background: #f0f0f0;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
  color: #d14;
}

.bubble-content :deep(pre) {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5em 0;
}

.bubble-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: #333;
}

.bubble-content :deep(blockquote) {
  border-left: 4px solid #ddd;
  margin: 0.5em 0;
  padding-left: 1em;
  color: #666;
}

.bubble-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.5em 0;
}

.bubble-content :deep(th),
.bubble-content :deep(td) {
  border: 1px solid #ddd;
  padding: 6px 10px;
  text-align: left;
}

.bubble-content :deep(th) {
  background: #f5f5f5;
}

.bubble-content :deep(a) {
  color: #0366d6;
  text-decoration: none;
}

.bubble-content :deep(a):hover {
  text-decoration: underline;
}

.bubble-content :deep(img) {
  max-width: 100%;
  border-radius: 6px;
}
</style>