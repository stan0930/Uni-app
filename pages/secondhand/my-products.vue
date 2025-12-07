<template>
  <view class="container">
    <!-- 商品列表 -->
    <view class="product-list">
      <view 
        v-for="product in productList" 
        :key="product.productId"
        class="product-card"
      >
        <!-- 商品图片 -->
        <image 
          :src="getFirstImage(product.imageUrls)" 
          class="product-image" 
          mode="aspectFill"
          @click="navigateToDetail(product.productId)"
        ></image>
        
        <!-- 商品信息 -->
        <view class="product-info">
          <view class="product-title" @click="navigateToDetail(product.productId)">{{ product.title }}</view>
          <view class="product-meta">
            <text class="price">¥{{ product.price }}</text>
            <text :class="['status', 'status-' + product.status]">{{ formatStatus(product.status) }}</text>
          </view>
          
          <!-- 操作按钮 -->
          <view class="action-buttons">
            <button class="btn-edit" size="mini" @click="handleEdit(product.productId)">编辑</button>
            <button class="btn-delete" size="mini" @click="handleDelete(product.productId)">删除</button>
          </view>
        </view>
      </view>

      <uni-load-more :status="loadingStatus" />

      <view v-if="!loading && productList.length === 0" class="empty-state">
        <image src="/static/images/empty.png" mode="widthFix" style="width: 200rpx; opacity: 0.5"></image>
        <text>还没有发布商品</text>
        <button class="publish-btn" @click="navigateToPost">去发布</button>
      </view>
    </view>
  </view>
</template>

<script>
import { myProducts, delProduct } from '@/api/campus/secondhand'
import config from '@/config'

export default {
  data() {
    return {
      productList: [],
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
    if (this.productList.length >= this.total) {
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
      this.productList = []
      this.getList()
    },
    
    getList() {
      this.loading = true
      this.loadingStatus = 'loading'
      
      myProducts(this.queryParams).then(res => {
        const newRows = res.rows || []
        
        if (this.queryParams.pageNum === 1) {
          this.productList = newRows
        } else {
          this.productList = this.productList.concat(newRows)
        }
        
        this.total = res.total || 0
        this.loading = false
        this.loadingStatus = this.productList.length >= this.total ? 'noMore' : 'more'
      }).catch(() => {
        this.loading = false
        this.loadingStatus = 'more'
      })
    },
    
    getFirstImage(imageUrls) {
      if (!imageUrls) return '/static/images/empty.png'
      const images = imageUrls.split(',')
      const firstImg = images[0]
      if (firstImg.startsWith('http')) return firstImg
      return this.baseUrl + firstImg
    },
    
    formatStatus(status) {
      const statusMap = {
        '0': '在售',
        '1': '已售',
        '2': '下架'
      }
      return statusMap[status] || '在售'
    },
    
    navigateToDetail(productId) {
      uni.navigateTo({
        url: '/pages/secondhand/detail?productId=' + productId
      })
    },
    
    handleEdit(productId) {
      uni.navigateTo({
        url: '/pages/secondhand/post?productId=' + productId
      })
    },
    
    handleDelete(productId) {
      uni.showModal({
        title: '提示',
        content: '确定要删除这个商品吗？',
        success: (res) => {
          if (res.confirm) {
            delProduct(productId).then(response => {
              if (response.code === 200) {
                uni.showToast({ title: '删除成功', icon: 'success' })
                this.resetList()
              } else {
                uni.showToast({ title: response.msg || '删除失败', icon: 'none' })
              }
            })
          }
        }
      })
    },
    
    navigateToPost() {
      uni.navigateTo({
        url: '/pages/secondhand/post'
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

.product-list {
  padding: 20rpx;
}

.product-card {
  display: flex;
  gap: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
  
  .product-image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 12rpx;
    background: #f5f5f5;
    flex-shrink: 0;
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
    
    .product-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 12rpx 0;
      
      .price {
        font-size: 32rpx;
        font-weight: bold;
        color: #f56c6c;
      }
      
      .status {
        font-size: 24rpx;
        padding: 4rpx 12rpx;
        border-radius: 20rpx;
        
        &.status-0 {
          color: #67C23A;
          background: #f0f9ff;
        }
        &.status-1 {
          color: #909399;
          background: #f4f4f5;
        }
        &.status-2 {
          color: #F56C6C;
          background: #fef0f0;
        }
      }
    }
    
    .action-buttons {
      display: flex;
      gap: 16rpx;
      
      button {
        flex: 1;
        height: 60rpx;
        line-height: 60rpx;
        border-radius: 8rpx;
        font-size: 26rpx;
      }
      
      .btn-edit {
        color: #409EFF;
        background: #ecf5ff;
        border: 1px solid #b3d8ff;
      }
      
      .btn-delete {
        color: #F56C6C;
        background: #fef0f0;
        border: 1px solid #fbc4c4;
      }
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
  
  .publish-btn {
    margin-top: 40rpx;
    width: 200rpx;
    height: 70rpx;
    line-height: 70rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-radius: 35rpx;
    font-size: 28rpx;
  }
}
</style>
