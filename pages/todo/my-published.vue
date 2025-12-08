<template>
  <view class="container">
    <view class="order-list">
      <view 
        v-for="order in orderList" 
        :key="order.orderId"
        class="order-card"
        @click="navigateToDetail(order.orderId)"
      >
        <!-- 订单头部 -->
        <view class="order-header">
          <text class="order-title">{{ order.title }}</text>
          <text :class="['order-status', 'status-' + order.status]">
            {{ formatStatus(order.status) }}
          </text>
        </view>

        <!-- 订单内容 -->
        <view class="order-content">
          <view class="info-row">
            <text class="label">类型：</text>
            <text class="value">{{ order.orderType }}</text>
          </view>
          <view class="info-row">
            <text class="label">详情：</text>
            <text class="value detail">{{ order.detail }}</text>
          </view>
          <view class="info-row">
            <text class="label">报酬：</text>
            <text class="value reward">¥{{ order.reward }}</text>
          </view>
          <view class="info-row" v-if="order.deliveryAddress">
            <uni-icons type="location" size="14" color="#909399"></uni-icons>
            <text class="value">{{ order.deliveryAddress }}</text>
          </view>
        </view>

        <!-- 订单底部 -->
        <view class="order-footer">
          <text class="create-time">{{ order.createTime }}</text>
          <!-- 如果有人接单，显示接单者信息 -->
          <text v-if="order.status === '1' && order.takerNickname" class="taker-info">
            接单人：{{ order.takerNickname }}
          </text>
        </view>
      </view>

      <uni-load-more :status="loadingStatus" />

      <view v-if="!loading && orderList.length === 0" class="empty-state">
        <image src="/static/images/empty.png" mode="widthFix" style="width: 200rpx; opacity: 0.5"></image>
        <text>暂无发布的任务</text>
      </view>
    </view>
  </view>
</template>

<script>
import { myPublishedErrands } from '@/api/campus/errand'

export default {
  data() {
    return {
      orderList: [],
      loading: true,
      
      queryParams: {
        pageNum: 1,
        pageSize: 10
      },
      
      total: 0,
      loadingStatus: 'more'
    }
  },
  
  onLoad() {
    this.getList()
  },
  
  onPullDownRefresh() {
    this.resetList()
    uni.stopPullDownRefresh()
  },
  
  onReachBottom() {
    if (this.orderList.length >= this.total) {
      this.loadingStatus = 'noMore'
    } else {
      this.loadingStatus = 'loading'
      this.queryParams.pageNum++
      this.getList()
    }
  },
  
  methods: {
    resetList() {
      this.queryParams.pageNum = 1
      this.orderList = []
      this.getList()
    },
    
    getList() {
      this.loading = true
      this.loadingStatus = 'loading'
      
      myPublishedErrands(this.queryParams).then(res => {
        const newRows = res.rows || []
        
        if (this.queryParams.pageNum === 1) {
          this.orderList = newRows
        } else {
          this.orderList = this.orderList.concat(newRows)
        }
        
        this.total = res.total || 0
        this.loading = false
        this.loadingStatus = this.orderList.length >= this.total ? 'noMore' : 'more'
      }).catch(() => {
        this.loading = false
        this.loadingStatus = 'more'
      })
    },
    
    formatStatus(status) {
      const statusMap = {
        '0': '待接单',
        '1': '进行中',
        '2': '已完成',
        '3': '已取消'
      }
      return statusMap[status] || '未知'
    },
    
    navigateToDetail(orderId) {
      uni.navigateTo({
        url: '/pages/todo/detail?id=' + orderId
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  background: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 20rpx;
}

.order-list {
  padding: 20rpx;
}

.order-card {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
  
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .order-title {
      flex: 1;
      font-size: 28rpx;
      font-weight: 600;
      color: #303133;
    }
    
    .order-status {
      font-size: 24rpx;
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
      
      &.status-0 { 
        background: #fef0f0;
        color: #f56c6c;
      }
      &.status-1 { 
        background: #e1f3d8;
        color: #67c23a;
      }
      &.status-2 { 
        background: #f0f9ff;
        color: #909399;
      }
      &.status-3 { 
        background: #fdf6ec;
        color: #e6a23c;
      }
    }
  }
  
  .order-content {
    padding: 20rpx 24rpx;
    
    .info-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12rpx;
      font-size: 26rpx;
      
      .label {
        color: #909399;
        min-width: 80rpx;
      }
      
      .value {
        flex: 1;
        color: #606266;
        
        &.detail {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        &.reward {
          color: #f56c6c;
          font-weight: bold;
          font-size: 28rpx;
        }
      }
    }
  }
  
  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 24rpx;
    border-top: 1rpx solid #f0f0f0;
    
    .create-time {
      font-size: 22rpx;
      color: #c0c4cc;
    }

    .taker-info {
      font-size: 24rpx;
      color: #67c23a;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100rpx;
  color: #c0c4cc;
  font-size: 28rpx;
}
</style>
