<template>
	<view class="container">
		<scroll-view :scroll-y="true" class="chat-window" :scroll-top="scrollTop" scroll-with-animation="true">
			<view v-for="(item, index) in chatHistory" :key="index" class="message-row" :class="item.from">
				<view class="message-bubble">
					<view v-html="item.content.replace(/\n/g, '<br>')"></view>
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
// 导入 baseUrl 是为了在出错时显示我们到底在请求哪个地址
import { baseUrl } from '@/config.js';

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
			
			// 在 HBuilderX 控制台打印请求信息
			console.log(`【排查】准备发送消息: "${userMessage}" 到 ${baseUrl}`);

			sendMessage({ content: userMessage }).then(res => {
				
				// 【【【 *** 关键修正点 *** 】】】
				// 根据您的日志, (res) 是一个Object, 
				// 格式为: {code: 200, msg: "{\"content\":\"...\"}"}
				console.log('【排查】请求成功，原始响应 (res):', res); 
				
				let aiReply = 'AI 暂时无法回复'; // 默认回复

				// 检查 res 是否是一个有效的对象, 并且有 msg 字段
				if (res && typeof res === 'object' && res.msg && typeof res.msg === 'string') {
					try {
						// 1. (res.msg) 才是那个字符串: "{\"content\":\"...\"}"
						// 尝试将其解析为 JSON 对象
						const parsedMsg = JSON.parse(res.msg);
						
						// 2. 检查解析后的对象, 并提取 content 字段
						if (parsedMsg && parsedMsg.content) {
							aiReply = parsedMsg.content; // aiReply = "Hello! 欢迎您！..."
						} 
						// 2b. 兼容 Dify v0.6 的 "answer" 字段 (以防万一)
						else if (parsedMsg && parsedMsg.answer) {
							aiReply = parsedMsg.answer;
						}
						else {
							aiReply = 'AI回复格式错误 (无 content 或 answer)';
						}
					} catch (e) {
						// 3. 如果 JSON.parse(res.msg) 失败
						// 说明 res.msg 不是一个JSON字符串, 而是 "Hello" 这样的普通文本
						console.warn("【排查】AI回复的 msg 字段不是JSON格式, 已按普通字符串处理:", res.msg);
						aiReply = res.msg; // 直接使用 msg 字段的字符串
					}
				} else {
					// 备用: 如果 res.msg 不存在, 或 res 不是对象
					console.error("【排查】后端响应格式不正确, 既不是字符串, 也没有 msg 字段:", res);
					aiReply = '后端响应格式错误';
				}
				
				this.chatHistory.push({ from: 'ai', content: aiReply });
				// 【【【 *** 修正结束 *** 】】】
				
				this.loading = false;
				this.scrollToBottom(); 
			}).catch(err => {
				
				// (保留之前的排查代码)
				console.error('【排查】请求失败 (err):', err);
				
				let errorDetails = '未知错误';
				if (err) {
					// uni-app 的 request:fail 错误 (例如连接超时、连接被拒绝)
					if (err.errMsg) {
						errorDetails = `uni-app 错误: ${err.errMsg}`;
					} 
					// 后端HTTP错误 (例如 404, 500)
					else if (err.data) {
						errorDetails = `HTTP ${err.statusCode}: ${JSON.stringify(err.data)}`;
					} 
					// 其他JS错误
					else if (err.message) {
						errorDetails = err.message;
					} 
					else {
						try {
							errorDetails = JSON.stringify(err);
						} catch(e) {
							errorDetails = err.toString();
						}
					}
				}
				
				const finalErrorMsg = `【网络排查】请求失败！\n\n- 目标地址 (baseUrl):\n${baseUrl}\n\n- 错误详情:\n${errorDetails}`;
				this.chatHistory.push({ from: 'ai', content: finalErrorMsg });
				this.$modal.msgError(finalErrorMsg); 
				
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