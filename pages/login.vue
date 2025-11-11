<template>
  <view class="login-container">
    
    <view class="header-section">
      <image :src="logoUrl" class="logo"></image>
      <text class="title">欢迎登录</text>
      <text class="subtitle">登录以继续使用您的校园服务</text>
    </view>

    <view class="form-section">
      <uni-forms ref="form" :modelValue="loginForm" :rules="rules">
        
        <uni-forms-item name="username">
          <view class="form-item-wrapper">
            <uni-icons type="person" size="24" color="#909399"></uni-icons>
            <input class="input-field" v-model="loginForm.username" placeholder="请输入您的账号" />
          </view>
        </uni-forms-item>
        
        <uni-forms-item name="password">
          <view class="form-item-wrapper">
            <uni-icons type="locked" size="24" color="#909399"></uni-icons>
            <input class="input-field" v-model="loginForm.password" password placeholder="请输入您的密码" />
          </view>
        </uni-forms-item>
        
        <uni-forms-item v-if="captchaEnabled" name="code">
          <view class="form-item-wrapper captcha-wrapper">
            <uni-icons type="auth" size="24" color="#909399"></uni-icons>
            <input class="input-field" v-model="loginForm.code" placeholder="请输入验证码" />
            <image :src="codeUrl" @click="getCode" class="captcha-image"></image>
          </view>
        </uni-forms-item>
        
      </uni-forms>
      
      <button class="primary-button" @click="handleLogin" :loading="loading">
        登 录
      </button>
      
      <view class="links">
        <text class="link-item" @click="goToRegister">注册账号</text>
        <text class="link-item">忘记密码?</text>
      </view>
    </view>
    
  </view>
</template>

<script>
  // 仅导入 getCodeImg
  import { getCodeImg } from '@/api/login'
  import config from '@/config'

  export default {
    data() {
      return {
        logoUrl: config.appInfo.logo || '/static/logo.png',
        loginForm: {
          username: "",
          password: "",
          code: "",
          uuid: ""
        },
        codeUrl: "",
        captchaEnabled: true,
        loading: false, // 默认必须为 false
        rules: {
          username: { rules: [{ required: true, errorMessage: '请输入账号' }] },
          password: { rules: [{ required: true, errorMessage: '请输入密码' }] },
          code: { rules: [{ required: true, errorMessage: '请输入验证码' }] }
        }
      }
    },
    created() {
      this.getCode()
    },
    methods: {
      getCode() {
        getCodeImg().then(res => {
          this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled
          if (this.captchaEnabled) {
            this.codeUrl = "data:image/gif;base64," + res.img
            this.loginForm.uuid = res.uuid
          }
        })
      },
      
      // -------------------- 核心修正点 (添加了详细的错误处理) --------------------
      handleLogin() {
        this.$refs.form.validate().then(res => {
          this.loading = true // 按钮进入加载状态，文字消失
          
          // 1. 调用 Vuex 的 Login 动作 (只获取 Token)
          this.$store.dispatch('Login', this.loginForm).then(() => {
            
            // 2. 登录成功后，立即调用 Vuex 的 GetInfo 动作 (获取用户信息)
            this.$store.dispatch('GetInfo').then(res => {
              
              // 3. GetInfo 成功
              this.loading = false // 恢复按钮
              uni.reLaunch({ url: '/pages/index' })
              
            }).catch(err => {
              // GetInfo 失败 (例如 /getInfo 接口报错或网络拦截)
              console.error("GetInfo 失败:", err)
              uni.showToast({ title: '获取用户信息失败，请重试', icon: 'none' })
              this.loading = false // 恢复按钮
              this.getCode()
            })
            
          }).catch((err) => {
            // Login 失败 (例如密码错误)
            console.error("Login 失败:", err)
            // request.js 中已经 toast 了，这里只重置状态
            this.loading = false // 恢复按钮
            this.getCode()
          })
          
        }).catch(err => {
          // 表单校验失败
          console.log('表单校验失败', err);
        })
      },
      // -------------------- 修正结束 --------------------

      goToRegister() {
        uni.navigateTo({ url: '/pages/register' })
      }
    }
  }
</script>

<style lang="scss" scoped>
  /* 确保您在 App.vue 中定义了 .primary-button 样式。
    为了防止样式丢失，我们在这里也定义一份关键样式。
  */
  .primary-button {
    background: linear-gradient(to right, #ecf5ff, #409EFF);
    background-color: #409EFF !important;
    color: #ffffff !important;
    border-radius: 50px !important;
    font-size: 16px !important;
    height: 44px;
    line-height: 44px;
    box-shadow: 0 4px 10px rgba(64, 158, 255, 0.4);
    
    /* 修复微信小程序中 loading 状态下文字颜色问题 */
    &[loading]::after {
      border-color: #ffffff #ffffff #ffffff transparent !important;
    }
  }

  /* 登录页原有美化样式 */
  .login-container {
    padding: 30px 20px;
    background-color: #f4f6f8;
    min-height: 100vh;
  }
  
  .header-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 0;
  }
  
  .logo {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-bottom: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
  
  .title {
    font-size: 24px;
    font-weight: bold;
    color: #303133;
  }
  
  .subtitle {
    font-size: 14px;
    color: #909399;
    margin-top: 5px;
  }

  .form-section {
    width: 100%;
  }

  .form-item-wrapper {
    background-color: #ffffff;
    padding: 8px 15px;
    border-radius: 50px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    border: 1px solid #e4e7ed;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }
  
  .input-field {
    flex: 1;
    height: 40px;
    line-height: 40px;
    font-size: 15px;
    margin-left: 10px;
  }
  
  .captcha-wrapper {
    padding-right: 0;
  }
  
  .captcha-image {
    width: 100px;
    height: 40px;
    border-radius: 0 50px 50px 0;
  }
  
  .links {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }
  
  .link-item {
    font-size: 13px;
    color: #909399;
  }
</style>