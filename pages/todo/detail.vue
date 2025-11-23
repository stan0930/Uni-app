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
        <uni-list-item 
          :border="false" 
          :thumb="getAvatarUrl(detail.publisherAvatar)" 
          :title="detail.publisherName || '匿名'" 
        />
      </view>

      <view class="user-section" v-if="detail.takerId">
        <text class="section-title">接单者</text>
        <uni-list-item 
          :border="false" 
          :thumb="getAvatarUrl(detail.takerAvatar)" 
          :title="detail.takerName || '接单者 ' + detail.takerId" 
        />
      </view>
    </view>
    
    <view class="footer-actions">
      <button v-if="detail.status == 0 && isPublisher" type="warn" @click="handleCancel">取消订单</button>
      <button v-if="detail.status == 0 && !isPublisher" type="primary" @click="handleTake">立即接单</button>
      <button v-if="detail.status == 1 && isTaker" type="primary" @click="handleComplete">我已完成</button>
      <button v-if="detail.status == 1 && isPublisher" type="warn" plain="true" @click="handleCancel">取消订单</button>
      <button v-if="detail.status == 2" type="default" disabled>订单已完成</button>
      <button v-if="detail.status == 3" type="default" disabled>订单已取消</button>
    </view>
  </view>
</template>

<script>
import { getErrand, takeErrand, completeErrand, delErrand, updateErrand } from '@/api/campus/errand.js';
import { mapGetters } from 'vuex';
// 【新增】
import config from '@/config';

export default {
  data() {
    return {
      orderId: null,
      detail: null,
      isPublisher: false, 
      isTaker: false,
      // 【新增】
      baseUrl: config.baseUrl
    };
  },
  computed: {
    // 这里之前报错 unknown getter: userId，现在修改 store 后应该正常了
    ...mapGetters(['userId'])
  },
  onLoad(options) {
    if (!options.orderId) { 
      this.$modal.msgError("参数错误");
      setTimeout(() => uni.navigateBack(), 1000);
      return;
    }
    this.orderId = options.orderId;
    this.getDetail();
  },
  methods: {
    // 【新增】头像处理方法
    getAvatarUrl(avatar) {
      if (!avatar) return '/static/images/profile.jpg';
      if (avatar.startsWith('http') || avatar.startsWith('https')) {
        return avatar;
      }
      return this.baseUrl + avatar;
    },

    getDetail() {
      getErrand(this.orderId).then(res => {
        if (res.code === 200) {
          const data = res.data;
          
          // 使用 mapGetters 获取的 userId 进行对比
          this.isPublisher = (data.createBy == this.userId) || (data.userId == this.userId);
          this.isTaker = (data.takerId == this.userId);

          this.detail = {
             ...data,
             publisherName: data.publisherName || '匿名',
             takerName: data.takerName || (data.takerId ? `接单者 ${data.takerId}` : '')
          };
          
        } else {
          this.$modal.msgError(res.msg);
        }
      });
    },
    // ... (handleTake, handleComplete, handleCancel, updateListPage, getStatusText 保持不变，请直接使用上次修复后的代码) ...
    handleTake() {
      this.$modal.confirm('确认接取该任务吗？').then(() => {
        takeErrand(this.orderId).then(res => {
          this.$modal.msgSuccess("接单成功");
          this.getDetail();
          this.updateListPage(); 
        });
      }).catch(() => {});
    },
    handleComplete() {
      this.$modal.confirm('确认任务已完成吗？').then(() => {
        completeErrand(this.orderId).then(res => {
          this.$modal.msgSuccess("操作成功");
          this.getDetail();
          this.updateListPage(); 
        });
      }).catch(() => {});
    },
    handleCancel() {
      this.$modal.confirm('确认取消该订单吗？').then(() => {
        if (this.detail.status == 0) {
           delErrand(this.orderId).then(res => {
             this.$modal.msgSuccess("订单已取消");
             uni.navigateBack(); 
             this.updateListPage();
           });
        } else {
           const data = { orderId: this.orderId, status: 3 };
           updateErrand(data).then(res => {
             this.$modal.msgSuccess("订单已取消");
             this.getDetail();
             this.updateListPage();
           });
        }
      }).catch(() => {});
    },
    updateListPage() {
       const pages = getCurrentPages();
       const prevPage = pages[pages.length - 2]; 
       if (prevPage && prevPage.$vm && typeof prevPage.$vm.onRefresh === 'function') {
         prevPage.$vm.onRefresh(); 
       } else if (prevPage && typeof prevPage.onRefresh === 'function') {
         prevPage.onRefresh();
       }
    },
    getStatusText(status) {
      const statusMap = { 0: '待接单', 1: '进行中', 2: '已完成', 3: '已取消' };
      return statusMap[status] || '未知';
    }
  }
};
</script>

<style scoped>
/* 样式保持不变 */
.container {
  padding-bottom: 80px; 
  background-color: #f5f7fa;
  min-height: 100vh;
}
.card {
  margin: 12px;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  flex: 1;
  line-height: 1.4;
}
.reward {
  font-size: 18px;
  font-weight: bold;
  color: #e43d33;
  padding-left: 10px;
  white-space: nowrap;
}
.content {
  padding: 15px 0;
  font-size: 15px;
  color: #555;
  line-height: 1.6;
  min-height: 60px;
}
.info-list {
  margin-top: 5px;
}
.user-section {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
}
.section-title {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
  display: block;
}
.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 10px 20px;
  padding-bottom: calc(10px + constant(safe-area-inset-bottom));
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  gap: 15px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}
.footer-actions button {
  flex: 1;
  font-size: 15px;
  border-radius: 20px;
}
</style>