import request from '@/utils/request'

// 查询校园圈子列表
export function listTopic(query) {
  return request({
    url: '/campus/topic/list',
    method: 'get',
    params: query
  })
}

// 查询校园话题详细
export function getTopic(topicId) {
  return request({
    url: '/campus/topic/' + topicId,
    method: 'get'
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

// 点赞
export function toggleLike(topicId) {
  return request({
    url: '/campus/topic/toggleLike/' + topicId,
    method: 'put'
  })
}

// 收藏
export function toggleFavorite(topicId) {
  return request({
    url: '/campus/topic/toggle-favorite/' + topicId,
    method: 'put'
  })
}

// 【新增】查询我发布的话题列表
export function listMyTopics(query) {
  return request({
    url: '/campus/topic/my-list',
    method: 'get',
    params: query
  })
}

// 【高亮：新增“我的评论”接口】
export function listMyCommentedTopics(query) {
  return request({
    url: '/campus/topic/my-comments',
    method: 'get',
    params: query
  })
}

// 【新增】查询我点赞的话题列表
export function listMyLikedTopics(query) {
  return request({
    url: '/campus/topic/my-likes',
    method: 'get',
    params: query
  })
}

// 【新增】查询我收藏的话题列表
export function listMyFavoriteTopics(query) {
  return request({
    url: '/campus/topic/my-favorites',
    method: 'get',
    params: query
  })
}