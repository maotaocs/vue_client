<template>
  <div class="pol-dashboard">
    <!-- 顶部状态栏 -->
    <header class="dashboard-header">
      <div class="header-left">
        <h1 class="title">POL 产线</h1>
      </div>
      <div class="header-center">
        <div class="connection-status" :class="{ connected: isConnected, disconnected: !isConnected }">
          <span class="status-dot"></span>
          {{ isConnected ? '已连接' : '未连接' }}
          <span v-if="isWebSocketConnected" class="ws-badge">WebSocket</span>
        </div>
        <div class="update-time" v-if="showUpdate">数据已更新</div>
      </div>
      <div class="header-right">
        <div class="current-time">{{ currentTime }}</div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="dashboard-main">
      <!-- 中间SVG布局 -->
      <section class="workshop-svg-container">
        <div class="svg-wrapper" v-html="svgContent"></div>

        <!-- 设备详情提示框 -->
        <div
          v-if="tooltip.visible"
          class="device-tooltip"
          :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
        >
          <div class="tooltip-title">{{ tooltip.deviceName }}</div>
          <div class="tooltip-row">
            <span class="label">设备编号:</span>
            <span class="value">{{ tooltip.deviceCode }}</span>
          </div>
          <div class="tooltip-row">
            <span class="label">设备类型:</span>
            <span class="value">{{ tooltip.deviceType }}</span>
          </div>
          <div class="tooltip-row">
            <span class="label">当前位置:</span>
            <span class="value">{{ tooltip.location }}</span>
          </div>
          <div class="tooltip-row">
            <span class="label">运行时长:</span>
            <span class="value">{{ tooltip.runningTime }} 小时</span>
          </div>
          <div class="tooltip-row">
            <span class="label">设备状态:</span>
            <span class="value status-badge" :style="{ backgroundColor: tooltip.statusColor }">
              {{ tooltip.statusText }}
            </span>
          </div>
        </div>
      </section>

      <!-- 右侧告警面板 -->
<!--      <aside class="right-panel">-->
<!--        <div class="alarm-section">-->
<!--          <div class="panel-title">实时告警</div>-->
<!--          <div class="alarm-list">-->
<!--            <div v-if="alarms.length === 0" class="no-alarm">暂无告警</div>-->
<!--            <div-->
<!--              v-for="alarm in alarms"-->
<!--              :key="alarm.alarmId"-->
<!--              class="alarm-item"-->
<!--              :class="`alarm-${alarm.alarmLevel}`"-->
<!--            >-->
<!--              <div class="alarm-icon">{{ alarm.alarmLevel === 'error' ? '!' : alarm.alarmLevel === 'warning' ? 'W' : 'i' }}</div>-->
<!--              <div class="alarm-content">-->
<!--                <div class="alarm-device">{{ alarm.deviceName }}</div>-->
<!--                <div class="alarm-message">{{ alarm.alarmMessage }}</div>-->
<!--                <div class="alarm-time">{{ alarm.alarmTime }}</div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </aside>-->
    </main>

    <!-- 图例 -->
    <footer class="dashboard-footer">
      <div class="legend">
        <div class="legend-item">
          <span class="legend-color" style="background: #52c41a"></span>
          <span class="legend-text">运行</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background: #faad14"></span>
          <span class="legend-text">闲置</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background: #ff4d4f"></span>
          <span class="legend-text">故障</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background: #8c8c8c"></span>
          <span class="legend-text">离线</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useDeviceLayout } from '@/composables/useDeviceLayout'
import { getDeviceStatusListMock, getRecentAlarmsMock } from '@/api/layout/devicePOL'
import rawSvg from './POL.svg?raw'

const {
  svgContent,
  isConnected,
  isWebSocketConnected,
  showUpdate,
  currentTime,
  alarms,
  tooltip,
  initSvg,
  fetchDeviceStatus,
  updateTime,
  initWebSocket,
  destroy
} = useDeviceLayout({
  layoutKey: 'POL',
  title: 'POL 产线',
  getStatusListMock: getDeviceStatusListMock,
  getAlarmsMock: getRecentAlarmsMock
})

let timeTimer = null

onMounted(() => {
  initSvg(rawSvg)
  fetchDeviceStatus()
  initWebSocket()
  updateTime()

  timeTimer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeTimer) clearInterval(timeTimer)
  destroy()
})
</script>

<style scoped>
.pol-dashboard {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0a0e27;
  color: #fff;
  overflow: hidden;
}

/* 顶部状态栏 */
.dashboard-header {
  height: 50px;
  background: linear-gradient(90deg, #001529 0%, #003a70 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left .title {
  font-size: 22px;
  font-weight: bold;
  margin: 0;
  color: #fff;
  letter-spacing: 2px;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 20px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.connection-status.connected {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.connection-status.disconnected {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

.ws-badge {
  background: #1890ff;
  color: #fff;
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 10px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.update-time {
  color: #52c41a;
  font-size: 12px;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.header-right .current-time {
  font-size: 14px;
  color: #a0d8f1;
}

/* 主内容区域 */
.dashboard-main {
  flex: 1;
  display: flex;
  padding: 15px;
  gap: 15px;
  overflow: hidden;
}

/* 中间SVG区域 */
.workshop-svg-container {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}



.svg-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-wrapper :deep(svg) {
  max-width: 100%;
  max-height: 100%;
}

/* SVG 设备样式 */
.svg-wrapper :deep(.device-rect) {
  fill: #52c41a;
  stroke: #3db811;
  stroke-width: 2px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.svg-wrapper :deep(.device-rect:hover) {
  filter: brightness(1.1) drop-shadow(0 0 10px rgba(82, 196, 26, 0.8));
}

/* 设备提示框 */
.device-tooltip {
  position: absolute;
  background: linear-gradient(135deg, rgba(0, 21, 41, 0.98) 0%, rgba(0, 33, 64, 0.98) 100%);
  border: 2px solid #1890ff;
  border-radius: 12px;
  padding: 16px 20px;
  min-width: 240px;
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(24, 144, 255, 0.3);
  backdrop-filter: blur(10px);
}

.device-tooltip::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 20px;
  right: 20px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #1890ff, transparent);
}

.tooltip-title {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(24, 144, 255, 0.3);
  text-shadow: 0 0 10px rgba(24, 144, 255, 0.5);
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  padding: 4px 0;
}

.tooltip-row .label {
  color: #8c8c8c;
  font-weight: 500;
}

.tooltip-row .value {
  color: #fff;
  font-weight: 600;
  text-align: right;
}

.status-badge {
  padding: 3px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1px;
}

/* 右侧面板 */
.right-panel {
  width: 280px;
  display: flex;
  flex-direction: column;
}

.alarm-section {
  background: rgba(0, 21, 41, 0.8);
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-title {
  padding: 10px 15px;
  font-size: 13px;
  font-weight: bold;
  background: rgba(0, 150, 136, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.alarm-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.alarm-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border-left: 3px solid;
}

.alarm-item.alarm-error { border-left-color: #ff4d4f; }
.alarm-item.alarm-warning { border-left-color: #faad14; }
.alarm-item.alarm-info { border-left-color: #1890ff; }

.alarm-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  color: #fff;
  flex-shrink: 0;
}

.alarm-error .alarm-icon { background: #ff4d4f; }
.alarm-warning .alarm-icon { background: #faad14; color: #333; }
.alarm-info .alarm-icon { background: #1890ff; }

.alarm-content { flex: 1; min-width: 0; }

.alarm-device {
  font-size: 12px;
  color: #fff;
  margin-bottom: 3px;
}

.alarm-message {
  font-size: 11px;
  color: #aaa;
  margin-bottom: 3px;
  word-break: break-all;
}

.alarm-time {
  font-size: 10px;
  color: #666;
}

.no-alarm {
  text-align: center;
  padding: 20px;
  color: #666;
}

/* 底部图例 */
.dashboard-footer {
  padding: 10px 20px;
  background: rgba(0, 21, 41, 0.8);
  display: flex;
  justify-content: center;
}

.legend {
  display: flex;
  gap: 30px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

.legend-text {
  font-size: 12px;
  color: #fff;
}
</style>
