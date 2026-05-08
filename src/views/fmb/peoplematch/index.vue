<template>
  <div class="peoplematch-dashboard">
    <!-- 主内容区域 -->
    <div class="page-content" v-loading="loading">
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
            <div class="stat-label">总人数</div>
            <div class="stat-value">{{ statsData.totalPeople }}</div>
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
            <div class="stat-label">匹配率</div>
            <div class="stat-value">{{ statsData.matchRate }}%</div>
          </div>
        </div>
        <div class="stat-card orange">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">培训覆盖率</div>
            <div class="stat-value">{{ statsData.trainingCoverage }}%</div>
          </div>
        </div>
        <div class="stat-card purple">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">排班耗时</div>
            <div class="stat-value">{{ statsData.schedulingTime }}min</div>
          </div>
        </div>
      </div>

      <!-- 中间区域 -->
      <div class="middle-area">
        <!-- 人员技能画像 -->
        <div class="card skill-profile-card">
          <div class="card-header">
            <div class="header-dot blue"></div>
            <h3>人员技能画像</h3>
            <el-select v-model="selectedPerson" placeholder="选择人员" class="person-select">
              <el-option
                v-for="person in personList"
                :key="person.id"
                :label="`${person.name} - ${person.level}`"
                :value="person.id"
              />
            </el-select>
          </div>
          <div class="card-desc">能力雷达图与认证岗位</div>
          <div class="skill-profile-content">
            <div class="radar-chart-container" ref="radarChartRef"></div>
            <div class="person-info">
              <div class="person-avatar">{{ currentPerson?.name?.charAt(0) }}</div>
              <div class="person-name">{{ currentPerson?.name }}</div>
              <div class="person-level" :class="currentPerson?.levelClass">{{ currentPerson?.level }}</div>
              <div class="person-stats">
                <div class="stat-item">
                  <span class="stat-title">认证岗位</span>
                  <span class="stat-val">{{ currentPerson?.certifiedPosition }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-title">质量绩效</span>
                  <span class="stat-val">{{ currentPerson?.qualityScore }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-title">产能绩效</span>
                  <span class="stat-val">{{ currentPerson?.capacityScore }}</span>
                </div>
                <div class="stat-item highlight">
                  <span class="stat-title">综合评分</span>
                  <span class="stat-val">{{ currentPerson?.overallScore }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 岗位人才库状态 -->
        <div class="card position-pool-card">
          <div class="card-header">
            <div class="header-dot green"></div>
            <h3>岗位人才库状态</h3>
          </div>
          <div class="card-desc">各岗位人员配置情况</div>
          <div class="position-pool-list">
            <div v-for="pos in positionPool" :key="pos.name" class="position-item">
              <div class="position-header">
                <span class="position-name">{{ pos.name }}</span>
                <span class="position-count">{{ pos.count }}人</span>
              </div>
              <div class="position-bar">
                <div class="bar-fill" :style="{ width: pos.fillRate + '%', background: pos.color }"></div>
              </div>
              <div class="position-avatars">
                <div
                  v-for="(person, idx) in pos.persons.slice(0, 5)"
                  :key="idx"
                  class="mini-avatar"
                  :style="{ background: pos.color }"
                >
                  {{ person.charAt(0) }}
                </div>
                <span v-if="pos.persons.length > 5" class="more-count">+{{ pos.persons.length - 5 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 智能排班模拟 -->
      <div class="card scheduling-card">
        <div class="card-header">
          <div class="header-dot orange"></div>
          <h3>智能排班模拟</h3>
        </div>
        <div class="card-desc">基于标准工时，建议配置</div>
        <div class="scheduling-content">
          <div class="scheduling-chart-container" ref="schedulingChartRef"></div>
          <div class="scheduling-summary">
            <div class="summary-item">
              <div class="summary-value">{{ schedulingData.totalNeed }}</div>
              <div class="summary-label">总人力需求</div>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-item highlight">
              <div class="summary-value">{{ schedulingData.matchRate }}%</div>
              <div class="summary-label">预计匹配度</div>
            </div>
          </div>
          <div class="scheduling-params">
            <div class="param-item">
              <span class="param-label">型号</span>
              <el-select v-model="selectedModel" placeholder="选择型号" size="small">
                <el-option
                  v-for="model in modelOptions"
                  :key="model.value"
                  :label="model.label"
                  :value="model.value"
                />
              </el-select>
            </div>
            <div class="param-item">
              <span class="param-label">计划产能</span>
              <span class="param-value">{{ selectedModelObj?.production || '-' }}台</span>
            </div>
            <el-button type="primary" @click="applySchedule" class="apply-btn">
              确认应用此排班
            </el-button>
          </div>
        </div>
      </div>

      <!-- 推荐排班计划 -->
      <div class="card schedule-plan-card">
        <div class="card-header">
          <div class="header-dot purple"></div>
          <h3>推荐排班计划</h3>
        </div>
        <div class="schedule-plan-grid">
          <div v-for="plan in schedulePlans" :key="plan.id" class="plan-item">
            <div class="plan-line">{{ plan.line }} {{ plan.position }}</div>
            <div class="plan-person">
              <div class="person-badge" :class="plan.levelClass">
                {{ plan.personName }} · {{ plan.level }}
              </div>
              <div class="plan-upph">UPPH {{ plan.upph }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 排班效果对比 -->
      <div class="card comparison-card">
        <div class="card-header">
          <div class="header-dot blue"></div>
          <h3>排班效果对比</h3>
        </div>
        <div class="comparison-content">
          <div class="comparison-chart-container" ref="comparisonChartRef"></div>
          <div class="comparison-stats">
            <div class="comparison-item">
              <div class="comparison-value up">+{{ comparisonData.matchRate }}%</div>
              <div class="comparison-label">人岗匹配度提升</div>
            </div>
            <div class="comparison-item">
              <div class="comparison-value up">+{{ comparisonData.trainingCoverage }}%</div>
              <div class="comparison-label">培训覆盖率提升</div>
            </div>
            <div class="comparison-item">
              <div class="comparison-value down">-{{ comparisonData.schedulingTime }}%</div>
              <div class="comparison-label">排班耗时降低</div>
            </div>
            <div class="comparison-item">
              <div class="comparison-value down">-{{ comparisonData.costOptimization }}%</div>
              <div class="comparison-label">人力成本优化</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 价值总结 -->
      <div class="value-summary">
        <div class="summary-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div class="summary-text">
          价值总结："班组长从'凭感觉排班'变为'凭数据排班'，人岗匹配度提升，同时也为绩效分配提供了透明依据。"
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { getPeopleMatchStatsMock, getPositionPoolMock, getSchedulePlanMock } from '@/api/fmb/peoplematch'

const loading = ref(false)

// 图表引用
const radarChartRef = ref(null)
const schedulingChartRef = ref(null)
const comparisonChartRef = ref(null)

let radarChart = null
let schedulingChart = null
let comparisonChart = null

// 当前日期
const currentDate = ref('')
const userName = ref('管理员')
const deptName = ref('生产管理部')

// 统计数据
const statsData = ref({
  totalPeople: 42,
  matchRate: 87,
  trainingCoverage: 95,
  schedulingTime: 15
})

// 人员列表
const personList = ref([
  { id: 1, name: '张三', level: '高级', levelClass: 'senior' },
  { id: 2, name: '李四', level: '中级', levelClass: 'mid' },
  { id: 3, name: '王五', level: '高级', levelClass: 'senior' },
  { id: 4, name: '赵六', level: '中级', levelClass: 'mid' },
  { id: 5, name: '孙七', level: '高级', levelClass: 'senior' },
  { id: 6, name: '周五', level: '初级', levelClass: 'junior' }
])
const selectedPerson = ref(1)

// 当前选中人员详情
const currentPerson = computed(() => {
  return personList.value.find(p => p.id === selectedPerson.value)
})

// 人员技能数据
const personSkillsData = {
  1: { name: '张三', level: '高级', levelClass: 'senior', certifiedPosition: '绑定岗', qualityScore: 92, capacityScore: 88, overallScore: 90,
    radar: [95, 88, 90, 85, 92, 87] },
  2: { name: '李四', level: '中级', levelClass: 'mid', certifiedPosition: '镜检岗', qualityScore: 85, capacityScore: 78, overallScore: 82,
    radar: [82, 78, 85, 80, 75, 83] },
  3: { name: '王五', level: '高级', levelClass: 'senior', certifiedPosition: '组装岗', qualityScore: 94, capacityScore: 92, overallScore: 93,
    radar: [90, 92, 88, 95, 90, 91] },
  4: { name: '赵六', level: '中级', levelClass: 'mid', certifiedPosition: '切割岗', qualityScore: 80, capacityScore: 72, overallScore: 76,
    radar: [75, 72, 78, 80, 70, 77] },
  5: { name: '孙七', level: '高级', levelClass: 'senior', certifiedPosition: '检测岗', qualityScore: 90, capacityScore: 88, overallScore: 89,
    radar: [88, 85, 92, 87, 89, 86] },
  6: { name: '周五', level: '初级', levelClass: 'junior', certifiedPosition: '外观检', qualityScore: 70, capacityScore: 65, overallScore: 68,
    radar: [65, 68, 70, 72, 60, 67] }
}

// 岗位人才库
const positionPool = ref([
  { name: '绑定岗', count: 8, fillRate: 80, color: '#1890ff', persons: ['张三', '刘一', '陈二', '杨三', '黄四', '赵五', '孙六', '周七'] },
  { name: '镜检岗', count: 6, fillRate: 60, color: '#52c41a', persons: ['李四', '吴一', '郑二', '王三', '冯四', '陈五'] },
  { name: '外观检', count: 10, fillRate: 100, color: '#fa8c16', persons: ['周五', '许一', '何二', '吕三', '施四', '张五', '孔六', '曹七', '严八', '华九'] },
  { name: '切割岗', count: 5, fillRate: 50, color: '#722ed1', persons: ['赵六', '金一', '魏二', '陶三', '姜四'] },
  { name: '组装岗', count: 7, fillRate: 70, color: '#eb2f96', persons: ['王五', '戚一', '谢二', '邹三', '喻四', '柏五', '水六'] },
  { name: '检测岗', count: 6, fillRate: 60, color: '#13c2c2', persons: ['孙七', '窦一', '章二', '云三', '苏四', '潘五'] }
])

// 智能排班数据
const schedulingData = ref({
  totalNeed: 28,
  matchRate: 92
})

// 型号选项
const modelOptions = ref([
  { value: 'modelX', label: 'Model X', production: 5000 },
  { value: 'modelY', label: 'Model Y', production: 3200 },
  { value: 'modelZ', label: 'Model Z', production: 2800 }
])
const selectedModel = ref('modelX')

const selectedModelObj = computed(() => {
  return modelOptions.value.find(m => m.value === selectedModel.value)
})

// 推荐排班计划
const schedulePlans = ref([
  { id: 1, line: 'A线', position: '绑定岗', personName: '张三', level: '高级', levelClass: 'senior', upph: 85 },
  { id: 2, line: 'A线', position: '镜检岗', personName: '李四', level: '中级', levelClass: 'mid', upph: 78 },
  { id: 3, line: 'A线', position: '组装岗', personName: '王五', level: '高级', levelClass: 'senior', upph: 92 },
  { id: 4, line: 'B线', position: '切割岗', personName: '赵六', level: '中级', levelClass: 'mid', upph: 72 },
  { id: 5, line: 'B线', position: '检测岗', personName: '孙七', level: '高级', levelClass: 'senior', upph: 88 },
  { id: 6, line: 'B线', position: '外观检', personName: '周五', level: '初级', levelClass: 'junior', upph: 65 }
])

// 效果对比数据
const comparisonData = ref({
  matchRate: 22,
  trainingCoverage: 27,
  schedulingTime: 82,
  costOptimization: 15
})

// 更新当前人员数据
const updateCurrentPerson = () => {
  const data = personSkillsData[selectedPerson.value]
  if (data && radarChart) {
    initRadarChart()
  }
}

// 监听人员选择变化
watch(selectedPerson, () => {
  updateCurrentPerson()
})

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    
    // 设置当前日期
    const now = new Date()
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    currentDate.value = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`
    
    // 获取模拟数据
    const [statsRes, poolRes, planRes] = await Promise.all([
      getPeopleMatchStatsMock(),
      getPositionPoolMock(),
      getSchedulePlanMock()
    ])
    
    if (statsRes.data) {
      statsData.value = { ...statsData.value, ...statsRes.data }
    }
    if (poolRes.data) {
      positionPool.value = poolRes.data
    }
    if (planRes.data) {
      schedulePlans.value = planRes.data
    }
    
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
  initRadarChart()
  initSchedulingChart()
  initComparisonChart()
}

// 雷达图 - 人员技能画像
const initRadarChart = () => {
  if (!radarChartRef.value) return
  if (!radarChart) {
    radarChart = echarts.init(radarChartRef.value)
  }
  
  const personData = personSkillsData[selectedPerson.value]
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    radar: {
      indicator: [
        { name: '操作技能', max: 100 },
        { name: '质量意识', max: 100 },
        { name: '学习能力', max: 100 },
        { name: '协作能力', max: 100 },
        { name: '安全意识', max: 100 },
        { name: '适应能力', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: '#666',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: '#e8e8e8'
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['#f8f8f8', '#fff']
        }
      },
      axisLine: {
        lineStyle: {
          color: '#e8e8e8'
        }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: personData?.radar || [80, 80, 80, 80, 80, 80],
        name: '技能评分',
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#1890ff',
          width: 2
        },
        areaStyle: {
          color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
            { offset: 0, color: 'rgba(24, 144, 255, 0.6)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
          ])
        },
        itemStyle: {
          color: '#1890ff',
          borderColor: '#fff',
          borderWidth: 2
        }
      }],
      emphasis: {
        lineStyle: {
          width: 3
        },
        areaStyle: {
          color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
            { offset: 0, color: 'rgba(24, 144, 255, 0.8)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.2)' }
          ])
        }
      }
    }]
  }
  radarChart.setOption(option)
}

// 智能排班环形图
const initSchedulingChart = () => {
  if (!schedulingChartRef.value) return
  if (!schedulingChart) {
    schedulingChart = echarts.init(schedulingChartRef.value)
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
      radius: '95%',
      center: ['50%', '60%'],
      axisLine: {
        lineStyle: {
          width: 16,
          color: [
            [0.3, '#f5222d'],
            [0.7, '#fa8c16'],
            [1, '#52c41a']
          ]
        }
      },
      pointer: {
        itemStyle: {
          color: '#1890ff'
        },
        width: 4,
        length: '60%'
      },
      axisTick: {
        distance: -18,
        length: 5,
        lineStyle: {
          color: '#fff'
        }
      },
      splitLine: {
        distance: -18,
        length: 10,
        lineStyle: {
          color: '#fff'
        }
      },
      axisLabel: {
        color: '#666',
        distance: 22,
        fontSize: 11
      },
      anchor: {
        show: true,
        showAbove: true,
        size: 8,
        itemStyle: {
          color: '#1890ff',
          borderColor: '#fff',
          borderWidth: 2
        }
      },
      title: {
        show: false
      },
      detail: {
        valueAnimation: true,
        fontSize: 26,
        fontWeight: 'bold',
        offsetCenter: [0, '10%'],
        formatter: '{value}%',
        color: '#333'
      },
      data: [{
        value: schedulingData.value.matchRate
      }]
    }]
  }
  schedulingChart.setOption(option)
}

// 效果对比柱状图
const initComparisonChart = () => {
  if (!comparisonChartRef.value) return
  if (!comparisonChart) {
    comparisonChart = echarts.init(comparisonChartRef.value)
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        let result = params[0].name + '<br/>'
        params.forEach(p => {
          const value = p.value > 0 ? `+${p.value}%` : `${p.value}%`
          result += `${p.seriesName}: ${value}<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['优化前', '优化后'],
      bottom: 0
    },
    grid: {
      left: 60,
      right: 40,
      top: 20,
      bottom: 50
    },
    xAxis: {
      type: 'category',
      data: ['人岗匹配度', '培训覆盖率', '排班效率', '成本优化'],
      axisLabel: {
        color: '#666',
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: '#e8e8e8'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%',
        color: '#666'
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      },
      max: 100
    },
    series: [
      {
        name: '优化前',
        type: 'bar',
        data: [65, 68, 85, 20],
        barWidth: 24,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#8c8c8c' },
            { offset: 1, color: '#bfbfbf' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          color: '#666',
          fontSize: 11
        }
      },
      {
        name: '优化后',
        type: 'bar',
        data: [87, 95, 18, 35],
        barWidth: 24,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#1890ff' },
            { offset: 1, color: '#69c0ff' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          color: '#1890ff',
          fontSize: 11
        }
      }
    ]
  }
  comparisonChart.setOption(option)
}

// 应用排班
const applySchedule = () => {
  console.log('应用排班:', {
    model: selectedModel.value,
    production: selectedModelObj.value?.production
  })
}

// 窗口调整
const handleResize = () => {
  radarChart?.resize()
  schedulingChart?.resize()
  comparisonChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  radarChart?.dispose()
  schedulingChart?.dispose()
  comparisonChart?.dispose()
})
</script>

<style scoped lang="scss">
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #fa8c16;
$purple-color: #722ed1;
$pink-color: #eb2f96;
$cyan-color: #13c2c2;
$bg-color: #f0f2f5;
$card-bg: #ffffff;
$text-primary: #333333;
$text-secondary: #666666;
$border-color: #e8e8e8;

.peoplematch-dashboard {
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
        margin-bottom: 6px;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 700;
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
    margin-bottom: 8px;

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

    .person-select {
      margin-left: auto;
      width: 160px;
    }
  }

  .card-desc {
    font-size: 14px;
    color: $text-secondary;
    margin-bottom: 20px;
    padding-left: 24px;
  }
}

// 中间区域
.middle-area {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;

  .skill-profile-card {
    flex: 1.2;
  }

  .position-pool-card {
    flex: 0.8;
  }
}

// 技能画像内容
.skill-profile-content {
  display: flex;
  gap: 30px;

  .radar-chart-container {
    flex: 1;
    height: 280px;
  }

  .person-info {
    width: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 20px;

    .person-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, $primary-color, #69c0ff);
      color: #fff;
      font-size: 32px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }

    .person-name {
      font-size: 20px;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 8px;
    }

    .person-level {
      padding: 4px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 20px;

      &.senior {
        background: rgba($primary-color, 0.1);
        color: $primary-color;
      }
      &.mid {
        background: rgba($warning-color, 0.1);
        color: $warning-color;
      }
      &.junior {
        background: rgba($text-secondary, 0.1);
        color: $text-secondary;
      }
    }

    .person-stats {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;

      .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #f8f8f8;
        border-radius: 8px;

        .stat-title {
          font-size: 13px;
          color: $text-secondary;
        }

        .stat-val {
          font-size: 14px;
          font-weight: 600;
          color: $text-primary;
        }

        &.highlight {
          background: rgba($primary-color, 0.08);
          .stat-val {
            color: $primary-color;
          }
        }
      }
    }
  }
}

// 岗位人才库
.position-pool-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.position-item {
  .position-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    .position-name {
      font-size: 14px;
      font-weight: 500;
      color: $text-primary;
    }

    .position-count {
      font-size: 13px;
      color: $text-secondary;
    }
  }

  .position-bar {
    height: 8px;
    background: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 10px;

    .bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
    }
  }

  .position-avatars {
    display: flex;
    gap: 6px;
    align-items: center;

    .mini-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      color: #fff;
      font-size: 12px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .more-count {
      font-size: 12px;
      color: $text-secondary;
      margin-left: 4px;
    }
  }
}

// 智能排班
.scheduling-card {
  margin-bottom: 20px;

  .scheduling-content {
    display: flex;
    align-items: center;
    gap: 40px;

    .scheduling-chart-container {
      width: 280px;
      height: 200px;
      flex-shrink: 0;
    }

    .scheduling-summary {
      display: flex;
      align-items: center;
      gap: 30px;
      flex-shrink: 0;

      .summary-item {
        text-align: center;

        .summary-value {
          font-size: 36px;
          font-weight: 700;
          color: $text-primary;
        }

        .summary-label {
          font-size: 14px;
          color: $text-secondary;
          margin-top: 4px;
        }

        &.highlight .summary-value {
          color: $success-color;
        }
      }

      .summary-divider {
        width: 1px;
        height: 60px;
        background: $border-color;
      }
    }

    .scheduling-params {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 20px;

      .param-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .param-label {
          font-size: 14px;
          color: $text-secondary;
        }

        .param-value {
          font-size: 14px;
          font-weight: 500;
          color: $text-primary;
        }
      }

      .apply-btn {
        margin-left: auto;
      }
    }
  }
}

// 推荐排班计划
.schedule-plan-card {
  margin-bottom: 20px;

  .schedule-plan-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
  }

  .plan-item {
    padding: 16px;
    background: #f8f8f8;
    border-radius: 10px;
    transition: all 0.3s ease;

    &:hover {
      background: #f0f0f0;
      transform: translateY(-2px);
    }

    .plan-line {
      font-size: 14px;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 10px;
    }

    .plan-person {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .person-badge {
        display: inline-block;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;

        &.senior {
          background: rgba($primary-color, 0.1);
          color: $primary-color;
        }
        &.mid {
          background: rgba($warning-color, 0.1);
          color: $warning-color;
        }
        &.junior {
          background: rgba($text-secondary, 0.1);
          color: $text-secondary;
        }
      }

      .plan-upph {
        font-size: 18px;
        font-weight: 700;
        color: $success-color;
      }
    }
  }
}

// 效果对比
.comparison-card {
  margin-bottom: 20px;

  .comparison-content {
    display: flex;
    gap: 40px;

    .comparison-chart-container {
      flex: 1;
      height: 300px;
    }

    .comparison-stats {
      width: 320px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      align-content: start;
    }

    .comparison-item {
      padding: 20px;
      background: #f8f8f8;
      border-radius: 10px;
      text-align: center;

      .comparison-value {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 8px;

        &.up {
          color: $success-color;
        }
        &.down {
          color: $primary-color;
        }
      }

      .comparison-label {
        font-size: 13px;
        color: $text-secondary;
      }
    }
  }
}

// 价值总结
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
    line-height: 1.6;
  }
}

// 响应式
@media (max-width: 1400px) {
  .schedule-plan-card .schedule-plan-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .stats-cards {
    flex-wrap: wrap;
    .stat-card {
      flex: 1 1 calc(50% - 8px);
      min-width: 200px;
    }
  }

  .middle-area {
    flex-direction: column;
  }

  .comparison-card .comparison-content {
    flex-direction: column;
  }

  .comparison-card .comparison-stats {
    width: 100%;
  }

  .scheduling-card .scheduling-content {
    flex-direction: column;
    gap: 20px;

    .scheduling-chart-container {
      width: 100%;
    }
  }
}

@media (max-width: 768px) {
  .stats-cards .stat-card {
    flex: 1 1 100%;
  }

  .schedule-plan-card .schedule-plan-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .skill-profile-content {
    flex-direction: column;
    align-items: center;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;

    .header-meta {
      align-items: flex-start;
    }
  }
}
</style>
