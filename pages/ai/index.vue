<template>
	<view class="container">
		<scroll-view :scroll-y="true" class="chat-window" :scroll-top="scrollTop" scroll-with-animation="true">
			<view v-for="(item, index) in chatHistory" :key="index" class="message-row" :class="item.from">
				<view class="message-bubble">
					<rich-text v-if="item.content" :nodes="item.content.replace(/\n/g, '<br>')"></rich-text>
				</view>
			</view>
		</scroll-view>

		<view class="input-area">
			<uni-easyinput 
				type="text" 
				v-model="message" 
				placeholder="请输入您的问题..."
				@confirm="handleSend"
				:inputBorder="false"
				class="input-field"
			></uni-easyinput>
			<button @click="handleSend" :disabled="loading" type="primary" class="send-btn">发送</button>
		</view>
	</view>
</template>

<script>
import { sendMessage } from '@/api/ai/chat';

export default {
	data() {
		return {
			message: '',
			loading: false,
			chatHistory: [
				{ from: 'ai', content: '您好，我是您的 AI 助手，有什么可以帮您的吗？' }
			],
			scrollTop: 0 
		};
	},
	methods: {
		handleSend() {
			const userMessage = this.message.trim();
			if (!userMessage) {
				this.$modal.msgError('消息不能为空');
				return;
			}

			this.chatHistory.push({ from: 'user', content: userMessage });
			this.message = ''; 
			this.loading = true;
			this.scrollToBottom(); 

			sendMessage({ content: userMessage }).then(res => {
				
				// 【【【 *** 修正点在这里 *** 】】】
				// 'res' 已经是AI回复的字符串，而不是 { data: '...' }
				// 并且检查 res 是否为字符串，防止后端返回空
				const aiReply = (typeof res === 'string') ? res : '我好像没听懂...';
				this.chatHistory.push({ from: 'ai', content: aiReply });
				// 【【【 *** 修正结束 *** 】】】
				
				this.loading = false;
				this.scrollToBottom(); 
			}).catch(() => {
				this.chatHistory.push({ from: 'ai', content: '抱歉，我暂时无法回答您的问题。' });
				this.loading = false;
				this.scrollToBottom();
			});
		},

		scrollToBottom() {
			this.$nextTick(() => {
				this.scrollTop = this.chatHistory.length * 1000; 
			});
		}
	},
	mounted() {
		this.scrollToBottom();
	}
};
</script>

<style lang="scss">
page {
	height: 100%;
}

.container {
	display: flex;
	flex-direction: column;
	height: 100%; 
	background-color: #f4f4f4;
}

.chat-window {
	flex: 1;
	padding: 10px;
	overflow-y: auto;
	width: 100%;
	box-sizing: border-box; 
}

.message-row {
	display: flex;
	margin-bottom: 15px;

	.message-bubble {
		padding: 10px 15px;
		border-radius: 12px;
		max-width: 70%;
		word-wrap: break-word; 
		font-size: 15px;
		line-height: 1.6;
	}

	&.ai {
		justify-content: flex-start;
		.message-bubble {
			background-color: #ffffff;
			color: #333;
			border-top-left-radius: 0;
		}
	}

	&.user {
		justify-content: flex-end;
		.message-bubble {
			background-color: #3c9cff;
			color: #ffffff;
			border-top-right-radius: 0;
		}
	}
}

.input-area {
	display: flex;
	align-items: center;
	padding: 10px;
	background-color: #fff;
	border-top: 1px solid #e0e0e0;
	
	.input-field {
		flex: 1;
		background-color: #f4f4f4;
		border-radius: 20px;
		padding: 0 15px; 
	}
	
	::v-deep .uni-easyinput__content-input {
		height: 40px;
		line-height: 40px;
		font-size: 15px;
	}

	.send-btn {
		margin-left: 10px;
		font-size: 14px;
		height: 40px;
		line-height: 40px;
	}
}
</style>