<template>
  <div class="dashboard-container">
    <!-- 顶部导航栏 -->

    <!-- 页面主体 -->
    <div class="page-content" v-loading="loading">
      <!-- 页面头部 -->


      <!-- 顶部统计卡片行 -->
      <div class="stats-cards">
        <div class="stat-card blue">
          <div class="card-label">插卡机覆盖率</div>
          <div class="card-value">{{ dashboardData.cardCoverage || '已覆盖全工序' }}</div>
        </div>
        <div class="stat-card green">
          <div class="card-label">管理饱和度下降</div>
          <div class="card-value">{{ dashboardData.saturationDesc || '班组长事务性工作减少' }}</div>
        </div>
        <div class="stat-card orange">
          <div class="card-label">UPPH提升</div>
          <div class="card-value">{{ dashboardData.upphValue || '试点线体数据' }}</div>
        </div>
        <div class="stat-card red">
          <div class="card-label">无证上岗拦截</div>
          <div class="card-value">{{ dashboardData.certificateCount || '系统上线以来' }}</div>
        </div>
        <div class="stat-card purple">
          <div class="card-label">在岗率实时值</div>
          <div class="card-value">{{ dashboardData.onDutyRate || '当前全厂' }}</div>
        </div>
      </div>

      <!-- 中间区域 -->
      <div class="middle-area">
        <!-- 车间人员热力图 -->
        <div class="card heatmap-card">
          <div class="card-header">
            <div class="header-dot"></div>
            <h3>车间人员热力图</h3>
          </div>
          <div class="card-desc">实时在岗人数与饱和度监控</div>
          <div class="chart-container" ref="heatmapRef"></div>
          <div class="card-quote">"过去班组长要跑断腿点名，现在一眼看清全厂人员在哪儿、是否饱和。"</div>
        </div>

        <!-- 效率与合规趋势 -->
        <div class="card trend-card">
          <div class="card-header">
            <div class="header-dot"></div>
            <h3>效率与合规趋势</h3>
          </div>
          <div class="card-desc">UPPH提升与违规离岗管控效果</div>
          <div class="chart-container" ref="trendChartRef"></div>
        </div>
      </div>

      <!-- 底部区域 -->
      <div class="bottom-area">
        <!-- 异常实时预警流 -->
        <div class="card alert-card">
          <div class="card-header">
            <div class="header-dot red"></div>
            <h3>异常实时预警流</h3>
          </div>
          <div class="alert-list">
            <div v-if="alertList.length === 0 && !loading" class="no-data">暂无预警信息</div>
            <div v-for="(alarm, index) in alertList" :key="index" class="alert-item">
              <div class="alert-indicator" :class="alarm.type || 'info'"></div>
              <div class="alert-content">
                <span class="alert-message">{{ alarm.message }}</span>
                <span class="alert-time">{{ alarm.timeAgo }}</span>
              </div>
            </div>
          </div>
          <div class="card-quote">"系统变被动响应为主动预警，问题发现速度提升至秒级。"</div>
        </div>

        <!-- 三层格栅管控体系 -->
        <div class="card control-card">
          <div class="card-header">
            <div class="header-dot green"></div>
            <h3>三层格栅管控体系</h3>
          </div>
          <div class="control-layers">
            <div class="layer-item">
              <div class="layer-icon company">
                <i class="el-icon-office-building"></i>
              </div>
              <div class="layer-title">{{ controlLayers.companyAccess || '公司门禁' }}</div>
              <div class="layer-subtitle">{{ controlLayers.companyAccessSub || '考勤数据' }}</div>
            </div>
            <div class="layer-arrow">→</div>
            <div class="layer-item">
              <div class="layer-icon locker">
                <i class="el-icon-coffee-cup"></i>
              </div>
              <div class="layer-title">{{ controlLayers.lockerRoom || '更衣室' }}</div>
              <div class="layer-subtitle">{{ controlLayers.lockerRoomSub || '在厂数据' }}</div>
            </div>
            <div class="layer-arrow">→</div>
            <div class="layer-item">
              <div class="layer-icon workstation">
                <i class="el-icon-monitor"></i>
              </div>
              <div class="layer-title">{{ controlLayers.workstation || '工位插卡' }}</div>
              <div class="layer-subtitle">{{ controlLayers.workstationSub || '在岗数据' }}</div>
            </div>
          </div>
          <div class="control-desc">{{ controlLayers.desc || '公司门禁（考勤）→ 更衣室（在厂）→ 工位插卡（在岗），三层数据贯通，无死角管控' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { getPersonDashboard } from '@/api/system/person'

const router = useRouter()
const heatmapRef = ref(null)
const trendChartRef = ref(null)

let heatmapChart = null
let trendChart = null
let timer = null
let refreshTimer = null

const loading = ref(false)

// 用户信息
// const userInfo = reactive({
//   userName: '管理员',
//   deptName: '生产管理部'
// })

// 看板主数据
const dashboardData = reactive({
  cardCoverage: '',
  saturationDesc: '',
  upphValue: '',
  certificateCount: '',
  onDutyRate: ''
})

// 预警列表
const alertList = ref([])

// 三层管控体系
const controlLayers = reactive({
  companyAccess: '公司门禁',
  companyAccessSub: '考勤数据',
  lockerRoom: '更衣室',
  lockerRoomSub: '在厂数据',
  workstation: '工位插卡',
  workstationSub: '在岗数据',
  desc: ''
})

// 热力图数据
const heatmapData = reactive({
  hours: [],
  workshops: [],
  data: []
})

// 趋势图数据
const trendData = reactive({
  days: [],
  upphData: [],
  violationData: []
})

// 当前时间
const currentDate = ref('')

const updateTime = () => {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

// 从后端获取数据
const fetchData = async () => {
  try {
    loading.value = true
    const res = await getPersonDashboard()
    if (res.code === 200 && res.data) {
      const data = res.data

      // 更新统计卡片数据
      if (data.cardCoverage !== undefined) dashboardData.cardCoverage = data.cardCoverage
      if (data.saturationDesc) dashboardData.saturationDesc = data.saturationDesc
      if (data.upphValue !== undefined) dashboardData.upphValue = data.upphValue
      if (data.certificateCount !== undefined) dashboardData.certificateCount = data.certificateCount
      if (data.onDutyRate !== undefined) dashboardData.onDutyRate = data.onDutyRate

      // 更新预警列表
      if (data.alertList && Array.isArray(data.alertList)) {
        alertList.value = data.alertList
      }

      // 更新三层管控体系
      if (data.controlLayers) {
        Object.assign(controlLayers, data.controlLayers)
      }

      // 更新热力图数据
      if (data.heatmap) {
        heatmapData.hours = data.heatmap.hours || []
        heatmapData.workshops = data.heatmap.workshops || []
        heatmapData.data = data.heatmap.data || []
      }

      // 更新趋势数据
      if (data.trend) {
        trendData.days = data.trend.days || []
        trendData.upphData = data.trend.upphData || []
        trendData.violationData = data.trend.violationData || []
      }

      nextTick(() => {
        initCharts()
      })
    }
  } catch (error) {
    console.error('获取看板数据失败:', error)
    // 使用模拟数据
    useMockData()
  } finally {
    loading.value = false
  }
}

// 使用模拟数据
const useMockData = () => {
  dashboardData.cardCoverage = '已覆盖全工序'
  dashboardData.saturationDesc = '班组长事务性工作减少'
  dashboardData.upphValue = '12.5%'
  dashboardData.certificateCount = '23次'
  dashboardData.onDutyRate = '96.8%'

  alertList.value = [
    { message: '张三在A线检测岗离岗超15分钟', timeAgo: '2分钟前', type: 'warning' },
    { message: '李四无证操作绑定机，已拦截', timeAgo: '5分钟前', type: 'error' },
    { message: 'B线绑定岗饱和度低于60%', timeAgo: '8分钟前', type: 'info' },
    { message: 'C线组装岗人员已全部到岗', timeAgo: '12分钟前', type: 'success' },
    { message: '王五在C线切割岗离岗超10分钟', timeAgo: '15分钟前', type: 'warning' }
  ]

  heatmapData.hours = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
  heatmapData.workshops = ['A线切割', 'A线检测', 'A线组装', 'B线切割', 'B线检测', 'B线组装', 'C线切割', 'C线检测', 'C线组装']
  heatmapData.data = []
  for (let i = 0; i < heatmapData.workshops.length; i++) {
    for (let j = 0; j < heatmapData.hours.length; j++) {
      heatmapData.data.push([j, i, Math.floor(Math.random() * 100)])
    }
  }

  trendData.days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  trendData.upphData = [12, 15, 18, 22, 25, 28, 32]
  trendData.violationData = [8, 6, 5, 4, 3, 2, 1]

  nextTick(() => {
    initCharts()
  })
}

// 初始化图表
const initCharts = () => {
  initHeatmap()
  initTrendChart()
}

// 车间人员热力图
const initHeatmap = () => {
  if (!heatmapRef.value) return
  if (!heatmapChart) {
    heatmapChart = echarts.init(heatmapRef.value)
  }

  const hours = heatmapData.hours.length ? heatmapData.hours : ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
  const workshops = heatmapData.workshops.length ? heatmapData.workshops : ['A线切割', 'A线检测', 'A线组装', 'B线切割', 'B线检测', 'B线组装', 'C线切割', 'C线检测', 'C线组装']
  const data = heatmapData.data.length ? heatmapData.data : []

  if (data.length === 0) {
    for (let i = 0; i < workshops.length; i++) {
      for (let j = 0; j < hours.length; j++) {
        data.push([j, i, Math.floor(Math.random() * 100)])
      }
    }
  }

  const option = {
    tooltip: {
      position: 'top',
      formatter: (params) => `${workshops[params.value[1]]} ${hours[params.value[0]]}<br/>饱和度: ${params.value[2]}%`
    },
    grid: { left: 80, right: 30, top: 20, bottom: 50 },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: { show: true },
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'category',
      data: workshops,
      splitArea: { show: true },
      axisLabel: { color: '#666' }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 10,
      inRange: {
        color: ['#e8f5e9', '#81c784', '#4caf50', '#ff9800', '#f44336']
      }
    },
    series: [{
      type: 'heatmap',
      data: data,
      label: { show: true, formatter: (p) => p.value[2] + '%', fontSize: 10 },
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' }
      }
    }]
  }
  heatmapChart.setOption(option)
}

// 效率与合规趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }

  const days = trendData.days.length ? trendData.days : ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const upphData = trendData.upphData.length ? trendData.upphData : [12, 15, 18, 22, 25, 28, 32]
  const violationData = trendData.violationData.length ? trendData.violationData : [8, 6, 5, 4, 3, 2, 1]

  const option = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['UPPH提升率', '违规离岗次数'],
      bottom: 0
    },
    grid: { left: 50, right: 20, top: 20, bottom: 50 },
    xAxis: {
      type: 'category',
      data: days,
      boundaryGap: false,
      axisLabel: { color: '#666' }
    },
    yAxis: [
      {
        type: 'value',
        name: '提升率',
        axisLabel: { formatter: '{value}%', color: '#666' }
      },
      {
        type: 'value',
        name: '违规次数',
        axisLabel: { formatter: '{value}', color: '#666' }
      }
    ],
    series: [
      {
        name: 'UPPH提升率',
        type: 'line',
        smooth: true,
        data: upphData,
        lineStyle: { color: '#1890ff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24,144,255,0.3)' },
            { offset: 1, color: 'rgba(24,144,255,0.05)' }
          ])
        },
        itemStyle: { color: '#1890ff' }
      },
      {
        name: '违规离岗次数',
        type: 'bar',
        yAxisIndex: 1,
        data: violationData,
        itemStyle: { color: '#f5222d' }
      }
    ]
  }
  trendChart.setOption(option)
}

// 窗口调整
const handleResize = () => {
  heatmapChart?.resize()
  trendChart?.resize()
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 60000)

  fetchData()
  refreshTimer = setInterval(fetchData, 30000)

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (refreshTimer) clearInterval(refreshTimer)
  window.removeEventListener('resize', handleResize)
  heatmapChart?.dispose()
  trendChart?.dispose()
})
</script>

<style scoped lang="scss">
// 变量定义
$primary-color: #001529;
$accent-color: #1890ff;
$success-color: #52c41a;
$warning-color: #fa8c16;
$danger-color: #f5222d;
$purple-color: #722ed1;
$bg-color: #f0f2f5;
$card-bg: #ffffff;
$text-primary: #333333;
$text-secondary: #666666;
$border-color: #e8e8e8;

.dashboard-container {
  width: 100%;
  min-height: 100vh;
  background: $bg-color;
  color: $text-primary;
}

// 顶部导航栏
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 24px;
  background: $primary-color;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  .nav-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #fff;

      i {
        font-size: 24px;
      }
    }

    .subtitle {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.65);
      padding-left: 16px;
      border-left: 1px solid rgba(255, 255, 255, 0.25);
    }
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      .user-name {
        font-size: 14px;
        color: #fff;
        font-weight: 500;
      }

      .user-dept {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.65);
      }
    }

    .logout-btn {
      padding: 6px 16px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 4px;
      color: #fff;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: rgba(255, 255, 255, 0.25);
      }
    }
  }
}

// 页面主体
.page-content {
  padding: 20px 24px;
  max-width: 1600px;
  margin: 0 auto;
}

// 页面头部
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: $text-primary;
    margin: 0;
    margin-right: 16px;
  }

  .page-date {
    font-size: 14px;
    color: $text-secondary;
  }
}

// 顶部统计卡片行
.stats-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;

  .stat-card {
    flex: 1;
    background: $card-bg;
    border-radius: 8px;
    padding: 16px 20px;
    padding-left: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border-left: 4px solid;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    &.blue {
      border-left-color: $accent-color;
      .card-value { color: $accent-color; }
    }
    &.green {
      border-left-color: $success-color;
      .card-value { color: $success-color; }
    }
    &.orange {
      border-left-color: $warning-color;
      .card-value { color: $warning-color; }
    }
    &.red {
      border-left-color: $danger-color;
      .card-value { color: $danger-color; }
    }
    &.purple {
      border-left-color: $purple-color;
      .card-value { color: $purple-color; }
    }

    .card-label {
      font-size: 14px;
      color: $text-secondary;
      margin-bottom: 8px;
    }

    .card-value {
      font-size: 18px;
      font-weight: 600;
    }
  }
}

// 通用卡片样式
.card {
  background: $card-bg;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;

    .header-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: $accent-color;

      &.red { background: $danger-color; }
      &.green { background: $success-color; }
    }

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: $text-primary;
      margin: 0;
    }
  }

  .card-desc {
    font-size: 14px;
    color: $text-secondary;
    margin-bottom: 16px;
    padding-left: 24px;
  }

  .card-quote {
    font-size: 14px;
    color: $text-secondary;
    font-style: italic;
    padding: 12px 16px;
    background: #fafafa;
    border-left: 3px solid $accent-color;
    border-radius: 4px;
    margin-top: 16px;
  }

  .chart-container {
    height: 280px;
  }

  .no-data {
    text-align: center;
    color: $text-secondary;
    padding: 40px;
    font-size: 14px;
  }
}

// 中间区域
.middle-area {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;

  .heatmap-card {
    flex: 1;
  }

  .trend-card {
    flex: 1;
  }
}

// 底部区域
.bottom-area {
  display: flex;
  gap: 20px;

  .alert-card {
    flex: 1;
  }

  .control-card {
    flex: 1;
  }
}

// 预警列表
.alert-list {
  max-height: 240px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 2px;
  }

  .alert-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .alert-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;

      &.warning { background: $warning-color; }
      &.error { background: $danger-color; }
      &.info { background: $accent-color; }
      &.success { background: $success-color; }
    }

    .alert-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;

      .alert-message {
        font-size: 14px;
        color: $text-primary;
      }

      .alert-time {
        font-size: 12px;
        color: $text-secondary;
        white-space: nowrap;
      }
    }
  }
}

// 三层管控体系
.control-layers {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 30px 0;

  .layer-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    .layer-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #fff;

      &.company { background: linear-gradient(135deg, $accent-color, #69b1ff); }
      &.locker { background: linear-gradient(135deg, $success-color, #73d13d); }
      &.workstation { background: linear-gradient(135deg, $purple-color, #9254de); }
    }

    .layer-title {
      font-size: 16px;
      font-weight: 600;
      color: $text-primary;
    }

    .layer-subtitle {
      font-size: 12px;
      color: $text-secondary;
    }
  }

  .layer-arrow {
    font-size: 24px;
    color: $text-secondary;
  }
}

.control-desc {
  text-align: center;
  font-size: 14px;
  color: $text-secondary;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  margin-top: 16px;
}

// 响应式
@media (max-width: 1200px) {
  .stats-cards {
    flex-wrap: wrap;
    .stat-card {
      flex: 1 1 calc(33.33% - 16px);
      min-width: 200px;
    }
  }

  .middle-area,
  .bottom-area {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .stats-cards {
    .stat-card {
      flex: 1 1 100%;
    }
  }

  .top-nav {
    .nav-left .subtitle {
      display: none;
    }
  }
}
</style>




















