<template>
  <div class="home-container">
    <!-- 顶部导航 -->
    <nav class="navbar">
      <div class="logo">AI面试平台</div>
      <div class="nav-links">
        <router-link to="/user-home" class="nav-link">首页</router-link>
        <router-link to="/interview-prepare" class="nav-link">面试准备</router-link>
        <router-link to="/aicoach" class="nav-link">ai教练</router-link>
        <router-link to="/user-question" class="nav-link">题目库</router-link>
        <router-link to="/user" class="nav-link">用户</router-link>
        <button @click="handleLogout" class="logout-btn">退出登录</button>
      </div>
    </nav>

    <!-- 轮播图区域 -->
    <div class="carousel-container">
      <div class="carousel" @mouseenter="pauseAutoPlay" @mouseleave="startAutoPlay">
        <div class="carousel-inner" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
          <div class="carousel-item" v-for="(item, index) in banners" :key="index">
            <img :src="item.image" :alt="item.title" />
            <div class="carousel-caption">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </div>
        
        <!-- 轮播指示器 -->
        <div class="carousel-indicators">
          <span 
            v-for="(item, index) in banners" 
            :key="index"
            :class="{ active: currentIndex === index }"
            @click="goToSlide(index)"
          ></span>
        </div>
        
        <!-- 左右箭头 -->
        <button class="carousel-arrow prev" @click="prevSlide">
          ❮
        </button>
        <button class="carousel-arrow next" @click="nextSlide">
          ❯
        </button>
      </div>
    </div>

    <!-- 搜索框区域 -->
    <div class="search-section">
      <h3>搜索题目</h3>
      <div class="search-wrapper">
        <input 
          v-model="searchKeyword" 
          type="text" 
          placeholder="输入题目关键词，回车搜索..." 
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch">搜索</button>
      </div>
      <p class="search-tip">例如：Vue 生命周期、MySQL 索引、Java 基础</p>
    </div>

    <!-- 客服求助 - AI 流式对话 -->
    <div class="support-section">
      <h3>🤖 客服求助</h3>
      <div class="chat-container">
        <div class="chat-messages" ref="chatRef">
          <div class="message system" v-for="msg in chatMessages" :key="msg.id">
            <p>{{ msg.content }}</p>
          </div>
          <div v-if="chatMessages.length === 0" class="empty-tip">
            点击下方按钮开始与 AI 对话，获取题目推荐或解答！
          </div>
        </div>

        <div class="input-area">
          <textarea 
            v-model="userInput" 
            placeholder="输入你的问题，例如：'给我推荐一道 Java 面试题'" 
            @keyup.enter="sendMessage"
          ></textarea>
          <button @click="sendMessage" :disabled="!userInput.trim()">发送</button>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="footer">
      <p>© 2025 AI面试平台 - 版权所有</p>
      <p>友情链接：<a href="#">链接1</a> | <a href="#">链接2</a> | <a href="#">链接3</a></p>
      <p>制作与模板设计</p>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'HomePage',
  setup() {
    const router = useRouter()
    const chatRef = ref(null)
    
    // 搜索关键词
    const searchKeyword = ref('')
    
    // 轮播图数据
    const currentIndex = ref(0)
    let autoPlayTimer = null
    
    const banners = ref([
      {
        image: 'https://picsum.photos/id/1/1200/400',
        title: 'AI创新大赛',
        description: '📢 大学生比赛通知：AI创新大赛即将开始，报名从速！'
      },
      {
        image: 'https://picsum.photos/id/2/1200/400',
        title: '校园招聘',
        description: '💼 公司招聘动态：优质企业校招岗位更新，等你来投！'
      },
      {
        image: 'https://picsum.photos/id/3/1200/400',
        title: '系统维护',
        description: '🔧 系统维护信息：定期维护通知，请合理安排使用时间'
      },
      {
        image: 'https://picsum.photos/id/4/1200/400',
        title: '面试技巧',
        description: '💡 面试技巧分享：AI面试官教你如何脱颖而出'
      }
    ])
    
    // AI 对话
    const userInput = ref('')
    const chatMessages = ref([
      { id: 1, content: '你好！我是 AI 助手，有什么问题随时问我，我会为你推荐题目并解答。' }
    ])

    // 轮播图控制
    const nextSlide = () => {
      currentIndex.value = (currentIndex.value + 1) % banners.value.length
    }
    
    const prevSlide = () => {
      currentIndex.value = (currentIndex.value - 1 + banners.value.length) % banners.value.length
    }
    
    const goToSlide = (index) => {
      currentIndex.value = index
    }
    
    const startAutoPlay = () => {
      if (autoPlayTimer) return
      autoPlayTimer = setInterval(() => {
        nextSlide()
      }, 5000) // 每5秒切换一次
    }
    
    const pauseAutoPlay = () => {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer)
        autoPlayTimer = null
      }
    }
    
    // 退出登录
    const handleLogout = () => {
      localStorage.removeItem('userToken')
      router.push('/login')
    }

    // 搜索题目
    const handleSearch = () => {
      if (!searchKeyword.value.trim()) {
        alert('请输入搜索关键词！')
        return
      }
      router.push({
        path: '/user-question',
        query: { keyword: searchKeyword.value }
      })
    }

    // AI 流式对话
    const sendMessage = async () => {
      if (!userInput.value.trim()) return
      
      chatMessages.value.push({
        id: Date.now(),
        content: userInput.value
      })
      
      const msg = userInput.value
      userInput.value = ''
      
      await nextTick(() => {
        if (chatRef.value) {
          chatRef.value.scrollTop = chatRef.value.scrollHeight
        }
      })

      setTimeout(() => {
        const replies = [
          '已收到你的问题，正在为你推荐相关题目...',
          '题目推荐：[Vue 3 响应式原理]，这是前端面试的高频题。',
          '解答：Vue 3 采用 Proxy 代理对象，实现了更高效的响应式系统。'
        ]
        chatMessages.value.push({
          id: Date.now() + 1,
          content: replies[Math.floor(Math.random() * replies.length)]
        })
        nextTick(() => {
          if (chatRef.value) {
            chatRef.value.scrollTop = chatRef.value.scrollHeight
          }
        })
      }, 800)
    }

    onMounted(() => {
      // 校验登录状态
      if (!localStorage.getItem('userToken')) {
        router.push('/login')
      }
      // 启动自动轮播
      startAutoPlay()
    })
    
    onUnmounted(() => {
      // 清理定时器
      pauseAutoPlay()
    })

    return {
      chatRef,
      searchKeyword,
      userInput,
      chatMessages,
      banners,
      currentIndex,
      handleLogout,
      handleSearch,
      sendMessage,
      nextSlide,
      prevSlide,
      goToSlide,
      startAutoPlay,
      pauseAutoPlay
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f7fa;
}

/* 导航栏 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* 轮播图容器 */
.carousel-container {
  padding: 20px 50px 0;
  background: #f5f7fa;
}
.carousel {
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.carousel-inner {
  display: flex;
  transition: transform 0.5s ease-in-out;
}
.carousel-item {
  flex-shrink: 0;
  width: 100%;
  position: relative;
}
.carousel-item img {
  width: 100%;
  height: 400px;
  object-fit: cover;
}
.carousel-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  color: white;
  padding: 30px;
  text-align: left;
}
.carousel-caption h3 {
  font-size: 28px;
  margin-bottom: 10px;
  font-weight: 600;
}
.carousel-caption p {
  font-size: 16px;
  opacity: 0.9;
}

/* 轮播指示器 */
.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}
.carousel-indicators span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all 0.3s;
}
.carousel-indicators span.active {
  width: 30px;
  border-radius: 5px;
  background: white;
}
.carousel-indicators span:hover {
  background: rgba(255,255,255,0.8);
}

/* 轮播箭头 */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.3s;
  z-index: 10;
}
.carousel-arrow:hover {
  background: rgba(0,0,0,0.8);
  transform: translateY(-50%) scale(1.1);
}
.prev {
  left: 20px;
}
.next {
  right: 20px;
}

/* 搜索区域 */
.search-section {
  padding: 40px 50px;
  text-align: center;
  background: white;
  margin: 20px 50px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.search-section h3 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}
.search-wrapper {
  display: flex;
  justify-content: center;
  gap: 10px;
  max-width: 600px;
  margin: 0 auto;
}
.search-wrapper input {
  flex: 1;
  padding: 12px 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
}
.search-wrapper input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
}
.search-wrapper button {
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s;
}
.search-wrapper button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102,126,234,0.4);
}
.search-tip {
  margin-top: 15px;
  color: #666;
  font-size: 14px;
}

/* 客服求助 */
.support-section {
  flex: 1;
  padding: 20px 50px 40px;
  background: white;
  margin: 0 50px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.support-section h3 {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}
.chat-container {
  display: flex;
  flex-direction: column;
  height: 450px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #f8f9fa;
  overflow: hidden;
}
.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
.message {
  margin-bottom: 15px;
  max-width: 80%;
}
.message.system p {
  background: white;
  padding: 12px 18px;
  border-radius: 18px;
  display: inline-block;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  margin: 0;
}
.empty-tip {
  text-align: center;
  color: #999;
  padding-top: 150px;
}
.input-area {
  display: flex;
  gap: 10px;
  padding: 15px;
  background: white;
  border-top: 1px solid #e0e0e0;
}
.input-area textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: none;
  height: 60px;
  font-family: inherit;
  font-size: 14px;
}
.input-area textarea:focus {
  outline: none;
  border-color: #667eea;
}
.input-area button {
  padding: 0 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}
.input-area button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102,126,234,0.3);
}
.input-area button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 页脚 */
.footer {
  text-align: center;
  padding: 30px;
  background: #2c3e50;
  color: #ecf0f1;
  margin-top: auto;
}
.footer a {
  color: #667eea;
  text-decoration: none;
  margin: 0 5px;
}
.footer a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
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
  .carousel-container {
    padding: 15px 20px 0;
  }
  .carousel-item img {
    height: 250px;
  }
  .carousel-caption h3 {
    font-size: 20px;
  }
  .carousel-caption p {
    font-size: 12px;
  }
  .search-section {
    padding: 25px 20px;
    margin: 15px 20px;
  }
  .support-section {
    padding: 20px;
    margin: 0 20px 20px;
  }
  .chat-container {
    height: 400px;
  }
  .footer {
    padding: 20px;
    font-size: 12px;
  }
}
</style>