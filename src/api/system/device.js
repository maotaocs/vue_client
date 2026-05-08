import request from '@/utils/request'

// 获取设备仪表盘统计数据
export function getDeviceStatistics() {
  return request({
    url: '/system/device/statistics',
    method: 'get'
  })
}

// 获取设备列表
export function listDevice(query) {
  return request({
    url: '/system/device/list',
    method: 'get',
    params: query
  })
}

// 获取所有设备
export function allDevices() {
  return request({
    url: '/system/device/all',
    method: 'get'
  })
}

// 获取设备详细信息
export function getDevice(deviceId) {
  return request({
    url: '/system/device/' + deviceId,
    method: 'get'
  })
}

// 新增设备
export function addDevice(data) {
  return request({
    url: '/system/device',
    method: 'post',
    data: data
  })
}

// 修改设备
export function updateDevice(data) {
  return request({
    url: '/system/device',
    method: 'put',
    data: data
  })
}

// 删除设备
export function delDevice(deviceIds) {
  return request({
    url: '/system/device/' + deviceIds,
    method: 'delete'
  })
}

// 导出设备数据
export function exportDevice(query) {
  return request({
    url: '/system/device/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}
