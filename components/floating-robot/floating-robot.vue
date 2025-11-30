<template>
  <view class="robot-float" @click="goToAI" v-if="visible">
    <view class="robot-bubble" v-if="showBubble">
      <text>{{ currentGreeting }}</text>
    </view>
    <image src="/static/images/robot_avatar.png" mode="aspectFit" class="robot-img"></image>
  </view>
</template>

<script>
export default {
  name: 'FloatingRobot',
  data() {
    return {
      visible: true, // 控制组件是否显示
      showBubble: false,
      currentGreeting: '你好呀~',
      greetings: [
        '主人，我在呢~', 
        '有什么可以帮您？', 
        '今天天气不错呢', 
        '试试问我点什么吧', 
        '学习累了吗？休息一下',
        '随时待命中...'
      ],
      bubbleTimer: null
    }
  },
  mounted() {
    // 1. 获取当前页面栈，判断是否在 AI 助手页面
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const route = pages[pages.length - 1].route;
      // 如果当前已经是AI页面，或者登录页，就不显示悬浮球
      if (route && (route.includes('pages/ai/index') || route.includes('pages/login'))) {
        this.visible = false;
        return;
      }
    }
    
    // 2. 启动气泡循环
    this.startRobotLoop();
  },
  beforeDestroy() {
    if (this.bubbleTimer) clearInterval(this.bubbleTimer);
  },
  methods: {
    goToAI() {
      this.showBubble = false;
      uni.navigateTo({ url: '/pages/ai/index' });
    },
    startRobotLoop() {
      // 每15秒显示一次气泡
      this.bubbleTimer = setInterval(() => {
        if (!this.showBubble) {
          const randomIdx = Math.floor(Math.random() * this.greetings.length);
          this.currentGreeting = this.greetings[randomIdx];
          this.showBubble = true;
          
          // 显示3.5秒后自动消失
          setTimeout(() => {
            this.showBubble = false;
          }, 3500);
        }
      }, 15000); 
    }
  }
}
</script>

<style scoped>
.robot-float {
  position: fixed;
  right: 30rpx;
  bottom: 200rpx; /* 避开底部导航栏 */
  width: 120rpx;
  height: 120rpx;
  z-index: 9999; /* 确保层级最高 */
  animation: floatAnim 3s ease-in-out infinite;
}

.robot-img {
  width: 100%;
  height: 100%;
  /* 增加阴影让它更立体 */
  filter: drop-shadow(0 4rpx 8rpx rgba(0,0,0,0.2));
}

.robot-bubble {
  position: absolute;
  top: -80rpx;
  right: 10rpx;
  background: #fff;
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  border-bottom-right-radius: 4rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.15);
  font-size: 24rpx;
  color: #333;
  white-space: nowrap;
  animation: fadeIn 0.3s ease-out;
  pointer-events: none; /* 防止气泡遮挡点击 */
}

@keyframes floatAnim {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>