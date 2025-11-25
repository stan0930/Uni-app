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
				placeholder="试试问我任何问题..."
				@confirm="handleSend"
				:inputBorder="false"
				class="input-field"
			></uni-easyinput>
			<button @click="handleSend" :disabled="loading" type="primary" class="send-btn">发送</button>
		</view>
	</view>
</template>

<script>
import { listSchedule } from '@/api/schedule'
import { callQwenAI, agentTools } from '@/utils/qwen'

export default {
	data() {
		return {
			message: '',
			loading: false,
			chatHistory: [
				{ from: 'ai', content: '您好！我是智能助手 🤖\n\n我可以帮您：\n📅 查询课表（如"今天有什么课"）\n🏃 发布跑腿任务\n💬 发布圈子帖子\n\n也可以跟我随便聊聊天！' }
			],
			scrollTop: 0,
			conversationHistory: [] // 对话历史（给AI用）
		}
	},
	methods: {
		async handleSend() {
			const msg = this.message.trim()
			if (!msg) return

			this.chatHistory.push({ from: 'user', content: msg })
			this.conversationHistory.push({ role: 'user', content: msg })
			this.message = ''
			this.loading = true
			this.scrollToBottom()

			try {
				const aiResponse = await this.callQwenAgent(msg)
				this.chatHistory.push({ from: 'ai', content: aiResponse })
			} catch (e) {
				this.chatHistory.push({ from: 'ai', content: '抱歉，我遇到了一些问题，请稍后再试' })
			}

			this.loading = false
			this.scrollToBottom()
		},

		async callQwenAgent(userMessage) {
			// 调用千问API（带工具）
			const response = await callQwenAI(this.conversationHistory, agentTools)
			
			if (!response.success) {
				return '抱歉，AI服务暂时不可用：' + response.error
			}

			const choice = response.data.choices[0]
			const assistantMessage = choice.message

			// 检查AI是否要调用工具
			if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
				// AI决定调用工具
				const toolCall = assistantMessage.tool_calls[0]
				const functionName = toolCall.function.name
				const functionArgs = JSON.parse(toolCall.function.arguments)

				console.log('AI调用工具:', functionName, functionArgs)

				// 执行工具
				const toolResult = await this.executeToolCall(functionName, functionArgs)

				// 将工具调用结果发回给AI
				this.conversationHistory.push({
					role: 'assistant',
					content: '',
					tool_calls: assistantMessage.tool_calls
				})
				this.conversationHistory.push({
					role: 'tool',
					content: toolResult,
					tool_call_id: toolCall.id
				})

				// 让AI根据工具结果生成最终回复
				const finalResponse = await callQwenAI(this.conversationHistory)
				if (finalResponse.success) {
					const finalMessage = finalResponse.data.choices[0].message.content
					this.conversationHistory.push({ role: 'assistant', content: finalMessage })
					return finalMessage
				} else {
					return toolResult
				}
			} else {
				// AI直接回复（不需要工具）
				const content = assistantMessage.content
				this.conversationHistory.push({ role: 'assistant', content: content })
				return content
			}
		},

		async executeToolCall(functionName, args) {
			console.log('执行工具:', functionName, args)

			if (functionName === 'query_schedule') {
				return await this.getSchedule(args.day_type)
			} else if (functionName === 'create_errand_task') {
				setTimeout(() => uni.navigateTo({ url: `/pages/todo/post?category=${args.task_type}` }), 500)
				return `🏃 正在为您打开跑腿发布页面（类型：${args.task_type}）...`
			} else if (functionName === 'create_circle_post') {
				setTimeout(() => uni.navigateTo({ url: `/pages/circle/post?category=${args.category}` }), 500)
				return `💬 正在为您打开发帖页面（分类：${args.category}）...`
			}

			return '未知工具调用'
		},

		async getSchedule(dayType) {
			try {
				const res = await listSchedule()
				if (res.code !== 200 || !res.data) return '📅 获取课表失败'

				const dayNum = this.getDayNum(dayType)
				const courses = res.data.filter(c => c.day === dayNum).sort((a, b) => a.section - b.section)
				const dayName = this.getDayName(dayType)

				if (courses.length === 0) return `📅 ${dayName}没有课程`

				let result = `📅 ${dayName}的课程：\n\n`
				courses.forEach(c => {
					result += `🕐 第${c.section}节: ${c.name}`
					if (c.teacher) result += ` | ${c.teacher}`
					if (c.location) result += ` | ${c.location}`
					result += '\n'
				})
				return result
			} catch (e) {
				return '📅 获取课表失败'
			}
		},

		getDayNum(t) {
			const today = new Date().getDay() || 7
			const map = { 'today': today, 'tomorrow': (today % 7) + 1, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 7 }
			return map[t] || today
		},

		getDayName(t) {
			const map = { 'today': '今天', 'tomorrow': '明天', 'monday': '星期一', 'tuesday': '星期二', 'wednesday': '星期三', 'thursday': '星期四', 'friday': '星期五', 'saturday': '星期六', 'sunday': '星期日' }
			return map[t] || '今天'
		},

		scrollToBottom() {
			this.$nextTick(() => this.scrollTop = this.chatHistory.length * 1000)
		}
	},
	mounted() {
		this.scrollToBottom()
	}
}
</script>

<style lang="scss">
page { height: 100%; }
.container { display: flex; flex-direction: column; height: 100%; background-color: #f4f4f4; }
.chat-window { flex: 1; padding: 10px; overflow-y: auto; }
.message-row { display: flex; margin-bottom: 15px; }
.message-row .message-bubble { padding: 10px 15px; border-radius: 12px; max-width: 70%; word-wrap: break-word; font-size: 15px; line-height: 1.6; }
.message-row.ai { justify-content: flex-start; }
.message-row.ai .message-bubble { background-color: #ffffff; color: #333; border-top-left-radius: 0; }
.message-row.user { justify-content: flex-end; }
.message-row.user .message-bubble { background-color: #3c9cff; color: #ffffff; border-top-right-radius: 0; }
.input-area { display: flex; align-items: center; padding: 10px; background-color: #fff; border-top: 1px solid #e0e0e0; }
.input-area .input-field { flex: 1; background-color: #f4f4f4; border-radius: 20px; padding: 0 15px; }
.input-area ::v-deep .uni-easyinput__content-input { height: 40px; line-height: 40px; font-size: 15px; }
.input-area .send-btn { margin-left: 10px; font-size: 14px; height: 40px; line-height: 40px; }
</style>