<template>
  <view class="container">
    <view class="detail-page">
      <!-- 订单状态 -->
      <view class="status-section">
        <view :class="['status-badge', 'status-' + order.status]">
          <text class="status-text">{{ formatStatus(order.status) }}</text>
        </view>
        <text class="status-tip">{{ getStatusTip(order.status) }}</text>
      </view>

      <!-- 商品信息 -->
      <view class="product-section">
        <view class="section-title">商品信息</view>
        <view class="product-card">
          <image 
            :src="getImage(order.productImage)" 
            class="product-img" 
            mode="aspectFill"
          ></image>
          <view class="product-info">
            <view class="product-title">{{ order.productTitle || '商品' }}</view>
            <view class="product-price">¥{{ order.totalAmount }}</view>
          </view>
        </view>
      </view>

      <!-- 收货地址 -->
      <view class="address-section">
        <view class="section-title">收货地址</view>
        <view class="address-content">
          <uni-icons type="location" size="20" color="#409EFF"></uni-icons>
          <text class="address-text">{{ order.address || '暂无地址' }}</text>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="order-section">
        <view class="section-title">订单信息</view>
        <view class="info-row">
          <text class="label">订单编号</text>
          <text class="value">{{ order.orderSn }}</text>
        </view>
        <view class="info-row">
          <text class="label">创建时间</text>
          <text class="value">{{ order.createTime }}</text>
        </view>
        <view class="info-row" v-if="order.payTime">
          <text class="label">支付时间</text>
          <text class="value">{{ order.payTime }}</text>
        </view>
        <view class="info-row total">
          <text class="label">订单金额</text>
          <text class="value">¥{{ order.totalAmount }}</text>
        </view>
      </view>

      <!-- 卖家信息 -->
      <view class="seller-section" v-if="order.sellerNickName">
        <view class="section-title">卖家信息</view>
        <view class="seller-info">
          <image 
            :src="getAvatar(order.sellerAvatar)" 
            class="seller-avatar"
          ></image>
          <text class="seller-name">{{ order.sellerNickName }}</text>
        </view>
      </view>

      <!-- 底部操作按钮 -->
      <view class="bottom-actions" v-if="order.status === '1' || order.status === '2'">
        <!-- 待发货状态，买家可以取消订单 -->
        <view v-if="order.status === '1'" class="action-btn cancel" @click="handleCancel">
          取消订单
        </view>
        
        <!-- 待收货状态，买家可以确认收货 -->
        <view v-if="order.status === '2'" class="action-btn primary" @click="handleConfirm">
          确认收货
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getOrderDetail, cancelOrder, confirmReceipt } from '@/api/campus/order'
import config from '@/config'

export default {
  data() {
    return {
      orderId: null,
      order: {},
      baseUrl: config.baseUrl
    }
  },
  
  onLoad(options) {
    if (options.orderId) {
      this.orderId = options.orderId
      this.loadOrder()
    }
  },
  
  methods: {
    loadOrder() {
      getOrderDetail(this.orderId).then(res => {
        this.order = res.data || {}
      })
    },
    
    getImage(imageUrl) {
      if (!imageUrl) return '/static/images/empty.png'
      const firstImg = imageUrl.split(',')[0]
      if (firstImg.startsWith('http')) return firstImg
      return this.baseUrl + firstImg
    },
    
    getAvatar(avatar) {
      if (!avatar) return '/static/images/profile.jpg'
      if (avatar.startsWith('http')) return avatar
      return this.baseUrl + avatar
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
    
    getStatusTip(status) {
      const tipMap = {
        '0': '请尽快完成支付',
        '1': '等待卖家发货',
        '2': '商品正在配送中',
        '3': '交易已完成',
        '4': '订单已取消'
      }
      return tipMap[status] || ''
    },
    
    handleCancel() {
      uni.showModal({
        title: '确认取消',
        content: '确定要取消这个订单吗？',
        success: (res) => {
          if (res.confirm) {
            cancelOrder(this.orderId).then(() => {
              uni.showToast({
                title: '订单已取消',
                icon: 'success'
              })
              this.loadOrder()
            })
          }
        }
      })
    },
    
    handleConfirm() {
      uni.showModal({
        title: '确认收货',
        content: '确认已收到商品吗？',
        success: (res) => {
          if (res.confirm) {
            confirmReceipt(this.orderId).then(() => {
              uni.showToast({
                title: '收货成功',
                icon: 'success'
              })
              this.loadOrder()
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  background: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.detail-page {
  padding: 20rpx;
}

.status-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
  text-align: center;
  color: #fff;
  
  .status-badge {
    display: inline-block;
    padding: 10rpx 40rpx;
    border-radius: 40rpx;
    background: rgba(255,255,255,0.2);
    margin-bottom: 20rpx;
    
    .status-text {
      font-size: 32rpx;
      font-weight: 600;
    }
  }
  
  .status-tip {
    display: block;
    font-size: 26rpx;
    opacity: 0.9;
  }
}

.product-section,
.address-section,
.order-section,
.seller-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20rpx;
}

.product-card {
  display: flex;
  gap: 20rpx;
  
  .product-img {
    width: 160rpx;
    height: 160rpx;
    border-radius: 8rpx;
    background: #f5f5f5;
  }
  
  .product-info {
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
    
    .product-price {
      font-size: 36rpx;
      font-weight: bold;
      color: #f56c6c;
    }
  }
}

.address-content {
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
  
  .address-text {
    flex: 1;
    font-size: 28rpx;
    color: #606266;
    line-height: 1.6;
  }
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 0;
  font-size: 28rpx;
  
  .label {
    color: #909399;
  }
  
  .value {
    color: #303133;
    text-align: right;
    max-width: 400rpx;
    word-break: break-all;
  }
  
  &.total {
    border-top: 1rpx solid #f0f0f0;
    margin-top: 10rpx;
    padding-top: 20rpx;
    
    .label {
      font-weight: 600;
      color: #303133;
    }
    
    .value {
      font-size: 36rpx;
      font-weight: bold;
      color: #f56c6c;
    }
  }
}

.seller-info {
  display: flex;
  align-items: center;
  gap: 15rpx;
  
  .seller-avatar {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
  }
  
  .seller-name {
    font-size: 28rpx;
    color: #303133;
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  
  .action-btn {
    flex: 1;
    height: 80rpx;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    font-weight: 600;
    
    &.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
    
    &.cancel {
      background: #fff;
      color: #909399;
      border: 2rpx solid #dcdfe6;
    }
  }
}
</style>
