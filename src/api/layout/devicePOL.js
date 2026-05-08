/**
 * POL Layout 设备数据接口
 *
 * layoutKey = 'POL'
 *
 * 此文件定义 POL 产线的模拟数据，供开发环境使用。
 * 正式环境后端从 mes_device 表获取数据，返回相同格式的真实数据，无需修改前端代码。
 *
 * 后端接口说明：
 *   - REST API: GET /system/layout/POL/statusList   (设备状态列表)
 *   - REST API: GET /system/layout/POL/alarms         (实时告警)
 *   - WebSocket: /ws/layout/POL                        (实时推送)
 *
 * WebSocket 消息格式：
 *   - device_status_update  → { deviceCode, status, deviceName, ... }
 *   - device_list_update    → [ { deviceCode, status }, ... ]
 *   - alarm                 → { alarmId, deviceCode, alarmLevel, ... }
 *   - heartbeat             → 心跳
 */

import { createLayoutMockData } from './deviceLayoutMock'

// POL 产线设备模拟数据 (设备编号与 POL.svg 中的 data-device 属性对应)
const mockDeviceStatusList = [
  { deviceCode: 'PCB-WELD', deviceName: 'PCB焊接设备', status: '1', runningTime: 480, location: 'POL产线-焊接区', deviceType: '焊接设备' },
  { deviceCode: 'BATCH-AGING', deviceName: 'Batch Aging老化炉', status: '1', runningTime: 2100, location: 'POL产线-老化区', deviceType: '老化设备' },
  { deviceCode: 'AUTO-CLAVE', deviceName: 'Auto Clave高压釜', status: '1', runningTime: 1850, location: 'POL产线-老化区', deviceType: '高压釜' },
  { deviceCode: 'UV-CURE', deviceName: 'UV固化设备', status: '1', runningTime: 920, location: 'POL产线-老化区', deviceType: '固化设备' },
]

// POL 告警模拟数据
const mockAlarms = [
  {
    alarmId: 1,
    deviceCode: 'BATCH-AGING',
    deviceName: 'Batch Aging老化炉',
    alarmLevel: 'warning',
    alarmCode: 'TEMP001',
    alarmMessage: '老化温度接近上限阈值',
    alarmTime: new Date().toLocaleString('zh-CN'),
    handleStatus: '0'
  },
  {
    alarmId: 2,
    deviceCode: 'UV-CURE',
    deviceName: 'UV固化设备',
    alarmLevel: 'info',
    alarmCode: 'MAINT001',
    alarmMessage: '设备维护保养即将到期提醒',
    alarmTime: new Date().toLocaleString('zh-CN'),
    handleStatus: '0'
  }
]

// 使用统一 mock 工厂生成 POL 的模拟 API
export const getDeviceStatusListMock = createLayoutMockData(mockDeviceStatusList)
export const getRecentAlarmsMock = createLayoutMockData(mockAlarms)

export { mockDeviceStatusList, mockAlarms }
