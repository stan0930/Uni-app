import request from '@/utils/request'

// 查询话题评论列表 (GET /campus/topic/comment/list)
// [修正] 后端接口为 /campus/topic/comments/{topicId} 且不支持分页
export function listComment(query) {
  return request({
    // url: '/campus/topic/comment/list', // [删除] 错误的URL
    url: '/campus/topic/comments/' + query.topicId, // [修改] 使用正确的URL和路径参数
    method: 'get'
    // params: query // [删除] 后端接口不支持分页参数
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