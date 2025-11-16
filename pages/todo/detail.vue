<template>
  <view class="container" v-if="detail">
    <view class="card">
      <view class="header">
        <text class="title">{{ detail.title }}</text>
        <text class="reward">￥{{ detail.reward }}</text>
      </view>

      <view class="content">
        <text>{{ detail.content }}</text>
      </view>
      
      <uni-list :border="false" class="info-list">
        <uni-list-item :border="false" title="订单状态" :rightText="getStatusText(detail.status)" />
        <uni-list-item :border="false" v-if="detail.deliveryAddress" title="送达地址" :rightText="detail.deliveryAddress" />
        <uni-list-item :border="false" title="订单类型" :rightText="detail.orderType" />
        <uni-list-item :border="false" title="发布时间" :rightText="detail.createTime" />
      </uni-list>

      <view class="user-section">
        <text class="section-title">发布者</text>
        <uni-list-item :border="false" :thumb="detail.publisherAvatar || '/static/images/profile.jpg'" :title="detail.publisherName || '匿名'" />
      </view>

      <view class="user-section" v-if="detail.takerId">
        <text class="section-title">接单者</text>
        <uni-list-item :border="false" :thumb="detail.takerAvatar || '/static/images/profile.jpg'" :title="detail.takerName || '接单者 ' + detail.takerId" />
      </view>
    </view>
    
    <view class="footer-actions">
      <button v-if="detail.status == 0" type="primary" @click="handleTake">立即接单</button>
      <button v-if="detail.status == 1 && detail.isTaker" type="primary" @click="handleComplete">我已完成</button>
      <button v-if="detail.status == 2" type="default" disabled>订单已完成</button>
      <button v-if="detail.status == 3" type="default" disabled>订单已取消</button>
    </view>
  </view>
</template>

<script>
import { getErrand, takeErrand, completeErrand } from '@/api/campus/errand.js';
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      // *** 修正点 ***
      orderId: null, // 从 errandOrderId 改为 orderId
      detail: null
    };
  },
  computed: {
    ...mapGetters(['userId'])
  },
  onLoad(options) {
    // *** 修正点 ***
    // 接收 'orderId'
    if (!options.orderId) { 
      this.$modal.msgError("参数错误");
      uni.navigateBack();
      return;
    }
    this.orderId = options.orderId;
    this.getDetail();
  },
  methods: {
    getDetail() {
      // *** 修正点 ***
      // 使用 this.orderId
      getErrand(this.orderId).then(res => {
        if (res.code === 200) {
          
          // "防崩溃" 逻辑 (同 21:05:37)
          this.detail = {
             ...res.data,
             isTaker: res.data.takerId === this.userId, 
             publisherName: null, 
             publisherAvatar: null,
             takerName: null,
             takerAvatar: null
          };
          
          if (res.data.takerId) {
             this.detail.takerName = '接单者 ' + res.data.takerId;
          }
          
        } else {
          this.$modal.msgError(res.msg);
        }
      });
    },
    // 接单
    handleTake() {
      // *** 修正点 ***
      takeErrand(this.orderId).then(res => {
        this.$modal.msgSuccess("接单成功");
        this.getDetail();
        this.updateListPage(); 
      });
    },
    // 完成订单
    handleComplete() {
      // *** 修正点 ***
      completeErrand(this.orderId).then(res => {
        this.$modal.msgSuccess("操作成功");
        this.getDetail();
        this.updateListPage(); 
      });
    },
    // 刷新列表页
    updateListPage() {
       const pages = getCurrentPages();
       const prevPage = pages[pages.length - 2]; 
       if (prevPage && typeof prevPage.onRefresh === 'function') {
         prevPage.onRefresh(); 
       }
    },
    getStatusText(status) {
      const statusMap = { 0: '待接单', 1: '进行中', 2: '已完成', 3: '已取消' };
      return statusMap[status] || '未知';
    }
    // 移除了 getOrderTypeText 函数
  }
};
</script>

<style scoped>
/* *** 修正点 ***
  清除了所有非法的 ' ' 缩进字符
*/
.container {
  padding-bottom: 70px; 
}
.card {
  margin: 12px;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}
.title {
  font-size: 20px;
  font-weight: bold;
  flex: 1;
}
.reward {
  font-size: 18px;
  font-weight: bold;
  color: #e43d33;
  padding-left: 10px;
}
.content {
  padding: 15px 0;
  font-size: 15px;
  color: #333;
  min-height: 80px;
}
.info-list {
  margin-top: 10px;
}
.user-section {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #f5f5f5;
}
.section-title {
  font-size: 14px;
  color: #999;
  margin-bottom: 5px;
}
.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 10px 15px;
  padding-bottom: calc(10px + constant(safe-area-inset-bottom));
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  border-top: 1px solid #f0f0f0;
}
</style>