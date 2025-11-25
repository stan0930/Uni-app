// 通义千问 API 配置
export const QWEN_API_KEY = 'sk-ad82ffbaa1a6462dbbcea79fa465f148';
// H5环境使用代理解决跨域，App/小程序使用直接链接
const baseUrl = process.env.UNI_PLATFORM === 'h5' ? '/dashscope' : 'https://dashscope.aliyuncs.com';
export const QWEN_API_URL = `${baseUrl}/api/v1/services/aigc/text-generation/generation`;

/**
 * 调用通义千问 API
 * @param {Array} messages - 对话历史
 * @param {Array} tools - Function定义（可选）
 */
export async function callQwenAI(messages, tools = null) {
    const requestBody = {
        model: 'qwen-plus', // 使用qwen-plus模型
        input: {
            messages: messages
        },
        parameters: {
            result_format: 'message'
        }
    };

    if (tools) {
        requestBody.parameters.tools = tools;
    }

    console.log('通义千问请求:', requestBody);

    return new Promise((resolve) => {
        uni.request({
            url: QWEN_API_URL,
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${QWEN_API_KEY}`
            },
            data: requestBody,
            timeout: 30000,
            success: (response) => {
                console.log('通义千问响应:', response);

                if (response.statusCode === 200 && response.data && response.data.output) {
                    resolve({
                        success: true,
                        data: response.data.output
                    });
                } else {
                    resolve({
                        success: false,
                        error: `API错误: ${JSON.stringify(response.data)}`
                    });
                }
            },
            fail: (error) => {
                console.error('通义千问请求失败:', error);
                resolve({
                    success: false,
                    error: `请求失败: ${error.errMsg || '网络错误'}`
                });
            }
        });
    });
}

/**
 * 定义Agent Functions（通义千问格式）
 */
export const agentTools = [
    {
        type: 'function',
        function: {
            name: 'query_schedule',
            description: '查询用户的课程表，可以查询今天、明天、或指定星期几的课程',
            parameters: {
                type: 'object',
                properties: {
                    day_type: {
                        type: 'string',
                        description: '查询的日期类型',
                        enum: ['today', 'tomorrow', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                    }
                },
                required: ['day_type']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'create_errand_task',
            description: '帮用户创建跑腿任务',
            parameters: {
                type: 'object',
                properties: {
                    task_type: {
                        type: 'string',
                        description: '任务类型',
                        enum: ['取快递', '外卖代购', '代购']
                    }
                },
                required: ['task_type']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'create_circle_post',
            description: '帮用户在校园圈子发帖',
            parameters: {
                type: 'object',
                properties: {
                    category: {
                        type: 'string',
                        description: '帖子分类',
                        enum: ['二手市场', '求助板块', '兼职发布', '恋爱交友']
                    }
                },
                required: ['category']
            }
        }
    }
];
