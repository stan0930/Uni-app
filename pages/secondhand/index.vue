<template>
  <view class="container">
    <!-- 顶部分类筛选 -->
    <view class="category-bar">
      <scroll-view scroll-x class="category-scroll">
        <view 
          v-for="(cat, index) in categories" 
          :key="index"
          :class="['category-item', { active: currentCategory === cat.value }]"
          @click="selectCategory(cat.value)"
        >
          {{ cat.label }}
        </view>
      </scroll-view>
    </view>

    <!-- 商品列表 -->
    <view class="product-list">
      <view 
        v-for="(product, index) in productList" 
        :key="product.productId"
        class="product-card"
        @click="navigateToDetail(product.productId)"
      >
        <!-- 商品图片 -->
        <image 
          :src="getFirstImage(product.imageUrls)" 
          class="product-image" 
          mode="aspectFill"
        ></image>
        
        <!-- 商品信息 -->
        <view class="product-info">
          <view class="product-title">{{ product.title }}</view>
          <view class="product-meta">
            <text class="price">¥{{ product.price }}</text>
            <text class="status">{{ formatStatus(product.status) }}</text>
          </view>
          <view class="product-footer">
            <view class="seller-info">
              <image :src="getAvatar(product.avatar)" class="avatar-small"></image>
              <text>{{ product.nickName || '神秘卖家' }}</text>
            </view>
            <view class="view-count">
              <uni-icons type="eye" size="14" color="#999"></uni-icons>
              <text>{{ product.viewCount || 0 }}</text>
            </view>
          </view>
        </view>
      </view>

      <uni-load-more :status="loadingStatus" />

      <view v-if="!loading && productList.length === 0" class="empty-state">
        <image src="/static/images/empty.png" mode="widthFix" style="width: 200rpx; opacity: 0.5"></image>
        <text>暂无商品</text>
      </view>
    </view>

    <!-- 悬浮按钮 -->
    <uni-fab
      ref="fab"
      :pattern="pattern"
      :content="content"
      horizontal="right"
      vertical="bottom"
      @trigger="trigger"
    />
  </view>
</template>

<script>
import { listProducts } from '@/api/campus/secondhand'
import config from '@/config'

export default {
  data() {
    return {
      productList: [],
      loading: true,
      baseUrl: config.baseUrl,
      
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        category: null
      },
      
      currentCategory: 'all',
      categories: [
        { label: '全部', value: 'all' },
        { label: '数码', value: 'digital' },
        { label: '图书', value: 'book' },
        { label: '生活用品', value: 'daily' },
        { label: '服饰', value: 'clothing' },
        { label: '其他', value: 'other' }
      ],
      
      total: 0,
      loadingStatus: 'more',
      
      pattern: {
        color: '#7A7E83',
        backgroundColor: '#fff',
        selectedColor: '#3c9cff',
        buttonColor: '#3c9cff',
        iconColor: '#fff'
      },
      content: [{
        iconPath: '/static/images/tabbar/work.png',
        text: '发布',
        active: true
      }]
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
    
    selectCategory(value) {
      if (this.currentCategory !== value) {
        this.currentCategory = value
        this.queryParams.category = value === 'all' ? null : value
        this.resetList()
      }
    },
    
    getList() {
      this.loading = true
      this.loadingStatus = 'loading'
      
      listProducts(this.queryParams).then(res => {
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
    
    getAvatar(avatar) {
      if (!avatar) return '/static/images/profile.jpg'
      if (avatar.startsWith('http')) return avatar
      return this.baseUrl + avatar
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
    
    trigger(e) {
      if (e.index === 0) {
        uni.navigateTo({
          url: '/pages/secondhand/post'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 20rpx;
}

.category-bar {
  background: #fff;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}

.category-scroll {
  white-space: nowrap;
  padding: 0 24rpx;
  
  .category-item {
    display: inline-block;
    padding: 12rpx 32rpx;
    margin-right: 20rpx;
    border-radius: 40rpx;
    font-size: 28rpx;
    color: #606266;
    background: #f4f4f5;
    transition: all 0.3s;
    
    &.active {
      background: #3c9cff;
      color: #fff;
      font-weight: 600;
    }
  }
}

.product-list {
  padding: 0 24rpx;
}

.product-card {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
  
  .product-image {
    width: 100%;
    height: 400rpx;
    background: #f5f5f5;
  }
  
  .product-info {
    padding: 24rpx;
    
    .product-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .product-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;
      
      .price {
        font-size: 36rpx;
        font-weight: bold;
        color: #f56c6c;
      }
      
      .status {
        font-size: 24rpx;
        padding: 4rpx 16rpx;
        border-radius: 20rpx;
        background: #f0f9ff;
        color: #409eff;
      }
    }
    
    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .seller-info {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #909399;
        
        .avatar-small {
          width: 40rpx;
          height: 40rpx;
          border-radius: 50%;
          margin-right: 8rpx;
        }
      }
      
      .view-count {
        display: flex;
        align-items: center;
        gap: 6rpx;
        font-size: 24rpx;
        color: #999;
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
}
</style>
