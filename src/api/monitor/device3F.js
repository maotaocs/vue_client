/**
 * Rework3F 设备数据接口（兼容旧路径）
 *
 * @deprecated 请使用 @/api/layout/device3F
 *
 * 此文件保留用于向后兼容，新代码请直接从 @/api/layout/device3F 导入。
 */

export {
  getDeviceStatusListMock,
  getRecentAlarmsMock,
  mockDeviceStatusList,
  mockAlarms
} from '@/api/layout/device3F'

// 兼容旧路径的 API 函数（实际调用统一接口）
import { getDeviceStatusList, getRecentAlarms } from '@/api/layout/deviceLayout'

export function getDeviceStatusList() {
  return getDeviceStatusList('rework3F')
}

export function getRecentAlarms() {
  return getRecentAlarms('rework3F')
}
