<template>
  <view class="container">
    
    <view class="topic-detail-card">
      <view class="header-info">
        <image class="avatar" src="/static/images/profile.jpg" mode="aspectFill"></image>
        <view class="meta-info">
          <text class="author-name">{{ topic.createBy }}</text>
          <text class="time">{{ formatTime(topic.createTime) }}</text>
        </view>
      </view>

      <view class="topic-title">{{ topic.title }}</view>
      <view class="topic-content-wrapper">
        <text class="content">{{ topic.content }}</text>
      </view>
    </view>

    <uni-section title="最新评论" type="line" padding>
      <view class="comment-list">
        <view v-for="comment in commentList" :key="comment.commentId" class="comment-item">
          <text class="comment-author">{{ comment.createBy }}：</text>
          <text class="comment-content">{{ comment.content }}</text>
        </view>
        <uni-load-more :status="loadingStatus"></uni-load-more>
      </view>
    </uni-section>

    <view class="bottom-input-bar">
      <input 
        class="comment-input" 
        v-model="commentForm.content" 
        placeholder="发表你的看法..." 
        confirm-type="send"
        @confirm="submitComment"
      />
      <button class="send-button" @click="submitComment" :disabled="!commentForm.content || isPosting">发送</button>
    </view>
  </view>
</template>

<script>
import { listComment, addComment } from '@/api/campus/comment'
// 假设您还需要话题详情 API，这里我们假设 listTopic 接口能通过 topicId 查询单个话题
import { listTopic } from '@/api/campus/topic' 
// 确保 parseTime 函数可用
function parseTime(time, cFormat) { /* ... (函数体保持不变) ... */ return time }

export default {
  data() {
    return {
      topicId: null,
      topic: {}, // 当前话题对象
      commentList: [],
      commentForm: {
        topicId: null,
        content: ''
      },
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        topicId: null
      },
      total: 0,
      loadingStatus: 'more',
      isPosting: false
    }
  },
  onLoad(options) {
    this.topicId = options.topicId
    this.commentForm.topicId = options.topicId
    this.queryParams.topicId = options.topicId
    this.getTopicDetail()
    this.getCommentList()
  },
  methods: {
    formatTime(time) { return parseTime(time, '{m}-{d} {h}:{i}') },
    
    // 获取话题详情
    getTopicDetail() {
        // 假设 listTopic 接口支持通过 topicId 精确查询
        listTopic({ topicId: this.topicId }).then(res => {
            if (res.rows && res.rows.length > 0) {
                this.topic = res.rows[0];
            }
        }).catch(err => {
            uni.showToast({ title: '加载话题详情失败', icon: 'none' })
        })
    },

    // 获取评论列表
    getCommentList() {
      if (this.loadingStatus === 'noMore' || this.loadingStatus === 'loading') return;
      this.loadingStatus = 'loading'
      listComment(this.queryParams).then(res => {
        this.commentList = [...this.commentList, ...res.rows]
        this.total = res.total
        this.loadingStatus = (this.commentList.length >= this.total) ? 'noMore' : 'more'
      }).catch(err => {
        uni.showToast({ title: '加载评论失败', icon: 'none' })
        this.loadingStatus = 'more'
      })
    },
    
    // 提交评论
    submitComment() {
      if (!this.commentForm.content.trim()) {
        uni.showToast({ title: '评论内容不能为空', icon: 'none' });
        return;
      }
      this.isPosting = true;
      addComment(this.commentForm).then(res => {
        uni.showToast({ title: '评论成功', icon: 'success' });
        this.commentForm.content = '';
        this.commentList = []; // 清空列表
        this.queryParams.pageNum = 1;
        this.loadingStatus = 'more';
        this.getCommentList(); // 重新加载评论列表
      }).catch(err => {
        uni.showToast({ title: '评论失败，请检查评论接口', icon: 'none' });
      }).finally(() => {
        this.isPosting = false;
      })
    }
  }
}
</script>

<style scoped>
/* 样式美化 */
.container {
  padding-bottom: 60px; /* 为底部输入条留出空间 */
  background-color: var(--page-bg-color);
  min-height: 100vh;
}
.topic-detail-card {
  background-color: #ffffff;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.header-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}
.author-name {
  font-weight: bold;
  font-size: 16px;
}
.time {
  font-size: 12px;
  color: #909399;
  display: block;
}
.topic-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}
.topic-content-wrapper {
  margin-bottom: 20px;
}
.content {
  font-size: 15px;
  color: #303133;
  line-height: 1.8;
  white-space: pre-wrap;
}

/* 评论区样式 */
.comment-list {
  background-color: #ffffff;
  padding: 0 15px;
}
.comment-item {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}
.comment-author {
  font-weight: bold;
  color: var(--primary-color);
  font-size: 14px;
}
.comment-content {
  font-size: 14px;
  color: #303133;
}

/* 底部输入条 */
.bottom-input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 8px 10px;
  background-color: #ffffff;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.03);
  z-index: 10;
}
.comment-input {
  flex: 1;
  height: 36px;
  line-height: 36px;
  background-color: #f5f5f5;
  border-radius: 18px;
  padding: 0 15px;
  margin-right: 10px;
}
.send-button {
  height: 36px;
  line-height: 36px;
  width: 70px;
  font-size: 14px;
  background-color: var(--primary-color);
  color: #ffffff;
  border-radius: 18px;
  padding: 0;
}
</style>