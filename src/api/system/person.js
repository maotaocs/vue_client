import request from '@/utils/request'

// 获取总体看板数据
export function getPersonDashboard() {
  return request({
    url: '/system/person/dashboard',
    method: 'get'
  })
}

// 获取插卡机覆盖率
export function getCardCoverage() {
  return request({
    url: '/system/person/cardCoverage',
    method: 'get'
  })
}

// 获取管理饱和度数据
export function getSaturationData() {
  return request({
    url: '/system/person/saturation',
    method: 'get'
  })
}

// 获取UPPH提升数据
export function getUpphData() {
  return request({
    url: '/system/person/upph',
    method: 'get'
  })
}

// 获取无证上岗拦截数据
export function getCertificateIntercept() {
  return request({
    url: '/system/person/certificateIntercept',
    method: 'get'
  })
}

// 获取在岗率实时数据
export function getOnDutyRate() {
  return request({
    url: '/system/person/onDutyRate',
    method: 'get'
  })
}

// 获取车间人员热力图数据
export function getWorkshopHeatmap() {
  return request({
    url: '/system/person/heatmap',
    method: 'get'
  })
}

// 获取效率与合规趋势数据
export function getTrendData() {
  return request({
    url: '/system/person/trend',
    method: 'get'
  })
}

// 获取异常预警列表
export function getAlertList() {
  return request({
    url: '/system/person/alertList',
    method: 'get'
  })
}

// 获取三层管控体系数据
export function getControlLayers() {
  return request({
    url: '/system/person/controlLayers',
    method: 'get'
  })
}
