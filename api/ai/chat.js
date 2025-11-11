import request from '@/utils/request'

/**
 * 发送消息到 AI 助手
 * @param data { content: "消息内容" }
 */
export function sendMessage(data) {
  return request({
    url: '/chat/send', // 对应 ChatController.java 的 /send 接口
    method: 'post',
    data: data
  })
}