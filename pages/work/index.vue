<template>
  <view class="work-container">
    <uni-swiper-dot class="uni-swiper-dot-box" :info="data" :current="current" field="content">
      <swiper class="swiper-box" :current="swiperDotIndex" @change="changeSwiper">
        <swiper-item v-for="(item, index) in data" :key="index">
          <view class="swiper-item" @click="clickBannerItem(item)">
            <image :src="item.image" mode="aspectFill" :draggable="false" />
          </view>
        </swiper-item>
      </swiper>
    </uni-swiper-dot>

    <uni-section title="校园应用" type="line"></uni-section>
    <view class="grid-body">
      <uni-grid :column="4" :showBorder="false" @change="changeAppGrid">
        
        <uni-grid-item :index="0">
          <view class="grid-item-box">
            <view class="icon-bg bg-gradient-red">
              <uni-icons type="calendar-filled" size="32" color="#fff"></uni-icons>
            </view>
            <text class="text">课表管理</text>
          </view>
        </uni-grid-item>

        <uni-grid-item :index="1">
          <view class="grid-item-box">
            <view class="icon-bg bg-gradient-blue">
              <uni-icons type="chatboxes-filled" size="32" color="#fff"></uni-icons>
            </view>
            <text class="text">校园圈子</text>
          </view>
        </uni-grid-item>

        <uni-grid-item :index="2">
          <view class="grid-item-box">
            <view class="icon-bg bg-gradient-purple">
              <uni-icons type="fire-filled" size="32" color="#fff"></uni-icons>
            </view>
            <text class="text">AI助手</text>
          </view>
        </uni-grid-item>

        <uni-grid-item :index="3">
          <view class="grid-item-box">
            <view class="icon-bg bg-gradient-orange">
              <uni-icons type="paperplane-filled" size="32" color="#fff"></uni-icons>
            </view>
            <text class="text">跑腿代办</text>
          </view>
        </uni-grid-item>

        <uni-grid-item :index="4">
          <view class="grid-item-box">
            <view class="icon-bg bg-gradient-green">
              <uni-icons type="cart-filled" size="32" color="#fff"></uni-icons>
            </view>
            <text class="text">二手市场</text>
          </view>
        </uni-grid-item>
        
      </uni-grid>
    </view>
	<floating-robot />
    <!-- <uni-section title="系统管理" type="line"></uni-section> -->
    <!-- <view class="grid-body">
      <uni-grid :column="4" :showBorder="false" @change="changeGrid">
        <uni-grid-item>
          <view class="grid-item-box">
            <uni-icons type="person-filled" size="30" color="#666"></uni-icons>
            <text class="text">用户管理</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box">
            <uni-icons type="staff-filled" size="30" color="#666"></uni-icons>
            <text class="text">角色管理</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box">
            <uni-icons type="color" size="30" color="#666"></uni-icons>
            <text class="text">菜单管理</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box">
            <uni-icons type="settings-filled" size="30" color="#666"></uni-icons>
            <text class="text">部门管理</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box">
            <uni-icons type="heart-filled" size="30" color="#666"></uni-icons>
            <text class="text">岗位管理</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box">
            <uni-icons type="bars" size="30" color="#666"></uni-icons>
            <text class="text">字典管理</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box">
            <uni-icons type="gear-filled" size="30" color="#666"></uni-icons>
            <text class="text">参数设置</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box">
            <uni-icons type="chat-filled" size="30" color="#666"></uni-icons>
            <text class="text">通知公告</text>
          </view>
        </uni-grid-item>
      </uni-grid>
    </view> -->
  </view>
</template>

<script>
  // 注意：这里不再引用 CourseSchedule 组件，因为已经改为跳转了
  export default {
    data() {
      return {
        current: 0,
        swiperDotIndex: 0,
        data: [{
            image: '/static/images/banner/banner01.jpg'
          },
          {
            image: '/static/images/banner/banner02.jpg'
          },
          {
            image: '/static/images/banner/banner03.jpg'
          }
        ]
      }
    },
    methods: {
      clickBannerItem(item) {
        console.info(item)
      },
      changeSwiper(e) {
        this.current = e.detail.current
      },
      changeAppGrid(e) {
        const index = e.detail.index;
        // 定义图标对应的跳转路径
        const urls = [
          '/pages/schedule/index', // 0: 课表管理
          '/pages/circle/index',   // 1: 校园圈子
          '/pages/ai/index',       // 2: AI助手
          '/pages/todo/index',     // 3: 跑腿代办
          '/pages/secondhand/index'                       // 4: 二手市场 (暂未开发)
        ];
        
        if (urls[index]) {
          uni.navigateTo({
            url: urls[index]
          });
        } 
		// else {
  //          this.$modal.showToast('模块建设中~');
  //       }
      },
      changeGrid(e) {
        this.$modal.showToast('模块建设中~')
      }
    }
  }
</script>

<style lang="scss" scoped>
  /* #ifndef APP-NVUE */
  page {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    background-color: #f5f7fa; 
    min-height: 100%;
    height: auto;
  }
  /* #endif */

  .work-container {
    background-color: #fff;
    padding-bottom: 20rpx;
  }

  .text {
    text-align: center;
    font-size: 26rpx;
    margin-top: 16rpx;
    color: #333;
  }

  .grid-item-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20rpx 0;
  }
  
  /* 图标背景样式 */
  .icon-bg {
    width: 100rpx;
    height: 100rpx;
    border-radius: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.1);
    transition: transform 0.1s;
  }
  
  .icon-bg:active {
    transform: scale(0.95);
  }

  /* 渐变色定义 */
  .bg-gradient-red {
    background: linear-gradient(135deg, #FF5252, #FF1744);
  }
  .bg-gradient-blue {
    background: linear-gradient(135deg, #007AFF, #00C6FF);
  }
  .bg-gradient-purple {
    background: linear-gradient(135deg, #9C27B0, #E040FB);
  }
  .bg-gradient-orange {
    background: linear-gradient(135deg, #FF9800, #FFC107);
  }
  .bg-gradient-green {
    background: linear-gradient(135deg, #4CAF50, #8BC34A);
  }

  .uni-margin-wrap {
    width: 100%;
  }

  .swiper {
    height: 300rpx;
  }

  .swiper-box {
    height: 150px;
  }

  .swiper-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #fff;
    height: 300rpx;
    line-height: 300rpx;
  }

  @media screen and (min-width: 500px) {
    .uni-swiper-dot-box {
      width: 400px;
      margin: 0 auto;
      margin-top: 8px;
    }

    .image {
      width: 100%;
    }
  }
</style>