<template>
  <div class="dashboard-container">
    <!-- 顶部标题栏 -->
    <div class="dashboard-header">
      <div class="header-left">
        <span class="time">{{ currentTime }}</span>
      </div>
      <div class="header-center">
        <h1>监控中心</h1>
      </div>
      <div class="header-right">
        <span class="date">{{ currentDate }}</span>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="dashboard-main">
      <!-- 左侧设备分类统计 -->
      <div class="panel left-panel">
        <div class="panel-header">
          <span class="panel-title">设备分类统计</span>
          <span class="panel-line"></span>
        </div>
        <div class="device-list" v-loading="loading">
          <div v-for="device in deviceTypeStats" :key="device.deviceType" class="device-item">
            <div class="device-icon" :style="{ backgroundColor: device.color }">
              <i :class="device.icon"></i>
            </div>
            <div class="device-info">
              <span class="device-name">{{ device.deviceTypeName }}</span>
              <span class="device-count">{{ device.total }} <em>台</em></span>
            </div>
            <div class="device-bars">
              <div class="bar running" :style="{ width: getRate(device.runningCount, device.total) + '%' }"></div>
              <div class="bar idle" :style="{ width: getRate(device.idleCount, device.total) + '%' }"></div>
              <div class="bar fault" :style="{ width: getRate(device.faultCount, device.total) + '%' }"></div>
              <div class="bar offline" :style="{ width: getRate(device.offlineCount, device.total) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间区域 -->
      <div class="center-area">
        <!-- 设备总览卡片 -->
        <div class="overview-cards">
          <div class="overview-card total">
            <div class="card-icon">
              <i class="el-icon-box"></i>
            </div>
            <div class="card-content">
              <span class="card-value">{{ totalCount || 0 }}</span>
              <span class="card-label">设备总数</span>
            </div>
          </div>
          <div class="overview-card running">
            <div class="card-icon">
              <i class="el-icon-video-play"></i>
            </div>
            <div class="card-content">
              <span class="card-value">{{ runningCount || 0 }}</span>
              <span class="card-label">运行中</span>
            </div>
          </div>
          <div class="overview-card idle">
            <div class="card-icon">
              <i class="el-icon-video-pause"></i>
            </div>
            <div class="card-content">
              <span class="card-value">{{ idleCount || 0 }}</span>
              <span class="card-label">闲置中</span>
            </div>
          </div>
          <div class="overview-card fault">
            <div class="card-icon">
              <i class="el-icon-warning"></i>
            </div>
            <div class="card-content">
              <span class="card-value">{{ faultCount || 0 }}</span>
              <span class="card-label">故障中</span>
            </div>
          </div>
          <div class="overview-card offline">
            <div class="card-icon">
              <i class="el-icon-turn-off-microphone"></i>
            </div>
            <div class="card-content">
              <span class="card-value">{{ offlineCount || 0 }}</span>
              <span class="card-label">离线中</span>
            </div>
          </div>
        </div>

        <!-- 设备状态分布图 -->
        <div class="chart-container">
          <div class="chart-wrapper">
            <div ref="pieChartRef" class="pie-chart"></div>
          </div>
          <div class="chart-wrapper">
            <div ref="barChartRef" class="bar-chart"></div>
          </div>
        </div>
      </div>

      <!-- 右侧实时监控 -->
      <div class="panel right-panel">
        <div class="panel-header">
          <span class="panel-title">实时告警</span>
          <span class="panel-line"></span>
        </div>
        <div class="alarm-list" v-loading="loading">
          <div v-for="(alarm, index) in alarmList" :key="index" class="alarm-item" :class="alarm.level">
            <div class="alarm-time">{{ alarm.time }}</div>
            <div class="alarm-content">
              <span class="alarm-device">{{ alarm.device }}</span>
              <span class="alarm-msg">{{ alarm.message }}</span>
            </div>
          </div>
          <div v-if="alarmList.length === 0 && !loading" class="no-data">暂无告警信息</div>
        </div>

        <div class="panel-header" style="margin-top: 20px;">
          <span class="panel-title">运行趋势</span>
          <span class="panel-line"></span>
        </div>
        <div ref="lineChartRef" class="line-chart"></div>
      </div>
    </div>

    <!-- 底部设备状态明细 -->
    <div class="dashboard-footer">
      <div class="footer-panel">
        <div class="panel-header">
          <span class="panel-title">设备状态明细</span>
          <span class="panel-line"></span>
        </div>
        <div class="device-grid" v-loading="loading">
          <div v-for="device in deviceDetails" :key="device.id" class="device-card" :class="getStatusClass(device.status)">
            <div class="device-status-dot"></div>
            <div class="device-card-icon">
              <i :class="getDeviceIcon(device.deviceType)"></i>
            </div>
            <div class="device-card-info">
              <span class="device-card-name">{{ device.deviceCode }}</span>
              <span class="device-card-type">{{ device.deviceType }}</span>
            </div>
            <div class="device-card-status">
              {{ getStatusText(device.status) }}
            </div>
          </div>
          <div v-if="deviceDetails.length === 0 && !loading" class="no-data-card">暂无设备数据</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getDeviceStatistics } from '@/api/system/device'

const pieChartRef = ref(null)
const barChartRef = ref(null)
const lineChartRef = ref(null)

let pieChart = null
let barChart = null
let lineChart = null
let timer = null
let refreshTimer = null

const loading = ref(false)

// 统计数据
const totalCount = ref(0)
const runningCount = ref(0)
const idleCount = ref(0)
const faultCount = ref(0)
const offlineCount = ref(0)

// 设备类型统计
const deviceTypeStats = ref([])

// 告警列表
const alarmList = ref([])

// 设备详情列表
const deviceDetails = ref([])

// 趋势数据
const trendData = ref({ hours: [], running: [], idle: [], fault: [] })

// 当前时间
const currentTime = ref('')
const currentDate = ref('')

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

// 计算比率
const getRate = (count, total) => {
  if (!total || total === 0) return 0
  return Math.round((count / total) * 100)
}

// 获取状态样式类
const getStatusClass = (status) => {
  const statusMap = {
    '0': 'offline', '1': 'running', '2': 'idle', '3': 'fault',
    0: 'offline', 1: 'running', 2: 'idle', 3: 'fault'
  }
  return statusMap[status] || 'offline'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    '0': '离线', '1': '运行中', '2': '闲置中', '3': '故障中',
    0: '离线', 1: '运行中', 2: '闲置中', 3: '故障中'
  }
  return statusMap[status] || '未知'
}

// 获取设备图标
const getDeviceIcon = (deviceType) => {
  const iconMap = {
    'PLC': 'el-icon-cpu',
    'RFID': 'el-icon-wifi',
    '打印机': 'el-icon-printer',
    '读码器': 'el-icon-scanner',
    '注塑机': 'el-icon-coin',
    '数控机床': 'el-icon-setting',
    '智能电批': 'el-icon-s-tools',
    'MES客户端': 'el-icon-monitor'
  }
  return iconMap[deviceType] || 'el-icon-box'
}

// 从后端获取数据
const fetchData = async () => {
  try {
    loading.value = true
    const res = await getDeviceStatistics()
    if (res.code === 200 && res.data) {
      const data = res.data

      // 更新统计数据
      totalCount.value = data.totalCount || 0
      runningCount.value = data.runningCount || 0
      idleCount.value = data.idleCount || 0
      faultCount.value = data.faultCount || 0
      offlineCount.value = data.offlineCount || 0

      // 更新设备类型统计
      deviceTypeStats.value = data.deviceTypeStats || []

      // 更新告警列表
      alarmList.value = data.alarmList || []

      // 更新设备详情
      deviceDetails.value = data.deviceDetails || []
      console.log('deviceDetails:', JSON.stringify(deviceDetails.value, null, 2))

      // 更新趋势数据
      if (data.trendData) {
        trendData.value = data.trendData
      }

      // 更新图表
      nextTick(() => {
        updateCharts()
      })
    }
  } catch (error) {
    console.error('获取设备数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 更新所有图表
const updateCharts = () => {
  initPieChart()
  initBarChart()
  initLineChart()
}

// 饼图配置
const initPieChart = () => {
  if (!pieChartRef.value) return
  if (!pieChart) {
    pieChart = echarts.init(pieChartRef.value)
  }
  const option = {
    title: {
      text: '设备状态分布',
      left: 'center',
      top: 10,
      textStyle: { color: '#fff', fontSize: 14 }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#fff' }
    },
    color: ['#67C23A', '#E6A23C', '#F56C6C', '#909399'],
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '55%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' }
      },
      data: [
        { value: runningCount.value, name: '运行中' },
        { value: idleCount.value, name: '闲置中' },
        { value: faultCount.value, name: '故障中' },
        { value: offlineCount.value, name: '离线中' }
      ]
    }]
  }
  pieChart.setOption(option)
}

// 柱状图配置
const initBarChart = () => {
  if (!barChartRef.value) return
  if (!barChart) {
    barChart = echarts.init(barChartRef.value)
  }
  const option = {
    title: {
      text: '设备类型数量',
      left: 'center',
      top: 10,
      textStyle: { color: '#fff', fontSize: 14 }
    },
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: deviceTypeStats.value.map(d => d.deviceTypeName.replace('控制器', '').replace('读写器', '').replace('打印机', '').replace('读码器', '')),
      axisLabel: { color: '#fff', rotate: 30, fontSize: 10 },
      axisLine: { lineStyle: { color: '#333' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#fff' },
      splitLine: { lineStyle: { color: '#333' } }
    },
    series: [{
      type: 'bar',
      data: deviceTypeStats.value.map(d => d.total),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#409EFF' },
          { offset: 1, color: '#66b1ff' }
        ])
      },
      barWidth: '50%'
    }]
  }
  barChart.setOption(option)
}

// 折线图配置
const initLineChart = () => {
  if (!lineChartRef.value) return
  if (!lineChart) {
    lineChart = echarts.init(lineChartRef.value)
  }
  const hours = trendData.value.hours || Array.from({ length: 12 }, (_, i) => `${6 + i}:00`)
  const running = trendData.value.running || [65, 72, 78, 82, 85, 88, 90, 92, 88, 85, 82, 78]
  const idle = trendData.value.idle || [25, 20, 15, 12, 10, 8, 7, 5, 8, 10, 12, 15]
  const fault = trendData.value.fault || [10, 8, 7, 6, 5, 4, 3, 3, 4, 5, 6, 7]

  const option = {
    title: {
      text: '24小时运行趋势',
      left: 'center',
      top: 5,
      textStyle: { color: '#fff', fontSize: 12 }
    },
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 15, top: 35, bottom: 25 },
    xAxis: {
      type: 'category',
      data: hours,
      axisLabel: { color: '#fff', fontSize: 9 },
      axisLine: { lineStyle: { color: '#333' } }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { color: '#fff', formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#333' } }
    },
    series: [
      {
        name: '运行率',
        type: 'line',
        smooth: true,
        data: running,
        lineStyle: { color: '#67C23A' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
          ])
        }
      },
      {
        name: '闲置率',
        type: 'line',
        smooth: true,
        data: idle,
        lineStyle: { color: '#E6A23C' }
      },
      {
        name: '故障率',
        type: 'line',
        smooth: true,
        data: fault,
        lineStyle: { color: '#F56C6C' }
      }
    ]
  }
  lineChart.setOption(option)
}

// 窗口调整
const handleResize = () => {
  pieChart?.resize()
  barChart?.resize()
  lineChart?.resize()
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)

  // 获取数据
  fetchData()

  // 每30秒刷新一次数据
  refreshTimer = setInterval(fetchData, 30000)

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (refreshTimer) clearInterval(refreshTimer)
  window.removeEventListener('resize', handleResize)
  pieChart?.dispose()
  barChart?.dispose()
  lineChart?.dispose()
})
</script>

<style scoped lang="scss">
.dashboard-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #0c1425 0%, #1a2744 50%, #0d1a2d 100%);
  color: #fff;
  padding: 0;
  overflow-x: hidden;
}

// 顶部标题栏
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: linear-gradient(90deg, rgba(0,77,158,0.6) 0%, rgba(0,77,158,0.3) 50%, rgba(0,77,158,0.6) 100%);
  border-bottom: 1px solid rgba(64,158,255,0.3);
  box-shadow: 0 2px 20px rgba(0,0,0,0.5);

  .header-center h1 {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: 8px;
    color: #409EFF;
    text-shadow: 0 0 20px rgba(64,158,255,0.5);
    margin: 0;
  }

  .header-left, .header-right {
    font-size: 14px;
    color: rgba(255,255,255,0.7);
  }

  .time {
    font-size: 24px;
    font-weight: bold;
    color: #409EFF;
    font-family: 'Courier New', monospace;
  }
}

// 主要内容区域
.dashboard-main {
  display: flex;
  padding: 15px;
  gap: 15px;
  height: calc(100vh - 350px);
  min-height: 400px;
}

// 面板样式
.panel {
  background: rgba(0,20,40,0.6);
  border: 1px solid rgba(64,158,255,0.2);
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 0 15px rgba(0,0,0,0.3);
}

.panel-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;

  .panel-title {
    font-size: 16px;
    font-weight: 600;
    color: #409EFF;
    white-space: nowrap;
  }

  .panel-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(64,158,255,0.6) 0%, transparent 100%);
    margin-left: 10px;
  }
}

// 左侧面板
.left-panel {
  width: 320px;
  flex-shrink: 0;

  .device-list {
    max-height: calc(100vh - 450px);
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(64,158,255,0.3);
      border-radius: 2px;
    }
  }

  .device-item {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);

    &:last-child {
      border-bottom: none;
    }

    .device-icon {
      width: 36px;
      height: 36px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;

      i {
        font-size: 18px;
        color: #fff;
      }
    }

    .device-info {
      width: 100px;
      flex-shrink: 0;

      .device-name {
        display: block;
        font-size: 13px;
        color: rgba(255,255,255,0.9);
      }

      .device-count {
        font-size: 18px;
        font-weight: bold;
        color: #fff;

        em {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          font-style: normal;
        }
      }
    }

    .device-bars {
      flex: 1;
      height: 8px;
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      margin-left: 10px;

      .bar {
        height: 100%;
        transition: width 0.5s ease;

        &.running { background: #67C23A; }
        &.idle { background: #E6A23C; }
        &.fault { background: #F56C6C; }
        &.offline { background: #909399; }
      }
    }
  }
}

// 中间区域
.center-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 0;
}

// 总览卡片
.overview-cards {
  display: flex;
  gap: 15px;

  .overview-card {
    flex: 1;
    background: rgba(0,20,40,0.6);
    border: 1px solid rgba(64,158,255,0.2);
    border-radius: 8px;
    padding: 15px;
    display: flex;
    align-items: center;
    gap: 15px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    }

    &.total {
      border-color: rgba(64,158,255,0.5);
      .card-icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
    }
    &.running {
      border-color: rgba(103,194,58,0.5);
      .card-icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
    }
    &.idle {
      border-color: rgba(230,162,60,0.5);
      .card-icon { background: linear-gradient(135deg, #E6A23C, #ebb563); }
    }
    &.fault {
      border-color: rgba(245,108,108,0.5);
      .card-icon { background: linear-gradient(135deg, #F56C6C, #f78989); }
    }
    &.offline {
      border-color: rgba(144,147,153,0.5);
      .card-icon { background: linear-gradient(135deg, #909399, #a6a9ad); }
    }

    .card-icon {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 24px;
        color: #fff;
      }
    }

    .card-content {
      .card-value {
        display: block;
        font-size: 28px;
        font-weight: bold;
        color: #fff;
      }

      .card-label {
        font-size: 13px;
        color: rgba(255,255,255,0.6);
      }
    }
  }
}

// 图表容器
.chart-container {
  flex: 1;
  display: flex;
  gap: 15px;

  .chart-wrapper {
    flex: 1;
    background: rgba(0,20,40,0.6);
    border: 1px solid rgba(64,158,255,0.2);
    border-radius: 8px;
    padding: 10px;

    .pie-chart,
    .bar-chart {
      width: 100%;
      height: 100%;
    }
  }
}

// 右侧面板
.right-panel {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;

  .alarm-list {
    flex: 1;
    overflow-y: auto;
    max-height: 200px;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(64,158,255,0.3);
      border-radius: 2px;
    }

    .no-data {
      text-align: center;
      color: rgba(255,255,255,0.5);
      padding: 20px;
    }
  }

  .alarm-item {
    display: flex;
    padding: 8px;
    margin-bottom: 8px;
    border-radius: 4px;
    background: rgba(0,0,0,0.2);
    font-size: 12px;

    &.warning {
      border-left: 3px solid #E6A23C;
    }
    &.error {
      border-left: 3px solid #F56C6C;
      background: rgba(245,108,108,0.1);
    }
    &.info {
      border-left: 3px solid #409EFF;
    }
    &.success {
      border-left: 3px solid #67C23A;
    }

    .alarm-time {
      color: rgba(255,255,255,0.5);
      margin-right: 10px;
      white-space: nowrap;
    }

    .alarm-content {
      flex: 1;

      .alarm-device {
        color: #409EFF;
        margin-right: 8px;
      }

      .alarm-msg {
        color: rgba(255,255,255,0.8);
      }
    }
  }

  .line-chart {
    height: 180px;
  }
}

// 底部设备明细
.dashboard-footer {
  padding: 15px;

  .footer-panel {
    background: rgba(0,20,40,0.6);
    border: 1px solid rgba(64,158,255,0.2);
    border-radius: 8px;
    padding: 15px;
  }

  .device-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .no-data-card {
      width: 100%;
      text-align: center;
      color: rgba(255,255,255,0.5);
      padding: 40px;
    }
  }

  .device-card {
    width: 140px;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 12px;
    position: relative;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }

    &.running {
      border-color: rgba(103,194,58,0.5);
      .device-status-dot { background: #67C23A; }
      .device-card-status { color: #67C23A; }
    }
    &.idle {
      border-color: rgba(230,162,60,0.5);
      .device-status-dot { background: #E6A23C; }
      .device-card-status { color: #E6A23C; }
    }
    &.fault {
      border-color: rgba(245,108,108,0.5);
      .device-status-dot { background: #F56C6C; }
      .device-card-status { color: #F56C6C; }
    }
    &.offline {
      border-color: rgba(144,147,153,0.5);
      .device-status-dot { background: #909399; }
      .device-card-status { color: #909399; }
    }

    .device-status-dot {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    .device-card-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, rgba(64,158,255,0.3), rgba(64,158,255,0.1));
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;

      i {
        font-size: 20px;
        color: #409EFF;
      }
    }

    .device-card-info {
      .device-card-name {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #fff;
        margin-bottom: 4px;
      }

      .device-card-type {
        font-size: 11px;
        color: rgba(255,255,255,0.5);
      }
    }

    .device-card-status {
      font-size: 12px;
      margin-top: 8px;
      font-weight: 500;
      color: #fff;
    }
  }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 currentColor; }
  70% { box-shadow: 0 0 0 6px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}

// 响应式
@media (max-width: 1400px) {
  .left-panel, .right-panel {
    width: 280px;
  }

  .device-card {
    width: 120px !important;
  }
}

@media (max-width: 1200px) {
  .dashboard-main {
    flex-direction: column;
    height: auto;
  }

  .left-panel, .right-panel {
    width: 100%;
  }

  .center-area {
    flex-direction: column;
  }

  .overview-cards {
    flex-wrap: wrap;
  }

  .device-grid {
    justify-content: center;
  }
}
</style>
