import request from '@/utils/request'

const baseUrl = '/campus/errand'

// 查询跑腿订单列表
export function listErrand(query) {
  return request({
    url: `${baseUrl}/list`,
    method: 'get',
    params: query
  })
}

// 查询跑腿订单详细
export function getErrand(errandOrderId) {
  return request({
    url: `${baseUrl}/` + errandOrderId,
    method: 'get'
  })
}

// 新增跑腿订单
export function addErrand(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data: data
  })
}

// 修改跑腿订单
export function updateErrand(data) {
  return request({
    url: `${baseUrl}`,
    method: 'put',
    data: data
  })
}

// 删除跑腿订单
export function delErrand(errandOrderId) {
  return request({
    url: `${baseUrl}/` + errandOrderId,
    method: 'delete'
  })
}

// 接取订单
export function takeErrand(errandOrderId) {
  return request({
    url: `${baseUrl}/take/` + errandOrderId,
    method: 'put'
  })
}

// 完成订单
export function completeErrand(errandOrderId) {
  return request({
    url: `${baseUrl}/complete/` + errandOrderId,
    method: 'put'
  })
}