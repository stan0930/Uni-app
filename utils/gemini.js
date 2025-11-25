// 智谱AI API 配置
export const ZHIPU_API_KEY = '5867b796f68c451eb45ab56a73a38585.htjaHv1Zr1M6PycL';
export const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

/**
 * 调用智谱AI API
 * @param {Array} messages - 对话历史（OpenAI格式）
 * @param {Array} tools - Function定义（可选）
 */
export async function callZhipuAI(messages, tools = null) {
    const requestBody = {
        model: 'glm-4-flash',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
    };

    if (tools) {
        requestBody.tools = tools;
        requestBody.tool_choice = 'auto';
    }

    console.log('智谱AI请求体:', JSON.stringify(requestBody, null, 2));

    return new Promise((resolve, reject) => {
        uni.request({
            url: ZHIPU_API_URL,
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ZHIPU_API_KEY}`
            },
            data: requestBody,
            timeout: 30000,
            success: (response) => {
                console.log('智谱AI响应成功:', response);

                if (response.statusCode === 200 && response.data) {
                    resolve({
                        success: true,
                        data: response.data
                    });
                } else {
                    resolve({
                        success: false,
                        error: `API错误: ${response.statusCode} - ${JSON.stringify(response.data)}`
                    });
                }
            },
            fail: (error) => {
                console.error('智谱AI请求失败:', error);
                resolve({
                    success: false,
                    error: `请求失败: ${error.errMsg || '网络错误'}`
                });
            }
        });
    });
}

/**
 * 定义Agent Functions
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
                        description: '查询的日期类型，可以是: today(今天), tomorrow(明天), monday(周一), tuesday(周二), wednesday(周三), thursday(周四), friday(周五), saturday(周六), sunday(周日)',
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
            description: '帮用户创建跑腿任务，比如拿快递、买外卖、代购等',
            parameters: {
                type: 'object',
                properties: {
                    task_type: {
                        type: 'string',
                        description: '任务类型',
                        enum: ['取快递', '外卖代购', '代购']
                    },
                    description: {
                        type: 'string',
                        description: '任务描述（可选）'
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
            description: '帮用户在校园圈子发帖，自动选择合适的板块',
            parameters: {
                type: 'object',
                properties: {
                    category: {
                        type: 'string',
                        description: '帖子分类板块',
                        enum: ['二手市场', '求助板块', '兼职发布', '恋爱交友']
                    },
                    content: {
                        type: 'string',
                        description: '帖子内容概要（可选）'
                    }
                },
                required: ['category']
            }
        }
    }
];
