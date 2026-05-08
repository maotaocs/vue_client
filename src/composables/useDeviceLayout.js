/**
 * 统一 Layout 设备大屏组合式函数
 *
 * 所有车间 Layout（大屏）共用此 composable，通过 layoutKey 参数区分不同产线。
 *
 * 功能：
 *   - REST API 获取设备状态 + 告警
 *   - WebSocket 实时推送（自动重连）
 *   - 备用轮询（WebSocket 断开时降级）
 *   - SVG 设备颜色更新 + tooltip
 *   - 状态文字/颜色映射
 *
 * 使用方式：
 *   const {
 *     isConnected,           // API 连接状态
 *     isWebSocketConnected, // WebSocket 连接状态
 *     showUpdate,           // 数据更新提示
 *     currentTime,           // 当前时间
 *     deviceList,           // 设备列表
 *     alarms,               // 告警列表
 *     deviceStatusMap,      // 设备状态映射
 *     deviceInfoMap,        // 设备信息映射
 *     initSvg,              // 初始化 SVG（返回 svgContent）
 *     updateDeviceColors,   // 更新设备颜色
 *     fetchDeviceStatus,    // 主动刷新数据
 *     destroy               // 销毁（组件卸载时调用）
 *   } = useDeviceLayout({ layoutKey, title, getStatusListMock, getAlarmsMock })
 */

import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import request from '@/utils/request'
import { USE_MOCK } from '@/api/layout/deviceLayoutMock'

export function useDeviceLayout({
  layoutKey = 'default',
  title = 'Layout',
  getStatusListMock,
  getAlarmsMock,
  wsPath = null
} = {}) {
  // layoutKey → WebSocket path mapping (REST endpoint ≠ WS path)
  const WS_PATH_MAP = {
    rework3F: 'device3F',
    POL: 'devicePOL'
  }
  const wsEndpoint = wsPath || WS_PATH_MAP[layoutKey] || `device${layoutKey}`

  // layoutKey → REST API path mapping
  const REST_PATH_MAP = {
    rework3F: 'device3F',
    POL: 'devicePOL'
  }
  const restPath = REST_PATH_MAP[layoutKey] || layoutKey

  // ======================== 响应式状态 ========================
  const svgContent = ref('')
  const isConnected = ref(false)
  const isWebSocketConnected = ref(false)
  const showUpdate = ref(false)
  const currentTime = ref('')
  const deviceList = ref([])
  const alarms = ref([])

  const tooltip = reactive({
    visible: false,
    x: 0,
    y: 0,
    deviceCode: '',
    deviceName: '',
    deviceType: '',
    location: '',
    runningTime: 0,
    statusText: '',
    statusColor: ''
  })

  const deviceStatusMap = reactive({})
  const deviceInfoMap = reactive({})

  // ======================== 定时器引用 ========================
  let websocket = null
  let reconnectTimer = null
  let pollingTimer = null
  let timeTimer = null

  // ======================== 工具函数 ========================

  function updateTime() {
    const now = new Date()
    currentTime.value = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  function getStatusText(status) {
    const texts = { '1': '运行', '2': '闲置', '3': '故障', '0': '离线' }
    return texts[status] || '未知'
  }

  function getStatusColor(status) {
    const colors = {
      '1': '#52c41a', // 运行 - 绿色
      '2': '#faad14', // 闲置 - 黄色
      '3': '#ff4d4f', // 故障 - 红色
      '0': '#8c8c8c'  // 离线 - 灰色
    }
    return colors[status] || colors['0']
  }

  function getStrokeColor(status) {
    const colors = {
      '1': '#3db811',
      '2': '#d4940a',
      '3': '#d42a2a',
      '0': '#6c6c6c'
    }
    return colors[status] || colors['0']
  }

  function showDataUpdate() {
    showUpdate.value = true
    setTimeout(() => { showUpdate.value = false }, 1500)
  }

  // ======================== SVG 初始化 ========================

  function initSvg(svgRaw) {
    svgContent.value = svgRaw
    nextTick(() => {
      bindSvgEvents()
    })
  }

  function updateDeviceColors() {
    const svgWrapper = document.querySelector('.svg-wrapper')
    if (!svgWrapper) return
    const svg = svgWrapper.querySelector('svg')
    if (!svg) return

    svg.querySelectorAll('.device-rect').forEach(rect => {
      const deviceCode = rect.getAttribute('data-device')
      if (!deviceCode) return
      const status = deviceStatusMap[deviceCode]
      rect.style.fill = getStatusColor(status)
      rect.style.stroke = getStrokeColor(status)
      rect.style.strokeWidth = '2px'
    })
  }

  function updateSingleDeviceColor(deviceCode, status) {
    const svgWrapper = document.querySelector('.svg-wrapper')
    if (!svgWrapper) return
    const svg = svgWrapper.querySelector('svg')
    if (!svg) return
    svg.querySelectorAll(`[data-device="${deviceCode}"]`).forEach(rect => {
      rect.style.fill = getStatusColor(status)
      rect.style.stroke = getStrokeColor(status)
    })
  }

  // ======================== Tooltip ========================

  function showTooltip(event, deviceCode) {
    const svgWrapper = document.querySelector('.svg-wrapper')
    if (!svgWrapper) return
    const status = deviceStatusMap[deviceCode] || '0'
    const info = deviceInfoMap[deviceCode]

    tooltip.visible = true
    tooltip.deviceCode = deviceCode
    tooltip.deviceName = info?.deviceName || deviceCode
    tooltip.deviceType = info?.deviceType || '未知'
    tooltip.location = info?.location || '未设置'
    tooltip.runningTime = info?.runningTime || 0
    tooltip.statusText = getStatusText(status)
    tooltip.statusColor = getStatusColor(status)

    moveTooltip(event)
  }

  function moveTooltip(event) {
    const svgWrapper = document.querySelector('.svg-wrapper')
    if (!svgWrapper) return
    const wrapperRect = svgWrapper.getBoundingClientRect()

    tooltip.x = event.clientX - wrapperRect.left + 15
    tooltip.y = event.clientY - wrapperRect.top + 15

    if (tooltip.x + 210 > wrapperRect.width) {
      tooltip.x = event.clientX - wrapperRect.left - 215
    }
    if (tooltip.y + 160 > wrapperRect.height) {
      tooltip.y = event.clientY - wrapperRect.top - 165
    }
  }

  function hideTooltip() {
    tooltip.visible = false
  }

  function bindSvgEvents() {
    const svgWrapper = document.querySelector('.svg-wrapper')
    if (!svgWrapper) return
    const svg = svgWrapper.querySelector('svg')
    if (!svg) return

    svg.querySelectorAll('.device-rect').forEach(rect => {
      rect.style.cursor = 'pointer'

      rect.addEventListener('mouseenter', (e) => {
        const deviceCode = rect.getAttribute('data-device')
        if (deviceCode) showTooltip(e, deviceCode)
      })

      rect.addEventListener('mousemove', (e) => {
        const deviceCode = rect.getAttribute('data-device')
        if (deviceCode) moveTooltip(e)
      })

      rect.addEventListener('mouseleave', () => {
        hideTooltip()
      })
    })
  }

  // ======================== 数据获取 ========================

  async function fetchDeviceStatus() {
    try {
      const statusRes = USE_MOCK
        ? await getStatusListMock()
        : await request({ url: `/system/${restPath}/statusList/cache`, method: 'get' })

      if (statusRes.code === 200 && statusRes.data) {
        deviceList.value = statusRes.data
        Object.keys(deviceStatusMap).forEach(key => delete deviceStatusMap[key])
        Object.keys(deviceInfoMap).forEach(key => delete deviceInfoMap[key])

        statusRes.data.forEach(device => {
          deviceStatusMap[device.deviceCode] = device.status
          deviceInfoMap[device.deviceCode] = device
        })

        updateDeviceColors()
      }

      const alarmRes = USE_MOCK
        ? await getAlarmsMock()
        : await request({ url: `/system/${restPath}/alarms`, method: 'get' })

      if (alarmRes.code === 200 && alarmRes.data) {
        alarms.value = alarmRes.data.slice(0, 5)
      }

      isConnected.value = true
      showDataUpdate()
    } catch (error) {
      console.error(`[${layoutKey}] 获取设备状态失败:`, error)
      isConnected.value = false
    }
  }

  // ======================== WebSocket ========================

  function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const origin = window.location.origin
    const wsUrl = `${protocol}//${origin.replace(/^http/, '')}/ws/${wsEndpoint}`

    try {
      websocket = new WebSocket(wsUrl)

      websocket.onopen = () => {
        console.log(`[${layoutKey}] WebSocket 连接已建立`)
        isWebSocketConnected.value = true
      }

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleWebSocketMessage(data)
        } catch (e) {
          console.error(`[${layoutKey}] WebSocket 消息解析失败:`, e)
        }
      }

      websocket.onerror = (error) => {
        console.error(`[${layoutKey}] WebSocket 错误:`, error)
        isWebSocketConnected.value = false
      }

      websocket.onclose = () => {
        console.log(`[${layoutKey}] WebSocket 连接已关闭`)
        isWebSocketConnected.value = false
        scheduleReconnect()
      }
    } catch (error) {
      console.error(`[${layoutKey}] WebSocket 连接失败:`, error)
      isWebSocketConnected.value = false
      scheduleReconnect()
    }
  }

  function handleWebSocketMessage(data) {
    const { type, payload } = data

    switch (type) {
      case 'device_status_update':
        if (payload?.deviceCode) {
          deviceStatusMap[payload.deviceCode] = payload.status
          if (payload.deviceName) {
            deviceInfoMap[payload.deviceCode] = {
              ...deviceInfoMap[payload.deviceCode],
              ...payload
            }
          }
          updateSingleDeviceColor(payload.deviceCode, payload.status)
          showDataUpdate()
        }
        break

      case 'device_list_update':
        if (Array.isArray(payload)) {
          payload.forEach(device => {
            deviceStatusMap[device.deviceCode] = device.status
            deviceInfoMap[device.deviceCode] = device
          })
          updateDeviceColors()
          showDataUpdate()
        }
        break

      case 'alarm':
        if (payload) {
          alarms.value.unshift(payload)
          if (alarms.value.length > 5) {
            alarms.value = alarms.value.slice(0, 5)
          }
        }
        break

      case 'heartbeat':
        if (websocket?.readyState === WebSocket.OPEN) {
          websocket.send(JSON.stringify({ type: 'heartbeat_ack' }))
        }
        break

      default:
        console.log(`[${layoutKey}] 未知的 WebSocket 消息类型:`, type)
    }
  }

  function scheduleReconnect() {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(() => {
      console.log(`[${layoutKey}] 尝试重新连接 WebSocket...`)
      initWebSocket()
    }, 5000)
  }

  function sendWebSocketMessage(message) {
    if (websocket?.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify(message))
    }
  }

  // ======================== 生命周期 ========================

  function destroy() {
    if (timeTimer) clearInterval(timeTimer)
    if (pollingTimer) clearInterval(pollingTimer)
    if (reconnectTimer) clearTimeout(reconnectTimer)
    if (websocket) websocket.close()
  }

  return {
    // 状态
    svgContent,
    isConnected,
    isWebSocketConnected,
    showUpdate,
    currentTime,
    deviceList,
    alarms,
    deviceStatusMap,
    deviceInfoMap,
    tooltip,
    // 方法
    initSvg,
    updateDeviceColors,
    updateSingleDeviceColor,
    fetchDeviceStatus,
    updateTime,
    initWebSocket,
    sendWebSocketMessage,
    destroy
  }
}
