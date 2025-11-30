<template>
  <view class="container">
    <view class="form-container">
      <!-- 图片上传 -->
      <view class="form-section">
        <view class="section-title required">商品图片</view>
        <view class="image-upload">
          <view 
            v-for="(img, index) in imageList" 
            :key="index"
            class="image-item"
          >
            <image :src="img" mode="aspectFill" class="uploaded-image"></image>
            <view class="delete-btn" @click="removeImage(index)">
              <uni-icons type="close" size="16" color="#fff"></uni-icons>
            </view>
          </view>
          <view v-if="imageList.length < 9" class="upload-btn" @click="chooseImage">
            <uni-icons type="camera" size="40" color="#909399"></uni-icons>
            <text>{{ imageList.length }}/9</text>
          </view>
        </view>
      </view>

      <!-- 商品标题 -->
      <view class="form-section">
        <view class="section-title required">商品标题</view>
        <uni-easyinput 
          v-model="form.title" 
          placeholder="请输入商品标题(最多30字)"
          :maxlength="30"
        ></uni-easyinput>
      </view>

      <!-- 商品分类 -->
      <view class="form-section">
        <view class="section-title required">商品分类</view>
        <picker :range="categories" range-key="label" @change="onCategoryChange">
          <view class="picker-input">
            <text :class="{ placeholder: !form.category }">
              {{ selectedCategoryLabel || '请选择商品分类' }}
            </text>
            <uni-icons type="arrowright" size="16" color="#c0c4cc"></uni-icons>
          </view>
        </picker>
      </view>

      <!-- 商品价格 -->
      <view class="form-section">
        <view class="section-title required">商品价格</view>
        <view class="price-input-wrapper">
          <text class="currency">¥</text>
          <input 
            v-model="form.price" 
            class="price-input" 
            type="digit"
            placeholder="请输入价格"
          />
        </view>
      </view>

      <!-- 联系方式 -->
      <view class="form-section">
        <view class="section-title required">联系方式</view>
        <uni-easyinput 
          v-model="form.contactInfo" 
          placeholder="请输入手机号或微信号"
        ></uni-easyinput>
      </view>

      <!-- 商品描述 -->
      <view class="form-section">
        <view class="section-title required">商品描述</view>
        <textarea 
          v-model="form.description" 
          class="form-textarea" 
          placeholder="请详细描述商品情况(最多500字)"
          maxlength="500"
        ></textarea>
        <view class="char-count">{{ form.description.length }}/500</view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-section">
        <button class="submit-btn" @click="handleSubmit">
          {{ isEdit ? '保存修改' : '立即发布' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { addProduct, updateProduct, getProductDetail } from '@/api/campus/secondhand'
import config from '@/config'

export default {
  data() {
    return {
      isEdit: false,
      productId: null,
      baseUrl: config.baseUrl,
      form: {
        title: '',
        category: '',
        price: '',
        contactInfo: '',
        description: '',
        imageUrls: ''
      },
      imageList: [],
      categories: [
        { label: '数码', value: 'digital' },
        { label: '图书', value: 'book' },
        { label: '生活用品', value: 'daily' },
        { label: '服饰', value: 'clothing' },
        { label: '其他', value: 'other' }
      ]
    }
  },
  
  computed: {
    selectedCategoryLabel() {
      const cat = this.categories.find(c => c.value === this.form.category)
      return cat ? cat.label : ''
    }
  },
  
  onLoad(options) {
    if (options.productId) {
      this.isEdit = true
      this.productId = options.productId
      this.loadProduct()
    }
  },
  
  methods: {
    loadProduct() {
      getProductDetail(this.productId).then(res => {
        const product = res.data
        this.form = {
          title: product.title,
          category: product.category,
          price: product.price,
          contactInfo: product.contactInfo || '',
          description: product.description,
          imageUrls: product.imageUrls
        }
        if (product.imageUrls) {
          this.imageList = product.imageUrls.split(',').map(url => {
            if (url.startsWith('http')) return url
            return this.baseUrl + url
          })
        }
      })
    },
    
    chooseImage() {
      const remaining = 9 - this.imageList.length
      uni.chooseImage({
        count: remaining,
        sizeType: ['compressed'],
        success: (res) => {
          this.uploadImages(res.tempFilePaths)
        }
      })
    },
    
    uploadImages(paths) {
      uni.showLoading({ title: '上传中...' })
      
      const uploadPromises = paths.map(path => {
        return new Promise(async (resolve, reject) => {
          const uploadUrl = this.baseUrl + '/common/upload'
          const token = 'Bearer ' + uni.getStorageSync('token')
          
          // #ifdef H5
          try {
            // H5 环境下使用原生 XHR 上传，解决 uni.uploadFile 可能的兼容性问题
            const response = await fetch(path);
            const blob = await response.blob();
            const file = new File([blob], "image.png", { type: "image/png" });
            
            const formData = new FormData();
            formData.append('file', file);
            
            const xhr = new XMLHttpRequest();
            xhr.open('POST', uploadUrl, true);
            xhr.setRequestHeader('Authorization', token);
            
            xhr.onload = () => {
              if (xhr.status === 200) {
                try {
                  const data = JSON.parse(xhr.responseText);
                  if (data.code === 200) {
                    resolve(data.url || data.fileName);
                  } else {
                    reject(data.msg || '上传失败');
                  }
                } catch (e) {
                  reject('解析响应失败');
                }
              } else {
                reject('上传失败 Status: ' + xhr.status);
              }
            };
            
            xhr.onerror = () => {
              reject('网络请求失败');
            };
            
            xhr.send(formData);
          } catch (e) {
            console.error('H5上传异常:', e);
            reject('H5上传异常: ' + e.message);
          }
          // #endif

          // #ifndef H5
          uni.uploadFile({
            url: uploadUrl,
            filePath: path,
            name: 'file',
            header: {
              'Authorization': token
            },
            success: (res) => {
              try {
                const data = JSON.parse(res.data)
                if (data.code === 200) {
                  resolve(data.url || data.fileName)
                } else {
                  reject(data.msg || '上传失败')
                }
              } catch (e) {
                reject('服务器响应格式错误')
              }
            },
            fail: (err) => {
              reject(err.errMsg || '网络请求失败')
            }
          })
          // #endif
        })
      })
      
      Promise.all(uploadPromises).then(urls => {
        this.imageList = this.imageList.concat(urls)
        uni.hideLoading()
        this.$modal.msgSuccess('上传成功')
      }).catch(err => {
        uni.hideLoading()
        console.error('上传错误:', err)
        const errMsg = typeof err === 'string' ? err : (err.message || err.errMsg || '上传失败')
        this.$modal.msgError('上传失败：' + errMsg)
      })
    },
    
    removeImage(index) {
      this.imageList.splice(index, 1)
    },
    
    onCategoryChange(e) {
      this.form.category = this.categories[e.detail.value].value
    },
    
    validateForm() {
      if (this.imageList.length === 0) {
        this.$modal.msgError('请上传商品图片')
        return false
      }
      if (!this.form.title.trim()) {
        this.$modal.msgError('请输入商品标题')
        return false
      }
      if (!this.form.category) {
        this.$modal.msgError('请选择商品分类')
        return false
      }
      if (!this.form.price || this.form.price <= 0) {
        this.$modal.msgError('请输入正确的价格')
        return false
      }
      if (!this.form.contactInfo.trim()) {
        this.$modal.msgError('请输入联系方式')
        return false
      }
      if (!this.form.description.trim()) {
        this.$modal.msgError('请输入商品描述')
        return false
      }
      return true
    },
    
    handleSubmit() {
      if (!this.validateForm()) return
      
      const data = {
        ...this.form,
        imageUrls: this.imageList.join(','),
        status: '0' // 默认在售
      }
      
      if (this.isEdit) {
        data.productId = this.productId
      }
      
      uni.showLoading({ title: '提交中...' })
      
      const apiCall = this.isEdit ? updateProduct(data) : addProduct(data)
      
      apiCall.then(res => {
        uni.hideLoading()
        this.$modal.msgSuccess(this.isEdit ? '修改成功' : '发布成功')
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      }).catch(err => {
        uni.hideLoading()
        this.$modal.msgError('操作失败：' + err)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  background: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 40rpx;
}

.form-container {
  padding: 20rpx;
}

.form-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20rpx;
    
    &.required::before {
      content: '*';
      color: #f56c6c;
      margin-right: 6rpx;
    }
  }
  
  .form-input, .form-textarea {
    width: 100%;
    padding: 20rpx;
    background: #f5f7fa;
    border-radius: 8rpx;
    font-size: 28rpx;
    box-sizing: border-box;
  }
  
  .form-textarea {
    min-height: 200rpx;
  }
  
  .char-count {
    text-align: right;
    font-size: 24rpx;
    color: #909399;
    margin-top: 10rpx;
  }
}

.image-upload {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  
  .image-item {
    position: relative;
    width: 200rpx;
    height: 200rpx;
    
    .uploaded-image {
      width: 100%;
      height: 100%;
      border-radius: 8rpx;
    }
    
    .delete-btn {
      position: absolute;
      top: -10rpx;
      right: -10rpx;
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  
  .upload-btn {
    width: 200rpx;
    height: 200rpx;
    border: 2rpx dashed #dcdfe6;
    border-radius: 8rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    color: #909399;
    font-size: 24rpx;
  }
}

.picker-input {
  padding: 20rpx;
  background: #f5f7fa;
  border-radius: 8rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .placeholder {
    color: #c0c4cc;
  }
}

.price-input-wrapper {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f5f7fa;
  border-radius: 8rpx;
  
  .currency {
    font-size: 32rpx;
    font-weight: 600;
    color: #f56c6c;
    margin-right: 10rpx;
  }
  
  .price-input {
    flex: 1;
    font-size: 28rpx;
    background: transparent;
    padding: 0;
  }
}

.submit-section {
  padding: 30rpx;
  
  .submit-btn {
    width: 100%;
    height: 90rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-radius: 40rpx;
    font-size: 32rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
