<template>
  <view class="container">
    <uni-forms ref="form" :modelValue="form" :rules="rules" class="form">
      <uni-forms-item label="标题" name="title" required>
        <uni-easyinput v-model="form.title" placeholder="请输入标题" />
      </uni-forms-item>
      
      <uni-forms-item label="任务内容" name="content" required>
        <uni-easyinput type="textarea" v-model="form.content" placeholder="请输入任务具体内容" />
      </uni-forms-item>

      <uni-forms-item label="送达地址" name="deliveryAddress" required>
        <uni-easyinput v-model="form.deliveryAddress" placeholder="请输入送达地址（如：宿舍楼、教学楼）" />
      </uni-forms-item>

      <uni-forms-item label="悬赏金额" name="reward" required>
        <uni-number-box v-model="form.reward" :min="0" :precision="2" />
      </uni-forms-item>
      
      <uni-forms-item label="订单类型" name="orderType">
        <view class="tag-group">
          <uni-tag 
            v-for="option in hardcodedOrderTypeOptions"
            :key="option.value"
            :text="option.text"
            :type="form.orderType === option.value ? 'primary' : 'default'"
            :inverted="form.orderType !== option.value"
            @click="form.orderType = option.value"
            style="margin-right: 10px; margin-bottom: 10px;"
          />
        </view>
      </uni-forms-item>
      </uni-forms>
    <button type="primary" @click="submitForm" class="submit-btn">立即发布</button>
  </view>
</template>

<script>
import { addErrand } from '@/api/campus/errand.js';
// 移除了 import { getDicts }

export default {
  data() {
    return {
      form: {
        title: '',
        content: '',
        deliveryAddress: '', 
        reward: 0,
        orderType: '快递代取' // 默认选中第一个
      },
      // 
      // 根据您提供的 SQL 
      // 'value' 必须是中文字符串
      //
      hardcodedOrderTypeOptions: [
        { value: '快递代取', text: '快递代取' },
        { value: '外卖代拿', text: '外卖代拿' },
        { value: '校园跑腿', text: '校园跑腿' },
        { value: '其他', text: '其他' } 
      ],
      rules: {
        title: {
          rules: [{ required: true, errorMessage: '标题不能为空' }]
        },
        content: {
          rules: [{ required: true, errorMessage: '内容不能为空' }]
        },
        reward: {
          rules: [{ required: true, errorMessage: '悬赏金额不能为空' }]
        },
		deliveryAddress:{
          rules: [{ required: true, errorMessage: '地址不能为空' }]
        }
      }
    };
  },
  
  methods: {
    submitForm() {
      this.$refs.form.validate().then(res => {
        addErrand(this.form).then(response => {
          if (response.code === 200) {
            this.$modal.msgSuccess("发布成功");
            // 返回上一页并刷新
            const pages = getCurrentPages();
            const prevPage = pages[pages.length - 2].$vm; 
            if (prevPage && typeof prevPage.onRefresh === 'function') {
               prevPage.onRefresh(); 
            }
            uni.navigateBack();
          }
        });
      }).catch(err => {
        console.log('表单错误信息：', err);
      });
    }
  }
};
</script>

<style scoped>
.container {
  padding: 15px;
  background-color: #f9f9f9;
}
.form {
  background-color: #fff;
  padding: 10px;
  border-radius: 8px;
}
.submit-btn {
  margin-top: 20px;
}

/* * 新增样式 
 * 用于实现您截图 中的标签组样式
 */
.tag-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
</style>