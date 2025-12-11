<template>
  <view class="activity-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <uni-search-bar 
        v-model="queryParams.activityName" 
        placeholder="搜索活动名称"
        @confirm="handleSearch"
        @clear="handleClear"
      ></uni-search-bar>
    </view>

    <!-- 活动列表 -->
    <scroll-view 
      scroll-y 
      class="activity-list"
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view 
        v-for="item in activityList" 
        :key="item.activityId" 
        class="activity-card"
        @click="goToDetail(item.activityId)"
      >
        <view class="card-header">
          <text class="activity-title">{{ item.activityName }}</text>
          <view :class="'status-tag status-' + item.status">
            {{ getStatusText(item.status) }}
          </view>
        </view>
        
        <view class="card-content">
          <view class="info-row">
            <uni-icons type="location" size="16" color="#999"></uni-icons>
            <text class="info-text">{{ item.location || '地点待定' }}</text>
          </view>
          <view class="info-row">
            <uni-icons type="calendar" size="16" color="#999"></uni-icons>
            <text class="info-text">{{ formatDate(item.activityTime) }}</text>
          </view>
          <view class="info-row">
            <uni-icons type="person" size="16" color="#999"></uni-icons>
            <text class="info-text">已报名 {{ item.participantCount || 0 }} 人</text>
          </view>
        </view>
        
        <view class="card-footer">
          <text class="organizer">主办：{{ item.organizer || '校园社团' }}</text>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="loading-more" v-if="loading">
        <uni-load-more :status="loadingStatus"></uni-load-more>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && activityList.length === 0" class="empty-state">
        <image src="/static/images/empty.png" mode="aspectFit" class="empty-image"></image>
        <text class="empty-text">暂无活动</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { listActivity } from '@/api/campus/activity'

export default {
  data() {
    return {
      activityList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        activityName: ''
      },
      total: 0,
      loading: false,
      refreshing: false,
      loadingStatus: 'more' // more | loading | noMore
    }
  },
  onLoad() {
    this.getList()
  },
  methods: {
    // 获取活动列表
    getList() {
      this.loading = true
      this.loadingStatus = 'loading'
      
      listActivity(this.queryParams).then(response => {
        if (this.queryParams.pageNum === 1) {
          this.activityList = response.rows
        } else {
          this.activityList = this.activityList.concat(response.rows)
        }
        this.total = response.total
        
        // 判断是否还有更多数据
        if (this.activityList.length >= this.total) {
          this.loadingStatus = 'noMore'
        } else {
          this.loadingStatus = 'more'
        }
        
        this.loading = false
        this.refreshing = false
      }).catch(() => {
        this.loading = false
        this.refreshing = false
        this.loadingStatus = 'more'
      })
    },

    // 搜索
    handleSearch() {
      this.queryParams.pageNum = 1
      this.getList()
    },

    // 清空搜索
    handleClear() {
      this.queryParams.activityName = ''
      this.queryParams.pageNum = 1
      this.getList()
    },

    // 加载更多
    loadMore() {
      if (this.loadingStatus === 'more' && !this.loading) {
        this.queryParams.pageNum++
        this.getList()
      }
    },

    // 下拉刷新
    onRefresh() {
      this.refreshing = true
      this.queryParams.pageNum = 1
      this.getList()
    },

    // 跳转详情
    goToDetail(activityId) {
      uni.navigateTo({
        url: `/pages/activity/detail?id=${activityId}`
      })
    },

    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return '时间待定'
      const date = new Date(dateStr)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      return `${month}月${day}日 ${hour}:${minute}`
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
.activity-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.search-bar {
  background-color: #fff;
  padding: 20rpx;
}

.activity-list {
  height: calc(100vh - 100rpx);
  padding: 20rpx;
}

.activity-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.activity-card:active {
  opacity: 0.9;
  transform: scale(0.99);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.activity-title {
  flex: 1;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-right: 20rpx;
}

.status-tag {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  white-space: nowrap;
}

.status-0 {
  background-color: #e8f5e9;
  color: #4caf50;
}

.status-1 {
  background-color: #e3f2fd;
  color: #2196f3;
}

.status-2 {
  background-color: #f5f5f5;
  color: #999;
}

.status-3 {
  background-color: #ffebee;
  color: #f44336;
}

.card-content {
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.info-text {
  font-size: 26rpx;
  color: #666;
  margin-left: 10rpx;
}

.card-footer {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
}

.organizer {
  font-size: 24rpx;
  color: #999;
}

.loading-more {
  padding: 20rpx 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-image {
  width: 300rpx;
  height: 300rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>
