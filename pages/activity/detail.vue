<template>
  <view class="detail-page">
    <scroll-view scroll-y class="detail-content">
      <!-- 活动海报/封面 -->
      <view class="activity-header">
        <view class="header-bg"></view>
        <view class="header-content">
          <text class="activity-name">{{ activity.activityName }}</text>
          <view :class="'status-badge status-' + activity.status">
            {{ getStatusText(activity.status) }}
          </view>
        </view>
      </view>

      <!-- 活动信息 -->
      <view class="info-section">
        <view class="info-item">
          <uni-icons type="calendar" size="20" color="#546e7a"></uni-icons>
          <view class="info-content">
            <text class="info-label">活动时间</text>
            <text class="info-value">{{ formatTime(activity.activityTime) }}</text>
          </view>
        </view>

        <view class="info-item">
          <uni-icons type="location" size="20" color="#546e7a"></uni-icons>
          <view class="info-content">
            <text class="info-label">活动地点</text>
            <text class="info-value">{{ activity.location || '待定' }}</text>
          </view>
        </view>

        <view class="info-item">
          <uni-icons type="person" size="20" color="#546e7a"></uni-icons>
          <view class="info-content">
            <text class="info-label">主办方</text>
            <text class="info-value">{{ activity.organizer || '校园社团' }}</text>
          </view>
        </view>

        <view class="info-item">
          <uni-icons type="staff" size="20" color="#546e7a"></uni-icons>
          <view class="info-content">
            <text class="info-label">已报名</text>
            <text class="info-value">{{ activity.participantCount || 0 }} 人</text>
          </view>
        </view>
      </view>

      <!-- 活动描述 -->
      <view class="description-section">
        <text class="section-title">活动详情</text>
        <text class="description-text">{{ activity.description || '暂无详情' }}</text>
      </view>

      <!-- 底部占位 -->
      <view style="height: 120rpx;"></view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <button 
        v-if="activity.status === '0'" 
        class="action-btn primary"
        @click="handleEnroll"
      >
        立即报名
      </button>
      <button 
        v-else-if="activity.status === '1'" 
        class="action-btn"
        disabled
      >
        活动进行中
      </button>
      <button 
        v-else 
        class="action-btn"
        disabled
      >
        活动已结束
      </button>
    </view>
  </view>
</template>

<script>
import { getActivity } from '@/api/campus/activity'

export default {
  data() {
    return {
      activityId: null,
      activity: {}
    }
  },
  onLoad(options) {
    this.activityId = options.id
    if (this.activityId) {
      this.getDetail()
    }
  },
  methods: {
    // 获取活动详情
    getDetail() {
      getActivity(this.activityId).then(response => {
        this.activity = response.data
      })
    },

    // 报名活动
    handleEnroll() {
      uni.showModal({
        title: '确认报名',
        content: `确定要报名参加"${this.activity.activityName}"吗？`,
        success: (res) => {
          if (res.confirm) {
            // 这里简化处理，实际应该调用报名API
            // 目前只是更新本地参与人数
            uni.showToast({
              title: '报名成功',
              icon: 'success'
            })
            this.activity.participantCount = (this.activity.participantCount || 0) + 1
          }
        }
      })
    },

    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return '时间待定'
      const date = new Date(timeStr)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      return `${year}年${month}月${day}日 ${hour}:${minute}`
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        '0': '报名中',
        '1': '进行中',
        '2': '已结束',
        '3': '已取消'
      }
      return statusMap[status] || '未知'
    }
  }
}
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.detail-content {
  height: calc(100vh - 100rpx);
}

.activity-header {
  position: relative;
  height: 400rpx;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-content {
  position: relative;
  height: 100%;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.activity-name {
  font-size: 44rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20rpx;
  line-height: 1.4;
}

.status-badge {
  align-self: flex-start;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: bold;
}

.status-0 {
  background-color: rgba(76, 175, 80, 0.9);
  color: #fff;
}

.status-1 {
  background-color: rgba(33, 150, 243, 0.9);
  color: #fff;
}

.status-2, .status-3 {
  background-color: rgba(255, 255, 255, 0.9);
  color: #666;
}

.info-section {
  background-color: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
}

.info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30rpx;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-content {
  flex: 1;
  margin-left: 20rpx;
}

.info-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.info-value {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.description-section {
  background-color: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.description-text {
  display: block;
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.action-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  background-color: #f5f5f5;
  color: #999;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.action-btn.primary:active {
  opacity: 0.9;
}
</style>
