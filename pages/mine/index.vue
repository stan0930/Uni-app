<template>
  <view class="mine-container">
    
    <view class="header-bg">
      <view class="absolute-header">
        <view class="user-box" @click="goToProfile">
          <view class="avatar-wrap">
             <image class="avatar" :src="avatar || '/static/images/profile.jpg'"></image>
             <view class="gender-badge" v-if="name">
                <uni-icons type="person-filled" size="12" color="#fff"></uni-icons>
             </view>
          </view>
          <view class="user-info">
            <view class="top-row">
               <text class="nickname">{{ nickName || '登录/注册' }}</text>
               <view class="vip-tag" v-if="name">学生认证</view>
            </view>
            <text class="username">@{{ name || 'login_please' }}</text>
          </view>
          <uni-icons type="right" size="16" color="rgba(255,255,255,0.8)"></uni-icons>
        </view>
        
        <view class="stats-row">
          <view class="stat-item" @click="goToCircleTab(0)">
            <text class="num">--</text>
            <text class="label">帖子</text>
          </view>
          <view class="stat-item" @click="goToCircleTab(2)">
            <text class="num">--</text>
            <text class="label">获赞</text>
          </view>
          <view class="stat-item" @click="goToCircleTab(3)">
            <text class="num">--</text>
            <text class="label">收藏</text>
          </view>
          <view class="stat-item">
            <text class="num">--</text>
            <text class="label">积分</text>
          </view>
        </view>
      </view>
      <image src="/static/images/banner/wave.png" class="wave-bg" mode="widthFix" v-if="false"></image>
    </view>
    
    <view class="menu-container">
      <view class="menu-card">
        <view class="card-title">账户管理</view>
        <uni-list :border="false">
          <uni-list-item title="个人资料" link to="/pages/mine/info/index" :border="false" showArrow>
            <template v-slot:header>
              <view class="icon-box blue"><uni-icons type="person-filled" size="20" color="#fff"></uni-icons></view>
            </template>
          </uni-list-item>
          <uni-list-item title="安全设置" link to="/pages/mine/pwd/index" :border="false" showArrow>
            <template v-slot:header>
              <view class="icon-box orange"><uni-icons type="locked-filled" size="20" color="#fff"></uni-icons></view>
            </template>
          </uni-list-item>
        </uni-list>
      </view>

      <view class="menu-card">
        <view class="card-title">更多服务</view>
        <uni-list :border="false">
          <uni-list-item title="常见问题" link to="/pages/mine/help/index" :border="false" showArrow>
            <template v-slot:header>
               <view class="icon-box green"><uni-icons type="help-filled" size="20" color="#fff"></uni-icons></view>
            </template>
          </uni-list-item>
          <uni-list-item title="关于我们" link to="/pages/mine/about/index" :border="false" showArrow>
             <template v-slot:header>
               <view class="icon-box purple"><uni-icons type="info-filled" size="20" color="#fff"></uni-icons></view>
             </template>
          </uni-list-item>
        </uni-list>
      </view>

      <button class="logout-btn" @click="handleLogout" v-if="name">退出登录</button>
      <view class="version-text">Version 1.2.0</view>
    </view>
    
  </view>
</template>

<script>
  import { mapGetters } from 'vuex'
  
  export default {
    data() {
      return {};
    },
    computed: {
      ...mapGetters(['avatar', 'nickName', 'name']) 
    },
    methods: {
      goToProfile() {
        if (this.name) {
          uni.navigateTo({ url: '/pages/mine/info/index' });
        } else {
          uni.navigateTo({ url: '/pages/login' });
        }
      },
      // 跳转到圈子页面的不同 Tab
      goToCircleTab(index) {
        // 这里假设圈子页面路径是 /pages/circle/index
        // 实际开发中，你可能需要通过 vuex 或 uni.$emit 传递 index，或者通过 url 参数
        // 简单做法：跳转过去，让用户自己点
        uni.switchTab({ url: '/pages/circle/index' });
      },
      handleLogout() {
        this.$modal.confirm('确定注销并退出系统吗？').then(() => {
          this.$store.dispatch('LogOut').then(() => {
            uni.reLaunch({ url: '/pages/login' });
          });
        });
      }
    }
  }
</script>

<style lang="scss" scoped>
  .mine-container {
    background-color: #f5f7fa;
    min-height: 100vh;
  }
  
  /* 头部背景 */
  .header-bg {
    position: relative;
    width: 100%;
    height: 480rpx;
    background: linear-gradient(135deg, #3c9cff 0%, #66b1ff 100%);
    border-bottom-left-radius: 60rpx;
    border-bottom-right-radius: 60rpx;
    overflow: hidden;
  }
  
  .absolute-header {
    padding: 100rpx 40rpx 0;
  }
  
  /* 用户信息区 */
  .user-box {
    display: flex;
    align-items: center;
    margin-bottom: 50rpx;
  }
  
  .avatar-wrap {
    position: relative;
  }
  .avatar {
    width: 110rpx;
    height: 110rpx;
    border-radius: 50%;
    border: 4rpx solid rgba(255,255,255,0.5);
    background-color: #fff;
  }
  .gender-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    background: #ff4d4f;
    border-radius: 50%;
    width: 32rpx;
    height: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2rpx solid #fff;
  }
  
  .user-info {
    flex: 1;
    margin-left: 24rpx;
    color: #fff;
  }
  .top-row {
    display: flex;
    align-items: center;
    margin-bottom: 8rpx;
  }
  .nickname {
    font-size: 36rpx;
    font-weight: bold;
    letter-spacing: 1px;
  }
  .vip-tag {
    font-size: 20rpx;
    background: rgba(0,0,0,0.2);
    padding: 2rpx 12rpx;
    border-radius: 20rpx;
    margin-left: 12rpx;
    border: 1px solid rgba(255,255,255,0.3);
  }
  .username {
    font-size: 24rpx;
    opacity: 0.8;
  }
  
  /* 数据统计栏 */
  .stats-row {
    display: flex;
    justify-content: space-around;
    color: #fff;
    padding: 0 10rpx;
  }
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .stat-item .num {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 4rpx;
  }
  .stat-item .label {
    font-size: 22rpx;
    opacity: 0.8;
  }
  
  /* 菜单列表容器 - 向上浮动覆盖背景 */
  .menu-container {
    padding: 0 30rpx;
    margin-top: -80rpx;
    position: relative;
    z-index: 10;
  }
  
  .menu-card {
    background: #fff;
    border-radius: 24rpx;
    padding: 10rpx 0;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03);
    overflow: hidden;
  }
  
  .card-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    padding: 24rpx 30rpx 10rpx;
  }
  
  /* 彩色图标盒子 */
  .icon-box {
    width: 60rpx;
    height: 60rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
  }
  .blue { background: linear-gradient(135deg, #66b1ff, #409eff); }
  .orange { background: linear-gradient(135deg, #ffcd50, #ff9f43); }
  .green { background: linear-gradient(135deg, #4cd137, #44bd32); }
  .purple { background: linear-gradient(135deg, #a55eea, #8854d0); }
  
  /* 退出按钮 */
  .logout-btn {
    margin-top: 40rpx;
    background: #fff;
    color: #ff4d4f;
    font-size: 30rpx;
    border-radius: 50rpx;
    border: none;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  }
  .logout-btn::after { border: none; }
  
  .version-text {
    text-align: center;
    color: #ccc;
    font-size: 22rpx;
    margin-top: 30rpx;
    margin-bottom: 50rpx;
  }
</style>