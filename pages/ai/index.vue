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
			<!-- v-model="message"存对话 -->
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
				{ from: 'ai', content: '您好！我是智能助手 🤖\n\n我可以帮您：\n📅 查询课表（如"今天有什么课"）\n🏃 发布跑腿任务（如"帮我发个取快递任务"）\n💬 发布圈子帖子（如"帮我发个求助帖"）\n🛍️ 发布二手商品（如"帮我卖iPhone"）\n🔍 搜索二手商品（如"帮我找一下iPhone"）\n\n也可以跟我随便聊聊天！' }
			],
			scrollTop: 0,
			conversationHistory: [] // 对话历史（给AI用）
		}
	},
	methods: {
		async handleSend() {       //发送
			const msg = this.message.trim()
			if (!msg) return

			this.chatHistory.push({ from: 'user', content: msg })//人
			this.conversationHistory.push({ role: 'user', content: msg })//ai  conversationHistory存对话框
			this.message = ''
			this.loading = true
			this.scrollToBottom()

			try {
				// 核心：调用AI处理
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
			const response = await callQwenAI(this.conversationHistory, agentTools)//ai返回的数据
			// 工具清单（从utils/qwen.js导入）
				// 			{
				//   messages: [
				//     { role: 'user', content: '帮我发个取快递的任务，送到宿舍楼下，给5块钱' }
				//   ],
				//   tools: [
				//     { name: 'create_errand_task', description: '创建跑腿任务', ... },
				//     { name: 'query_schedule', description: '查询课表', ... },
				//     // ... 其他工具
				//   ]
				// }
			
			if (!response.success) {
				return '抱歉，AI服务暂时不可用：' + response.error
			}
			// 提取AI的回复
			const choice = response.data.choices[0]
			const assistantMessage = choice.message

			// 检查AI是否要调用工具
			if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
				// AI决定调用工具，工具信息下面
				// tool_calls: [
				//     {
				//         id: 'tool_call_id_1',
				//         function: {
				//             name: 'create_errand_task',
				//             arguments: '{"task_type": "快递", "title": "取快递", "detail": "取快递", "reward": 5, "delivery_address": "宿舍楼下"}'
				//         }
				//     }
				// ]
				const toolCall = assistantMessage.tool_calls[0]
				const functionName = toolCall.function.name
				// AI 返回的 arguments 是一个字符串，比如 '{"reward": 5, ...}'
				// 这里用 JSON.parse 把它变成了真正的 JS 对象
				const functionArgs = JSON.parse(toolCall.function.arguments)

				console.log('AI调用工具:', functionName, functionArgs)

				// 执行工具，结果存到 toolResult
				const toolResult = await this.executeToolCall(functionName, functionArgs)
				     
					// 		     		async executeToolCall(functionName, args) {
					// 	console.log('执行工具:', functionName, args)

					// 	if (functionName === 'query_schedule') {
					// 		return await this.getSchedule(args.day_type)
					// 	} else if (functionName === 'create_errand_task') {
					// 		return await this.createErrandTask(args)
					// 	} else if (functionName === 'create_circle_post') {
					// 		return await this.createCirclePost(args)
					// 	} else if (functionName === 'create_secondhand_product') {
					// 		return await this.createSecondhandProduct(args)
					// 	} else if (functionName === 'search_secondhand_product') {
					// 		return await this.searchSecondhandProduct(args)
					// 	} else if (functionName === 'buy_secondhand_product') {
					// 		return await this.buySecondhandProduct(args)
					// 	}

					// 	return '未知工具调用'
					// },

				// 将工具调用结果发回给AI
				this.conversationHistory.push({
					role: 'assistant',
					content: '',
					tool_calls: assistantMessage.tool_calls
				})
				this.conversationHistory.push({
					role: 'tool',			// 标记这是工具的返回结果
					content: toolResult,	// 工具执行的结果
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
		//执行工具！！！6个
		async executeToolCall(functionName, args) {
			console.log('执行工具:', functionName, args)

			if (functionName === 'query_schedule') {
				return await this.getSchedule(args.day_type)
			} else if (functionName === 'create_errand_task') {
				return await this.createErrandTask(args)
			} else if (functionName === 'create_circle_post') {
				return await this.createCirclePost(args)
			} else if (functionName === 'create_secondhand_product') {
				return await this.createSecondhandProduct(args)
			} else if (functionName === 'search_secondhand_product') {
				return await this.searchSecondhandProduct(args)
			} else if (functionName === 'buy_secondhand_product') {
				return await this.buySecondhandProduct(args)
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

		async createErrandTask(args) {
			try {
				// api/campus/errand.js  addErrand方法
				const { addErrand } = await import('@/api/campus/errand')
				const data = {
					orderType: args.task_type,
					title: args.title,
					detail: args.detail,
					reward: args.reward,
					deliveryAddress: args.delivery_address,
					status: '0' // 待接单
				}
				const res = await addErrand(data)    //调后端api
				if (res.code === 200) {
					return `✅ 任务发布成功！\n\n📋 任务标题：${args.title}\n💰 悬赏：¥${args.reward}\n📍 送达地址：${args.delivery_address}\n\n您可以在跑腿代办页面查看发布的任务。`
				} else {
					return `❌ 发布失败：${res.msg || '未知错误'}`
				}
			} catch (e) {
				console.error('发布跑腿任务失败:', e)
				return `❌ 任务发布失败，请稍后再试`
			}
		},

		async createCirclePost(args) {
			try {
				const { addTopic } = await import('@/api/campus/topic')
				const data = {
					topicType: args.category,
					content: `${args.title}\n\n${args.content}`,
					status: '0', // 0=正常
					commentEnabled: '0' // 0=允许评论
				}
				const res = await addTopic(data)
				if (res.code === 200) {
					return `✅ 帖子发布成功！\n\n📝 标题：${args.title}\n📚 分类：${args.category}\n\n💡 建议：为了获得更好的互动效果，可以到校园圈子页面找到该帖子，点击编辑添加图片或视频！`
				} else {
					return `❌ 发布失败：${res.msg || '未知错误'}`
				}
			} catch (e) {
				console.error('发布帖子失败:', e)
				return `❌ 帖子发布失败，请稍后再试`
			}
		},

		async createSecondhandProduct(args) {
			try {
				const { addProduct } = await import('@/api/campus/secondhand')
				const data = {
					title: args.title,
					description: args.description,
					category: args.category,
					price: args.price,
					contactInfo: args.contact_info,
					status: '0' // 0=在售
				}
				const res = await addProduct(data)
				if (res.code === 200) {
					return '✅ 商品发布成功！\n\n请到“二手市场→我的”页面编辑添加图片。\n💡 注意：你不能购买自己发布的商品'
					return `✅ 商品发布成功！\n\n📝 商品名称：${args.title}\n💰 价格：￥${args.price}\n📚 分类：${args.category}\n\n📸 重要提示：商品暂无图片！请到二手市场 → 我的发布 → 找到该商品 → 点击编辑上传真实照片，这样会更容易卖出哦！`
				} else {
					return `❌ 发布失败：${res.msg || '未知错误'}`
				}
			} catch (e) {
				console.error('发布二手商品失败:', e)
				return `❌ 商品发布失败，请稍后再试`
			}
		},

		async searchSecondhandProduct(args) {
			try {
				const { listProducts } = await import('@/api/campus/secondhand')
				const query = {
					pageNum: 1,
					pageSize: 10
				}
				// 如果指定了分类且不是"全部"
				if (args.category && args.category !== '全部') {
					query.category = args.category
				}
				// 添加关键词搜索
				if (args.keyword) {
					query.title = args.keyword
				}
				
				const res = await listProducts(query)
				if (res.code === 200 && res.rows) {
					if (res.rows.length === 0) {
						return `🔍 没有找到相关商品，试试其他关键词吧！`
					}
					
					let result = `🔍 搜索到 ${res.total} 件相关商品，以下是前 ${Math.min(res.rows.length, 10)} 件：\n\n`
					res.rows.forEach((item, index) => {
						result += `${index + 1}. ${item.title}\n`
						result += `   💰 价格：￥${item.price}\n`
						if (item.nickName) result += `   👤 卖家：${item.nickName}\n`
						result += `\n`
					})
					result += `您可以在二手市场页面查看详情。`
					return result
				} else {
					return `❌ 搜索失败：${res.msg || '未知错误'}`
				}
			} catch (e) {
				console.error('搜索二手商品失败:', e)
				return `❌ 搜索失败，请稍后再试`
			}
		},

		async buySecondhandProduct(args) {
			try {
				const { createOrder } = await import('@/api/campus/order')
				const data = {
					productId: args.product_id,
					address: args.address
				}
				if (args.remark) {
					data.remark = args.remark
				}
				
				const res = await createOrder(data)
				if (res.code === 200) {
					return `✅ 订单创建成功！\n\n📍 收货地址：${args.address}\n\n请到“我的订单”页面查看详情。`
				} else {
					return `❌ 下单失败：${res.msg || '未知错误'}`
				}
			} catch (e) {
				console.error('购买商品失败:', e)
				return `❌ 下单失败，请稍后再试`
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