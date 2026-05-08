/**
 * 人效提升 API 接口
 * 
 * layoutKey = 'efficiency'
 * 
 * 此文件定义人效提升的模拟数据，供开发环境使用。
 * 正式环境后端从相关表获取数据，返回相同格式的真实数据。
 */

/**
 * 获取 UPPH 看板数据
 */
export function getEfficiencyUPPHMock() {
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: {
      // UPPH 趋势数据（系统上线前后对比）
      trendData: {
        before: [
          { month: '1月', upph: 68.5 },
          { month: '2月', upph: 69.2 },
          { month: '3月', upph: 70.1 }
        ],
        after: [
          { month: '4月', upph: 75.3 },
          { month: '5月', upph: 78.6 },
          { month: '6月', upph: 82.4 }
        ]
      },
      // 班组 UPPH 排名
      teamRanking: [
        { team: 'A班-组装', model: 'Model X', upph: 85.2, change: 12, trend: 'up' },
        { team: 'B班-切割', model: 'Model Y', upph: 82.6, change: 8, trend: 'up' },
        { team: 'C班-检测', model: 'Model X', upph: 79.3, change: 15, trend: 'up' },
        { team: 'A班-绑定', model: 'Model Z', upph: 76.8, change: -3, trend: 'down' }
      ]
    }
  })
}

/**
 * 获取岗位饱和度数据
 */
export function getPositionSaturationMock() {
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: {
      // 岗位饱和度列表
      positions: [
        { 
          name: '组装岗', 
          saturation: 92, 
          status: 'normal',
          analysis: '饱和度良好，效率达标'
        },
        { 
          name: '焊接岗', 
          saturation: 88, 
          status: 'normal',
          analysis: '饱和度良好'
        },
        { 
          name: '检测岗', 
          saturation: 85, 
          status: 'normal',
          analysis: '检测效率稳定'
        },
        { 
          name: '绑定岗', 
          saturation: 65, 
          status: 'warning',
          analysis: '设备OEE低导致人等机'
        },
        { 
          name: '包装岗', 
          saturation: 78, 
          status: 'normal',
          analysis: '包装效率正常'
        }
      ],
      // 瓶颈岗位
      bottleneck: {
        name: '绑定岗',
        saturation: 65,
        conclusion: '设备OEE低导致人等机'
      }
    }
  })
}

/**
 * 获取异常工时漏斗数据
 */
export function getAbnormalHoursMock() {
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: {
      // 漏斗各层级数据
      funnel: [
        { stage: '总工时', hours: 4800, count: 100, percentage: 100 },
        { stage: '有效工时', hours: 4200, count: 87.5, percentage: 87.5 },
        { stage: '异常工时', hours: 600, count: 12.5, percentage: 12.5 },
        { stage: '待分析', hours: 150, count: 3.1, percentage: 3.1 }
      ],
      // 异常工时分类
      categories: [
        { name: '等待物料', hours: 180, percentage: 30 },
        { name: '设备故障', hours: 150, percentage: 25 },
        { name: '质量问题', hours: 120, percentage: 20 },
        { name: '人员培训', hours: 90, percentage: 15 },
        { name: '其他', hours: 60, percentage: 10 }
      ]
    }
  })
}

/**
 * 获取工时利用率数据
 */
export function getWorkHoursUtilizationMock() {
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: {
      // 今日数据
      today: {
        totalHours: 800,
        effectiveHours: 720,
        utilization: 90,
        comparison: 5 // 较昨日提升
      },
      // 班组筛选选项
      teams: ['全部班组', 'A班', 'B班', 'C班'],
      // 型号筛选选项
      models: ['全部型号', 'Model X', 'Model Y', 'Model Z']
    }
  })
}
