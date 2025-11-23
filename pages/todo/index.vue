<template>
  <view class="container">
    
    <view class="navbar-wrapper">
      <view class="navbar-inner">
        <uni-segmented-control
          :current="currentTab"
          :values="tabs.map(v => v.name)"
          @clickItem="onClickItem"
          style-type="text"
          active-color="#007aff"
          class="tab-control"
        ></uni-segmented-control>
      </view>
    </view>

    <scroll-view
      :refresher-triggered="triggered"
      @refresherrefresh="onRefresh"
      @scrolltolower="onBottom"
      refresher-enabled="true"
      scroll-y="true"
      class="scroll-view"
    >
      <view v-if="!loading" class="list-container">
        <view 
          v-for="(item, index) in errandList" 
          :key="item.orderId" 
          class="task-card" 
          :style="{ animationDelay: index * 0.05 + 's' }"
          @click="handleToDetail(item.orderId)"
        >
          
          <view class="card-left">
            <view class="price-box">
              <text class="currency">￥</text>
              <text class="amount">{{ item.reward }}</text>
            </view>
            <text class="label">悬赏金</text>
          </view>

          <view class="card-right">
            <view class="card-header">
              <text class="title uni-ellipsis">{{ item.title }}</text>
              <view :class="['status-tag', 'status-' + item.status]">
                {{ getStatusText(item.status) }}
              </view>
            </view>
            
            <text class="desc uni-ellipsis-2">{{ item.content }}</text>
            
            <view class="card-footer">
              <view class="location-row" v-if="item.deliveryAddress">
                <uni-icons type="location-filled" size="12" color="#909399"></uni-icons>
                <text class="addr-text uni-ellipsis">{{ item.deliveryAddress }}</text>
              </view>
              <view class="location-row" v-else>
                 <text class="addr-text">无特定地点</text>
              </view>

              <view class="publisher-info">
                <image 
                  :src="getAvatarUrl(item.publisherAvatar)" 
                  mode="aspectFill" 
                  class="avatar"
                ></image>
                <text class="name uni-ellipsis">{{ item.publisherName || '匿名' }}</text>
              </view>
            </view>
          </view>
          
          <view class="card-bg-decoration"></view>
        </view>
        
        <uni-load-more :status="loadingStatus" color="#ccc"></uni-load-more>
      </view>
      
      <view v-if="!loading && errandList.length === 0" class="empty-state">
         <image src="/static/images/empty.png" mode="widthFix" style="width: 200rpx; margin-bottom: 20rpx; opacity: 0.5;" />
         <text>暂无相关任务</text>
      </view>
    </scroll-view>

    <uni-fab ref="fab" horizontal="right" vertical="bottom" @fabClick="handleToPost"></uni-fab>
  </view>
</template>

<script>
import { listErrand } from '@/api/campus/errand.js';
import config from '@/config';

export default {
  data() {
    return {
      errandList: [],
      loading: true,
      triggered: false, 
      loadingStatus: 'more', 
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        status: 0 
      },
      total: 0,
      currentTab: 0, 
      tabs: [
        { name: '待接单', status: 0 },
        { name: '进行中', status: 1 },
        { name: '已完成', status: 2 },
        { name: '已取消', status: 3 }
      ],
      baseUrl: config.baseUrl
    };
  },
  onLoad() {
    this.getList();
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loadingStatus = 'loading';
      if(this.queryParams.pageNum === 1) this.loading = true; // 仅第一页显示全屏Loading
      
      listErrand(this.queryParams).then(res => {
        if (res.code === 200) {
          if (this.queryParams.pageNum === 1) {
            this.errandList = res.rows;
          } else {
            this.errandList = this.errandList.concat(res.rows);
          }
          this.total = res.total;
          this.loadingStatus = this.errandList.length >= this.total ? 'noMore' : 'more';
        }
        this.loading = false;
        this.triggered = false;
      }).catch(() => {
         this.loading = false;
         this.triggered = false;
      });
    },

    // 处理头像路径
    getAvatarUrl(avatar) {
      if (!avatar) return '/static/images/profile.jpg';
      if (avatar.startsWith('http') || avatar.startsWith('https')) {
        return avatar;
      }
      return this.baseUrl + avatar;
    },

    onClickItem(e) {
      if (this.currentTab !== e.currentIndex) {
        this.currentTab = e.currentIndex;
        this.queryParams.status = this.tabs[e.currentIndex].status;
        this.resetList();
      }
    },
    
    resetList() {
      this.queryParams.pageNum = 1;
      this.errandList = [];
      this.getList();
    },

    onRefresh() {
      if (this.triggered) return;
      this.triggered = true;
      this.resetList(); 
    },
    onBottom() {
      if (this.loadingStatus === 'noMore') return;
      this.queryParams.pageNum++;
      this.getList(); 
    },
    handleToDetail(id) {
      uni.navigateTo({
        url: '/pages/todo/detail?orderId=' + id
      });
    },
    handleToPost() {
      uni.navigateTo({
        url: '/pages/todo/post'
      });
    },
    getStatusText(status) {
      const statusMap = { 0: '待接单', 1: '进行中', 2: '已完成', 3: '已取消' };
      return statusMap[status] || '未知';
    }
  }
};
</script>

<style scoped lang="scss">
/* 页面容器：浅灰背景，全屏 */
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

/* 顶部导航栏样式 */
.navbar-wrapper {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03);
}
.navbar-inner {
  padding: 10rpx 0;
}

/* 滚动区域 */
.scroll-view {
  flex: 1;
  height: 0; /* 必须设置高度为0以配合flex布局 */
}
.list-container {
  padding: 24rpx;
  padding-bottom: 100rpx; /* 留出FAB位置 */
}

/* --- 核心卡片样式 --- */
.task-card {
  display: flex;
  background: #ffffff;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
  overflow: hidden;
  position: relative;
  /* 初始隐藏，用于动画 */
  opacity: 0;
  transform: translateY(20px);
  animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片左侧：价格区 */
.card-left {
  width: 160rpx;
  background: linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-right: 1px dashed #e0e0e0;
  position: relative;
}
/* 半圆缺口装饰 (模仿票据) */
.card-left::after {
  content: '';
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  width: 24rpx;
  height: 24rpx;
  background-color: #f5f7fa;
  border-radius: 50%;
}
.card-left::before {
  content: '';
  position: absolute;
  bottom: -12rpx;
  right: -12rpx;
  width: 24rpx;
  height: 24rpx;
  background-color: #f5f7fa;
  border-radius: 50%;
}

.price-box {
  display: flex;
  align-items: baseline;
  color: #ff4d4f;
}
.currency {
  font-size: 24rpx;
  font-weight: 600;
}
.amount {
  font-size: 40rpx;
  font-weight: bold;
  font-family: 'DIN', sans-serif; /* 如果有数字字体 */
}
.label {
  font-size: 20rpx;
  color: #909399;
  margin-top: 4rpx;
}

/* 卡片右侧：内容区 */
.card-right {
  flex: 1;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12rpx;
}
.title {
  font-size: 30rpx;
  font-weight: 700;
  color: #303133;
  line-height: 1.4;
  flex: 1;
  margin-right: 10rpx;
}

/* 状态标签样式 */
.status-tag {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  white-space: nowrap;
}
.status-0 { color: #ff9900; background: rgba(255, 153, 0, 0.1); } /* 待接单 */
.status-1 { color: #007aff; background: rgba(0, 122, 255, 0.1); } /* 进行中 */
.status-2 { color: #52c41a; background: rgba(82, 196, 26, 0.1); } /* 已完成 */
.status-3 { color: #909399; background: #f4f4f5; } /* 已取消 */

.desc {
  font-size: 26rpx;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 20rpx;
  min-height: 70rpx; /* 保持卡片高度一致性 */
}

/* 底部信息 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}
.location-row {
  display: flex;
  align-items: center;
  max-width: 50%;
}
.addr-text {
  font-size: 22rpx;
  color: #909399;
  margin-left: 4rpx;
}

.publisher-info {
  display: flex;
  align-items: center;
}
.avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #fff;
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.1);
}
.name {
  font-size: 22rpx;
  color: #606266;
  margin-left: 10rpx;
  max-width: 120rpx;
}

/* 装饰背景圆球 (右下角淡色) */
.card-bg-decoration {
  position: absolute;
  bottom: -40rpx;
  right: -40rpx;
  width: 120rpx;
  height: 120rpx;
  background: radial-gradient(circle, rgba(0, 122, 255, 0.05) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  z-index: 0;
  pointer-events: none;
}

/* 空状态 */
.empty-state {
  padding-top: 150rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #c0c4cc;
  font-size: 28rpx;
}
</style>