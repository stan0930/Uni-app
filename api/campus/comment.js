import request from '@/utils/request'

// 查询话题评论列表 (GET /campus/topic/comment/list)
export function listComment(query) {
  return request({
    url: '/campus/topic/comment/list',
    method: 'get',
    params: query
  })
}

// 新增话题评论 (POST /campus/topic/comment)
export function addComment(data) {
  return request({
    url: '/campus/topic/comment',
    method: 'post',
    data: data
  })
}