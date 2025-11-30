import request from '@/utils/request'

// 查询二手商品列表
export function listProducts(query) {
    return request({
        url: '/campus/product/list',
        method: 'get',
        params: query
    })
}

// 查询商品详情
export function getProductDetail(productId) {
    return request({
        url: '/campus/product/detail/' + productId,
        method: 'get'
    })
}

// 发布商品
export function addProduct(data) {
    return request({
        url: '/campus/product',
        method: 'post',
        data: data
    })
}

// 更新商品
export function updateProduct(data) {
    return request({
        url: '/campus/product',
        method: 'put',
        data: data
    })
}

// 删除商品
export function deleteProduct(productId) {
    return request({
        url: '/campus/product/' + productId,
        method: 'delete'
    })
}

// 更新商品状态
export function updateProductStatus(productId, status) {
    return request({
        url: '/campus/product/status/' + productId,
        method: 'put',
        data: { status: status }
    })
}

// 切换收藏状态
export function toggleFavorite(productId) {
    return request({
        url: '/campus/product/toggle-favorite/' + productId,
        method: 'put'
    })
}

// 查询我的商品
export function myProducts(query) {
    return request({
        url: '/campus/product/my-products',
        method: 'get',
        params: query
    })
}

// 查询我的收藏
export function myFavorites(query) {
    return request({
        url: '/campus/product/my-favorites',
        method: 'get',
        params: query
    })
}
