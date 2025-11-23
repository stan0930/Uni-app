<template>
  <view class="container">
    <view class="bg-decoration"></view>

    <view class="form-card">
      <view class="card-header">
        <text class="header-title">发布新任务</text>
        <text class="header-desc">填写详情，寻找同学帮忙</text>
      </view>

      <uni-forms ref="form" :modelValue="form" :rules="rules" class="custom-form">
        
        <uni-forms-item label="任务标题" name="title" required label-width="80px">
          <view class="input-wrapper">
            <uni-easyinput 
              v-model="form.title" 
              placeholder="简短描述任务 (如: 代取快递)" 
              :inputBorder="false"
              primaryColor="#3c9cff"
            />
          </view>
        </uni-forms-item>
        
        <uni-forms-item label="具体内容" name="content" required label-width="80px">
          <view class="input-wrapper textarea-wrapper">
            <uni-easyinput 
              type="textarea" 
              v-model="form.content" 
              placeholder="请输入任务的详细要求..." 
              :inputBorder="false"
              primaryColor="#3c9cff"
            />
          </view>
        </uni-forms-item>

        <uni-forms-item label="送达地址" name="deliveryAddress" required label-width="80px">
          <view class="input-wrapper">
            <uni-easyinput 
              v-model="form.deliveryAddress" 
              placeholder="如：宿舍楼A栋101 / 教学楼" 
              :inputBorder="false"
              primaryColor="#3c9cff"
            />
            <uni-icons type="location" size="20" color="#c0c4cc" class="input-icon"></uni-icons>
          </view>
        </uni-forms-item>

        <uni-forms-item label="悬赏金额" name="reward" required label-width="80px">
          <view class="reward-wrapper">
             <text class="currency">￥</text>
             <uni-number-box 
               v-model="form.reward" 
               :min="0" 
               :step="0.5"
               :precision="2" 
               background="#f5f7fa"
               color="#333"
             />
          </view>
        </uni-forms-item>
        
        <uni-forms-item label="订单类型" name="orderType" label-width="80px">
          <view class="tag-group">
            <view 
              v-for="option in hardcodedOrderTypeOptions"
              :key="option.value"
              class="tag-item"
              :class="{ 'tag-active': form.orderType === option.value }"
              @click="form.orderType = option.value"
            >
              {{ option.text }}
            </view>
          </view>
        </uni-forms-item>
      </uni-forms>
    </view>

    <view class="footer-btn-area">
      <button class="submit-btn" @click="submitForm" hover-class="btn-hover">立即发布</button>
    </view>
  </view>
</template>

<script>
import { addErrand } from '@/api/campus/errand.js';

export default {
  data() {
    return {
      form: {
        title: '',
        content: '',
        deliveryAddress: '', 
        reward: 2.0, // 默认给个初始值
        orderType: '快递代取' 
      },
      hardcodedOrderTypeOptions: [
        { value: '快递代取', text: '📦 快递代取' },
        { value: '外卖代拿', text: '🍔 外卖代拿' },
        { value: '校园跑腿', text: '🏃 校园跑腿' },
        { value: '其他', text: '✨ 其他' } 
      ],
      rules: {
        title: { rules: [{ required: true, errorMessage: '请输入标题' }] },
        content: { rules: [{ required: true, errorMessage: '请输入具体内容' }] },
        reward: { rules: [{ required: true, errorMessage: '请输入悬赏金额' }] },
		    deliveryAddress: { rules: [{ required: true, errorMessage: '请输入地址' }] }
      }
    };
  },
  
  methods: {
    submitForm() {
      this.$refs.form.validate().then(res => {
        // 显示加载中
        uni.showLoading({ title: '发布中...', mask: true });
        
        addErrand(this.form).then(response => {
          uni.hideLoading();
          
          if (response.code === 200) {
            this.$modal.msgSuccess("发布成功");
            
            // 【核心修复】先刷新上一页数据，延迟 1.5 秒再跳转，解决"僵硬"感
            const pages = getCurrentPages();
            if (pages.length > 1) {
              const prevPage = pages[pages.length - 2].$vm || pages[pages.length - 2]; 
              if (prevPage && typeof prevPage.onRefresh === 'function') {
                 prevPage.onRefresh(); 
              }
            }
            
            // 延迟跳转
            setTimeout(() => {
               uni.navigateBack();
            }, 1500);
          }
        }).catch(() => {
           uni.hideLoading();
        });
      }).catch(err => {
        // 表单校验失败不需要特殊处理，uni-forms会自动提示
      });
    }
  }
};
</script>

<style scoped lang="scss">
.container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 30rpx;
  padding-bottom: 120rpx; /* 留出底部按钮空间 */
  overflow-y: auto;
}

/* 顶部背景装饰圆球 */
.bg-decoration {
  position: fixed;
  top: -100rpx;
  right: -100rpx;
  width: 400rpx;
  height: 400rpx;
  background: radial-gradient(circle, rgba(60, 156, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  z-index: 0;
  pointer-events: none;
}

/* 表单卡片 */
.form-card {
  position: relative;
  z-index: 1;
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-header {
  margin-bottom: 40rpx;
}
.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
}
.header-desc {
  font-size: 24rpx;
  color: #909399;
  margin-top: 10rpx;
  display: block;
}

/* 输入框美化 */
.input-wrapper {
  background-color: #f5f7fa;
  border-radius: 12rpx;
  padding: 0 10rpx;
  display: flex;
  align-items: center;
  border: 1px solid transparent;
  transition: all 0.3s;
}
.input-wrapper:focus-within {
  background-color: #fff;
  border-color: #3c9cff;
  box-shadow: 0 0 8rpx rgba(60, 156, 255, 0.1);
}
.textarea-wrapper {
  padding: 10rpx;
}
.input-icon {
  margin-right: 10rpx;
}

/* 金额输入 */
.reward-wrapper {
  display: flex;
  align-items: center;
}
.currency {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff4d4f;
  margin-right: 10rpx;
}

/* 标签组样式 */
.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}
.tag-item {
  padding: 12rpx 30rpx;
  background-color: #f5f7fa;
  color: #606266;
  border-radius: 50rpx;
  font-size: 26rpx;
  transition: all 0.2s;
  border: 1px solid #eee;
}
.tag-active {
  background: linear-gradient(135deg, #3c9cff 0%, #66b1ff 100%);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 4rpx 10rpx rgba(60, 156, 255, 0.3);
  font-weight: 500;
}

/* 底部按钮区 */
.footer-btn-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  z-index: 10;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.submit-btn {
  background: linear-gradient(90deg, #3c9cff, #66b1ff);
  color: #fff;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
  height: 88rpx;
  line-height: 88rpx;
  box-shadow: 0 8rpx 16rpx rgba(60, 156, 255, 0.3);
  border: none;
}
.submit-btn::after {
  border: none;
}
.btn-hover {
  transform: scale(0.98);
  opacity: 0.9;
}
</style>