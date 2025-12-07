<template>
  <view class="container">
    <view class="confirm-page">
      <!-- 商品信息 -->
      <view class="product-section">
        <view class="section-title">商品信息</view>
        <view class="product-card">
          <image :src="getFirstImage(product.imageUrls)" class="product-img" mode="aspectFill"></image>
          <view class="product-info">
            <view class="product-title">{{ product.title }}</view>
            <view class="product-price">¥{{ product.price }}</view>
          </view>
        </view>
      </view>

      <!-- 收货地址 -->
      <view class="address-section">
        <view class="section-title required">收货地址</view>
        <textarea 
          v-model="address" 
          class="address-input" 
          placeholder="请填写详细收货地址，如：宿舍楼栋-房间号"
          maxlength="200"
        ></textarea>
        <view class="char-count">{{ address.length }}/200</view>
      </view>

      <!-- 订单备注 -->
      <view class="remark-section">
        <view class="section-title">订单备注（选填）</view>
        <textarea 
          v-model="remark" 
          class="remark-input" 
          placeholder="给卖家留言"
          maxlength="100"
        ></textarea>
      </view>

      <!-- 订单金额 -->
      <view class="amount-section">
        <view class="amount-row">
          <text class="label">商品金额</text>
          <text class="value">¥{{ product.price }}</text>
        </view>
        <view class="amount-row total">
          <text class="label">应付总额</text>
          <text class="value">¥{{ product.price }}</text>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-section">
        <button class="submit-btn" @click="handleSubmit" :loading="submitting">
          {{ submitting ? '提交中...' : '确认下单' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { getProductDetail } from '@/api/campus/secondhand'
import { createOrder } from '@/api/campus/order'
import config from '@/config'

export default {
  data() {
    return {
      productId: null,
      product: {},
      baseUrl: config.baseUrl,
      address: '',
      remark: '',
      submitting: false
    }
  },
  
  onLoad(options) {
    if (options.productId) {
      this.productId = options.productId
      this.loadProduct()
    } else {
      this.$modal.msgError('商品ID缺失')
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  },
  
  methods: {
    loadProduct() {
      getProductDetail(this.productId).then(res => {
        this.product = res.data
        
        // 再次检查商品状态
        if (this.product.status !== '0') {
          this.$modal.msgError('商品已售出或已下架')
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        }
      })
    },
    
    getFirstImage(imageUrls) {
      if (!imageUrls) return '/static/images/empty.png'
      const images = imageUrls.split(',')
      const firstImg = images[0]
      if (firstImg.startsWith('http')) return firstImg
      return this.baseUrl + firstImg
    },
    
    validateForm() {
      if (!this.address.trim()) {
        this.$modal.msgError('请填写收货地址')
        return false
      }
      if (this.address.trim().length < 5) {
        this.$modal.msgError('收货地址至少5个字符')
        return false
      }
      return true
    },
    
    handleSubmit() {
      if (!this.validateForm()) return
      if (this.submitting) return
      
      this.submitting = true
      
      const orderData = {
        productId: this.productId,
        address: this.address.trim()
      }
      
      createOrder(orderData).then(res => {
        this.submitting = false
        this.$modal.msgSuccess('订单创建成功')
        
        // 跳转到订单详情页
        const orderId = res.data
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/secondhand/order-detail?orderId=' + orderId
          })
        }, 1000)
      }).catch(err => {
        this.submitting = false
        this.$modal.msgError(err || '创建订单失败')
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

.confirm-page {
  padding: 20rpx;
}

.product-section,
.address-section,
.remark-section,
.amount-section {
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
  
  &.required::before {
    content: '*';
    color: #f56c6c;
    margin-right: 6rpx;
  }
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

.address-input,
.remark-input {
  width: 100%;
  min-height: 150rpx;
  padding: 20rpx;
  background: #f5f7fa;
  border-radius: 8rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  line-height: 1.5;
}

.remark-input {
  min-height: 100rpx;
}

.char-count {
  text-align: right;
  font-size: 24rpx;
  color: #909399;
  margin-top: 10rpx;
}

.amount-section {
  .amount-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15rpx 0;
    font-size: 28rpx;
    
    .label {
      color: #606266;
    }
    
    .value {
      color: #303133;
      font-weight: 500;
    }
    
    &.total {
      border-top: 1rpx solid #f0f0f0;
      margin-top: 10rpx;
      padding-top: 20rpx;
      
      .label {
        font-size: 32rpx;
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
}

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  
  .submit-btn {
    width: 100%;
    height: 90rpx;
    background: linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%);
    color: #fff;
    border-radius: 40rpx;
    font-size: 32rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
  }
  
  .submit-btn[disabled] {
    opacity: 0.6;
  }
}
</style>
