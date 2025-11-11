<template>
	<view class="container">
		<uni-forms ref="form" :modelValue="form" :rules="rules">
			
			<uni-forms-item label="分区" required name="topicType">
				<picker @change="bindPickerChange" :value="pickerIndex" :range="pickerTabs" range-key="name">
					<view class="picker-input">
						{{ pickerTabs[pickerIndex].name }}
						<uni-icons type="right" size="14" color="#999" style="margin-left: auto;"></uni-icons>
					</view>
				</picker>
			</uni-forms-item>

			<uni-forms-item label="内容" required name="content">
				<uni-easyinput type="textarea" v-model="form.content" placeholder="分享校园新鲜事..." />
			</uni-forms-item>
			
			<uni-forms-item label="图片" name="imageUrls">
				<uni-file-picker
					v-model="imageValue"
					fileMediatype="image"
					mode="grid"
					@success="uploadSuccess"
					@fail="uploadFail"
					@delete="deleteFile"
					:auto-upload="false"
				/>
			</uni-forms-item>
		</uni-forms>
		
		<button type="primary" @click="submit" class="submit-btn">发布</button>
	</view>
</template>

<script>
	import { addTopic } from '@/api/campus/topic';
	import { upload } from '@/utils/upload'; // 确保您的 upload 方法返回 Promise

	export default {
		data() {
			return {
				// 【修改】表单
				form: {
					content: '',
					imageUrls: '',
					topicType: 'recommend' // 【新增】默认为'推荐'
				},
				imageValue: [], // uni-file-picker 的 v-model
				
				// 【新增】分区选择器数据
				pickerIndex: 0,
				pickerTabs: [
					{ name: '推荐', type: 'recommend' },
					{ name: '问答', type: 'qa' },
					{ name: '二手', type: 'secondhand' },
					{ name: '交友', type: 'dating' },
					{ name: '兼职', type: 'jobs' },
					{ name: '八卦', type: 'gossip' }
				],

				// 【修改】表单规则
				rules: {
					content: {
						rules: [{ required: true, errorMessage: '内容不能为空' }]
					},
					// 【新增】分区规则
					topicType: {
						rules: [{ required: true, errorMessage: '请选择分区' }]
					}
				}
			};
		},
		methods: {
			// 【新增】Picker 选择事件
			bindPickerChange(e) {
				this.pickerIndex = e.detail.value;
				this.form.topicType = this.pickerTabs[this.pickerIndex].type;
			},

			// 以下图片上传逻辑假设您使用的是手动上传
			//（因为需要先提交表单内容）
			// 如果您是自动上传，请参考您的原始 post.vue 逻辑

			uploadSuccess(e) {
				// 注意：如果 auto-upload=false, success 事件可能不会按预期触发
				// 我们将在 submit 方法中处理
			},
			deleteFile(e) {
				// 从 imageValue 中移除
				this.imageValue = this.imageValue.filter(file => file.uuid !== e.tempFile.uuid);
			},
			uploadFail(e) {
				this.$modal.msgError('图片上传失败');
			},

			/** 提交按钮 */
			submit() {
				this.$refs.form.validate().then(res => {
					this.$modal.loading('正在发布...');
					// 1. 先上传图片（如果存在）
					this.uploadImages().then(imageUrls => {
						this.form.imageUrls = imageUrls.join(',');
						
						// 2. 提交表单
						addTopic(this.form).then(response => {
							this.$modal.closeLoading();
							this.$modal.msgSuccess('发布成功');
							
							// 返回上一页并刷新
							const pages = getCurrentPages();
							const prevPage = pages[pages.length - 2];
							if (prevPage && typeof prevPage.onPullDownRefresh === 'function') {
								prevPage.onPullDownRefresh();
							}
							uni.navigateBack();
							
						}).catch(() => {
							this.$modal.closeLoading();
						});
					}).catch(err => {
						this.$modal.closeLoading();
						this.$modal.msgError('图片上传失败，请重试');
					});
				});
			},
			
			// 辅助方法：上传所有图片
			async uploadImages() {
				if (this.imageValue.length === 0) {
					return Promise.resolve([]);
				}
				
				const uploadTasks = this.imageValue
					.filter(file => file.url) // 过滤掉可能已上传的
					.map(file => {
						return upload({
							filePath: file.url, // uni-file-picker 提供的临时路径
							name: 'file' // 后端接收的字段名
						});
					});

				try {
					const results = await Promise.all(uploadTasks);
					// 假设 upload util 返回的是 { url: '...' } 或直接是 url 字符串
					// 这里我们假设 upload util 成功时返回解析后的 { url: '...' } 或 { data: { url: '...' } }
					// 您需要根据您的 `utils/upload.js` 调整
					const urls = results.map(res => {
						// 示例：假设 upload 返回 { code: 200, url: '...' }
						if (res.code === 200) {
							return res.url; 
						}
						// 示例：假设 upload 返回 { code: 200, data: { url: '...' } }
						if (res.data && res.data.url) {
							return res.data.url;
						}
						// 示例：假设 upload 直接返回 { url: '...' }
						if(res.url) {
							return res.url;
						}
						// 默认回退（或抛出错误）
						return res.url || (res.data ? res.data.url : ''); 
					});
					
					// 合并新上传的URL和已有的URL（如果有的话）
					const existingUrls = this.imageValue.filter(f => f.url && !f.url.startsWith('blob:') && !f.url.startsWith('file:')).map(f => f.url);
					
					return [...existingUrls, ...urls.filter(Boolean)];
					
				} catch (error) {
					console.error("Upload failed", error);
					return Promise.reject(error);
				}
			}
		}
	};
</script>

<style lang="scss">
	.container {
		padding: 15px;
		background-color: #fff;
	}
	
	.submit-btn {
		margin-top: 20px;
	}

	/* 【新增】Picker 输入框样式 */
	.picker-input {
		height: 35px;
		line-height: 35px;
		padding: 0 10px;
		background-color: #f5f5f5;
		border-radius: 5px;
		display: flex;
		align-items: center;
		color: #333;
	}
	
	// 覆盖 uni-forms-item 样式，使其与 easyinput 对齐
	::v-deep .uni-forms-item__content {
		display: flex;
		align-items: center;
	}
	
	::v-deep .uni-file-picker__container {
		margin-top: 5px;
	}
</style>