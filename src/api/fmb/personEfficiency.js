/**
 * 人效提升页面 Mock 数据
 * 
 * 后端接口说明（待实现）：
 *   - REST API: GET /system/efficiency/workload      (工时利用率数据)
 *   - REST API: GET /system/efficiency/upph         (UPPH数据)
 *   - REST API: GET /system/efficiency/bottleneck   (瓶颈岗位分析)
 *   - REST API: GET /system/efficiency/abnormalHours (异常工时漏斗)
 */

export const getWorkloadAnalysisMock = () => {
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: {
      overallUtilization: 78.5,
      utilizationTrend: '+5.2%',
      bottleneckJobs: [
        {
          jobName: '绑定岗',
          utilization: 65,
          conclusion: '设备OEE低导致人等机'
        }
      ],
      trendData: [
        { month: '1月', value: 72 },
        { month: '2月', value: 74 },
        { month: '3月', value: 76 },
        { month: '4月', value: 78.5 }
      ]
    }
  })
}

export const getAbnormalHoursMock = () => {
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: {
      totalAbnormalHours: 156,
      breakdown: [
        { type: '人等机', hours: 85, percentage: 54.5, color: '#ff6b6b' },
        { type: '机等人', hours: 45, percentage: 28.8, color: '#4ecdc4' },
        { type: '换班损失', hours: 18, percentage: 11.5, color: '#ffe66d' },
        { type: '其他', hours: 8, percentage: 5.2, color: '#95a5a6' }
      ]
    }
  })
}

export const getUpphDataMock = () => {
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: {
      trendData: [
        { month: '上线前', value: 68.5 },
        { month: '1月', value: 72.3 },
        { month: '2月', value: 75.8 },
        { month: '3月', value: 79.2 },
        { month: '4月', value: 82.1 }
      ],
      ranking: [
        { team: 'A班-组装', model: 'Model X', upph: 85.2, change: 12, status: 'up' },
        { team: 'B班-切割', model: 'Model Y', upph: 82.6, change: 8, status: 'up' },
        { team: 'C班-检测', model: 'Model X', upph: 79.3, change: 15, status: 'up' },
        { team: 'A班-绑定', model: 'Model Z', upph: 76.8, change: -3, status: 'down' }
      ],
      overallImprovement: 19.9
    }
  })
}

export const getValueSummaryMock = () => {
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: {
      summary: '"过去工时是黑盒，现在精准定位到\'人等机\'还是\'机等人\',为工艺改进和人员精简提供了数据子弹。"',
      keyMetrics: [
        { label: '工时透明度', value: '100%' },
        { label: '定位精度', value: '岗位级' },
        { label: '改进方向', value: '可视化' }
      ]
    }
  })
}
