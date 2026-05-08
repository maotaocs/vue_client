/**
 * Rework3F Layout 设备数据接口
 *
 * layoutKey = 'rework3F'
 *
 * 此文件定义 Rework3F 产线的模拟数据，供开发环境使用。
 * 正式环境后端返回相同格式的真实数据，无需修改前端代码。
 */

import { createLayoutMockData } from './deviceLayoutMock'

// Rework3F 产线设备模拟数据
const mockDeviceStatusList = [
  // 点灯机OC区域 (4台)
  { deviceCode: 'LHT-OC-1', deviceName: '点灯机OC1', status: '1', runningTime: 1250, location: 'Rework 3F-点灯机OC区域', deviceType: '点灯机' },
  { deviceCode: 'LHT-OC-2', deviceName: '点灯机OC2', status: '1', runningTime: 980, location: 'Rework 3F-点灯机OC区域', deviceType: '点灯机' },
  { deviceCode: 'LHT-OC-3', deviceName: '点灯机OC3', status: '2', runningTime: 560, location: 'Rework 3F-点灯机OC区域', deviceType: '点灯机' },
  { deviceCode: 'LHT-OC-4', deviceName: '点灯机OC4', status: '1', runningTime: 890, location: 'Rework 3F-点灯机OC区域', deviceType: '点灯机' },

  // PI区域点灯机 (3台)
  { deviceCode: 'LHT-PI-1', deviceName: '点灯机PI1', status: '1', runningTime: 720, location: 'Rework 3F-PI区域', deviceType: '点灯机' },
  { deviceCode: 'LHT-PI-2', deviceName: '点灯机PI2', status: '1', runningTime: 650, location: 'Rework 3F-PI区域', deviceType: '点灯机' },
  { deviceCode: 'LHT-PI-3', deviceName: '点灯机PI3', status: '2', runningTime: 480, location: 'Rework 3F-PI区域', deviceType: '点灯机' },

  // Laser区域
  { deviceCode: 'LSR', deviceName: 'Laser切割机', status: '1', runningTime: 1100, location: 'Rework 3F-Laser区域', deviceType: 'Laser' },
  { deviceCode: 'LSR-OK', deviceName: 'Laser维修工位', status: '1', runningTime: 0, location: 'Rework 3F-Laser维修区', deviceType: '维修区' },

  // L/S区域
  { deviceCode: 'LS', deviceName: 'L/S切割设备', status: '1', runningTime: 850, location: 'Rework 3F-L/S区域', deviceType: '切割区' },

  // 老化区域
  { deviceCode: 'BA', deviceName: 'Batch Aging老化炉', status: '1', runningTime: 2100, location: 'Rework 3F-老化区域', deviceType: '老化' },
  { deviceCode: 'AC', deviceName: 'Auto Clave高压釜', status: '1', runningTime: 1850, location: 'Rework 3F-老化区域', deviceType: '老化' },
  { deviceCode: 'UV', deviceName: 'UV固化设备', status: '1', runningTime: 920, location: 'Rework 3F-老化区域', deviceType: '固化' },

  // POL贴附区域
  { deviceCode: 'MNT-POL', deviceName: 'MNT POL贴附机', status: '1', runningTime: 780, location: 'Rework 3F-POL贴附区域', deviceType: '贴附' },
  { deviceCode: 'TV-POL', deviceName: 'TV POL贴附机', status: '1', runningTime: 820, location: 'Rework 3F-POL贴附区域', deviceType: '贴附' },
  { deviceCode: 'TEAR-POL', deviceName: '撕POL设备', status: '2', runningTime: 320, location: 'Rework 3F-POL贴附区域', deviceType: '撕膜' },

  // B/D区域
  { deviceCode: 'BD-SA', deviceName: 'B/D半自动设备', status: '1', runningTime: 680, location: 'Rework 3F-B/D区域', deviceType: 'B/D' },
  { deviceCode: 'BD-M', deviceName: 'B/D手动设备', status: '1', runningTime: 590, location: 'Rework 3F-B/D区域', deviceType: 'B/D' },

  // 焊接区域
  { deviceCode: 'TCP', deviceName: 'TCP Punching设备', status: '1', runningTime: 450, location: 'Rework 3F-焊接区域', deviceType: '焊接' },
  { deviceCode: 'ACF', deviceName: 'ACF Attach贴附机', status: '1', runningTime: 380, location: 'Rework 3F-焊接区域', deviceType: '贴附' },
  { deviceCode: 'REMOVE', deviceName: '祛除设备', status: '1', runningTime: 220, location: 'Rework 3F-焊接区域', deviceType: '祛除' },

  // PPR区域
  { deviceCode: 'PPR', deviceName: 'PPR检测设备', status: '1', runningTime: 560, location: 'Rework 3F-PPR区域', deviceType: '检测' },
  { deviceCode: 'FIX-POL', deviceName: '修POL膜设备', status: '1', runningTime: 280, location: 'Rework 3F-PPR区域', deviceType: '修复' },

  // 检验区域
  { deviceCode: 'TV-VI-1', deviceName: 'TV VI检验设备1', status: '1', runningTime: 420, location: 'Rework 3F-检验区域', deviceType: '检验' },
  { deviceCode: 'TV-VI-2', deviceName: 'TV VI检验设备2', status: '2', runningTime: 350, location: 'Rework 3F-检验区域', deviceType: '检验' },

  // 分析区域
  { deviceCode: 'FA', deviceName: 'FA分析设备', status: '1', runningTime: 620, location: 'Rework 3F-分析区域', deviceType: '分析' },
  { deviceCode: 'PCB', deviceName: 'PCB焊接设备', status: '1', runningTime: 480, location: 'Rework 3F-分析区域', deviceType: '焊接' },
  { deviceCode: 'MIC', deviceName: '显微镜检测设备', status: '1', runningTime: 180, location: 'Rework 3F-分析区域', deviceType: '检测' },

  // 待处理区域
  { deviceCode: 'LSR-WAIT', deviceName: '待LSR周转区', status: '0', runningTime: 0, location: 'Rework 3F-待处理区域', deviceType: '周转区' },
  { deviceCode: 'REMOVE-WAIT', deviceName: '待祛除周转区', status: '0', runningTime: 0, location: 'Rework 3F-待处理区域', deviceType: '周转区' },
  { deviceCode: 'BROKEN', deviceName: '破片周转区', status: '0', runningTime: 0, location: 'Rework 3F-待处理区域', deviceType: '周转区' },

  // 物料区域
  { deviceCode: 'BC', deviceName: '黑胶存储区', status: '1', runningTime: 0, location: 'Rework 3F-物料区域', deviceType: '物料区' },
  { deviceCode: 'FILM', deviceName: '膜材存储区', status: '1', runningTime: 0, location: 'Rework 3F-物料区域', deviceType: '物料区' },
  { deviceCode: 'POL1', deviceName: 'POL存储区1', status: '1', runningTime: 0, location: 'Rework 3F-物料区域', deviceType: '物料区' },
  { deviceCode: 'POL2', deviceName: 'POL存储区2', status: '1', runningTime: 0, location: 'Rework 3F-物料区域', deviceType: '物料区' },

  // 放置区
  { deviceCode: 'TCON', deviceName: 'T-con放置区', status: '1', runningTime: 0, location: 'Rework 3F-放置区域', deviceType: '放置区' },
  { deviceCode: 'PCB-AREA', deviceName: 'PCB放置区', status: '1', runningTime: 0, location: 'Rework 3F-放置区域', deviceType: '放置区' },

  // 办公区域
  { deviceCode: 'DESK', deviceName: '办公桌', status: '1', runningTime: 0, location: 'Rework 3F-办公区域', deviceType: '办公' },
]

// Rework3F 告警模拟数据
const mockAlarms = [
  {
    alarmId: 1,
    deviceCode: 'UV',
    deviceName: 'UV固化设备',
    alarmLevel: 'error',
    alarmCode: 'TEMP001',
    alarmMessage: 'UV灯管温度超过阈值',
    alarmTime: new Date().toLocaleString('zh-CN'),
    handleStatus: '0'
  },
  {
    alarmId: 2,
    deviceCode: 'LSR',
    deviceName: 'Laser切割机',
    alarmLevel: 'warning',
    alarmCode: 'MAINT001',
    alarmMessage: '设备维护到期提醒',
    alarmTime: new Date().toLocaleString('zh-CN'),
    handleStatus: '0'
  },
  {
    alarmId: 3,
    deviceCode: 'TV-VI-2',
    deviceName: 'TV VI检验设备2',
    alarmLevel: 'info',
    alarmCode: 'CAL001',
    alarmMessage: '检测精度校准提醒',
    alarmTime: new Date().toLocaleString('zh-CN'),
    handleStatus: '0'
  }
]

// 使用统一 mock 工厂
export const getDeviceStatusListMock = createLayoutMockData(mockDeviceStatusList)
export const getRecentAlarmsMock = createLayoutMockData(mockAlarms)

export { mockDeviceStatusList, mockAlarms }
