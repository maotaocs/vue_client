/**
 * 出勤监控 API 接口
 * 
 * layoutKey = 'chuqi'
 * 
 * 此文件定义出勤监控的模拟数据，供开发环境使用。
 * 正式环境后端从相关表获取数据，返回相同格式的真实数据。
 */

/**
 * 获取出勤统计数据
 */
export function getAttendanceStatsMock() {
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: {
      actual: 172,
      planned: 186,
      onDutyRate: 92,
      offDutyCount: 5,
      offDutyTrend: 3.2
    }
  })
}

/**
 * 获取车间热力图数据
 */
export function getWorkshopHeatmapMock(team = 'all') {
  const areas = [
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
  ]

  // 根据班组筛选
  if (team !== 'all') {
    return Promise.resolve({
      code: 200,
      msg: '操作成功',
      data: areas.filter(a => a.name.startsWith(team.replace('班', '')))
    })
  }

  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: areas
  })
}

/**
 * 获取离岗人员列表
 */
export function getOffDutyListMock() {
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: [
      { id: 1, name: '张三', code: 'EMP001', line: 'A线', position: '绑定岗', offDuration: 42, offTime: '09:15' },
      { id: 2, name: '李四', code: 'EMP002', line: 'B线', position: '检测岗', offDuration: 35, offTime: '09:30' },
      { id: 3, name: '王五', code: 'EMP003', line: 'B线', position: '绑定岗', offDuration: 28, offTime: '10:00' },
      { id: 4, name: '赵六', code: 'EMP004', line: 'A线', position: '组装岗', offDuration: 18, offTime: '10:15' },
      { id: 5, name: '孙七', code: 'EMP005', line: 'C线', position: '切割岗', offDuration: 15, offTime: '10:30' }
    ]
  })
}

/**
 * 获取近7天离岗趋势数据
 */
export function getOffDutyTrendMock() {
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: {
      dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      counts: [12, 8, 15, 10, 7, 3, 5],
      durations: [35, 28, 42, 30, 25, 18, 22]
    }
  })
}

/**
 * 获取离岗时长分布数据
 */
export function getOffDutyDistributionMock() {
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: [
      { range: '15分钟以内', count: 45, color: '#52c41a' },
      { range: '15-30分钟', count: 28, color: '#1890ff' },
      { range: '30-60分钟', count: 15, color: '#fa8c16' },
      { range: '60分钟以上', count: 8, color: '#f5222d' },
      { range: '未归', count: 4, color: '#722ed1' }
    ]
  })
}

/**
 * 通知班组长
 */
export function notifyTeamLeader(params) {
  return Promise.resolve({
    code: 200,
    msg: '通知已发送',
    data: {
      success: true,
      sentAt: new Date().toISOString()
    }
  })
}
