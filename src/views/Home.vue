<template>
  <div class="home">
    <header class="header">
      <div class="header-left">
        <div class="logo">
          <img src="/logo.png" alt="中草药识别系统" />
        </div>
        <h1>中草药识别系统</h1>
      </div>
      <div class="user-info">
        <img v-if="userStore.user?.avatar" :src="userStore.user.avatar" alt="头像" class="avatar" />
        <div v-else class="avatar">{{ userStore.user?.username.charAt(0).toUpperCase() }}</div>
        <span class="username">{{ userStore.user?.username }}</span>
        <router-link v-if="userStore.user?.role === 'admin'" to="/admin/herbs" class="btn-profile">管理后台</router-link>
        <router-link to="/profile" class="btn-profile">个人中心</router-link>
        <button @click="handleLogout" class="btn-logout" title="退出登录">退出</button>
      </div>
    </header>

    <main class="main">
      <div class="content-wrapper">
        <div class="hero-section">
          <div class="hero-text">
            <h2>中草药识别系统</h2>
            <p>基于人工智能的中草药识别平台，帮助您快速准确地识别各类中草药</p>
            <div class="hero-actions">
              <router-link to="/recognize" class="btn-primary">拍照识别</router-link>
              <router-link to="/herbs" class="btn-secondary">药材百科</router-link>
              <router-link to="/history" class="btn-secondary">历史记录</router-link>
            </div>
          </div>
          <div class="hero-carousel">
            <div class="carousel-container" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
              <div v-for="(slide, index) in slides" :key="index" class="carousel-slide">
                <div class="slide-image" :style="{ backgroundImage: `url(${slide.image})` }">
                  <div class="slide-overlay">
                    <h3>{{ slide.name }}</h3>
                    <p>{{ slide.category }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="carousel-dots">
              <span
                v-for="(_, index) in slides"
                :key="index"
                :class="['dot', { active: index === currentSlide }]"
                @click="currentSlide = index"
              ></span>
            </div>
          </div>
        </div>

        <div class="features-section">
          <h3>核心功能</h3>
          <div class="features">
            <router-link to="/recognize" class="feature-card">
              <div class="feature-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="48" rx="12" fill="#10b981" opacity="0.1"/>
                  <rect x="14" y="14" width="20" height="20" rx="4" stroke="#10b981" stroke-width="2"/>
                  <circle cx="24" cy="24" r="4" fill="#10b981"/>
                </svg>
              </div>
              <h4>拍照识别</h4>
              <p>上传药材照片，AI 智能识别品种和功效</p>
              <span class="feature-link">立即使用 →</span>
            </router-link>
            <router-link to="/herbs" class="feature-card">
              <div class="feature-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="48" rx="12" fill="#06b6d4" opacity="0.1"/>
                  <path d="M16 18H32M16 24H32M16 30H26" stroke="#06b6d4" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <h4>药材百科</h4>
              <p>详细了解每种药材的功效与用法用量</p>
              <span class="feature-link">浏览全部 →</span>
            </router-link>
            <router-link to="/history" class="feature-card">
              <div class="feature-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="48" rx="12" fill="#f59e0b" opacity="0.1"/>
                  <path d="M18 16H30M18 24H30M18 32H26" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <h4>历史记录</h4>
              <p>随时查看过往的识别记录和结果</p>
              <span class="feature-link">查看历史 →</span>
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const currentSlide = ref(0)
let timer: number | null = null

const slides = ref([
  { name: '人参', category: '补气药', image: 'dist/danggui.png' },
  { name: '枸杞', category: '补阴药', image: 'dist/gouqi.png' },
  { name: '当归', category: '补血药', image: 'dist/danggui.png' },
])

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
}

function startAutoPlay() {
  timer = window.setInterval(nextSlide, 4000)
}

function stopAutoPlay() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: var(--bg-secondary);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.header h1 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.nav {
  display: flex;
  gap: 8px;
}

.nav-item {
  padding: 10px 18px;
  color: var(--text-secondary);
  border-radius: var(--radius);
  transition: all 0.2s;
  font-weight: 500;
}

.nav-item:hover {
  background: var(--bg-tertiary);
  color: var(--primary-color);
}

.nav-item.router-link-active {
  background: rgba(16, 185, 129, 0.1);
  color: var(--primary-color);
}

.nav-item.admin {
  color: var(--warning-color);
}

.nav-item.admin.router-link-active {
  background: rgba(245, 158, 11, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  object-fit: cover;
}

.username {
  color: var(--text-primary);
  font-weight: 500;
}

.btn-profile {
  padding: 8px 16px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  color: var(--primary-color);
  text-decoration: none;
  transition: all 0.2s;
}

.btn-profile:hover {
  background: rgba(16, 185, 129, 0.2);
}

.btn-logout {
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #fef2f2;
  border-color: var(--danger-color);
  color: var(--danger-color);
}

.main {
  padding: 0;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
}

.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
  margin-bottom: 64px;
}

.hero-text h2 {
  font-size: 42px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 16px;
  line-height: 1.2;
}

.hero-text p {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: 32px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.btn-primary {
  padding: 14px 32px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  color: #fff;
  text-decoration: none;
  border-radius: var(--radius);
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  padding: 14px 32px;
  background: var(--bg-primary);
  color: var(--text-primary);
  text-decoration: none;
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-secondary:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.hero-carousel {
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.carousel-container {
  display: flex;
  transition: transform 0.5s ease;
}

.carousel-slide {
  min-width: 100%;
  height: 360px;
}

.slide-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
}

.slide-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: #fff;
}

.slide-overlay h3 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px;
}

.slide-overlay p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.carousel-dots {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.dot.active {
  background: #fff;
  width: 24px;
  border-radius: 5px;
}

.features-section {
  text-align: center;
}

.features-section h3 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 40px;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.feature-card {
  display: block;
  padding: 40px 32px;
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  margin-bottom: 20px;
}

.feature-card h4 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.feature-card p {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 20px;
  line-height: 1.6;
}

.feature-link {
  display: inline-block;
  font-size: 15px;
  font-weight: 600;
  color: var(--primary-color);
}

@media (max-width: 900px) {
  .hero-section {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .hero-text h2 {
    font-size: 32px;
  }

  .hero-carousel .carousel-slide {
    height: 280px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 12px 16px;
  }

  .nav {
    display: none;
  }

  .content-wrapper {
    padding: 24px 16px;
  }

  .hero-text h2 {
    font-size: 28px;
  }

  .hero-actions {
    flex-direction: column;
  }

  .features {
    grid-template-columns: 1fr;
  }
}
</style>
