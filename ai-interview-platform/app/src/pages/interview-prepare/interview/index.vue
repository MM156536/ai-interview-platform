<template>
  <div class="interview">
    <div class="interview-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo-area">
            <div class="ai-avatar">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="interview-info">
              <h2 class="interview-title">AI智能面试系统</h2>
              <p class="interview-subtitle">企业级智能招聘面试平台</p>
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="header-tools">
            <div class="countdown-badge" :class="{ warning: timeLeft <= 10 }">
              <el-icon><Clock /></el-icon>
              <span>{{ formatCountdown(timeLeft) }}</span>
            </div>

            <el-switch
              v-model="voiceModeEnabled"
              active-text="语音"
              inactive-text="文字"
              style="margin-left: 8px"
              @change="stopAllVoice"
            />

            <el-button
              type="primary"
              size="default"
              @click="showStartDialog"
              :disabled="interviewStarted"
            >
              开始面试
            </el-button>

            <el-button
              type="danger"
              size="default"
              @click="handleEndInterview"
              :disabled="!interviewStarted"
              class="end-btn"
            >
              结束面试
            </el-button>

            <div
              class="status-badge"
              :class="{ ready: !interviewStarted, doing: interviewStarted }"
            >
              <div class="status-dot"></div>
              <span class="status-text">
                {{ interviewStarted ? "面试中" : "未开始" }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="interview-main">
      <div class="chat-container">
        <div class="chat-messages" ref="chatMessagesRef">
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            :class="[
              'message',
              msg.type === 'user' ? 'user-message' : 'ai-message',
            ]"
          >
            <div class="message-avatar">
              <div
                :class="
                  msg.type === 'user' ? 'user-avatar-small' : 'ai-avatar-small'
                "
              >
                <el-icon v-if="msg.type === 'user'"><User /></el-icon>
                <el-icon v-else><ChatDotRound /></el-icon>
              </div>
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">{{
                  msg.type === "user" ? "我" : "AI面试官"
                }}</span>
                <span class="message-time">{{ msg.time || "刚刚" }}</span>
              </div>

              <!-- 语音消息：不包裹气泡框 -->
              <template v-if="msg.type === 'user' && msg.audioUrl">
                <div class="voice-message-container">
                  <div
                    class="wechat-voice-message"
                    @click="playVoiceMessage(msg, idx)"
                  >
                    <div class="voice-icon">
                      <el-icon><Microphone /></el-icon>
                    </div>
                    <div class="voice-duration">
                      {{ formatDuration(msg.duration) }}
                    </div>
                    <div v-if="playingVoiceId === idx" class="voice-wave">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- 文字消息：显示气泡 -->
              <template v-else>
                <div class="message-text">
                  <div v-if="msg.thinking" class="thinking-dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                  </div>
                  <div
                    v-else
                    class="text-inner"
                    v-html="renderMarkdown(msg.content)"
                  ></div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="chat-input-area">
          <!-- 语音模式：只显示大录音按钮 -->
          <div v-if="voiceModeEnabled" class="voice-input-area">
            <el-button
              class="voice-record-button"
              :type="isRecording ? 'danger' : 'primary'"
              size="large"
              @click="toggleRecord"
              :disabled="!interviewStarted || isStreaming"
            >
              <el-icon><Microphone /></el-icon>
              {{ isRecording ? "结束录音并发送" : "点击录音" }}
            </el-button>
            <div class="voice-hint" v-if="!isRecording">
              点击按钮开始语音回答
            </div>
            <div class="voice-hint recording-hint" v-else>
              正在录音，点击结束并发送
            </div>
          </div>

          <!-- 文字模式：只显示输入框 + 发送按钮 -->
          <div v-else class="text-input-area">
            <div class="input-wrapper">
              <div class="input-center">
                <el-input
                  v-model="inputMessage"
                  placeholder="请输入你的回答..."
                  @keyup.enter="sendMessage"
                  class="message-input"
                  size="large"
                  :disabled="!interviewStarted || isStreaming"
                  ref="inputRef"
                />
              </div>
              <div class="input-right">
                <el-button
                  @click="sendMessage"
                  type="primary"
                  size="large"
                  class="send-button"
                  :disabled="
                    !inputMessage.trim() || !interviewStarted || isStreaming
                  "
                >
                  <template #icon>
                    <el-icon><Promotion /></el-icon>
                  </template>
                  发送
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="info-panel">
        <div class="panel-card">
          <div class="panel-header">
            <h3>面试情况</h3>
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="panel-content">
            <div class="progress-item" style="margin-bottom: 16px">
              <div class="progress-label">面试职业：</div>
              <div class="job-value">{{ jobRole }}</div>
            </div>

            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-icon">
                  <el-icon><ChatLineSquare /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ userMessageCount }}</div>
                  <div class="stat-label">问答轮次</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">
                  <el-icon><Clock /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ formatTime(elapsedTime) }}</div>
                  <div class="stat-label">已用时间</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="voice-control-card">
          <h3>🎤 语音设置</h3>
          <div class="voice-row">
            <label>语音播报</label>
            <el-switch v-model="voiceModeEnabled" @change="stopAllVoice" />
          </div>
          <div class="voice-row">
            <label>发音人</label>
            <el-select v-model="voiceName" size="small" style="width: 100%">
              <el-option label="晓燕" value="xiaoyan" />
              <el-option label="晓峰" value="xiaofeng" />
              <el-option label="小雪" value="xiaoxue" />
              <el-option label="小强" value="xiaoqiang" />
            </el-select>
          </div>
          <div class="voice-row">
            <label>语速 {{ voiceSpeed }}</label>
            <el-slider v-model="voiceSpeed" :min="20" :max="80" />
          </div>
          <div class="voice-row">
            <label>音量 {{ voiceVolume }}</label>
            <el-slider v-model="voiceVolume" :min="50" :max="100" />
          </div>
        </div>

        <div class="panel-card">
          <div class="panel-header">
            <h3>面试技巧</h3>
            <el-icon><Star /></el-icon>
          </div>
          <div class="panel-content">
            <div class="tip-item">
              <div class="tip-icon">
                <el-icon><Check /></el-icon>
              </div>
              <div class="tip-text">展示你的专业能力</div>
            </div>
            <div class="tip-item">
              <div class="tip-icon">
                <el-icon><Check /></el-icon>
              </div>
              <div class="tip-text">保持自信，清晰表达</div>
            </div>
            <div class="tip-item">
              <div class="tip-icon">
                <el-icon><Check /></el-icon>
              </div>
              <div class="tip-text">倾听问题，避免抢答</div>
            </div>
            <div class="tip-item">
              <div class="tip-icon">
                <el-icon><Check /></el-icon>
              </div>
              <div class="tip-text">回答要具体，举例说明</div>
            </div>
            <div class="tip-item">
              <div class="tip-icon">
                <el-icon><Check /></el-icon>
              </div>
              <div class="tip-text">控制回答时长，简洁抓重点</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onUnmounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useInterviewStore } from "@/store/interview";
import { useRouter } from "vue-router";
import CryptoJS from "crypto-js";
import {
  ChatDotRound,
  User,
  Promotion,
  TrendCharts,
  ChatLineSquare,
  Clock,
  Star,
  Check,
  Microphone,
} from "@element-plus/icons-vue";

import { marked } from "marked";
import DOMPurify from "dompurify";

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

const renderMarkdown = (text) => {
  if (!text) return "";
  const rawHtml = marked.parse(text);
  return DOMPurify.sanitize(rawHtml);
};

const router = useRouter();
const interviewStore = useInterviewStore();
const chatId = interviewStore.chatId;
const jobRole = interviewStore.jobRole;

const XUNFEI_CONFIG = interviewStore.xunfeiConfig; // 👈 从 pinia 读取
const TOKEN = interviewStore.token;
const API = interviewStore.apiConfig;

const voiceModeEnabled = ref(true);
const voiceName = ref("xiaoyan");
const voiceSpeed = ref(50);
const voiceVolume = ref(100);

let ttsWs = null;
let audioBuffer = [];
const stopAllVoice = () => {
  try {
    if (ttsWs) ttsWs.close();
  } catch {}
  try {
    if (iatWs) iatWs.close();
  } catch {}
  ttsWs = null;
  iatWs = null;
  audioBuffer = [];
};

const getTtsWsUrl = () => {
  const host = "tts-api.xfyun.cn";
  const date = new Date().toGMTString();
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/tts HTTP/1.1`;
  const signatureSha = CryptoJS.HmacSHA256(
    signatureOrigin,
    XUNFEI_CONFIG.API_SECRET,
  );
  const signature = CryptoJS.enc.Base64.stringify(signatureSha);
  const authorizationOrigin = `api_key="${XUNFEI_CONFIG.API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = btoa(authorizationOrigin);
  return `wss://${host}/v2/tts?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
};

const playText = (text) => {
  if (!voiceModeEnabled.value || !text) return;
  stopAllVoice();
  const wsUrl = getTtsWsUrl();
  ttsWs = new WebSocket(wsUrl);
  ttsWs.onopen = () => {
    const params = {
      common: { app_id: XUNFEI_CONFIG.APPID },
      business: {
        aue: "lame",
        vcn: voiceName.value,
        speed: parseInt(voiceSpeed.value),
        volume: parseInt(voiceVolume.value),
        pitch: 50,
        tte: "UTF8",
      },
      data: {
        status: 2,
        text: btoa(unescape(encodeURIComponent(text))),
        encoding: "raw",
      },
    };
    ttsWs.send(JSON.stringify(params));
  };
  ttsWs.onmessage = (e) => {
    const res = JSON.parse(e.data);
    if (res.data?.audio) {
      const binary = atob(res.data.audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      audioBuffer.push(bytes);
    }
    if (res.data?.status === 2) {
      const total = audioBuffer.reduce((t, b) => t + b.length, 0);
      const combined = new Uint8Array(total);
      let off = 0;
      audioBuffer.forEach((b) => {
        combined.set(b, off);
        off += b.length;
      });
      const blob = new Blob([combined], { type: "audio/mpeg" });
      const a = new Audio(URL.createObjectURL(blob));
      a.play().catch(() => {});
    }
  };
};

const isListening = ref(false);
const inputMessage = ref("");
const inputRef = ref(null);
let iatWs = null;
let audioContext = null;
let processor = null;
let mediaStream = null;
let finalResult = "";

let recordedAudioChunks = [];
let pendingAudioBlobUrl = ref(null);

const pcmToWavBlob = (samples, sampleRate) => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (view, offset, str) => {
    for (let i = 0; i < str.length; i++)
      view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    view.setInt16(offset, samples[i], true);
    offset += 2;
  }
  return new Blob([view], { type: "audio/wav" });
};

const getIatWsUrl = () => {
  const host = "iat-api.xfyun.cn";
  const date = new Date().toGMTString();
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
  const signatureSha = CryptoJS.HmacSHA256(
    signatureOrigin,
    XUNFEI_CONFIG.API_SECRET,
  );
  const signature = CryptoJS.enc.Base64.stringify(signatureSha);
  const authorizationOrigin = `api_key="${XUNFEI_CONFIG.API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = btoa(authorizationOrigin);
  return `wss://${host}/v2/iat?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
};

function pcmToBase64(int16Array) {
  const u8 = new Uint8Array(int16Array.buffer);
  let bin = "";
  for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
  return btoa(bin);
}

const startXFVoiceRecog = async () => {
  if (isListening.value) return;
  stopAllVoice();
  recordedAudioChunks = [];
  if (pendingAudioBlobUrl.value) {
    URL.revokeObjectURL(pendingAudioBlobUrl.value);
    pendingAudioBlobUrl.value = null;
  }
  finalResult = "";

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new AudioContext({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(mediaStream);
    processor = audioContext.createScriptProcessor(4096, 1, 1);
    source.connect(processor);
    processor.connect(audioContext.destination);

    const wsUrl = getIatWsUrl();
    iatWs = new WebSocket(wsUrl);
    iatWs.onopen = () => {
      isListening.value = true;
      const frame = {
        common: { app_id: XUNFEI_CONFIG.APPID },
        business: {
          language: "zh_cn",
          domain: "iat",
          accent: "mandarin",
          vad_eos: 100000,
          dwa: "wpgs",
        },
        data: { status: 0, format: "audio/L16;rate=16000", encoding: "raw" },
      };
      iatWs.send(JSON.stringify(frame));
    };
    processor.onaudioprocess = (e) => {
      if (!iatWs || iatWs.readyState !== WebSocket.OPEN) return;
      const data = e.inputBuffer.getChannelData(0);
      const pcm = new Int16Array(data.length);
      for (let i = 0; i < data.length; i++) {
        const s = Math.max(-1, Math.min(1, data[i]));
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      recordedAudioChunks.push(new Int16Array(pcm));
      const base64 = pcmToBase64(pcm);
      iatWs.send(
        JSON.stringify({ data: { status: 1, audio: base64, encoding: "raw" } }),
      );
    };
    let fullText = "";
    iatWs.onmessage = (e) => {
      const res = JSON.parse(e.data);
      if (res.code !== 0) return;
      if (res.data?.result?.ws) {
        let txt = "";
        res.data.result.ws.forEach((w) => {
          txt += w.cw[0].w;
        });
        const isFinal = res.data.result.status === 2;
        if (isFinal) {
          fullText += txt;
          inputMessage.value = fullText;
        } else {
          inputMessage.value = fullText + txt;
        }
      }
    };
    iatWs.onclose = () => {
      isListening.value = false;
    };
    iatWs.onerror = () => {
      ElMessage.error("识别异常");
      isListening.value = false;
    };
  } catch (err) {
    ElMessage.error("麦克风异常：" + err.message);
    isListening.value = false;
  }
};

const stopXFVoiceRecog = () => {
  isListening.value = false;
  try {
    iatWs?.send(JSON.stringify({ data: { status: 2 } }));
  } catch {}
  try {
    iatWs?.close();
  } catch {}
  try {
    processor?.disconnect();
  } catch {}
  try {
    audioContext?.close();
  } catch {}
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  iatWs = null;
  audioContext = null;
  processor = null;

  if (recordedAudioChunks.length > 0) {
    let totalLength = 0;
    recordedAudioChunks.forEach((chunk) => (totalLength += chunk.length));
    const combinedPcm = new Int16Array(totalLength);
    let offset = 0;
    recordedAudioChunks.forEach((chunk) => {
      combinedPcm.set(chunk, offset);
      offset += chunk.length;
    });
    const wavBlob = pcmToWavBlob(combinedPcm, 16000);
    if (pendingAudioBlobUrl.value)
      URL.revokeObjectURL(pendingAudioBlobUrl.value);
    pendingAudioBlobUrl.value = URL.createObjectURL(wavBlob);
  }
};

const isRecording = ref(false);
const toggleRecord = () => {
  if (!interviewStarted.value) {
    ElMessage.warning("请先开始面试");
    return;
  }
  if (isStreaming.value) {
    ElMessage.warning("AI思考中，请稍后");
    return;
  }
  if (!isRecording.value) {
    isRecording.value = true;
    startXFVoiceRecog();
  } else {
    isRecording.value = false;
    stopXFVoiceRecog();
    if (inputMessage.value.trim()) {
      sendMessage();
    }
  }
};

const messages = ref([]);
const chatMessagesRef = ref(null);
const interviewStarted = ref(false);
const elapsedTime = ref(0);
const isStreaming = ref(false);
const timeLeft = ref(180);
let abortController = null;
let countdownTimer = null;
let timerInterval = null;

const userMessageCount = computed(
  () => messages.value.filter((m) => m.type === "user").length,
);

const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
};

watch(
  messages,
  () =>
    nextTick(() => {
      const el = chatMessagesRef.value;
      if (el) el.scrollTop = el.scrollHeight;
    }),
  { deep: true },
);

const showStartDialog = async () => {
  try {
    await ElMessageBox.confirm("确认开始面试？", "提示");
    startInterview();
  } catch {}
};

const startInterview = () => {
  interviewStarted.value = true;
  ElMessage.success("面试已开始");
  timerInterval = setInterval(() => elapsedTime.value++, 1000);
  startCountdown();
  streamAIResponse("");
};

// 加载音频时长
const loadAudioDuration = (msg) => {
  const audio = new Audio(msg.audioUrl);
  audio.addEventListener("loadedmetadata", () => {
    msg.duration = audio.duration;
  });
  audio.addEventListener("error", () => {
    msg.duration = 0;
  });
};

// 微信风格语音播放
const playingVoiceId = ref(null);
let currentAudio = null;

const playVoiceMessage = (msg, index) => {
  if (playingVoiceId.value === index) {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    playingVoiceId.value = null;
  } else {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    playingVoiceId.value = index;
    currentAudio = new Audio(msg.audioUrl);
    currentAudio.play();
    currentAudio.onended = () => {
      playingVoiceId.value = null;
      currentAudio = null;
    };
    currentAudio.onerror = () => {
      playingVoiceId.value = null;
      currentAudio = null;
    };
  }
};

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return "";
  const sec = Math.floor(seconds);
  return `${sec}"`;
};

const sendMessage = async () => {
  if (
    !inputMessage.value.trim() ||
    !interviewStarted.value ||
    isStreaming.value
  )
    return;
  stopAllVoice();

  const txt = inputMessage.value.trim();
  const hasAudioUrl = pendingAudioBlobUrl.value && voiceModeEnabled.value;

  const userMsgObj = {
    type: "user",
    content: txt,
    time: getCurrentTime(),
  };
  if (hasAudioUrl) {
    userMsgObj.audioUrl = pendingAudioBlobUrl.value;
  }
  messages.value.push(userMsgObj);
  if (userMsgObj.audioUrl) {
    loadAudioDuration(userMsgObj);
  }

  if (pendingAudioBlobUrl.value) {
    pendingAudioBlobUrl.value = null;
  }
  inputMessage.value = "";
  await nextTick();
  inputRef.value?.focus();
  streamAIResponse(txt);
};

const streamAIResponse = async (userMsg = "") => {
  if (!chatId) {
    ElMessage.error("会话ID不存在");
    return;
  }
  if (isStreaming.value) return;

  isStreaming.value = true;
  if (abortController) abortController.abort();
  abortController = new AbortController();

  const aiMsg = {
    type: "ai",
    content: "",
    thinking: true,
    time: getCurrentTime(),
  };
  messages.value.push(aiMsg);
  scrollToBottom();

  try {
    const params = { chatId, userMsg };
    const url = `${API.INTERVIEW}?${new URLSearchParams(params)}`;
    console.log("【请求】AI面试流式接口", {
      method: "GET",
      url,
      params,
      token: TOKEN,
    });

    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${TOKEN}` },
      signal: abortController.signal,
    });
    if (!response.ok) throw new Error(`请求失败 ${response.status}`);
    if (!response.body) throw new Error("不支持流式输出");
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let accumulatedContent = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      accumulatedContent += chunk;
      await nextTick(() => {
        const lastIndex = messages.value.length - 1;
        const updatedMsg = {
          ...aiMsg,
          thinking: false,
          content: accumulatedContent,
          time: getCurrentTime(), // ✅ 每次更新都刷新时间
        };
        messages.value.splice(lastIndex, 1, updatedMsg);
      });
      scrollToBottom();
    }

    if (aiMsg.thinking) {
      const lastIndex = messages.value.length - 1;
      messages.value.splice(lastIndex, 1, { ...aiMsg, thinking: false });
    }
    if (accumulatedContent) playText(accumulatedContent);
    else {
      const lastIndex = messages.value.length - 1;
      messages.value.splice(lastIndex, 1, {
        ...aiMsg,
        content: "未获取到有效内容",
        thinking: false,
        time: getCurrentTime(), // ✅ 每次更新都刷新时间
      });
    }
  } catch (err) {
    console.error("流式异常:", err);
    const lastIndex = messages.value.length - 1;
    let errorText = "服务异常，请稍后重试";
    if (err.name === "AbortError") errorText = "⏸️ 面试已中断";
    else if (err.message.includes("HTTP"))
      errorText = `❌ 服务器错误：${err.message}`;
    messages.value.splice(lastIndex, 1, {
      ...aiMsg,
      content: errorText,
      thinking: false,
      time: getCurrentTime(),
    });
    ElMessage.error(errorText);
  } finally {
    isStreaming.value = false;
    abortController = null;
  }
};

const startCountdown = () => {
  countdownTimer = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      clearInterval(countdownTimer);
      handleEndInterview();
    }
  }, 1000);
};

const handleEndInterview = async () => {
  if (!interviewStarted.value) return;
  interviewStarted.value = false;
  stopAllVoice();

  if (abortController) abortController.abort();
  if (countdownTimer) clearInterval(countdownTimer);
  if (timerInterval) clearInterval(timerInterval);

  try {
    ElMessage.success("面试已结束，正在生成报告...");
    const params = { chatId };
    const url = `${API.END_INTERVIEW}?${new URLSearchParams(params)}`;
    console.log("【请求】结束面试接口", {
      method: "POST",
      url,
      params,
      token: TOKEN,
    });
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const result = await res.json();
    if (result.data) {
      interviewStore.reportData = result.data;
      ElMessage.success("报告生成成功！");
    }
  } catch (err) {
    console.error("结束面试异常:", err);
  } finally {
    setTimeout(() => router.push("/report"), 1500);
  }
};

const formatCountdown = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const formatTime = (sec) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessagesRef.value)
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
  });
};

onUnmounted(() => {
  stopAllVoice();
  clearInterval(countdownTimer);
  clearInterval(timerInterval);
  if (abortController) abortController.abort();
  if (pendingAudioBlobUrl.value) URL.revokeObjectURL(pendingAudioBlobUrl.value);
  messages.value.forEach((msg) => {
    if (msg.audioUrl) URL.revokeObjectURL(msg.audioUrl);
  });
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
});
</script>
<style scoped>
.user-message .message-text {
  background: #333;
  color: #fff;
  border-radius: 8px 0 8px 8px;
  align-self: flex-end;
}

/* 语音消息容器：不显示气泡背景 */
.voice-message-container {
  display: inline-block;
  max-width: 100%;
}

/* 微信风格语音条（黑色背景，白色文字） */
.wechat-voice-message {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #333; /* 与用户消息气泡背景一致 */
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.wechat-voice-message:hover {
  opacity: 0.85;
}
.voice-icon {
  font-size: 18px;
  color: #fff; /* 白色图标 */
}
.voice-duration {
  font-size: 14px;
  color: #fff; /* 白色时长 */
  min-width: 40px;
  text-align: right;
}
.voice-wave {
  display: flex;
  align-items: center;
  gap: 2px;
}
.voice-wave span {
  width: 2px;
  height: 8px;
  background: #fff; /* 白色波形 */
  animation: wave 0.5s infinite ease alternate;
}
.voice-wave span:nth-child(2) {
  height: 12px;
  animation-delay: 0.1s;
}
.voice-wave span:nth-child(3) {
  height: 16px;
  animation-delay: 0.2s;
}
@keyframes wave {
  0% {
    transform: scaleY(0.5);
  }
  100% {
    transform: scaleY(1);
  }
}

/* 其他原有样式保持不变 */
.interview {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  font-family: "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
}
.interview-header {
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  padding: 16px 40px;
}
.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo-area {
  display: flex;
  align-items: center;
  gap: 14px;
}
.ai-avatar {
  width: 44px;
  height: 44px;
  background: #333;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ai-avatar .el-icon {
  font-size: 22px;
  color: #fff;
}
.interview-info {
  line-height: 1.3;
}
.interview-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0;
}
.interview-subtitle {
  font-size: 13px;
  color: #999;
  margin: 2px 0 0;
}
.header-tools {
  display: flex;
  align-items: center;
  gap: 16px;
}
.countdown-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}
.countdown-badge.warning {
  background: #fff5e5;
  color: #ff6600;
  animation: pulse 1s infinite;
}
.end-btn {
  border-radius: 8px;
  padding: 0 14px;
  height: 32px;
  font-size: 13px;
}
.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 8px;
}
.status-dot {
  width: 8px;
  height: 8px;
  background: #333;
  border-radius: 50%;
}
.status-text {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}
.interview-main {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 24px 40px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  max-height: calc(100vh - 80px);
  overflow: hidden;
}
.chat-container {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chat-messages {
  flex: 1;
  padding: 28px 32px;
  overflow-y: auto;
  background: #fff;
}
.message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  animation: msg 0.25s ease;
  align-items: flex-start;
}
@keyframes msg {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.ai-avatar-small,
.user-avatar-small {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ai-avatar-small {
  background: #333;
}
.user-avatar-small {
  background: #e5e5e5;
}
.ai-avatar-small .el-icon,
.user-avatar-small .el-icon {
  color: #fff;
  font-size: 18px;
}
.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.message-sender {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}
.message-time {
  font-size: 12px;
  color: #999;
}
.message-text {
  padding: 10px 14px 0;
  border-radius: 8px;
  font-size: 14px;
  width: fit-content;
  max-width: 100%;
  align-self: flex-start;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
  overflow-wrap: break-word;
}
.text-inner {
  margin: 0;
  padding: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.ai-message .message-text {
  background: #f5f5f5;
  border: 1px solid #e5e5e5;
  border-radius: 0 8px 8px 8px;
}
.user-message {
  flex-direction: row-reverse;
}
.user-message .message-text {
  background: #333;
  color: #fff;
  border-radius: 8px 0 8px 8px;
  align-self: flex-end;
}

.thinking-dots {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
}
.thinking-dots .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #999;
  animation: thinking 1.4s infinite ease-in-out;
}
.thinking-dots .dot:nth-child(2) {
  animation-delay: 0.2s;
}
.thinking-dots .dot:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes thinking {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.chat-input-area {
  padding: 20px 28px;
  background: #fff;
  border-top: 1px solid #e5e5e5;
}
.voice-input-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
}
.voice-record-button {
  width: 280px;
  height: 56px;
  border-radius: 28px;
  font-size: 18px;
  font-weight: 500;
  background: #333;
  color: #fff;
  transition: all 0.2s;
  border: none;
}
.voice-record-button:hover {
  transform: scale(1.02);
  background: #555;
}
.voice-record-button.el-button--danger {
  background: #f56c6c;
  border-color: #f56c6c;
  animation: pulse 1s infinite;
}
.voice-hint {
  font-size: 12px;
  color: #999;
  text-align: center;
}
.recording-hint {
  color: #f56c6c;
}
.text-input-area {
  width: 100%;
}
.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}
.input-center {
  flex: 1;
  min-width: 0;
}
.input-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}
.message-input {
  --el-input-border-radius: 8px;
  width: 100%;
  min-height: 44px;
}
.message-input :deep(.el-input__wrapper) {
  box-shadow: none;
  border: 1px solid #e5e5e5;
}
.send-button {
  height: 44px;
  padding: 0 24px;
  border-radius: 8px;
  font-weight: 500;
}
.voice-input-button {
  border-radius: 8px;
}

.info-panel {
  width: 310px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.panel-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  overflow: hidden;
}
.panel-header {
  padding: 16px 20px;
  background: #fafafa;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.panel-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: #333;
}
.panel-content {
  padding: 20px;
}
.progress-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #fafafa;
  border-radius: 8px;
}
.stat-icon {
  width: 36px;
  height: 36px;
  background: #333;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-icon .el-icon {
  color: #fff;
  font-size: 16px;
}
.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.stat-label {
  font-size: 12px;
  color: #999;
}
.tip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #e5e5e5;
}
.tip-item:last-child {
  border-bottom: none;
}
.tip-icon {
  width: 32px;
  height: 32px;
  background: #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tip-icon .el-icon {
  color: white;
  font-size: 16px;
}
.tip-text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}
.job-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-top: 4px;
}
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
.voice-control-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.voice-control-card h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #333;
}
.voice-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 12px;
  color: #666;
  gap: 10px;
}
.voice-row:last-child {
  margin-bottom: 0;
}
.voice-row label {
  white-space: nowrap;
}
.voice-row .el-slider {
  flex: 1;
}

/* ========== 明显的 Markdown 样式 ========== */
.text-inner :deep(h1) {
  font-size: 20px;
  font-weight: bold;
  margin: 12px 0 8px;
  color: #111;
}
.text-inner :deep(h2) {
  font-size: 18px;
  font-weight: bold;
  margin: 10px 0 6px;
  color: #222;
}
.text-inner :deep(h3) {
  font-size: 16px;
  font-weight: bold;
  margin: 8px 0 5px;
  color: #333;
}

.text-inner :deep(p) {
  margin: 0 0;
  line-height: 1.6;
}

.text-inner :deep(strong) {
  font-weight: bold;
  color: #000;
}
.text-inner :deep(em) {
  font-style: italic;
  color: #666;
}

.text-inner :deep(ul),
.text-inner :deep(ol) {
  padding-left: 1.8em;
  margin: 0.6em 0;
}
.text-inner :deep(li) {
  margin: 0.4em 0;
}

.text-inner :deep(blockquote) {
  margin: 0.8em 0;
  padding: 10px 14px;
  background: #f0f0f0;
  border-left: 4px solid #999;
  color: #555;
  border-radius: 0 4px 4px 0;
}

.text-inner :deep(code) {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  color: #c03434;
}

.text-inner :deep(pre) {
  background: #2d2d2d;
  color: #fff;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.8em 0;
}
.text-inner :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
}

@media (max-width: 1200px) {
  .info-panel {
    display: none;
  }
}
@media (max-width: 768px) {
  .interview-header {
    padding: 12px 20px;
  }
  .interview-main {
    padding: 16px 20px;
  }
  .chat-messages {
    padding: 20px;
  }
  .voice-record-button {
    width: 220px;
    height: 48px;
    font-size: 16px;
  }
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>
