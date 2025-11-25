import request from '@/utils/request'

// 查询课程表列表
export function listSchedule() {
    return request({
        url: '/app/schedule/list',
        method: 'get'
    })
}

// 查询课程表详细
export function getSchedule(id) {
    return request({
        url: '/app/schedule/' + id,
        method: 'get'
    })
}

// 新增课程表
export function addSchedule(data) {
    return request({
        url: '/app/schedule',
        method: 'post',
        data: data
    })
}

// 修改课程表
export function updateSchedule(data) {
    return request({
        url: '/app/schedule',
        method: 'put',
        data: data
    })
}

// 删除课程表
export function delSchedule(id) {
    return request({
        url: '/app/schedule/' + id,
        method: 'delete'
    })
}

// 批量保存课程表（用于本地数据同步）
export function batchSaveSchedule(data) {
    return request({
        url: '/app/schedule/batch',
        method: 'post',
        data: data
    })
}
