<template>
  <view class="container">
    <view class="bg-decoration"></view>

    <view class="post-card">
      <view class="card-header">
        <text class="header-title">发布动态</text>
        <text class="header-desc">分享校园新鲜事，记录精彩瞬间</text>
      </view>

      <uni-forms ref="form" :modelValue="form" :rules="rules" class="custom-form">
        
        <uni-forms-item label="发布分区" required name="topicType" label-width="80px">
          <picker @change="bindPickerChange" :value="pickerIndex" :range="pickerTabs" range-key="name">
            <view class="picker-trigger">
              <text class="picker-text">{{ pickerTabs[pickerIndex].name }}</text>
              <uni-icons type="bottom" size="14" color="#3c9cff"></uni-icons>
            </view>
          </picker>
        </uni-forms-item>

        <uni-forms-item label="动态内容" required name="content" label-width="80px">
          <view class="textarea-wrapper">
            <uni-easyinput 
              type="textarea" 
              v-model="form.content" 
              placeholder="分享此刻的想法..." 
              :inputBorder="false"
              placeholderStyle="color:#909399;font-size:14px"
              :styles="{ backgroundColor: 'transparent' }"
              autoHeight
              :minHeight="100"
            />
          </view>
        </uni-forms-item>
        
        <uni-forms-item label="配图" name="imageUrls" label-width="80px">
            <view class="upload-box">
                <uni-file-picker
                    v-model="imageValue"
                    fileMediatype="image"
                    mode="grid"
                    :limit="9"
                    title="最多9张"
                    @success="uploadSuccess"
                    @fail="uploadFail"
                    @delete="deleteFile"
                    :auto-upload="false"
                />
            </view>
        </uni-forms-item>
      </uni-forms>
    </view>

    <view class="footer-btn-area">
        <button class="submit-btn" @click="submit" hover-class="btn-hover">立即发布</button>
    </view>
  </view>
</template>

<script>
  import { addTopic } from '@/api/campus/topic';
  import { upload } from '@/utils/upload'; 

  export default {
    data() {
      return {
        form: {
          content: '',
          imageUrls: '',
          topicType: 'recommend' 
        },
        imageValue: [], 
        
        pickerIndex: 0,
        pickerTabs: [
          { name: '推荐', type: 'recommend' },
          { name: '问答', type: 'qa' },
          { name: '二手', type: 'secondhand' },
          { name: '交友', type: 'dating' },
          { name: '兼职', type: 'jobs' },
          { name: '八卦', type: 'gossip' }
        ],

        rules: {
          content: { rules: [{ required: true, errorMessage: '内容不能为空' }] },
          topicType: { rules: [{ required: true, errorMessage: '请选择分区' }] }
        }
      };
    },
    methods: {
      bindPickerChange(e) {
        this.pickerIndex = e.detail.value;
        this.form.topicType = this.pickerTabs[this.pickerIndex].type;
      },

      uploadSuccess(e) {},
      
      deleteFile(e) {
        this.imageValue = this.imageValue.filter(file => file.uuid !== e.tempFile.uuid);
      },
      
      uploadFail(e) {
        this.$modal.msgError('图片选择失败');
      },

      /** 提交按钮 */
      submit() {
        this.$refs.form.validate().then(res => {
          uni.showLoading({ title: '发布中...', mask: true });
          
          // 1. 先上传图片
          this.uploadImages().then(imageUrls => {
            this.form.imageUrls = imageUrls.join(',');
            
            // 2. 提交表单
            addTopic(this.form).then(response => {
              uni.hideLoading();
              this.$modal.msgSuccess('发布成功');
              
              // 刷新上一页
              const pages = getCurrentPages();
              if(pages.length > 1) {
                  const prevPage = pages[pages.length - 2].$vm || pages[pages.length - 2];
                  // 尝试调用上一页的下拉刷新或重置列表方法
                  if (prevPage && typeof prevPage.onPullDownRefresh === 'function') {
                    prevPage.onPullDownRefresh();
                  } else if (prevPage && typeof prevPage.resetList === 'function') {
                    prevPage.resetList();
                  }
              }
              
              // 延迟 1.5 秒返回，避免僵硬
              setTimeout(() => {
                 uni.navigateBack();
              }, 1500);
              
            }).catch(() => {
              uni.hideLoading();
            });
          }).catch(err => {
            uni.hideLoading();
            this.$modal.msgError('图片上传失败，请重试');
            console.error(err);
          });
        });
      },
      
      // 上传图片逻辑
      async uploadImages() {
        if (this.imageValue.length === 0) {
          return Promise.resolve([]);
        }
        
        const uploadTasks = this.imageValue
          .filter(file => file.url) 
          .map(file => {
            // 如果已经是网络图片（编辑模式下），直接返回
            if (file.url.startsWith('http') || file.url.startsWith('https')) {
                return Promise.resolve({ url: file.url });
            }
            return upload({
              filePath: file.url, 
              name: 'file' 
            });
          });

        try {
          const results = await Promise.all(uploadTasks);
          const urls = results.map(res => {
            // 兼容不同的 upload 返回格式
            if (res.url) return res.url;
            if (res.data && res.data.url) return res.data.url;
            if (res.code === 200 && typeof res.msg === 'string' && res.msg.startsWith('http')) return res.msg; // 某些极端情况
            return res.url || ''; 
          });
          return urls.filter(Boolean);
        } catch (error) {
          return Promise.reject(error);
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  .container {
    min-height: 100vh;
    background-color: #f5f7fa;
    padding: 30rpx;
    padding-bottom: 120rpx;
    overflow-y: auto;
  }

  /* 背景装饰 */
  .bg-decoration {
    position: fixed;
    top: -120rpx;
    right: -120rpx;
    width: 450rpx;
    height: 450rpx;
    background: radial-gradient(circle, rgba(60, 156, 255, 0.08) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
    z-index: 0;
    pointer-events: none;
  }

  /* 主体卡片 */
  .post-card {
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
    padding-left: 10rpx;
    border-left: 8rpx solid #3c9cff;
  }
  .header-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
    display: block;
    line-height: 1;
    margin-bottom: 12rpx;
  }
  .header-desc {
    font-size: 24rpx;
    color: #909399;
    padding-left: 4rpx;
  }

  /* Picker 样式美化 */
  .picker-trigger {
    background-color: #f5f7fa;
    border-radius: 12rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20rpx;
    border: 1px solid transparent;
    transition: all 0.3s;
  }
  .picker-trigger:active {
    background-color: #ecf5ff;
    border-color: #a0cfff;
  }
  .picker-text {
    font-size: 28rpx;
    color: #333;
  }

  /* 文本域美化 */
  .textarea-wrapper {
    background-color: #f5f7fa;
    border-radius: 12rpx;
    padding: 20rpx;
    min-height: 200rpx;
  }

  /* 图片上传区微调 */
  .upload-box {
    margin-top: 10rpx;
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