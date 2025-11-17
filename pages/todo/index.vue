<template>
  <view class="container">
    
    <view class="navbar">
      <uni-segmented-control
        :current="currentTab"
        :values="tabs.map(v => v.name)"
        @clickItem="onClickItem"
        style-type="text"
        active-color="#3c9cff"
      ></uni-segmented-control>
    </view>
    <scroll-view
      :refresher-triggered="triggered"
      @refresherrefresh="onRefresh"
      @scrolltolower="onBottom"
      refresher-enabled="true"
      scroll-y="true"
      class="scroll-view"
    >
      <view v-if="!loading">
        <view v-for="item in errandList" :key="item.orderId" class="card" @click="handleToDetail(item.orderId)">
          <view class="card-header">
            <text class="title">{{ item.title }}</text>
            <text class="reward">￥{{ item.reward }}</text>
          </view>
          <view class="card-content">
            <text class="content-text">{{ item.content }}</text>
            <view v-if="item.deliveryAddress" class="address-box">
              <uni-icons type="location-filled" size="14" color="#909399"></uni-icons>
              <text class="address-text">{{ item.deliveryAddress }}</text>
            </view>
          </view>
          <view class="card-footer">
            <view class="user-info">
              <image :src="item.publisherAvatar || '/static/images/profile.jpg'" class="avatar"></image>
              <text class="username">{{ item.publisherName || '匿名' }}</text>
            </view>
            <view>
              <uni-tag :text="getStatusText(item.status)" :type="getStatusType(item.status)" :inverted="true" size="small" />
              <uni-tag :text="item.orderType" :inverted="true" size="small" style="margin-left: 10px;" />
            </view>
          </view>
        </view>
        <uni-load-more :status="loadingStatus"></uni-load-more>
      </view>
    </scroll-view>

    <uni-fab ref="fab" horizontal="right" vertical="bottom" @fabClick="handleToPost"></uni-fab>
  </view>
</template>

<script>
import { listErrand } from '@/api/campus/errand.js';

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
        status: 0 // 默认只看 "待接单" (status 0)
      },
      total: 0,
      
      // *** 新增：Tab 数据 ***
      currentTab: 0, // 默认选中第一个 Tab
      tabs: [
        { name: '待接单', status: 0 },
        { name: '进行中', status: 1 },
        { name: '已完成', status: 2 },
        { name: '已取消', status: 3 }
      ],
      // *** 修改结束 ***
    };
  },
  onLoad() {
    this.getList();
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loadingStatus = 'loading';
      this.loading = true;
      // getList 会自动使用 data 中最新的 queryParams.status
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

    // *** 新增：Tab 点击事件 ***
    onClickItem(e) {
      if (this.currentTab !== e.currentIndex) {
        this.currentTab = e.currentIndex;
        // 关键：更新 queryParams.status 为所选 Tab 的 status
        this.queryParams.status = this.tabs[e.currentIndex].status;
        this.resetList();
      }
    },
    
    // *** 新增：重置列表 ***
    resetList() {
      this.queryParams.pageNum = 1;
      this.errandList = [];
      this.getList();
    },

    /** 下拉刷新 */
    onRefresh() {
      if (this.triggered) return;
      this.triggered = true;
      this.resetList(); // 下拉刷新也调用 resetList
    },
    /** 上拉加载 */
    onBottom() {
      if (this.loadingStatus === 'noMore') return;
      this.queryParams.pageNum++;
      this.getList(); // 上拉加载不清空列表，所以不调用 resetList
    },
    /** 跳转到详情 */
    handleToDetail(id) {
      uni.navigateTo({
        url: '/pages/todo/detail?orderId=' + id
      });
    },
    /** 跳转到发布 */
    handleToPost() {
      uni.navigateTo({
        url: '/pages/todo/post'
      });
    },
    /** 状态文本 */
    getStatusText(status) {
      const statusMap = { 0: '待接单', 1: '进行中', 2: '已完成', 3: '已取消' };
      return statusMap[status] || '未知';
    },
    /** 状态样式 */
    getStatusType(status) {
      const typeMap = { 0: 'warning', 1: 'primary', 2: 'success', 3: 'default' };
      return typeMap[status] || 'default';
    }
  }
};
</script>

<style scoped>
/* *** 修正点 ***
  清除了所有非法的 ' ' 缩进字符
*/
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
/* *** 新增：Navbar 样式 *** */
.navbar {
  background-color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;
}
.scroll-view {
  flex: 1;
  overflow-y: auto;
  box-sizing: border-box;
}
.card {
  background-color: #fff;
  border-radius: 8px;
  margin: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}
.title {
  font-size: 16px;
  font-weight: bold;
}
.reward {
  font-size: 16px;
  color: #e43d33;
  font-weight: bold;
}
.card-content {
  padding: 12px 0;
}
.content-text {
  font-size: 14px;
  color: #333;
}
.address-box {
  display: flex;
  align-items: center;
  margin-top: 8px;
  padding: 5px 8px;
  background-color: #f8f8f8;
  border-radius: 4px;
}
.address-text {
  font-size: 13px;
  color: #909399;
  margin-left: 5px;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}
.user-info {
  display: flex;
  align-items: center;
}
.avatar {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  margin-right: 8px;
}
</style>