<template>
	<view class="container">
		
		<view class="navbar">
			<uni-segmented-control
				:current="currentTab"
				:values="tabs.map(v => v.name)"
				@clickItem="onClickItem"
				style-type="text"
				active-color="#3c9cff"
			></uni-segmented-control>
		</view>

		<view class="topic-list">
			<view v-for="(topic, index) in topicList" :key="topic.topicId" class="topic-item">
				<view class="topic-header">
					<image :src="topic.avatar || '/static/images/profile.jpg'" class="avatar"></image>
					<view class="user-info">
						<view class="nickname">{{ topic.nickName }}</view>
						<view class="create-time">{{ topic.createTime }}</view>
					</view>
					<uni-tag :text="formatTopicType(topic.topicType)" type="primary" size="mini" class="topic-type-tag"></uni-tag>
				</view>
				<view class="topic-content" @click="navigateTo(topic.topicId)">
					<rich-text :nodes="topic.content"></rich-text>
					<view class="image-list" v-if="topic.imageUrls">
						<image
							v-for="(url, imgIndex) in topic.imageUrls.split(',')"
							:key="imgIndex"
							:src="url"
							class="topic-image"
							mode="aspectFill"
							@click.stop="previewImage(topic.imageUrls, imgIndex)"
						></image>
					</view>
				</view>
				<view class="topic-actions">
					<view class="action-item" @click="handleLike(topic)">
						<uni-icons :type="topic.liked ? 'hand-up-filled' : 'hand-up'" size="20" :color="topic.liked ? '#3c9cff' : '#666'"></uni-icons>
						<text>{{ topic.likeCount || 0 }}</text>
					</view>
					<view class="action-item" @click="navigateTo(topic.topicId)">
						<uni-icons type="chat" size="20" color="#666"></uni-icons>
						<text>评论</text>
					</view>
					<view class="action-item" @click="handleFavorite(topic)">
						<uni-icons :type="topic.favorited ? 'star-filled' : 'star'" size="20" :color="topic.favorited ? '#f9ae3d' : '#666'"></uni-icons>
						<text>收藏</text>
					</view>
				</view>
			</view>
		</view>
		
		<uni-load-more :status="loadingStatus" />

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
	import { listTopic, toggleLike, toggleFavorite } from '@/api/campus/topic';

	export default {
		data() {
			return {
				topicList: [],
				loading: true,
				total: 0,
				
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
					{ name: '兼职', type: 'jobs' }
				],
				
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
					iconPath: '/static/images/tabbar/work.png', // 请替换为您的发布图标
					text: '发布',
					active: true
				}]
			};
		},
		onLoad() {
			this.getList();
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.queryParams.pageNum = 1;
			this.topicList = [];
			this.getList();
			uni.stopPullDownRefresh();
		},
		// 触底加载
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
			// 【新增】Tab点击事件
			onClickItem(e) {
				if (this.currentTab !== e.currentIndex) {
					this.currentTab = e.currentIndex;
					this.queryParams.topicType = this.tabs[e.currentIndex].type;
					
					// 重置并重新加载
					this.queryParams.pageNum = 1;
					this.topicList = [];
					this.getList();
				}
			},

			/** 【修改】获取列表 */
			getList() {
				this.loading = true;
				this.loadingStatus = 'loading';
				
				// 【修改】处理 'all' 类型
				let params = { ...this.queryParams };
				if (params.topicType === 'all') {
					params.topicType = null; // 后端查询所有
				}

				listTopic(params).then(res => {
					this.topicList = this.topicList.concat(res.rows);
					this.total = res.total;
					this.loading = false;
					if (this.topicList.length >= this.total) {
						this.loadingStatus = 'noMore';
					} else {
						this.loadingStatus = 'more';
					}
				}).catch(() => {
					this.loading = false;
					this.loadingStatus = 'more';
				});
			},
			
			// 【新增】格式化分区显示
			formatTopicType(type) {
			  const option = this.topicTypeOptions.find(item => item.value === type);
			  return option ? option.label : '其他';
			},

			// 点赞
			handleLike(topic) {
				toggleLike(topic.topicId).then(res => {
					topic.liked = res.data;
					if (topic.liked) {
						topic.likeCount++;
						this.$modal.msgSuccess("点赞成功");
					} else {
						topic.likeCount--;
						this.$modal.msgSuccess("取消点赞");
					}
				});
			},
			// 收藏
			handleFavorite(topic) {
				toggleFavorite(topic.topicId).then(res => {
					topic.favorited = res.data;
					if (topic.favorited) {
						this.$modal.msgSuccess("收藏成功");
					} else {
						this.$modal.msgSuccess("取消收藏");
					}
				});
			},
			// 详情
			navigateTo(topicId) {
				uni.navigateTo({
					url: '/pages/circle/detail?topicId=' + topicId
				});
			},
			// 预览图片
			previewImage(imageUrls, index) {
				let urls = imageUrls.split(',');
				uni.previewImage({
					urls: urls,
					current: index
				});
			},
			// FAB 点击
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

<style lang="scss">
	.container {
		background-color: #f4f4f4;
		min-height: 100vh;
	}
	
	/* 【新增】导航栏样式 */
	.navbar {
		background-color: #ffffff;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.topic-list {
		padding: 10px;
	}

	.topic-item {
		background-color: #fff;
		border-radius: 8px;
		margin-bottom: 10px;
		padding: 15px;
	}

	.topic-header {
		display: flex;
		align-items: center;
		position: relative;
	}

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
	}

	.user-info {
		margin-left: 10px;
	}

	.nickname {
		font-weight: bold;
	}

	.create-time {
		font-size: 12px;
		color: #999;
	}
	
	.topic-type-tag {
		position: absolute;
		top: 0;
		right: 0;
	}

	.topic-content {
		margin-top: 10px;
	}

	.image-list {
		margin-top: 10px;
		display: flex;
		flex-wrap: wrap;
	}

	.topic-image {
		width: 80px;
		height: 80px;
		margin-right: 5px;
		margin-bottom: 5px;
		border-radius: 6px;
	}

	.topic-actions {
		display: flex;
		justify-content: space-around;
		margin-top: 15px;
		padding-top: 10px;
		border-top: 1px solid #f0f0f0;
	}

	.action-item {
		display: flex;
		align-items: center;
		color: #666;
		font-size: 14px;
	}

	.action-item text {
		margin-left: 5px;
	}
</style>