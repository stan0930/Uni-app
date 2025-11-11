import request from '@/utils/request'

// 查询校园圈子列表
export function listTopic(query) {
  return request({
    url: '/campus/topic/list',
    method: 'get',
    params: query
  })
}

// 新增校园圈子
export function addTopic(data) {
  return request({
    url: '/campus/topic',
    method: 'post',
    data: data
  })
}

// 【核心修正】匹配 PC 端的点赞接口 (PUT /campus/topic/toggleLike/{topicId})
export function likeTopic(topicId) {
  return request({
    url: '/campus/topic/toggleLike/' + topicId, // 路径与 PC 端一致
    method: 'put' // 方法与 PC 端一致
    // data: data  (PUT 请求体为空)
  })
}

// 【核心修正】匹配 PC 端的收藏接口 (假设与点赞类似)
export function favoriteTopic(topicId) {
  return request({
    url: '/campus/topic/toggle-favorite/' + topicId, // 假设收藏接口与 PC 端一致
    method: 'put'
  })
}