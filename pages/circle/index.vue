<template>
  <view class="container">
    
    <view class="navbar-wrapper">
      <view class="navbar-inner">
        <uni-segmented-control
          :current="currentTab"
          :values="tabs.map(v => v.name)"
          @clickItem="onClickItem"
          style-type="text"
          active-color="#3c9cff"
          class="tab-control"
        ></uni-segmented-control>
      </view>
      
      <view v-if="isMyPage" class="sub-navbar-inner">
        <uni-segmented-control
          :current="currentMyTab"
          :values="myTabs.map(v => v.name)"
          @clickItem="onMyClickItem"
          style-type="text"
          active-color="#3c9cff"
          class="sub-tab-control"
        ></uni-segmented-control>
      </view>
    </view>

    <view class="list-container">
      <view 
        v-for="(topic, index) in topicList" 
        :key="topic.topicId" 
        class="post-card"
        :style="{ animationDelay: index * 0.05 + 's' }"
        @click="navigateTo(topic.topicId)"
      >
        <view class="card-header">
          <view class="user-row">
            <image 
              :src="getAvatarUrl(topic.avatar)" 
              class="avatar" 
              mode="aspectFill"
            ></image>
            <view class="user-info">
              <text class="nickname">{{ topic.nickName || '神秘同学' }}</text>
              <text class="time">{{ topic.createTime }}</text>
            </view>
          </view>
          <view :class="['tag', 'tag-' + topic.topicType]">
            {{ formatTopicType(topic.topicType) }}
          </view>
        </view>

        <view class="card-content">
          <rich-text :nodes="topic.content" class="text-content"></rich-text>
          
          <view class="image-grid" v-if="topic.imageList && topic.imageList.length > 0">
             <view 
               class="grid-item" 
               v-for="(url, imgIndex) in topic.imageList" 
               :key="imgIndex"
               :class="topic.gridClass"
               @click.stop="previewImage(topic.imageList, imgIndex)"
             >
               <image 
                 :src="getImageUrl(url)" 
                 mode="aspectFill" 
                 class="grid-img"
               ></image>
             </view>
          </view>
        </view>

        <view class="card-footer">
          <view class="action-btn" @click.stop="handleLike(topic)">
            <uni-icons 
              :type="topic.liked ? 'hand-up-filled' : 'hand-up'" 
              size="20" 
              :color="topic.liked ? '#3c9cff' : '#909399'"
            ></uni-icons>
            <text :class="{ 'active-text': topic.liked }">{{ topic.likeCount || 0 }}</text>
          </view>
          
          <view class="action-btn" @click.stop="navigateTo(topic.topicId)">
            <uni-icons type="chat" size="20" color="#909399"></uni-icons>
            <text>评论</text>
          </view>
          
          <view class="action-btn" @click.stop="handleFavorite(topic)">
            <uni-icons 
              :type="topic.favorited ? 'star-filled' : 'star'" 
              size="20" 
              :color="topic.favorited ? '#f9ae3d' : '#909399'"
            ></uni-icons>
            <text :class="{ 'active-text-fav': topic.favorited }">{{ topic.favorited ? '已收藏' : '收藏' }}</text>
          </view>
        </view>
      </view>
      
      <uni-load-more :status="loadingStatus" />
      
      <view v-if="!loading && topicList.length === 0" class="empty-state">
         <image src="/static/images/empty.png" mode="widthFix" style="width: 200rpx; margin-bottom: 20rpx; opacity: 0.5;" />
         <text>这里静悄悄的...</text>
      </view>
    </view>

    <uni-fab
      ref="fab"
      :pattern="pattern"
      :content="content"
      horizontal="right"
      vertical="bottom"
      @trigger="trigger"
    />
  </view> 
</template>

<script>
  import { 
    listTopic, 
    toggleLike, 
    toggleFavorite, 
    listMyTopics, 
    listMyCommentedTopics, 
    listMyLikedTopics,
    listMyFavoriteTopics
  } from '@/api/campus/topic';
  import config from '@/config';

  export default {
    data() {
      return {
        topicList: [],
        loading: true,
        total: 0,
        baseUrl: config.baseUrl,
        
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          topicType: 'all' 
        },
        
        currentTab: 0, 
        tabs: [
          { name: '全部', type: 'all' },
          { name: '推荐', type: 'recommend' },
          { name: '问答', type: 'qa' },
          { name: '二手', type: 'secondhand' },
          { name: '交友', type: 'dating' },
          { name: '兼职', type: 'jobs' },
          { name: '我的', type: 'my' }
        ],
        
        myTabs: [
          { name: '我的圈子', type: 'my-list' },
          { name: '我的评论', type: 'my-comments' },
          { name: '我的点赞', type: 'my-likes' },
          { name: '我的收藏', type: 'my-favorites' }
        ],
        currentMyTab: 0, 
        
        topicTypeOptions: [
          { value: 'recommend', label: '推荐' },
          { value: 'qa', label: '问答' },
          { value: 'secondhand', label: '二手' },
          { value: 'dating', label: '恋爱交友' },
          { value: 'jobs', label: '兼职信息' },
          { value: 'gossip', label: '校园八卦' }
        ],
        
        loadingStatus: 'more',
        pattern: {
          color: '#7A7E83',
          backgroundColor: '#fff',
          selectedColor: '#3c9cff',
          buttonColor: '#3c9cff',
          iconColor: '#fff'
        },
        content: [{
          iconPath: '/static/images/tabbar/work.png',
          text: '发布',
          active: true
        }]
      };
    },
    computed: {
      isMyPage() {
        return this.tabs[this.currentTab].type === 'my';
      }
    },
    onLoad() {
      this.getList();
    },
    onPullDownRefresh() {
      this.resetList();
      uni.stopPullDownRefresh();
    },
    onReachBottom() {
      if (this.topicList.length >= this.total) {
        this.loadingStatus = 'noMore';
      } else {
        this.loadingStatus = 'loading';
        this.queryParams.pageNum++;
        this.getList();
      }
    },
    methods: {
      resetList() {
        this.queryParams.pageNum = 1;
        this.topicList = [];
        this.getList();
      },
      
      onClickItem(e) {
        if (this.currentTab !== e.currentIndex) {
          this.currentTab = e.currentIndex;
          const selectedTabType = this.tabs[e.currentIndex].type;

          if (selectedTabType === 'my') {
            this.queryParams.topicType = this.myTabs[this.currentMyTab].type;
          } else {
            this.queryParams.topicType = selectedTabType;
          }
          this.resetList();
        }
      },
      
      onMyClickItem(e) {
        if (this.currentMyTab !== e.currentIndex) {
          this.currentMyTab = e.currentIndex;
          this.queryParams.topicType = this.myTabs[e.currentIndex].type;
          this.resetList();
        }
      },

      getList() {
        this.loading = true;
        this.loadingStatus = 'loading';
        
        let params = { ...this.queryParams };
        let apiCall;
        
        const topicType = params.topicType;

        if (topicType === 'my-list') {
          params.topicType = null; 
          apiCall = listMyTopics(params);
        } else if (topicType === 'my-comments') { 
          params.topicType = null;
          apiCall = listMyCommentedTopics(params);
        } else if (topicType === 'my-likes') {
          params.topicType = null;
          apiCall = listMyLikedTopics(params);
        } else if (topicType === 'my-favorites') {
          params.topicType = null;
          apiCall = listMyFavoriteTopics(params);
        } else {
          if (topicType === 'all') {
            params.topicType = null; 
          }
          apiCall = listTopic(params);
        }

        apiCall.then(res => {
          // 【修复点2】数据预处理：在 JS 中计算好 gridClass 和 imageList
          const newRows = res.rows.map(item => {
            // 1. 将字符串转为数组，方便 v-for 使用
            item.imageList = item.imageUrls ? item.imageUrls.split(',') : [];
            // 2. 提前计算好样式类名
            item.gridClass = this.getImageGridClass(item.imageList.length);
            return item;
          });

          if (this.queryParams.pageNum === 1) {
            this.topicList = newRows;
          } else {
            this.topicList = this.topicList.concat(newRows);
          }
          
          this.total = res.total;
          this.loading = false;
          this.loadingStatus = this.topicList.length >= this.total ? 'noMore' : 'more';
        }).catch(() => {
          this.loading = false;
          this.loadingStatus = 'more';
        });
      },
      
      getAvatarUrl(avatar) {
        if (!avatar) return '/static/images/profile.jpg';
        if (avatar.startsWith('http') || avatar.startsWith('https')) return avatar;
        return this.baseUrl + avatar;
      },
      
      getImageUrl(url) {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('https')) return url;
        return this.baseUrl + url;
      },
      
      // 此方法现在只在 JS 中调用，不直接在 template 中调用
      getImageGridClass(count) {
        if (count === 1) return 'grid-1';
        if (count === 2) return 'grid-2';
        if (count === 4) return 'grid-2'; 
        return 'grid-3'; 
      },

      formatTopicType(type) {
        const option = this.topicTypeOptions.find(item => item.value === type);
        return option ? option.label : '动态';
      },

      handleLike(topic) {
        toggleLike(topic.topicId).then(res => {
          topic.liked = res.data;
          if (topic.liked) {
            topic.likeCount++;
            this.$modal.msgSuccess("点赞成功");
          } else {
            topic.likeCount--;
          }
        });
      },
      handleFavorite(topic) {
        toggleFavorite(topic.topicId).then(res => {
          topic.favorited = res.data;
          if (topic.favorited) {
            this.$modal.msgSuccess("已收藏");
          } else {
            this.$modal.msgSuccess("已取消收藏");
          }
        });
      },
      navigateTo(topicId) {
        uni.navigateTo({
          url: '/pages/circle/detail?topicId=' + topicId
        });
      },
      // 预览图片逻辑微调：直接使用传入的 imageList 数组
      previewImage(imageList, index) {
        let urls = imageList.map(url => this.getImageUrl(url));
        uni.previewImage({
          urls: urls,
          current: index
        });
      },
      trigger(e) {
        if (e.index === 0) {
          uni.navigateTo({
            url: '/pages/circle/post'
          });
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  /* 样式保持不变，直接复用上一版的美化样式 */
  .container {
    background-color: #f5f7fa;
    min-height: 100vh;
    padding-bottom: 20px;
  }
  
  .navbar-wrapper {
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.03);
  }
  .navbar-inner, .sub-navbar-inner {
    padding: 10rpx 0;
  }
  .sub-navbar-inner {
    border-top: 1rpx solid #f0f0f0;
  }

  .list-container {
    padding: 24rpx;
  }

  .post-card {
    background: #ffffff;
    border-radius: 24rpx;
    margin-bottom: 24rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
    opacity: 0;
    transform: translateY(20px);
    animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }

  @keyframes slideUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20rpx;
  }
  .user-row {
    display: flex;
    align-items: center;
  }
  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    border: 2rpx solid #f0f0f0;
    margin-right: 20rpx;
  }
  .user-info {
    display: flex;
    flex-direction: column;
  }
  .nickname {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 6rpx;
  }
  .time {
    font-size: 24rpx;
    color: #999;
  }

  .tag {
    font-size: 22rpx;
    padding: 4rpx 16rpx;
    border-radius: 20rpx;
    font-weight: 500;
  }
  .tag-recommend { background: #fff0f0; color: #ff4d4f; }
  .tag-qa { background: #e6f7ff; color: #1890ff; }
  .tag-secondhand { background: #f6ffed; color: #52c41a; }
  .tag-dating { background: #fff2e8; color: #fa8c16; }
  .tag-jobs { background: #f9f0ff; color: #722ed1; }
  .tag-gossip { background: #fffbe6; color: #faad14; }

  .text-content {
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;
    margin-bottom: 20rpx;
    display: block;
  }

  .image-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 20rpx;
  }
  .grid-item {
    position: relative;
  }
  .grid-img {
    width: 100%;
    height: 100%;
    border-radius: 12rpx;
    background-color: #f5f5f5;
  }
  /* Grid 布局逻辑 */
  .grid-1 { width: 400rpx; height: 400rpx; }
  .grid-2 { width: calc(50% - 6rpx); height: 220rpx; }
  .grid-3 { width: calc(33.33% - 8rpx); height: 220rpx; }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1rpx solid #f8f8f8;
    padding-top: 20rpx;
  }
  .action-btn {
    display: flex;
    align-items: center;
    padding: 10rpx 20rpx;
    border-radius: 12rpx;
  }
  .action-btn:active {
    background-color: #f5f7fa;
  }
  .action-btn text {
    font-size: 26rpx;
    color: #606266;
    margin-left: 10rpx;
  }
  .active-text { color: #3c9cff; }
  .active-text-fav { color: #f9ae3d; }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 100rpx;
    color: #c0c4cc;
    font-size: 28rpx;
  }
</style>