<template>
  <view class="page">
    <view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <text class="navbar-title">智慧校园</text>
      </view>
    </view>
    
    <scroll-view scroll-y class="page-content" :style="{ top: (statusBarHeight + 44) + 'px' }">
      <view class="welcome-section">
        <view class="welcome-left">
          <text class="welcome-text">你好，{{ nickName || '同学'}}</text>
          <text class="welcome-subtitle">
            {{ currentCity ? currentCity : '正在定位...' }} | 欢迎回来
          </text>
        </view>
        <view class="weather-box" @click="openWeather">
          <text class="weather-icon">{{ weather.icon }}</text>
          <view class="weather-info">
            <text class="weather-temp">{{ weather.temp }}°C</text>
            <text class="weather-type">{{ weather.type }}</text>
          </view>
        </view>
      </view>
      
      <view class="schedule-section">
        <course-schedule :readonly="true"></course-schedule>
      </view>
      
    </scroll-view>

    <view class="robot-float" @click="goToAI">
      <view class="robot-bubble" v-if="showBubble">
        <text>{{ currentGreeting }}</text>
      </view>
      <image src="/static/images/robot_avatar.png" mode="aspectFit" class="robot-img"></image>
    </view>
    <uni-popup ref="weatherPopup" type="bottom" background-color="#fff">
      <view class="weather-popup-content">
        <view class="popup-header">
          <text class="popup-title">{{ currentCity }} 天气详情</text>
          <uni-icons type="closeempty" size="24" color="#999" @click="closeWeather"></uni-icons>
        </view>
        
        <view class="today-detail-box">
          <view class="today-main">
            <text class="today-icon-large">{{ weather.icon }}</text>
            <view class="today-temp-box">
              <text class="today-temp-num">{{ weather.temp }}</text>
              <text class="today-temp-unit">°C</text>
            </view>
            <text class="today-weather-text">{{ weather.type }}</text>
          </view>
          
          <view class="today-grid">
            <view class="grid-item">
              <text class="grid-label">湿度</text>
              <text class="grid-value">{{ weather.humidity }}</text>
            </view>
            <view class="grid-item">
              <text class="grid-label">空气质量</text>
              <text class="grid-value quality-badge aqi-good">{{ weather.aqi || '良' }}</text>
            </view>
            <view class="grid-item">
              <text class="grid-label">风向</text>
              <text class="grid-value">{{ weather.wind }}</text>
            </view>
          </view>
        </view>

        <view class="forecast-section">
          <text class="section-title">未来7天预报</text>
          <scroll-view scroll-x class="forecast-scroll" show-scrollbar="false">
            <view class="forecast-list">
              <view class="forecast-item" v-for="(item, index) in futureWeather" :key="index">
                <text class="f-day">{{ item.day }}</text>
                <text class="f-date">{{ item.date }}</text>
                <text class="f-icon">{{ item.icon }}</text>
                <text class="f-type">{{ item.type }}</text>
                <text class="f-temp">{{ item.min }}°~{{ item.max }}°</text>
              </view>
            </view>
          </scroll-view>
          <text class="update-time">实况更新于: {{ weather.reportTime }}</text>
        </view>
      </view>
    </uni-popup>
	<floating-robot />
  </view>
</template>

<script>
import CourseSchedule from '@/components/course-schedule/course-schedule.vue'
import { mapGetters } from 'vuex' // 1. 引入 mapGetters

export default {
  components: {
    CourseSchedule
  },
  data() {
    return {
      statusBarHeight: 0,
      // userName: '同学',
      currentCity: '定位中...', 
      // 高德 Web服务 Key
      amapKey: '99fce6ede8b9a6aef0e79643ffc9aa6b', 
      
      // 天气数据
      weather: {
        temp: '--',
        type: '未知',
        icon: '🌥️',
        humidity: '--%',
        aqi: '良',
        wind: '--',
        reportTime: ''
      },
      // 未来七天天气数组
      futureWeather: [],
      
      // === 机器人相关数据 ===
      showBubble: false,
      currentGreeting: '你好呀~',
      // 这里可以自定义更多有趣的问候语
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
  computed: {
      ...mapGetters(['nickName'])
    },
  onLoad() {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight || 0
    
    this.loadUserInfo()
    this.initLocation()
    
    // 启动机器人气泡循环
    this.startRobotLoop()
  },
  onUnload() {
    // 页面销毁时清除定时器
    if (this.bubbleTimer) clearInterval(this.bubbleTimer)
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

    // 1. 初始化定位
    initLocation() {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.getCityByLocation(res.longitude, res.latitude);
        },
        fail: (err) => {
          console.error('定位失败:', err);
          this.currentCity = '北京市';
          this.getWeather('110101'); // 默认查北京
        }
      });
    },

    // 2. 逆地理编码
    getCityByLocation(lon, lat) {
      uni.request({
        url: 'https://restapi.amap.com/v3/geocode/regeo',
        method: 'GET',
        data: {
          key: this.amapKey,
          location: `${lon},${lat}`,
          extensions: 'base'
        },
        success: (res) => {
          if (res.data.status === '1') {
            const addressComponent = res.data.regeocode.addressComponent;
            const adcode = addressComponent.adcode;
            this.currentCity = addressComponent.district || addressComponent.city;
            this.getWeather(adcode);
          }
        },
        fail: () => {
          this.currentCity = '定位未知';
          this.generateForecast(25);
        }
      });
    },

    // 3. 获取实况天气
    getWeather(cityCode) {
      uni.request({
        url: 'https://restapi.amap.com/v3/weather/weatherInfo',
        method: 'GET',
        data: {
          key: this.amapKey,
          city: cityCode,
          extensions: 'base'
        },
        success: (res) => {
          if (res.data.status === '1' && res.data.lives.length > 0) {
            const live = res.data.lives[0];
            const currentTemp = parseInt(live.temperature);
            
            this.weather = {
              temp: live.temperature,
              type: live.weather,
              icon: this.getWeatherIcon(live.weather),
              humidity: live.humidity + '%',
              wind: `${live.winddirection}风 ${live.windpower}级`,
              aqi: '良',
              reportTime: live.reporttime
            };
            
            this.generateForecast(currentTemp, live.weather);
          }
        }
      });
    },

    // 4. 生成未来7天预报 (模拟数据)
    generateForecast(baseTemp, baseType = '晴') {
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const today = new Date();
      const list = [];
      const types = ['晴', '多云', '阴', '小雨'];
      
      for(let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i + 1); 
        
        const randomFluctuation = Math.floor(Math.random() * 7) - 3;
        const min = baseTemp + randomFluctuation - 5;
        const max = baseTemp + randomFluctuation + 5;
        const type = types[Math.floor(Math.random() * types.length)];
        
        list.push({
          day: i === 0 ? '明天' : weekDays[d.getDay()],
          date: `${d.getMonth() + 1}/${d.getDate()}`,
          type: type,
          icon: this.getWeatherIcon(type),
          min: min,
          max: max
        });
      }
      this.futureWeather = list;
    },

    getWeatherIcon(type) {
      if (type.includes('晴')) return '☀️';
      if (type.includes('云') || type.includes('阴')) return '☁️';
      if (type.includes('雨')) return '🌧️';
      if (type.includes('雪')) return '❄️';
      if (type.includes('雷')) return '⚡';
      return '🌥️';
    },

    openWeather() { this.$refs.weatherPopup.open() },
    closeWeather() { this.$refs.weatherPopup.close() },
    
    // === 机器人方法 ===
    goToAI() {
      this.showBubble = false; // 点击时先隐藏气泡
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
  padding-bottom: 120rpx;
}

/* 欢迎卡片 */
.welcome-section {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-left {
  flex: 1;
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

/* 天气小卡片 */
.weather-box {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.5);
  padding: 15rpx 25rpx;
  border-radius: 50rpx;
}

.weather-box:active {
  opacity: 0.8;
  transform: scale(0.98);
}

.weather-icon {
  font-size: 56rpx;
  margin-right: 15rpx;
}

.weather-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.weather-temp {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  line-height: 1;
  margin-bottom: 4rpx;
}

.weather-type {
  font-size: 22rpx;
  color: #666;
}

.schedule-section {
  margin-bottom: 20rpx;
}

/* === 机器人样式 === */
.robot-float {
  position: fixed;
  right: 30rpx;
  bottom: 200rpx; /* 避开底部导航栏 */
  width: 120rpx;
  height: 120rpx;
  z-index: 9999; /* 确保在最上层 */
  
  /* 浮动动画 */
  animation: floatAnim 3s ease-in-out infinite;
  
  /* 红色调试背景 (如果你图片没加载出来，至少能看到红圈) */
  /* background-color: rgba(255,0,0,0.1); */
}

.robot-img {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4rpx 8rpx rgba(0,0,0,0.2));
}

.robot-bubble {
  position: absolute;
  top: -80rpx;
  right: 10rpx;
  background: #fff;
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  border-bottom-right-radius: 4rpx; /* 让气泡角指向机器人 */
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.15);
  font-size: 24rpx;
  color: #333;
  white-space: nowrap;
  animation: fadeIn 0.3s ease-out;
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

/* --- 弹窗样式 --- */
.weather-popup-content {
  background-color: #fff;
  border-radius: 30rpx 30rpx 0 0;
  padding: 30rpx;
  min-height: 60vh;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.popup-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.today-detail-box {
  background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
  border-radius: 24rpx;
  padding: 40rpx;
  color: #fff;
  margin-bottom: 40rpx;
  box-shadow: 0 10rpx 20rpx rgba(142, 197, 252, 0.4);
}

.today-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}

.today-icon-large {
  font-size: 100rpx;
  margin-bottom: 10rpx;
}

.today-temp-box {
  display: flex;
  align-items: flex-start;
}

.today-temp-num {
  font-size: 100rpx;
  font-weight: bold;
  line-height: 1;
}

.today-temp-unit {
  font-size: 40rpx;
  margin-top: 20rpx;
}

.today-weather-text {
  font-size: 32rpx;
  margin-top: 10rpx;
}

.today-grid {
  display: flex;
  justify-content: space-around;
  border-top: 1rpx solid rgba(255,255,255,0.3);
  padding-top: 30rpx;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.grid-label {
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
  margin-bottom: 10rpx;
}

.grid-value {
  font-size: 28rpx;
  font-weight: bold;
}

.quality-badge {
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}
.aqi-good { background-color: #4CAF50; }

.forecast-section {
  margin-top: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.forecast-scroll {
  width: 100%;
  white-space: nowrap;
}

.forecast-list {
  display: flex;
  padding-bottom: 20rpx;
}

.forecast-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 30rpx;
  background-color: #f8f8f8;
  padding: 20rpx;
  border-radius: 16rpx;
  min-width: 140rpx;
}

.f-day { font-size: 28rpx; color: #333; font-weight: bold; margin-bottom: 6rpx; }
.f-date { font-size: 22rpx; color: #999; margin-bottom: 20rpx; }
.f-icon { font-size: 48rpx; margin-bottom: 10rpx; }
.f-type { font-size: 24rpx; color: #666; margin-bottom: 6rpx; }
.f-temp { font-size: 24rpx; color: #333; font-weight: bold; }

.update-time {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: #999;
  margin-top: 30rpx;
  margin-bottom: 20rpx;
}
</style>