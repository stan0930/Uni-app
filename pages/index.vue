<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <text class="navbar-title">智慧校园</text>
      </view>
    </view>
    
    <!-- 页面内容 -->
    <scroll-view scroll-y class="page-content" :style="{ top: (statusBarHeight + 44) + 'px' }">
      <!-- 欢迎区域 -->
      <view class="welcome-section">
        <text class="welcome-text">你好，{{ userName }}</text>
        <text class="welcome-subtitle">欢迎回来！</text>
      </view>
      
      <!-- 课表组件 -->
      <view class="schedule-section">
        <course-schedule></course-schedule>
      </view>
      
      <!-- 快捷功能入口 -->
      <view class="quick-actions">
        <view class="action-card" @click="goToCircle">
          <text class="action-icon">📱</text>
          <text class="action-name">校园圈子</text>
        </view>
        <view class="action-card" @click="goToAI">
          <text class="action-icon">🤖</text>
          <text class="action-name">AI助手</text>
        </view>
        <view class="action-card" @click="goToTodo">
          <text class="action-icon">🏃</text>
          <text class="action-name">跑腿代办</text>
        </view>
        <view class="action-card" @click="goToMine">
          <text class="action-icon">👤</text>
          <text class="action-name">我的</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import CourseSchedule from '@/components/course-schedule/course-schedule.vue'

export default {
  components: {
    CourseSchedule
  },
  data() {
    return {
      statusBarHeight: 0,
      userName: '同学'
    }
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight || 0
    
    // 获取用户信息
    this.loadUserInfo()
  },
  methods: {
    loadUserInfo() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo) {
          const user = JSON.parse(userInfo)
          this.userName = user.nickName || user.userName || '同学'
        }
      } catch (e) {
        console.error('加载用户信息失败', e)
      }
    },
    goToCircle() {
      uni.switchTab({ url: '/pages/circle/index' })
    },
    goToAI() {
      uni.switchTab({ url: '/pages/ai/index' })
    },
    goToTodo() {
      uni.switchTab({ url: '/pages/todo/index' })
    },
    goToMine() {
      uni.switchTab({ url: '/pages/mine/index' })
    }
  }
}
</script>

<style scoped>
.page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.navbar-content {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 30rpx;
}

.navbar-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.page-content {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx;
  padding-bottom: 120rpx; /* 增加底部padding，避免被TabBar遮挡 */
}

.welcome-section {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}

.welcome-text {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.welcome-subtitle {
  display: block;
  font-size: 28rpx;
  color: #666;
}

.schedule-section {
  margin-bottom: 20rpx;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30rpx 20rpx;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16rpx;
  transition: transform 0.2s;
}

.action-card:active {
  transform: scale(0.95);
}

.action-icon {
  font-size: 48rpx;
  margin-bottom: 10rpx;
}

.action-name {
  font-size: 24rpx;
  color: #333;
  text-align: center;
}
</style>
