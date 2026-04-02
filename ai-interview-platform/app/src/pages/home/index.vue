<template>
  <!-- 外层全屏容器 -->
  <div class="container">
    <!-- 导航栏：新增退出登录按钮 -->
    <div class="nav-links">
      
      <router-link to="/question" class="nav-item">题目</router-link>
      <router-link to="/resume" class="nav-item">简历</router-link>
      <!-- 退出登录按钮 -->
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </div>
    <!-- 图表区域：自适应剩余空间 -->
    <div class="charts-wrapper">
      <!-- 用户趋势折线图 -->
      <div class="chart-item">
        <div ref="echartLine" class="chart-container"></div>
      </div>
      <!-- 热门岗位饼图 -->
      <div class="chart-item">
        <div ref="echartPie" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, nextTick } from "vue";
import { useRouter } from "vue-router"; // 新增：引入路由
import * as echarts from "echarts";

const router = useRouter(); // 初始化路由

const API_LINE =
  "http://127.0.0.1:4523/m1/7900134-7650835-default/admin/homePage/userTrend";
const API_PIE =
  "http://127.0.0.1:4523/m1/7900134-7650835-default/admin/homePage/hotPosition";

const echartLine = ref(null);
const echartPie = ref(null);

let chartLine = null;
let chartPie = null;
let resizeOb = null;

// 折线图配置
const lineOptions = reactive({
  title: {
    text: "用户增长趋势",
    left: "center",
    textStyle: { fontSize: 16, fontWeight: 600 },
  },
  tooltip: { trigger: "axis" },
  xAxis: {
    type: "category",
    data: [],
    axisLine: { lineStyle: { color: "#17b3a3" } },
  },
  yAxis: [{ type: "value", axisLine: { lineStyle: { color: "#17b3a3" } } }],
  color: ["#2ec7c9"],
  series: [],
});

// 饼图配置
const pieOptions = reactive({
  title: {
    text: "面试热度分布",
    left: "center",
    textStyle: { fontSize: 16, fontWeight: 600 },
  },
  tooltip: { trigger: "item" },
  legend: { orient: "vertical", left: 10 }, // 优化图例位置
  color: ["#0f78f4", "#dd536b", "#9462e5", "#a6a6a6", "#e1bb22"],
  series: [
    {
      type: "pie",
      label: {
        formatter: "{d}%",
        fontSize: 14,
      },
    },
  ],
});

// 新增：退出登录逻辑
const handleLogout = () => {
  // 1. 确认退出
  if (confirm("确定要退出登录吗？")) {
    // 2. 清除 localStorage 里的 token
    localStorage.removeItem("token");
    // 3. 销毁图表（避免内存泄漏）
    chartLine?.dispose();
    chartPie?.dispose();
    resizeOb?.disconnect();
    // 4. 跳回登录页
    router.push("/login");
    // 5. 提示退出成功
    alert("退出登录成功！");
  }
};

// 初始化（增加DOM加载等待，优化图表自适应）
onMounted(async () => {
  await nextTick(); // 等待DOM渲染完成
  if (!echartLine.value || !echartPie.value) return;

  // 初始化图表
  chartLine = echarts.init(echartLine.value);
  chartPie = echarts.init(echartPie.value);

  try {
    const resLine = await fetch(API_LINE);
    const dataLine = await resLine.json();
    lineOptions.xAxis.data = dataLine.data?.map((item) => item.date) || [];
    lineOptions.series = [
      {
        name: "用户量",
        data: dataLine.data?.map((item) => item.count) || [],
        type: "line",
        smooth: true,
      },
    ];

    const resPie = await fetch(API_PIE);
    const dataPie = await resPie.json();
    const pieData = dataPie.data?.map((item) => ({
      name: item.jobRole,
      value: item.count,
    })) || [];
    pieOptions.series[0].data = pieData;
  } catch (err) {
    console.error("接口请求失败", err);
    // 接口失败时用模拟数据，避免图表空白
    lineOptions.xAxis.data = ["1月", "2月", "3月", "4月", "5月"];
    lineOptions.series = [{ name: "用户量", data: [120, 200, 150, 280, 350], type: "line", smooth: true }];
    pieOptions.series[0].data = [{ name: "前端", value: 30 }, { name: "后端", value: 50 }, { name: "测试", value: 20 }];
  }

  chartLine.setOption(lineOptions);
  chartPie.setOption(pieOptions);

  // 监听容器大小变化，图表自适应
  resizeOb = new ResizeObserver(() => {
    chartLine?.resize();
    chartPie?.resize();
  });
  resizeOb.observe(echartLine.value);
  resizeOb.observe(echartPie.value);
});

onUnmounted(() => {
  resizeOb?.disconnect();
  chartLine?.dispose();
  chartPie?.dispose();
});
</script>

<style scoped>
/* 全屏容器：占满整个浏览器窗口 */
.container {
  width: 100vw;
  min-height: 100vh;
  background-color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止滚动条 */
}

/* 导航栏样式 */
.nav-links {
  display: flex;
  gap: 20px;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
  background-color: #fff;
  align-items: center; /* 垂直居中 */
  justify-content: space-between; /* 按钮靠右 */
}

/* 导航项容器（把按钮分开） */
.nav-links > div:first-of-type {
  display: flex;
  gap: 20px;
}

.nav-item {
  text-decoration: none;
  color: #333;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-item:hover {
  background-color: #f5f5f5;
  color: #2ec7c9;
}

/* 退出登录按钮样式 */
.logout-btn {
  padding: 6px 16px;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-left: auto; /* 靠右显示 */
}

.logout-btn:hover {
  background-color: #ff7875;
}

/* 图表区域：占满导航栏下方所有空间 */
.charts-wrapper {
  flex: 1; /* 关键：占满剩余高度 */
  padding: 20px;
  display: flex;
  gap: 20px;
  min-height: 0; /* 解决flex子元素高度溢出问题 */
}

/* 单个图表项：平分宽度，自适应高度 */
.chart-item {
  flex: 1;
  min-width: 400px; /* 最小宽度，防止挤变形 */
  display: flex;
  flex-direction: column;
}

/* 图表容器：占满父元素 */
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 400px; /* 最小高度，保证图表显示 */
}
</style>