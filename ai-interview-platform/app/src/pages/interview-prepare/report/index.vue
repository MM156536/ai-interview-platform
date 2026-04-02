<template>
  <div class="page-container">
    <div class="interview-report-page">
      <el-card class="report-card">
        <div class="report-header">
          <h2 class="title">面试报告</h2>
          <p class="subtitle">基于你的面试表现生成的专业分析报告</p>
        </div>

        <!-- 基本信息展示 -->
        <el-card class="base-info-card" shadow="hover">
          <el-descriptions :column="1" border label-width="85px">
            <el-descriptions-item label="应聘岗位">
              {{ reportData.jobRole || "暂无" }}
            </el-descriptions-item>
            <el-descriptions-item label="面试报告创建时间">
              {{ reportData.createTime || "暂无" }}
            </el-descriptions-item>
            <el-descriptions-item label="AI 综合评价">
              <div class="ai-summary-text">
                {{ reportData.aiSummary || "暂无评价" }}
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-row :gutter="24" class="chart-section">
          <el-col :span="14">
            <el-card class="chart-card" shadow="hover">
              <div class="chart-title">能力维度对比（所有人 vs 个人）</div>
              <div ref="lineChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="10">
            <el-card class="chart-card" shadow="hover">
              <div class="chart-title">个人能力维度分析（雷达图）</div>
              <div ref="radarChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <div class="report-footer">
          <el-button size="large" @click="goBack">返回首页</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import * as echarts from "echarts";
import { useInterviewStore } from "@/store/interview";
import { useRouter } from "vue-router";
const router = useRouter();
const interviewStore = useInterviewStore();
const TOKEN = interviewStore.token;
const reportData = ref(interviewStore.reportData || {});

const avgAllData = ref({});
const avgPersonalData = ref({});

// ====================== 【接口统一整理】只改这里 ======================

const API = interviewStore.apiConfig;
// ====================================================================

const lineChartRef = ref(null);
const radarChartRef = ref(null);
let lineChart = null;
let radarChart = null;

const goBack = () => {
  router.push("/user-home");
};

const fetchAvgAll = async () => {
  try {
    const res = await fetch(API.AVG_ALL, {
      method: "GET",
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const result = await res.json();
    if (result.data && Object.keys(result.data).length > 0) {
      avgAllData.value = result.data;
    }

    console.log("所有人平均值", avgAllData.value);
  } catch (err) {
    console.error("获取所有人平均值失败", err);
  }
};

const fetchAvgPersonal = async () => {
  try {
    const res = await fetch(API.AVG_PERSONAL, {
      method: "GET",
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const result = await res.json();
    if (result.data && Object.keys(result.data).length > 0) {
      avgPersonalData.value = result.data;
    }

    console.log("个人平均值", avgPersonalData.value);
  } catch (err) {
    console.error("获取个人平均值失败", err);
  }
};

// 初始化折线图
const initLineChart = () => {
  if (!lineChartRef.value) return;

  const dimensions = [
    "沟通能力",
    "技术深度",
    "问题解决",
    "学习能力",
    "团队协作",
    "主动性",
  ];

  const allAvg = [
    avgAllData.value.avgCommunication ?? 0,
    avgAllData.value.avgTechnicalDepth ?? 0,
    avgAllData.value.avgProblemSolving ?? 0,
    avgAllData.value.avgLearningAbility ?? 0,
    avgAllData.value.avgTeamwork ?? 0,
    avgAllData.value.avgInitiative ?? 0,
  ];

  const personalAvg = [
    avgPersonalData.value.avgCommunication ?? 0,
    avgPersonalData.value.avgTechnicalDepth ?? 0,
    avgPersonalData.value.avgProblemSolving ?? 0,
    avgPersonalData.value.avgLearningAbility ?? 0,
    avgPersonalData.value.avgTeamwork ?? 0,
    avgPersonalData.value.avgInitiative ?? 0,
  ];

  if (lineChart) lineChart.dispose();
  lineChart = echarts.init(lineChartRef.value);
  lineChart.setOption({
    tooltip: { trigger: "axis" },
    legend: { data: ["所有人平均值", "个人平均值"], bottom: 0 },
    grid: { left: "3%", right: "4%", bottom: "15%", containLabel: true },
    xAxis: { type: "category", data: dimensions },
    yAxis: { type: "value", min: 0, max: 100 },
    series: [
      {
        name: "所有人平均值",
        type: "line",
        data: allAvg,
        itemStyle: { color: "#909399" },
        smooth: true,
      },
      {
        name: "个人平均值",
        type: "line",
        data: personalAvg,
        itemStyle: { color: "#3b82f6" },
        smooth: true,
      },
    ],
  });
  lineChart.resize();
};

// 初始化雷达图
const initRadarChart = () => {
  if (!radarChartRef.value) return;

  const radar = reportData.value.radarData || {};
  const radarValues = [
    radar.communication ?? 0,
    radar.technical_depth ?? 0,
    radar.problem_solving ?? 0,
    radar.learning_ability ?? 0,
    radar.teamwork ?? 0,
    radar.initiative ?? 0,
  ];

  if (radarChart) radarChart.dispose();
  radarChart = echarts.init(radarChartRef.value);
  radarChart.setOption({
    tooltip: { trigger: "item" },
    radar: {
      radius: "70%",
      indicator: [
        { name: "沟通能力", max: 100 },
        { name: "技术深度", max: 100 },
        { name: "问题解决", max: 100 },
        { name: "学习能力", max: 100 },
        { name: "团队协作", max: 100 },
        { name: "主动性", max: 100 },
      ],
    },
    series: [
      {
        type: "radar",
        data: [{ value: radarValues, name: "个人能力" }],
        itemStyle: { color: "#3b82f6" },
        areaStyle: { opacity: 0.2 },
      },
    ],
  });
  radarChart.resize();
};

onMounted(async () => {
  await fetchAvgAll();
  await fetchAvgPersonal();
  await nextTick();

  setTimeout(() => {
    initLineChart();
    initRadarChart();
  }, 100);

  window.addEventListener("resize", () => {
    lineChart?.resize();
    radarChart?.resize();
  });
});

onUnmounted(() => {
  if (lineChart) lineChart.dispose();
  if (radarChart) radarChart.dispose();
  window.removeEventListener("resize", () => {});
});
</script>
<style>
html,
body {
  height: auto !important;
  overflow: visible !important;
  margin: 0;
  padding: 0;
}
</style>

<style scoped>
.page-container {
  width: 100%;
  height: auto;
  overflow: visible;
}
.interview-report-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9edf2 100%);
  padding: 30px;
  font-family: "Inter", system-ui, sans-serif;
  box-sizing: border-box;
}
.report-card {
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 20px;
  border: none;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.15);
  padding: 10px 20px;
}
.report-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eef2f6;
}
.title {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(120deg, #1f2b3c, #2c3e66);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
.subtitle {
  color: #5d6f83;
  font-size: 14px;
}

.base-info-card {
  margin-bottom: 24px;
  border-radius: 16px;
}
.ai-summary-text {
  line-height: 1.8;
  color: #333;
  padding: 12px 0;
  white-space: pre-wrap;
  word-break: break-all;
  text-align: justify;
  width: 100%;
  height: auto !important;
  display: block;
}

.chart-section {
  margin-bottom: 24px;
}
.chart-card {
  height: 350px;
  border-radius: 16px;
}
.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}
.chart-container {
  width: 100%;
  height: 280px;
}
.report-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px 0;
}
</style>
