<template>
  <div class="attendance-dashboard">
    <!-- 主内容区域 -->
    <div class="page-content" v-loading="loading">
      <!-- 页面标题区 -->
<!--      <div class="page-header">-->
<!--        <div class="header-info">-->
<!--          <h2>出勤监控(初期)</h2>-->
<!--          <p class="subtitle">初期阶段 · 实时看到人、准确掌握岗</p>-->
<!--        </div>-->
<!--        <div class="header-meta">-->
<!--          <span class="meta-item">-->
<!--            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">-->
<!--              <circle cx="12" cy="12" r="10"></circle>-->
<!--              <polyline points="12 6 12 12 16 14"></polyline>-->
<!--            </svg>-->
<!--            数据更新时间 {{ updateTime }}-->
<!--          </span>-->
<!--          <span class="user-info">{{ userName }} · {{ deptName }}</span>-->
<!--        </div>-->
<!--      </div>-->

      <!-- 顶部统计卡片 -->
      <div class="stats-cards">
        <div class="stat-card blue">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">出勤人数</div>
            <div class="stat-value">{{ statsData.actual }} / {{ statsData.planned }} 人</div>
            <div class="stat-desc">实际 / 计划</div>
          </div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">在岗率</div>
            <div class="stat-value">{{ statsData.onDutyRate }}%</div>
            <div class="stat-desc">当前出勤率</div>
          </div>
        </div>
        <div class="stat-card orange">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">离岗超时</div>
            <div class="stat-value">{{ statsData.offDutyCount }} 次</div>
            <div class="stat-desc off-duty">离岗超过30分钟未归</div>
          </div>
        </div>
        <div class="stat-card purple">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">离岗趋势</div>
            <div class="stat-value trend-down">-{{ statsData.offDutyTrend }} 分钟</div>
            <div class="stat-desc">较上周平均</div>
          </div>
        </div>
      </div>

      <!-- 中间区域 -->
      <div class="middle-area">
        <!-- 车间热力图 -->
        <div class="card heatmap-card">
          <div class="card-header">
            <div class="header-dot blue"></div>
            <h3>车间热力图</h3>
            <el-select v-model="selectedTeam" placeholder="全部班组" class="team-select" size="small">
              <el-option
                v-for="team in teamOptions"
                :key="team.value"
                :label="team.label"
                :value="team.value"
              />
            </el-select>
          </div>
          <div class="heatmap-grid">
            <div v-for="(area, index) in workshopAreas" :key="index" class="heatmap-cell" :class="getHeatmapClass(area.rate)">
              <div class="cell-rate">{{ area.rate }}%</div>
              <div class="cell-count">{{ area.current }} / {{ area.total }}</div>
              <div class="cell-name">{{ area.name }}</div>
            </div>
          </div>
        </div>

        <!-- 离岗监控列表 -->
        <div class="card offduty-card">
          <div class="card-header">
            <div class="header-dot orange"></div>
            <h3>离岗监控列表</h3>
            <el-button type="primary" size="small" class="notify-btn" @click="notifyTeamLeader">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              通知班组长
            </el-button>
          </div>
          <div class="offduty-list">
            <div v-for="person in offDutyList" :key="person.id" class="offduty-item">
              <div class="person-avatar" :class="getAvatarClass(person.offDuration)">
                {{ person.name.charAt(0) }}
              </div>
              <div class="person-info">
                <div class="person-name">{{ person.name }} ({{ person.code }})</div>
                <div class="person-location">{{ person.line }} · {{ person.position }}</div>
              </div>
              <div class="offduty-status">
                <div class="duration" :class="{ warning: person.offDuration >= 30 }">
                  {{ person.offDuration }} 分钟
                </div>
                <div class="offtime">离岗时间 {{ person.offTime }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-area">
        <!-- 近7天离岗超时趋势 -->
        <div class="card chart-card">
          <div class="card-header">
            <div class="header-dot green"></div>
            <h3>近7天离岗超时趋势</h3>
          </div>
          <div class="chart-container" ref="trendChartRef"></div>
        </div>

        <!-- 离岗时长分布 -->
        <div class="card chart-card">
          <div class="card-header">
            <div class="header-dot purple"></div>
            <h3>离岗时长分布</h3>
          </div>
          <div class="chart-container" ref="distributionChartRef"></div>
        </div>
      </div>

      <!-- 价值阐述 -->
      <div class="value-summary">
        <div class="summary-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div class="summary-text">
          {{ valueStatement }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
// import { getAttendanceStatsMock, getWorkshopHeatmapMock, getOffDutyListMock } from '@/api/fmb/chuqi'

const loading = ref(false)

// 图表引用
const trendChartRef = ref(null)
const distributionChartRef = ref(null)

let trendChart = null
let distributionChart = null

// 当前日期和时间
const updateTime = ref('')
const userName = ref('管理员')
const deptName = ref('生产管理部')

// 统计数据
const statsData = reactive({
  actual: 172,
  planned: 186,
  onDutyRate: 92,
  offDutyCount: 5,
  offDutyTrend: 3.2
})

// 班组选择
const teamOptions = ref([
  { value: 'all', label: '全部班组' },
  { value: 'A班', label: 'A班' },
  { value: 'B班', label: 'B班' },
  { value: 'C班', label: 'C班' }
])
const selectedTeam = ref('all')

// 车间热力图数据
const workshopAreas = ref([
  { name: 'A线绑定岗', rate: 92, current: 11, total: 12 },
  { name: 'A线镜检岗', rate: 75, current: 6, total: 8 },
  { name: 'A线组装岗', rate: 100, current: 15, total: 15 },
  { name: 'A线检测岗', rate: 90, current: 9, total: 10 },
  { name: 'B线绑定岗', rate: 100, current: 11, total: 11 },
  { name: 'B线外观检', rate: 63, current: 5, total: 8 },
  { name: 'B线切割岗', rate: 93, current: 13, total: 14 },
  { name: 'B线组装岗', rate: 78, current: 7, total: 9 },
  { name: 'C线检测岗', rate: 100, current: 13, total: 13 },
  { name: 'C线包装岗', rate: 90, current: 9, total: 10 },
  { name: 'C线质检岗', rate: 100, current: 16, total: 16 },
  { name: 'C线入库岗', rate: 91, current: 10, total: 11 }
])

// 离岗人员列表
const offDutyList = ref([
  { id: 1, name: '张三', code: 'EMP001', line: 'A线', position: '绑定岗', offDuration: 42, offTime: '09:15' },
  { id: 2, name: '李四', code: 'EMP002', line: 'B线', position: '检测岗', offDuration: 35, offTime: '09:30' },
  { id: 3, name: '王五', code: 'EMP003', line: 'B线', position: '绑定岗', offDuration: 28, offTime: '10:00' },
  { id: 4, name: '赵六', code: 'EMP004', line: 'A线', position: '组装岗', offDuration: 18, offTime: '10:15' },
  { id: 5, name: '孙七', code: 'EMP005', line: 'C线', position: '切割岗', offDuration: 15, offTime: '10:30' }
])

// 价值阐述
const valueStatement = '"初期通过插卡机实现实时在岗监控，班组长不用再满产线找人，打开系统就能看到每个工位谁在、谁缺、谁离岗超时。异常预警从\'事后统计\'变为\'实时干预\'，在岗率提升的同时，也减少了因人员缺位导致的产能损失。"'

// 获取热力图颜色类
const getHeatmapClass = (rate) => {
  if (rate >= 90) return 'high'
  if (rate >= 70) return 'medium'
  if (rate >= 50) return 'low'
  return 'critical'
}

// 获取头像样式类
const getAvatarClass = (duration) => {
  if (duration >= 40) return 'critical'
  if (duration >= 30) return 'warning'
  return 'normal'
}

// 更新当前时间
const updateDateTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  updateTime.value = `${hours}:${minutes}`
}

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    updateDateTime()

    // 模拟API调用
    // const res = await getAttendanceStats()
    // if (res.data) {
    //   Object.assign(statsData, res.data)
    // }

    nextTick(() => {
      initCharts()
    })
  } catch (error) {
    console.error('加载数据失败:', error)
    nextTick(() => {
      initCharts()
    })
  } finally {
    loading.value = false
  }
}

// 初始化图表
const initCharts = () => {
  initTrendChart()
  initDistributionChart()
}

// 近7天离岗超时趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    grid: {
      left: 50,
      right: 30,
      top: 20,
      bottom: 40
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: {
        lineStyle: { color: '#e8e8e8' }
      },
      axisLabel: {
        color: '#666',
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '离岗次数',
      nameTextStyle: {
        color: '#666',
        fontSize: 12
      },
      axisLabel: {
        color: '#666',
        fontSize: 12
      },
      splitLine: {
        lineStyle: { color: '#f0f0f0' }
      }
    },
    series: [
      {
        name: '离岗次数',
        type: 'line',
        smooth: true,
        data: [12, 8, 15, 10, 7, 3, 5],
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#1890ff',
          width: 3
        },
        itemStyle: {
          color: '#1890ff',
          borderColor: '#fff',
          borderWidth: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
          ])
        }
      },
      {
        name: '平均时长(分钟)',
        type: 'bar',
        data: [35, 28, 42, 30, 25, 18, 22],
        barWidth: 20,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#52c41a' },
            { offset: 1, color: '#95de64' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        yAxisIndex: 1,
        tooltip: {
          formatter: '{b}: {c}分钟'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '离岗次数',
        nameTextStyle: { color: '#666', fontSize: 12 },
        axisLabel: { color: '#666', fontSize: 12 },
        splitLine: { lineStyle: { color: '#f0f0f0' } }
      },
      {
        type: 'value',
        name: '平均时长',
        nameTextStyle: { color: '#666', fontSize: 12 },
        axisLabel: {
          color: '#666',
          fontSize: 12,
          formatter: '{value}分钟'
        },
        splitLine: { show: false }
      }
    ]
  }

  trendChart.setOption(option)
}

// 离岗时长分布图
const initDistributionChart = () => {
  if (!distributionChartRef.value) return
  if (!distributionChart) {
    distributionChart = echarts.init(distributionChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 40,
      top: 'center',
      itemWidth: 14,
      itemHeight: 14,
      textStyle: {
        color: '#666',
        fontSize: 13
      }
    },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        position: 'outside',
        formatter: '{b}\n{d}%',
        color: '#666',
        fontSize: 12
      },
      labelLine: {
        length: 15,
        length2: 10
      },
      data: [
        {
          value: 45,
          name: '15分钟以内',
          itemStyle: { color: '#52c41a' }
        },
        {
          value: 28,
          name: '15-30分钟',
          itemStyle: { color: '#1890ff' }
        },
        {
          value: 15,
          name: '30-60分钟',
          itemStyle: { color: '#fa8c16' }
        },
        {
          value: 8,
          name: '60分钟以上',
          itemStyle: { color: '#f5222d' }
        },
        {
          value: 4,
          name: '未归',
          itemStyle: { color: '#722ed1' }
        }
      ]
    }]
  }

  distributionChart.setOption(option)
}

// 通知班组长
const notifyTeamLeader = () => {
  ElMessage.success('已通知班组长')
}

// 窗口调整
const handleResize = () => {
  trendChart?.resize()
  distributionChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
  // 每分钟更新时间
  const timer = setInterval(updateDateTime, 60000)
  onUnmounted(() => {
    clearInterval(timer)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  distributionChart?.dispose()
})
</script>

<style scoped lang="scss">
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #fa8c16;
$purple-color: #722ed1;
$bg-color: #f0f2f5;
$card-bg: #ffffff;
$text-primary: #333333;
$text-secondary: #666666;
$border-color: #e8e8e8;

.attendance-dashboard {
  width: 100%;
  min-height: 100vh;
  background: $bg-color;
  color: $text-primary;
}

// 页面主体
.page-content {
  padding: 0 0 24px 0;
  max-width: 1600px;
  margin: 0 auto;
}

// 页面头部
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px;
  background: $card-bg;
  margin-bottom: 20px;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  .header-info {
    h2 {
      font-size: 22px;
      font-weight: 600;
      color: $text-primary;
      margin: 0 0 6px 0;
    }

    .subtitle {
      font-size: 14px;
      color: $text-secondary;
      margin: 0;
    }
  }

  .header-meta {
    display: flex;
    align-items: center;
    gap: 20px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: $text-secondary;

      svg {
        width: 16px;
        height: 16px;
      }
    }

    .user-info {
      font-size: 14px;
      color: $text-primary;
      padding: 6px 12px;
      background: rgba($primary-color, 0.08);
      border-radius: 20px;
    }
  }
}

// 顶部统计卡片
.stats-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;

  .stat-card {
    flex: 1;
    background: $card-bg;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;
    gap: 16px;
    border-left: 5px solid;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    &.blue {
      border-left-color: $primary-color;
      .stat-icon { background: rgba($primary-color, 0.1); color: $primary-color; }
      .stat-value { color: $primary-color; }
    }
    &.green {
      border-left-color: $success-color;
      .stat-icon { background: rgba($success-color, 0.1); color: $success-color; }
      .stat-value { color: $success-color; }
    }
    &.orange {
      border-left-color: $warning-color;
      .stat-icon { background: rgba($warning-color, 0.1); color: $warning-color; }
      .stat-value { color: $warning-color; }
    }
    &.purple {
      border-left-color: $purple-color;
      .stat-icon { background: rgba($purple-color, 0.1); color: $purple-color; }
      .stat-value { color: $purple-color; }
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 28px;
        height: 28px;
      }
    }

    .stat-content {
      flex: 1;

      .stat-label {
        font-size: 14px;
        color: $text-secondary;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 26px;
        font-weight: 700;

        &.trend-down {
          color: $success-color;
        }
      }

      .stat-desc {
        font-size: 12px;
        color: $text-secondary;
        margin-top: 4px;

        &.off-duty {
          color: $warning-color;
        }
      }
    }
  }
}

// 通用卡片样式
.card {
  background: $card-bg;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .header-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;

      &.blue { background: $primary-color; }
      &.green { background: $success-color; }
      &.orange { background: $warning-color; }
      &.purple { background: $purple-color; }
    }

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: $text-primary;
      margin: 0;
    }

    .team-select {
      margin-left: auto;
      width: 140px;
    }

    .notify-btn {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
}

// 中间区域
.middle-area {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;

  .heatmap-card {
    flex: 1.2;
  }

  .offduty-card {
    flex: 0.8;
  }
}

// 热力图
.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  .heatmap-cell {
    padding: 16px;
    border-radius: 10px;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .cell-rate {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .cell-count {
      font-size: 13px;
      color: $text-secondary;
      margin-bottom: 6px;
    }

    .cell-name {
      font-size: 12px;
      color: $text-secondary;
      padding: 4px 8px;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
    }

    &.high {
      background: linear-gradient(135deg, rgba($success-color, 0.15), rgba($success-color, 0.05));
      .cell-rate { color: $success-color; }
    }

    &.medium {
      background: linear-gradient(135deg, rgba($primary-color, 0.15), rgba($primary-color, 0.05));
      .cell-rate { color: $primary-color; }
    }

    &.low {
      background: linear-gradient(135deg, rgba($warning-color, 0.15), rgba($warning-color, 0.05));
      .cell-rate { color: $warning-color; }
    }

    &.critical {
      background: linear-gradient(135deg, rgba(#f5222d, 0.15), rgba(#f5222d, 0.05));
      .cell-rate { color: #f5222d; }
    }
  }
}

// 离岗列表
.offduty-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 3px;
  }
}

.offduty-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: #f8f8f8;
  border-radius: 10px;
  transition: all 0.3s ease;

  &:hover {
    background: #f0f0f0;
    transform: translateX(4px);
  }

  .person-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    flex-shrink: 0;

    &.normal {
      background: linear-gradient(135deg, $primary-color, #69c0ff);
    }

    &.warning {
      background: linear-gradient(135deg, $warning-color, #ffc53d);
    }

    &.critical {
      background: linear-gradient(135deg, #f5222d, #ff7875);
    }
  }

  .person-info {
    flex: 1;
    min-width: 0;

    .person-name {
      font-size: 14px;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 4px;
    }

    .person-location {
      font-size: 13px;
      color: $text-secondary;
    }
  }

  .offduty-status {
    text-align: right;
    flex-shrink: 0;

    .duration {
      font-size: 16px;
      font-weight: 700;
      color: $text-primary;
      margin-bottom: 4px;

      &.warning {
        color: $warning-color;
      }
    }

    .offtime {
      font-size: 12px;
      color: $text-secondary;
    }
  }
}

// 图表区域
.charts-area {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;

  .chart-card {
    flex: 1;
  }

  .chart-container {
    height: 280px;
  }
}

// 价值阐述
.value-summary {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  background: rgba($primary-color, 0.08);
  border-left: 4px solid $primary-color;
  border-radius: 8px;

  .summary-icon {
    width: 32px;
    height: 32px;
    color: $primary-color;
    flex-shrink: 0;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  .summary-text {
    font-size: 14px;
    color: $text-primary;
    line-height: 1.8;
  }
}

// 响应式
@media (max-width: 1400px) {
  .heatmap-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .middle-area {
    flex-direction: column;
  }

  .charts-area {
    flex-direction: column;
  }

  .heatmap-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 992px) {
  .stats-cards {
    flex-wrap: wrap;
    .stat-card {
      flex: 1 1 calc(50% - 8px);
      min-width: 200px;
    }
  }

  .heatmap-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;

    .header-meta {
      align-items: flex-start;
    }
  }

  .stats-cards .stat-card {
    flex: 1 1 100%;
  }

  .heatmap-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
