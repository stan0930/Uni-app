import request from '@/utils/request'

// 创建订单
export function createOrder(data) {
    return request({
        url: '/campus/order/create',
        method: 'post',
        data: data
    })
}

// 查询我的订单列表（买家视角）
export function myOrders(query) {
    return request({
        url: '/campus/order/my-orders',
        method: 'get',
        params: query
    })
}

// 查询订单详情
export function getOrderDetail(orderId) {
    return request({
        url: '/campus/order/' + orderId,
        method: 'get'
    })
}

// 取消订单
export function cancelOrder(orderId) {
    return request({
        url: '/campus/order/cancel/' + orderId,
        method: 'put'
    })
}

// 确认收货
export function confirmReceipt(orderId) {
    return request({
        url: '/campus/order/confirm/' + orderId,
        method: 'put'
    })
}

// 查询卖家收到的订单列表（卖家视角）
export function sellerOrders(query) {
    return request({
        url: '/campus/order/seller-orders',
        method: 'get',
        params: query
    })
}

// 卖家发货
export function shipOrder(orderId) {
    return request({
        url: '/campus/order/ship/' + orderId,
        method: 'put'
    })
}
