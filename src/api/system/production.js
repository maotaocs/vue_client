import request from '@/utils/request'

// 获取生产看板数据
export function getProductionDashboard() {
  return request({
    url: '/system/production/dashboard',
    method: 'get'
  })
}

// 获取生产单元列表
export function listProductionUnit(query) {
  return request({
    url: '/system/production/unit/list',
    method: 'get',
    params: query
  })
}

// 获取生产单元详细信息
export function getProductionUnit(unitId) {
  return request({
    url: '/system/production/unit/' + unitId,
    method: 'get'
  })
}

// 新增生产单元
export function addProductionUnit(data) {
  return request({
    url: '/system/production/unit',
    method: 'post',
    data: data
  })
}

// 修改生产单元
export function updateProductionUnit(data) {
  return request({
    url: '/system/production/unit',
    method: 'put',
    data: data
  })
}

// 删除生产单元
export function delProductionUnit(unitIds) {
  return request({
    url: '/system/production/unit/' + unitIds,
    method: 'delete'
  })
}

// 获取追溯列表
export function listTrace(query) {
  return request({
    url: '/system/production/trace/list',
    method: 'get',
    params: query
  })
}

// 获取设备状态统计
export function getDeviceStatusStats() {
  return request({
    url: '/system/production/device/stats',
    method: 'get'
  })
}

// 获取告警列表
export function listAlarm(query) {
  return request({
    url: '/system/production/alarm/list',
    method: 'get',
    params: query
  })
}
