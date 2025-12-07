<template>
  <view class="container">
    <view class="detail-page">
      <!-- 图片轮播 -->
      <swiper class="product-swiper" :indicator-dots="true" :autoplay="false">
        <swiper-item v-for="(img, index) in imageList" :key="index">
          <image :src="img" mode="aspectFill" class="swiper-image"></image>
        </swiper-item>
      </swiper>

      <!-- 商品信息 -->
      <view class="product-section">
        <view class="price-row">
          <text class="price">¥{{ product.price }}</text>
          <text :class="['status-tag', 'status-' + product.status]">
            {{ formatStatus(product.status) }}
          </text>
        </view>
        <view class="product-title">{{ product.title }}</view>
        <view class="product-meta">
          <text>{{ formatCategory(product.category) }}</text>
          <text>浏览 {{ product.viewCount || 0 }} 次</text>
        </view>
      </view>

      <!-- 商品描述 -->
      <view class="section">
        <view class="section-title">商品描述</view>
        <view class="description">{{ product.description }}</view>
      </view>

      <!-- 卖家信息 -->
      <view class="section seller-section">
        <view class="section-title">卖家信息</view>
        <view class="seller-info">
          <image :src="getAvatar(product.avatar)" class="seller-avatar"></image>
          <view class="seller-details">
            <text class="seller-name">{{ product.nickName || '神秘卖家' }}</text>
            <text class="publish-time">发布于 {{ product.createTime }}</text>
          </view>
        </view>
        <view v-if="product.contactInfo" class="contact-info">
          <text>联系方式：{{ product.contactInfo }}</text>
        </view>
      </view>

      <!-- 底部操作栏 -->
      <view class="bottom-bar">
        <view class="action-btn" @click="handleFavorite">
          <uni-icons 
            :type="product.favorited ? 'star-filled' : 'star'" 
            size="24" 
            :color="product.favorited ? '#f9ae3d' : '#606266'"
          ></uni-icons>
          <text>{{ product.favorited ? '已收藏' : '收藏' }}</text>
        </view>
        
        <view v-if="isMine" class="action-btn" @click="showStatusPicker = true">
          <uni-icons type="settings" size="24" color="#606266"></uni-icons>
          <text>状态管理</text>
        </view>
        
        <!-- 非自己的商品且在售状态，显示购买按钮 -->
        <view v-if="!isMine && product.status === '0'" class="buy-btn" @click="handleBuy">
          立即购买
        </view>
        
        <!-- 非自己的商品，显示联系卖家按钮 -->
        <view v-if="!isMine && product.contactInfo" class="contact-btn" @click="contactSeller">
          联系卖家
        </view>
      </view>
    </view>

    <!-- 状态选择器 -->
    <uni-popup ref="statusPopup" type="bottom">
      <view class="status-picker">
        <view class="picker-title">更新商品状态</view>
        <view 
          v-for="status in statusOptions" 
          :key="status.value"
          class="status-option"
          @click="updateStatus(status.value)"
        >
          {{ status.label }}
        </view>
        <view class="status-option cancel" @click="$refs.statusPopup.close()">取消</view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { getProductDetail, toggleFavorite, updateProductStatus } from '@/api/campus/secondhand'
import config from '@/config'

export default {
  data() {
    return {
      productId: null,
      product: {},
      baseUrl: config.baseUrl,
      imageList: [],
      isMine: false,
      showStatusPicker: false,
      statusOptions: [
        { label: '在售', value: '0' },
        { label: '已售出', value: '1' },
        { label: '下架', value: '2' }
      ]
    }
  },
  
  onLoad(options) {
    this.productId = options.productId
    this.getDetail()
  },
  
  methods: {
    getDetail() {
      getProductDetail(this.productId).then(res => {
        this.product = res.data
        this.parseImages()
        this.checkIsMine()
      })
    },
    
    parseImages() {
      if (this.product.imageUrls) {
        const images = this.product.imageUrls.split(',')
        this.imageList = images.map(img => {
          if (img.startsWith('http')) return img
          return this.baseUrl + img
        })
      }
      if (this.imageList.length === 0) {
        this.imageList = ['/static/images/empty.png']
      }
    },
    
    checkIsMine() {
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo && this.product.userId) {
        this.isMine = userInfo.userId === this.product.userId
      }
    },
    
    getAvatar(avatar) {
      if (!avatar) return '/static/images/profile.jpg'
      if (avatar.startsWith('http')) return avatar
      return this.baseUrl + avatar
    },
    
    formatStatus(status) {
      const map = { '0': '在售', '1': '已售', '2': '下架' }
      return map[status] || '在售'
    },
    
    formatCategory(category) {
      const map = {
        'digital': '数码',
        'book': '图书',
        'daily': '生活用品',
        'clothing': '服饰',
        'other': '其他'
      }
      return map[category] || '其他'
    },
    
    handleFavorite() {
      toggleFavorite(this.productId).then(res => {
        this.product.favorited = res.data
        this.$modal.msgSuccess(res.data ? '已收藏' : '已取消收藏')
      })
    },
    
    updateStatus(status) {
      updateProductStatus(this.productId, status).then(() => {
        this.$modal.msgSuccess('状态已更新')
        this.product.status = status
        this.$refs.statusPopup.close()
      })
    },
    
    
    contactSeller() {
      uni.showModal({
        title: '联系方式',
        content: this.product.contactInfo,
        confirmText: '复制',
        success: (res) => {
          if (res.confirm) {
            uni.setClipboardData({
              data: this.product.contactInfo,
              success: () => {
                this.$modal.msgSuccess('已复制到剪贴板')
              }
            })
          }
        }
      })
    },
    
    handleBuy() {
      // 检查商品状态
      if (this.product.status !== '0') {
        this.$modal.msgError('商品已售出或已下架')
        return
      }
      
      // 跳转到订单确认页
      uni.navigateTo({
        url: '/pages/secondhand/order-confirm?productId=' + this.productId
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  background: #f5f7fa;
  min-height: 100vh;
}

.product-swiper {
  width: 100%;
  height: 750rpx;
  background: #fff;
  
  .swiper-image {
    width: 100%;
    height: 100%;
  }
}

.product-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .price {
      font-size: 40rpx;
      font-weight: bold;
      color: #f56c6c;
    }
    
    .status-tag {
      padding: 6rpx 20rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      
      &.status-0 { background: #f0f9ff; color: #409eff; }
      &.status-1 { background: #f0f0f0; color: #909399; }
      &.status-2 { background: #fef0f0; color: #f56c6c; }
    }
  }
  
  .product-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16rpx;
  }
  
  .product-meta {
    display: flex;
    gap: 30rpx;
    font-size: 26rpx;
    color: #909399;
  }
}

.section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20rpx;
  }
  
  .description {
    font-size: 28rpx;
    color: #606266;
    line-height: 1.6;
  }
}

.seller-section {
  .seller-info {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .seller-avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 20rpx;
    }
    
    .seller-details {
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      
      .seller-name {
        font-size: 30rpx;
        color: #303133;
        font-weight: 600;
      }
      
      .publish-time {
        font-size: 24rpx;
        color: #909399;
      }
    }
  }
  
  .contact-info {
    padding: 20rpx;
    background: #f5f7fa;
    border-radius: 8rpx;
    font-size: 26rpx;
    color: #606266;
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  
  .action-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6rpx;
    font-size: 24rpx;
    color: #606266;
  }
  
  .buy-btn {
    flex: 2;
    height: 70rpx;
    background: linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%);
    color: #fff;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    font-weight: 600;
    margin-right: 20rpx;
  }
  
  .contact-btn {
    flex: 2;
    height: 70rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    font-weight: 600;
  }
}

.status-picker {
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
  
  .picker-title {
    padding: 30rpx;
    text-align: center;
    font-size: 32rpx;
    font-weight: 600;
    border-bottom: 1rpx solid #f0f0f0;
  }
  
  .status-option {
    padding: 30rpx;
    text-align: center;
    font-size: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    &.cancel {
      color: #909399;
    }
    
    &:active {
      background: #f5f7fa;
    }
  }
}
</style>
