<template>
  <view class="mine-container">
    
    <view class="profile-card card-container" @click="goToProfile">
      <view class="user-info">
        <image class="avatar" :src="avatar"></image>
        <view class="user-meta">
          <text class="nickname">{{ nickName || '未设置昵称' }}</text>
          <text class="username">@{{ name || '点击登录' }}</text>
        </view>
      </view>
      <uni-icons type="arrow-right" size="18" color="#ecf5ff"></uni-icons>
    </view>
    
    <uni-section title="账户设置" type="line" padding>
      <view class="menu-list">
        <uni-list :border="false">
          <uni-list-item title="个人信息" link to="/pages/mine/info/index" :border="false" :showArrow="true">
            <template v-slot:header>
              <uni-icons type="person" size="22" color="#409EFF"></uni-icons>
            </template>
          </uni-list-item>
          <uni-list-item title="修改密码" link to="/pages/mine/pwd/index" :border="false" :showArrow="true">
            <template v-slot:header>
              <uni-icons type="locked" size="22" color="#E6A23C"></uni-icons>
            </template>
          </uni-list-item>
        </uni-list>
      </view>
    </uni-section>

    <uni-section title="系统" type="line" padding>
      <view class="menu-list">
        <uni-list :border="false">
          <uni-list-item title="常见问题" link to="/pages/mine/help/index" :border="false" :showArrow="true">
            <template v-slot:header>
              <uni-icons type="help" size="22" color="#67C23A"></uni-icons>
            </template>
          </uni-list-item>
          <uni-list-item title="关于我们" link to="/pages/mine/about/index" :border="false" :showArrow="true">
            <template v-slot:header>
              <uni-icons type="info" size="22" color="#909399"></uni-icons>
            </template>
          </uni-list-item>
        </uni-list>
      </view>
    </uni-section>

    <view class="logout-section">
      <button class="logout-button" @click="handleLogout">退出登录</button>
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
      // 【修正】确保 getters 与 store/getters.js 一致
      ...mapGetters(['avatar', 'nickName', 'name']) // 使用 name (用户名)
    },
    methods: {
      goToProfile() {
        if (this.name) { // 检查 name 是否存在
          uni.navigateTo({ url: '/pages/mine/info/index' });
        } else {
          uni.navigateTo({ url: '/pages/login' });
        }
      },
      handleLogout() {
        this.$store.dispatch('LogOut').then(() => {
          uni.reLaunch({ url: '/pages/login' });
        });
      }
    }
  }
</script>

<style lang="scss" scoped>
  /* 引用全局变量 */
  @import "@/uni.scss";
  
  .mine-container {
    background-color: var(--page-bg-color);
    min-height: 100vh;
  }
  
  .profile-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(to right, #409EFF, #66b1ff);
    box-shadow: 0 4px 10px rgba(64, 158, 255, 0.4);
  }
  
  .user-info {
    display: flex;
    align-items: center;
  }
  
  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 2px solid #ffffff;
  }
  
  .user-meta {
    margin-left: 15px;
    display: flex;
    flex-direction: column;
  }
  
  .nickname {
    font-size: 18px;
    font-weight: bold;
    color: #ffffff;
  }
  
  .username {
    font-size: 13px;
    color: #ecf5ff;
    margin-top: 4px;
  }
  
  .menu-list {
    background-color: var(--card-bg-color);
    border-radius: 10px;
    overflow: hidden;
  }
  
  ::v-deep .uni-list-item {
    padding-left: 10px !important;
  }
  
  ::v-deep .uni-list-item__container {
    padding: 12px 15px !important;
  }
  
  ::v-deep .uni-list-item__header {
    width: 25px;
    margin-right: 12px;
  }
  
  ::v-deep .uni-list-item__content-title {
    font-size: 15px !important;
    color: var(--text-color-primary) !important;
  }

  .logout-section {
    padding: 20px;
  }
  
  .logout-button {
    background-color: #fef0f0 !important;
    color: #fa5151 !important;
    font-size: 15px;
    border-radius: 50px;
  }
</style>