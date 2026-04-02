<template>
  <div class="file-manage">
    <div class="left-panel" :class="{ shrink: previewVisible }">
      <div class="operate-bar">
        <el-button type="primary" @click="triggerFileInput">新增</el-button>
        <template v-if="!batchMode">
          <el-button @click="enterBatchMode">批量删除</el-button>
        </template>
        <template v-else>
          <el-button
            type="danger"
            @click="confirmBatchDelete"
            :disabled="selectedIds.length === 0"
          >
            确认删除
          </el-button>
          <el-button @click="exitBatchMode">取消</el-button>
        </template>

        <!-- 搜索 -->
        <el-input
          v-model="searchKey"
          placeholder="搜索文件名 / ID"
          style="width: 240px"
          @keyup.enter="handleSearch"
        />
        <el-button @click="handleSearch" type="primary">搜索</el-button>
      </div>

      <el-table
        :data="showList"
        border
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          v-if="batchMode"
          type="selection"
          width="50"
          align="center"
        />

        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="文件名" prop="fileName" />
        <el-table-column label="大小(KB)" width="120">
          <template #default="scope">
            {{ (scope.row.fileSize / 1024).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="页数" width="100" prop="totalPages" />
        <el-table-column label="上传时间" width="180" prop="uploadTime" />

        <el-table-column label="操作" width="260">
          <template #default="scope">
            <el-button size="small" @click="handlePreview(scope.row)"
              >预览</el-button
            >
            <el-button size="small" @click="handleEdit(scope.row)"
              >修改</el-button
            >
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          size="small"
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 右侧预览 -->
    <div class="right-panel" :class="{ active: previewVisible }">
      <div class="preview-header">
        <h3>预览：{{ currentFile?.fileName }}</h3>
        <el-button type="text" class="close-btn" @click="closePreview"
          >×</el-button
        >
      </div>
      <div class="preview-content">
        <pre v-if="currentType === 'txt'">{{ previewContent }}</pre>
        <embed
          v-if="currentType === 'pdf'"
          :src="currentFile?.fileUrl"
          type="application/pdf"
          width="100%"
          height="100%"
        />
      </div>
    </div>

    <el-dialog
      v-model="editVisible"
      :title="isEdit ? '修改文件' : '新增文件'"
      width="500px"
    >
      <el-form label-width="80px">
        <el-form-item label="ID" v-if="isEdit">
          <el-input v-model.number="editForm.id" disabled />
        </el-form-item>

        <el-form-item label="文件名">
          <el-input v-model="editForm.fileName" readonly />
        </el-form-item>

        <el-form-item label="选择文件">
          <input
            type="file"
            accept=".pdf,.txt"
            @change="handleReplaceFile"
            class="custom-file-input"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmEdit">确认提交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

// 预览
const previewVisible = ref(false);
const currentFile = ref(null);
const currentType = ref("");
const previewContent = ref("");

// 编辑弹窗
const editVisible = ref(false);
const isEdit = ref(false);
const editForm = ref({});
const selectedFile = ref(null);

// 搜索
const searchKey = ref("");

// 文件列表
const fileList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(5);
const loading = ref(false);

// 批量删除
const batchMode = ref(false);
const selectedIds = ref([]);

// Mock接口
const BASE = "http://127.0.0.1:4523/m1/7900134-7650835-default/admin/resume";

onMounted(() => {
  getList();
});

// 获取列表
const getList = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      keyword: searchKey.value,
      page: currentPage.value,
      size: pageSize.value,
    });

    const res = await fetch(`${BASE}/list?${params}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const result = await res.json();
    console.log("获取列表", result);

    fileList.value = result.data?.records || [];
    total.value = result.data?.total || 0;
    exitBatchMode();
  } catch (err) {
    console.error("获取列表失败", err);
  } finally {
    loading.value = false;
  }
};

// 分页切换
const handlePageChange = (val) => {
  currentPage.value = val;
  getList();
};

const showList = computed(() => fileList.value);

// 搜索
const handleSearch = () => {
  getList();
};

// 预览
const handlePreview = (item) => {
  currentFile.value = item;
  previewVisible.value = true;
  const name = (item.fileName || "").toLowerCase();

  if (name.endsWith(".txt")) {
    currentType.value = "txt";
    previewContent.value = "加载中...";
    fetch(item.fileUrl)
      .then((res) => {
        if (!res.ok) throw new Error("文件加载失败");
        return res.text();
      })
      .then((text) => {
        previewContent.value = text;
      })
      .catch((err) => {
        previewContent.value = "加载失败，请稍后重试";
      });
  } else {
    currentType.value = "pdf";
  }
};

const closePreview = () => {
  previewVisible.value = false;
  currentFile.value = null;
};

// 新增
const triggerFileInput = () => {
  editForm.value = { id: "", fileName: "", fileUrl: "" };
  selectedFile.value = null;
  isEdit.value = false;
  editVisible.value = true;
};

// 修改
const handleEdit = (item) => {
  editForm.value = { ...item };
  selectedFile.value = null;
  isEdit.value = true;
  editVisible.value = true;
};

// 选择文件
const handleReplaceFile = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext !== "pdf" && ext !== "txt") {
    ElMessage.warning("仅支持 PDF / TXT");
    e.target.value = "";
    return;
  }

  selectedFile.value = file;
  editForm.value.fileName = file.name;
};

// 上传请求
const confirmEdit = async () => {
  if (!selectedFile.value) {
    ElMessage.warning("请选择文件");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile.value);

  try {
    const res = await fetch(`${BASE}/load`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const result = await res.json();
      console.log("上传响应", result);

      currentPage.value = 1;
      await getList();
      editVisible.value = false;
      ElMessage.success(result.data || "上传成功");
    } else {
      const errorText = await res.text();
      ElMessage.error(`请求失败: ${res.status} ${errorText}`);
    }
  } catch (err) {
    ElMessage.error("网络错误或请求失败");
  }
};

// 单条删除
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm("确定删除？", "提示", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    });
  } catch {
    return; // 取消删除
  }

  try {
    const res = await fetch(`${BASE}/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, //记得带请求头
      body: JSON.stringify({ ids: [id] }),
    });

    if (res.ok) {
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
      console.log("删除响应", data);

      await getList();
      if (fileList.value.length === 0 && currentPage.value > 1) {
        currentPage.value--;
        await getList();
      }
      closePreview();
      ElMessage.success(
        typeof data === "object" ? data.msg || data.data || "删除成功" : data,
      );
    } else {
      const errorText = await res.text();
      ElMessage.error(`删除失败: ${res.status} ${errorText}`);
    }
  } catch (err) {
    ElMessage.error("网络错误或请求失败");
  }
};

// 批量模式
const enterBatchMode = () => {
  batchMode.value = true;
  selectedIds.value = [];
};
const exitBatchMode = () => {
  batchMode.value = false;
  selectedIds.value = [];
};

const handleSelectionChange = (val) => {
  selectedIds.value = val.map((item) => item.id);
};

// 批量删除
const confirmBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning("请先选择要删除的文件");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${selectedIds.value.length} 个文件吗？`,
      "提示",
      {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      },
    );
  } catch {
    return; // 取消删除
  }

  try {
    const res = await fetch(`${BASE}/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds.value }),
    });

    if (res.ok) {
      // 删除成功后立即关闭预览（如果当前预览的文件正好被删除，避免显示失效内容）
      closePreview();

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
      console.log("删除响应", data);

      await getList();
      if (fileList.value.length === 0 && currentPage.value > 1) {
        currentPage.value--;
        await getList();
      }
      ElMessage.success(
        typeof data === "object" ? data.msg || data.data || "删除成功" : data,
      );
    } else {
      const errorText = await res.text();
      ElMessage.error(`批量删除失败: ${res.status} ${errorText}`);
    }
  } catch (err) {
    ElMessage.error("网络错误或请求失败");
  }
};
</script>

<style scoped>
/* ===== 全局变量 ===== */
.file-manage {
  --primary-color: #4361ee;
  --success-color: #06d6a0;
  --danger-color: #ef476f;
  --warning-color: #ffd166;
  --text-primary: #2b2d42;
  --text-secondary: #6c757d;
  --bg-light: #f8f9fa;
  --border-light: #e9ecef;
  --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --radius-md: 12px;
  --radius-lg: 16px;
  --transition: all 0.25s ease;
}

/* ===== 主容器：全屏自适应 ===== */
.file-manage {
  width: 100vw;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  gap: 20px;
  background: linear-gradient(145deg, #f1f5f9 0%, #e9eff5 100%);
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
  color: var(--text-primary);
}

/* ===== 左侧面板 ===== */
.left-panel {
  flex: 1;
  min-width: 300px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-md);
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255,255,255,0.5);
}
.left-panel.shrink {
  flex: 0 0 40%;
}

/* ===== 操作栏 ===== */
.operate-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* ===== 表格 ===== */
:deep(.el-table) {
  flex: 1;
  border: none !important;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

/* ===== 分页 ===== */
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

/* ===== 右侧预览面板 ===== */
.right-panel {
  flex: 0;
  opacity: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-lg);
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255,255,255,0.5);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  pointer-events: none;
}
.right-panel.active {
  flex: 1;
  opacity: 1;
  padding: 20px;
  pointer-events: all;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--border-light);
}
.preview-content {
  flex: 1;
  background: var(--bg-light);
  padding: 16px;
  border-radius: var(--radius-md);
  overflow-y: auto;
}

pre {
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}
embed {
  border: none;
  border-radius: var(--radius-md);
  width: 100%;
  height: 100%;
}

/* ===== 按钮 & 弹窗 美化（不影响功能） ===== */
:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: var(--transition);
}
:deep(.el-button--primary) {
  background: var(--primary-color);
}
:deep(.el-button--danger) {
  background: var(--danger-color);
}
:deep(.el-input__wrapper) {
  border-radius: 8px;
}

.custom-file-input {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  text-align: center;
  line-height: 38px;
  cursor: pointer;
}

/* 滚动条 */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}
</style>