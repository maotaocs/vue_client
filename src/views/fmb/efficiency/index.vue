<template>
  <div class="efficiency-dashboard">
    <!-- 筛选栏 -->
<!--    <div class="filter-bar">-->
<!--      <div class="filter-left">-->
<!--        <el-select v-model="selectedTeam" placeholder="全部班组" @change="handleFilterChange">-->
<!--          <el-option v-for="team in teams" :key="team" :label="team" :value="team" />-->
<!--        </el-select>-->
<!--        <el-select v-model="selectedModel" placeholder="全部型号" @change="handleFilterChange">-->
<!--          <el-option v-for="model in models" :key="model" :label="model" :value="model" />-->
<!--        </el-select>-->
<!--      </div>-->
<!--      <div class="filter-right">-->
<!--        <el-button type="primary" @click="handleFilterChange">查看全部</el-button>-->
<!--      </div>-->
<!--    </div>-->

    <!-- 主内容区域 -->
    <div class="page-content" v-loading="loading">
      <!-- 顶部统计卡片 -->


      <!-- 中间区域：工时利用率环形图 + 岗位饱和度 -->
      <div class="middle-area">
        <!-- 工时利用率环形图 -->
        <div class="card utilization-card">
          <div class="card-header">
            <div class="header-dot blue"></div>
            <h3>工时利用率</h3>
          </div>
          <div class="card-desc">让工时透明，驱动效率优化</div>
          <div class="chart-container" ref="utilizationChartRef"></div>
        </div>

        <!-- 岗位饱和度分析 -->
        <div class="card saturation-card">
          <div class="card-header">
            <div class="header-dot green"></div>
            <h3>岗位饱和度分析</h3>
          </div>
          <div class="card-desc">瓶颈岗位识别</div>
          <div class="chart-container" ref="saturationChartRef"></div>
          <div class="bottleneck-alert" v-if="bottleneck">
            <div class="alert-icon">!</div>
            <div class="alert-content">
              <div class="alert-title">瓶颈岗位：{{ bottleneck.name }}</div>
              <div class="alert-desc">饱和度仅{{ bottleneck.saturation }}%，分析结论：{{ bottleneck.conclusion }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 异常工时漏斗 -->
      <div class="card funnel-card">
        <div class="card-header">
          <div class="header-dot orange"></div>
          <h3>异常工时漏斗</h3>
        </div>
        <div class="card-desc">异常工时 breakdown</div>
        <div class="funnel-content">
          <div class="funnel-chart" ref="funnelChartRef"></div>
          <div class="funnel-categories">
            <div v-for="cat in abnormalCategories" :key="cat.name" class="category-item">
              <div class="category-dot"></div>
              <div class="category-name">{{ cat.name }}</div>
              <div class="category-hours">{{ cat.hours }}h</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部区域：UPPH趋势 + 班组排名 -->
      <div class="bottom-area">
        <!-- UPPH提升趋势 -->
        <div class="card upph-trend-card">
          <div class="card-header">
            <div class="header-dot purple"></div>
            <h3>UPPH提升趋势</h3>
          </div>
          <div class="card-desc">系统上线前后对比</div>
          <div class="chart-container" ref="upphTrendChartRef"></div>
        </div>

        <!-- 班组UPPH排名 -->
        <div class="card ranking-card">
          <div class="card-header">
            <div class="header-dot red"></div>
            <h3>班组UPPH排名</h3>
          </div>
          <div class="ranking-list">
            <div v-for="(item, index) in teamRanking" :key="item.team" class="ranking-item">
              <div class="ranking-index" :class="{ top: index < 3 }">{{ index + 1 }}</div>
              <div class="ranking-info">
                <div class="ranking-team">{{ item.team }}</div>
                <div class="ranking-model">{{ item.model }}</div>
              </div>
              <div class="ranking-value">{{ item.upph }}</div>
              <div class="ranking-change" :class="{ up: item.trend === 'up', down: item.trend === 'down' }">
                {{ item.trend === 'up' ? '+' : '' }}{{ item.change }}%
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="stats-cards">
        <div class="stat-card blue">
          <div class="card-label">工时利用率</div>
          <div class="card-value">{{ utilizationData.utilization }}%</div>
        </div>
        <div class="stat-card green">
          <div class="card-label">今日总工时</div>
          <div class="card-value">{{ utilizationData.totalHours }}h</div>
        </div>
        <div class="stat-card orange">
          <div class="card-label">有效工时</div>
          <div class="card-value">{{ utilizationData.effectiveHours }}h</div>
        </div>
        <div class="stat-card purple">
          <div class="card-label">较昨日提升</div>
          <div class="card-value">+{{ utilizationData.comparison }}%</div>
        </div>
      </div>
      <!-- 价值总结 -->
      <div class="value-summary">
        <div class="summary-icon">💡</div>
        <div class="summary-text">
          价值总结："过去工时是黑盒，现在精准定位到'人等机'还是'机等人'，为工艺改进和人员精简提供了数据子弹。"
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import {
  getEfficiencyUPPHMock,
  getPositionSaturationMock,
  getAbnormalHoursMock,
  getWorkHoursUtilizationMock
} from '@/api/fmb/efficiency'

const loading = ref(false)
const utilizationChartRef = ref(null)
const saturationChartRef = ref(null)
const funnelChartRef = ref(null)
const upphTrendChartRef = ref(null)

let utilizationChart = null
let saturationChart = null
let funnelChart = null
let upphTrendChart = null

// 筛选数据
const selectedTeam = ref('全部班组')
const selectedModel = ref('全部型号')
const teams = ref(['全部班组', 'A班', 'B班', 'C班'])
const models = ref(['全部型号', 'Model X', 'Model Y', 'Model Z'])

// 工时利用率数据
const utilizationData = ref({
  totalHours: 800,
  effectiveHours: 720,
  utilization: 90,
  comparison: 5
})

// 岗位饱和度数据
const positions = ref([])
const bottleneck = ref(null)

// 异常工时漏斗数据
const abnormalCategories = ref([])

// UPPH 数据
const trendBefore = ref([])
const trendAfter = ref([])
const teamRanking = ref([])

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    const [upphRes, saturationRes, funnelRes, utilizationRes] = await Promise.all([
      getEfficiencyUPPHMock(),
      getPositionSaturationMock(),
      getAbnormalHoursMock(),
      getWorkHoursUtilizationMock()
    ])

    if (upphRes.data) {
      trendBefore.value = upphRes.data.trendData?.before || []
      trendAfter.value = upphRes.data.trendData?.after || []
      teamRanking.value = upphRes.data.teamRanking || []
    }

    if (saturationRes.data) {
      positions.value = saturationRes.data.positions || []
      bottleneck.value = saturationRes.data.bottleneck || null
    }

    if (funnelRes.data) {
      abnormalCategories.value = funnelRes.data.categories || []
    }

    if (utilizationRes.data) {
      utilizationData.value = utilizationRes.data.today || utilizationData.value
      teams.value = utilizationRes.data.teams || teams.value
      models.value = utilizationRes.data.models || models.value
    }

    nextTick(() => {
      initCharts()
    })
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化图表
const initCharts = () => {
  initUtilizationChart()
  initSaturationChart()
  initFunnelChart()
  initUpphTrendChart()
}

// 工时利用率环形图
const initUtilizationChart = () => {
  if (!utilizationChartRef.value) return
  if (!utilizationChart) {
    utilizationChart = echarts.init(utilizationChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%'
    },
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 5,
      radius: '90%',
      center: ['50%', '60%'],
      axisLine: {
        lineStyle: {
          width: 20,
          color: [
            [0.3, '#f5222d'],
            [0.7, '#faad14'],
            [1, '#52c41a']
          ]
        }
      },
      pointer: {
        itemStyle: {
          color: '#1890ff'
        }
      },
      axisTick: {
        distance: -20,
        length: 5,
        lineStyle: {
          color: '#fff'
        }
      },
      splitLine: {
        distance: -20,
        length: 10,
        lineStyle: {
          color: '#fff'
        }
      },
      axisLabel: {
        color: '#666',
        distance: 25
      },
      anchor: {
        show: false
      },
      title: {
        show: false
      },
      detail: {
        valueAnimation: true,
        fontSize: 28,
        fontWeight: 'bold',
        offsetCenter: [0, '10%'],
        formatter: '{value}%',
        color: '#333'
      },
      data: [{
        value: utilizationData.value.utilization
      }]
    }]
  }
  utilizationChart.setOption(option)
}

// 岗位饱和度柱状图
const initSaturationChart = () => {
  if (!saturationChartRef.value) return
  if (!saturationChart) {
    saturationChart = echarts.init(saturationChartRef.value)
  }

  const data = positions.value.map(p => ({
    name: p.name,
    value: p.saturation,
    itemStyle: {
      color: p.status === 'warning' ? '#f5222d' : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: '#1890ff' },
        { offset: 1, color: '#52c41a' }
      ])
    }
  }))

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const p = params[0]
        return `${p.name}<br/>饱和度: ${p.value}%`
      }
    },
    grid: { left: 80, right: 40, top: 10, bottom: 30 },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%', color: '#666' },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    yAxis: {
      type: 'category',
      data: positions.value.map(p => p.name),
      axisLabel: { color: '#333' },
      axisLine: { lineStyle: { color: '#e8e8e8' } }
    },
    series: [{
      type: 'bar',
      data: data,
      barWidth: 20,
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%',
        color: '#666'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.2)'
        }
      }
    }]
  }
  saturationChart.setOption(option)
}

// 异常工时漏斗图
const initFunnelChart = () => {
  if (!funnelChartRef.value) return
  if (!funnelChart) {
    funnelChart = echarts.init(funnelChartRef.value)
  }

  const funnelData = [
    { name: '总工时', value: 4800 },
    { name: '有效工时', value: 4200 },
    { name: '异常工时', value: 600 },
    { name: '待分析', value: 150 }
  ]

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (p) => `${p.name}<br/>工时: ${p.value}h`
    },
    series: [{
      type: 'funnel',
      left: '10%',
      top: 20,
      bottom: 20,
      width: '80%',
      min: 0,
      max: 4800,
      minSize: '0%',
      maxSize: '100%',
      sort: 'none',
      gap: 4,
      label: {
        show: true,
        position: 'inside',
        formatter: '{b}\n{c}h',
        color: '#fff',
        fontSize: 13
      },
      labelLine: {
        show: false
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 2
      },
      emphasis: {
        label: {
          fontSize: 16
        }
      },
      data: funnelData.map((item, index) => ({
        name: item.name,
        value: item.value,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#1890ff' },
            { offset: 1, color: '#69b1ff' }
          ])
        }
      }))
    }]
  }
  funnelChart.setOption(option)
}

// UPPH趋势对比图
const initUpphTrendChart = () => {
  if (!upphTrendChartRef.value) return
  if (!upphTrendChart) {
    upphTrendChart = echarts.init(upphTrendChartRef.value)
  }

  const months = ['1月', '2月', '3月', '4月', '5月', '6月']
  const beforeData = trendBefore.value.length ? trendBefore.value.map(p => p.upph) : [68.5, 69.2, 70.1]
  const afterData = trendAfter.value.length ? trendAfter.value.map(p => p.upph) : [75.3, 78.6, 82.4]

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['上线前', '上线后'],
      bottom: 0
    },
    grid: { left: 50, right: 20, top: 20, bottom: 50 },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: { color: '#666' },
      axisLine: { lineStyle: { color: '#e8e8e8' } }
    },
    yAxis: {
      type: 'value',
      name: 'UPPH',
      axisLabel: { formatter: '{value}', color: '#666' },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    series: [
      {
        name: '上线前',
        type: 'line',
        data: beforeData,
        lineStyle: { color: '#8c8c8c', type: 'dashed' },
        itemStyle: { color: '#8c8c8c' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(140,140,140,0.2)' },
            { offset: 1, color: 'rgba(140,140,140,0.05)' }
          ])
        }
      },
      {
        name: '上线后',
        type: 'line',
        smooth: true,
        data: afterData,
        lineStyle: { color: '#1890ff' },
        itemStyle: { color: '#1890ff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24,144,255,0.3)' },
            { offset: 1, color: 'rgba(24,144,255,0.05)' }
          ])
        }
      }
    ]
  }
  upphTrendChart.setOption(option)
}

// 筛选变化处理
const handleFilterChange = () => {
  loadData()
}

// 窗口调整
const handleResize = () => {
  utilizationChart?.resize()
  saturationChart?.resize()
  funnelChart?.resize()
  upphTrendChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  utilizationChart?.dispose()
  saturationChart?.dispose()
  funnelChart?.dispose()
  upphTrendChart?.dispose()
})
</script>

<style scoped lang="scss">
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

.efficiency-dashboard {
  width: 100%;
  min-height: 100vh;
  background: $bg-color;
  color: $text-primary;
}

// 筛选栏
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: $card-bg;
  border-bottom: 1px solid #e8e8e8;

  .filter-left {
    display: flex;
    gap: 12px;
  }
}

// 页面主体
.page-content {
  padding: 20px 24px;
  max-width: 1600px;
  margin: 0 auto;
}

// 顶部统计卡片
.stats-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;

  .stat-card {
    flex: 1;
    background: $card-bg;
    border-radius: 8px;
    padding: 16px 20px;
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
      font-size: 24px;
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

      &.blue { background: $accent-color; }
      &.green { background: $success-color; }
      &.orange { background: $warning-color; }
      &.red { background: $danger-color; }
      &.purple { background: $purple-color; }
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

  .chart-container {
    height: 260px;
  }
}

// 中间区域
.middle-area {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;

  .utilization-card {
    flex: 1;
  }

  .saturation-card {
    flex: 1;
  }
}

// 瓶颈告警
.bottleneck-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(250, 173, 20, 0.1);
  border: 1px solid rgba(250, 173, 20, 0.3);
  border-radius: 8px;
  margin-top: 16px;

  .alert-icon {
    width: 24px;
    height: 24px;
    background: $warning-color;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    flex-shrink: 0;
  }

  .alert-content {
    flex: 1;
  }

  .alert-title {
    font-size: 14px;
    font-weight: bold;
    color: $warning-color;
    margin-bottom: 4px;
  }

  .alert-desc {
    font-size: 12px;
    color: $text-secondary;
  }
}

// 漏斗卡片
.funnel-card {
  margin-bottom: 20px;

  .funnel-content {
    display: flex;
    gap: 30px;
  }

  .funnel-chart {
    flex: 1;
    height: 260px;
  }

  .funnel-categories {
    width: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 12px;
  }

  .category-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    background: #fafafa;
    border-radius: 8px;

    .category-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: $accent-color;
    }

    .category-name {
      flex: 1;
      font-size: 14px;
      color: $text-primary;
    }

    .category-hours {
      font-size: 14px;
      font-weight: 600;
      color: $accent-color;
    }
  }
}

// 底部区域
.bottom-area {
  display: flex;
  gap: 20px;

  .upph-trend-card {
    flex: 1;
  }

  .ranking-card {
    width: 380px;
    flex-shrink: 0;
  }
}

// 排名列表
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 8px;
  transition: all 0.3s;

  &:hover {
    background: #f0f0f0;
  }

  .ranking-index {
    width: 24px;
    height: 24px;
    background: #d9d9d9;
    color: #fff;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;

    &.top {
      background: linear-gradient(135deg, $warning-color, $danger-color);
    }
  }

  .ranking-info {
    flex: 1;
    min-width: 0;

    .ranking-team {
      font-size: 14px;
      color: $text-primary;
      font-weight: 500;
    }

    .ranking-model {
      font-size: 12px;
      color: $text-secondary;
    }
  }

  .ranking-value {
    font-size: 18px;
    font-weight: bold;
    color: $accent-color;
  }

  .ranking-change {
    font-size: 12px;
    font-weight: bold;
    padding: 4px 10px;
    border-radius: 12px;

    &.up {
      background: rgba(82, 196, 26, 0.15);
      color: $success-color;
    }

    &.down {
      background: rgba(245, 34, 45, 0.15);
      color: $danger-color;
    }
  }
}

// 价值总结
.value-summary {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  background: rgba(24, 144, 255, 0.08);
  border-left: 4px solid $accent-color;
  border-radius: 8px;
  margin-top: 20px;

  .summary-icon {
    font-size: 24px;
  }

  .summary-text {
    font-size: 14px;
    color: $text-primary;
    line-height: 1.6;
  }
}

// 响应式
@media (max-width: 1200px) {
  .stats-cards {
    flex-wrap: wrap;
    .stat-card {
      flex: 1 1 calc(50% - 8px);
      min-width: 180px;
    }
  }

  .middle-area,
  .bottom-area {
    flex-direction: column;
  }

  .funnel-card .funnel-content {
    flex-direction: column;
  }

  .funnel-card .funnel-categories {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .ranking-card {
    width: 100%;
  }
}
</style>
