<template>
  <view class="container">
    <!-- 订单列表 -->
    <view class="order-list">
      <view 
        v-for="order in orderList" 
        :key="order.orderId"
        class="order-card"
        @click="navigateToDetail(order.orderId)"
      >
        <!-- 订单头部 -->
        <view class="order-header">
          <text class="order-sn">订单编号：{{ order.orderSn }}</text>
          <text :class="['order-status', 'status-' + order.status]">
            {{ formatStatus(order.status) }}
          </text>
        </view>

        <!-- 商品信息 -->
        <view class="order-content">
          <image 
            v-if="order.productImage" 
            :src="getImage(order.productImage)" 
            class="product-image" 
            mode="aspectFill"
          ></image>
          <view class="order-info">
            <view class="product-title">{{ order.productTitle || '商品' }}</view>
            <view class="order-amount">¥{{ order.totalAmount }}</view>
          </view>
        </view>

        <!-- 订单底部 -->
        <view class="order-footer">
          <text class="create-time">{{ order.createTime }}</text>
        </view>
      </view>

      <uni-load-more :status="loadingStatus" />

      <view v-if="!loading && orderList.length === 0" class="empty-state">
        <image src="/static/images/empty.png" mode="widthFix" style="width: 200rpx; opacity: 0.5"></image>
        <text>暂无订单</text>
      </view>
    </view>
  </view>
</template>

<script>
import { myOrders } from '@/api/campus/order'
import config from '@/config'

export default {
  data() {
    return {
      orderList: [],
      loading: true,
      baseUrl: config.baseUrl,
      
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
      
      myOrders(this.queryParams).then(res => {
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
    
    getImage(imageUrl) {
      if (!imageUrl) return '/static/images/empty.png'
      const firstImg = imageUrl.split(',')[0]
      if (firstImg.startsWith('http')) return firstImg
      return this.baseUrl + firstImg
    },
    
    formatStatus(status) {
      const statusMap = {
        '0': '待支付',
        '1': '待发货',
        '2': '待收货',
        '3': '已完成',
        '4': '已取消'
      }
      return statusMap[status] || '未知'
    },
    
    navigateToDetail(orderId) {
      uni.navigateTo({
        url: '/pages/secondhand/order-detail?orderId=' + orderId
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
    
    .order-sn {
      font-size: 24rpx;
      color: #909399;
    }
    
    .order-status {
      font-size: 26rpx;
      font-weight: 600;
      
      &.status-0 { color: #E6A23C; }
      &.status-1 { color: #409EFF; }
      &.status-2 { color: #67C23A; }
      &.status-3 { color: #909399; }
      &.status-4 { color: #F56C6C; }
    }
  }
  
  .order-content {
    display: flex;
    gap: 20rpx;
    padding: 24rpx;
    
    .product-image {
      width: 140rpx;
      height: 140rpx;
      border-radius: 8rpx;
      background: #f5f5f5;
    }
    
    .order-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      
      .product-title {
        font-size: 28rpx;
        color: #303133;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      
      .order-amount {
        font-size: 32rpx;
        font-weight: bold;
        color: #f56c6c;
      }
    }
  }
  
  .order-footer {
    padding: 20rpx 24rpx;
    border-top: 1rpx solid #f0f0f0;
    
    .create-time {
      font-size: 24rpx;
      color: #909399;
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
