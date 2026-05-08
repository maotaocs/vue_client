/**
 * 统一 Layout 设备数据接口
 *
 * 所有车间 Layout（大屏）共用此 API 基类，通过 layoutKey 参数区分不同产线/区域。
 * 后端只需维护一套 Controller，通过 layoutKey 参数路由到对应的数据源或缓存。
 *
 * 统一接口设计：
 *   - GET /system/layout/{layoutKey}/statusList   → 设备状态列表
 *   - GET /system/layout/{layoutKey}/alarms        → 实时告警
 *   - GET /system/layout/{layoutKey}/statistics    → 设备统计
 *   - GET /system/layout/{layoutKey}/trend         → 设备趋势
 *   - GET /system/layout/{layoutKey}/details       → 设备明细
 *   - GET /system/layout/{layoutKey}/workstationStatus → 工位状态
 *   - GET /system/layout/{layoutKey}/areaStatus    → 区域统计
 *
 * WebSocket 统一路径：/ws/layout/{layoutKey}
 *
 * 统一消息格式：
 *   - device_status_update  → 单设备状态更新 { deviceCode, status, deviceName, ... }
 *   - device_list_update    → 批量设备状态更新 [ { deviceCode, status }, ... ]
 *   - alarm                 → 新增告警 { alarmId, deviceCode, alarmLevel, ... }
 *   - heartbeat             → 心跳
 */

import request from '@/utils/request'

/**
 * 获取指定 layoutKey 的设备状态列表
 * @param {string} layoutKey - 产线标识，如 'POL'、'rework3F'
 */
export function getDeviceStatusList(layoutKey) {
  return request({
    url: `/system/layout/${layoutKey}/statusList`,
    method: 'get'
  })
}

/**
 * 获取指定 layoutKey 的实时告警
 * @param {string} layoutKey
 */
export function getRecentAlarms(layoutKey) {
  return request({
    url: `/system/layout/${layoutKey}/alarms`,
    method: 'get'
  })
}

/**
 * 获取指定 layoutKey 的设备统计数据
 * @param {string} layoutKey
 */
export function getDeviceStatistics(layoutKey) {
  return request({
    url: `/system/layout/${layoutKey}/statistics`,
    method: 'get'
  })
}

/**
 * 获取指定 layoutKey 的设备运行趋势
 * @param {string} layoutKey
 */
export function getDeviceTrend(layoutKey) {
  return request({
    url: `/system/layout/${layoutKey}/trend`,
    method: 'get'
  })
}

/**
 * 获取指定 layoutKey 的设备状态明细
 * @param {string} layoutKey
 */
export function getDeviceDetails(layoutKey) {
  return request({
    url: `/system/layout/${layoutKey}/details`,
    method: 'get'
  })
}

/**
 * 获取指定 layoutKey 的工位状态列表
 * @param {string} layoutKey
 */
export function getWorkstationStatus(layoutKey) {
  return request({
    url: `/system/layout/${layoutKey}/workstationStatus`,
    method: 'get'
  })
}

/**
 * 获取指定 layoutKey 的区域状态统计
 * @param {string} layoutKey
 */
export function getAreaStatus(layoutKey) {
  return request({
    url: `/system/layout/${layoutKey}/areaStatus`,
    method: 'get'
  })
}
