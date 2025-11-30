<template>
  <view class="history-container">
    <scroll-view scroll-y class="post-list" @scrolltolower="loadMore">
      <view class="empty-tip" v-if="postList.length === 0 && loadingStatus !== 'loading'">
        <uni-icons type="info" size="40" color="#ccc"></uni-icons>
        <text>暂无相关记录</text>
      </view>

      <view class="post-card" v-for="(item, index) in postList" :key="index" @click="goDetail(item)">
        <view class="card-header">
          <image :src="getAvatarUrl(item.avatar)" class="user-avatar" mode="aspectFill"></image>
          <view class="user-info">
            <text class="user-name">{{ item.nickName || item.createBy || '匿名同学' }}</text>
            <text class="post-time">{{ item.createTime }}</text>
          </view>
        </view>

        <view class="card-content">
          <text class="post-text">{{ item.content }}</text>
        </view>

        <view class="card-images" v-if="item.imageUrls">
          <image 
            v-for="(img, imgIndex) in splitImages(item.imageUrls)" 
            :key="imgIndex"
            :src="getImageUrl(img)" 
            mode="aspectFill" 
            class="post-image"
            :class="getImageClass(splitImages(item.imageUrls).length)"
          ></image>
        </view>

        <view class="card-footer">
          <view class="action-item">
            <uni-icons type="eye" size="16" color="#999"></uni-icons>
            <text>{{ item.viewCount || 0 }}</text>
          </view>
          <view class="action-item">
            <uni-icons :type="type === 'favorite' ? 'star-filled' : 'heart-filled'" size="16" color="#999"></uni-icons>
            <text>{{ item.likeCount || 0 }}</text>
          </view>
        </view>
      </view>
      
      <uni-load-more :status="loadingStatus" v-if="postList.length > 0"></uni-load-more>
    </scroll-view>
  </view>
</template>

<script>
import { listMyTopics, listMyLikedTopics, listMyFavoriteTopics } from '@/api/campus/topic'
import config from '@/config'

export default {
  data() {
    return {
      type: 'post', // post, like, favorite
      postList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      loadingStatus: 'more',
      baseUrl: config.baseUrl
    }
  },
  onLoad(options) {
    this.type = options.type || 'post'
    const titles = {
      post: '我的发布',
      like: '我的获赞',
      favorite: '我的收藏'
    }
    uni.setNavigationBarTitle({
      title: titles[this.type]
    })
    this.getList()
  },
  methods: {
    getList() {
      this.loadingStatus = 'loading'
      
      let apiFunc = listMyTopics
      if (this.type === 'like') apiFunc = listMyLikedTopics
      if (this.type === 'favorite') apiFunc = listMyFavoriteTopics
      
      apiFunc(this.queryParams).then(res => {
        if (this.queryParams.pageNum === 1) {
          this.postList = res.rows || []
        } else {
          this.postList = [...this.postList, ...(res.rows || [])]
        }
        this.total = res.total
        this.loadingStatus = this.postList.length >= this.total ? 'noMore' : 'more'
      }).catch(() => {
        this.loadingStatus = 'more'
      })
    },
    loadMore() {
      if (this.loadingStatus === 'noMore') return
      this.queryParams.pageNum++
      this.getList()
    },
    splitImages(images) {
      if (!images) return []
      return Array.isArray(images) ? images : images.split(',')
    },
    getAvatarUrl(avatar) {
      if (!avatar) return '/static/images/profile.jpg';
      if (avatar.startsWith('http') || avatar.startsWith('https')) return avatar;
      return this.baseUrl + avatar;
    },
    getImageUrl(url) {
      if (!url) return ''
      if (url.startsWith('http') || url.startsWith('https')) return url
      return this.baseUrl + url
    },
    getImageClass(count) {
      if (count === 1) return 'img-single';
      if (count === 2 || count === 4) return 'img-half';
      return 'img-third';
    },
    goDetail(item) {
      // 【关键修复】这里必须使用 topicId，且参数名必须对应 detail 页面的 options.topicId
      // 原错误代码：url: `/pages/circle/detail?id=${item.id}`
      uni.navigateTo({ 
        url: `/pages/circle/detail?topicId=${item.topicId}` 
      });
    }
  }
}
</script>

<style scoped lang="scss">
.history-container {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 20rpx;
}

.post-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.02);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.user-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  border: 1rpx solid #eee;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.post-time {
  font-size: 22rpx;
  color: #999;
}

.post-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  margin-bottom: 16rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.card-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 16rpx;
}

.post-image {
  border-radius: 8rpx;
  background-color: #f5f5f5;
}
.img-single { width: 60%; height: 300rpx; }
.img-half { width: calc(50% - 10rpx); height: 200rpx; }
.img-third { width: calc(33.33% - 10rpx); height: 180rpx; }

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 30rpx;
  border-top: 1rpx solid #f8f8f8;
  padding-top: 20rpx;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 24rpx;
  color: #999;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  color: #ccc;
  font-size: 28rpx;
  
  text {
    margin-top: 20rpx;
  }
}
</style>