/**
 * 人岗匹配 API 接口
 * 
 * layoutKey = 'peoplematch'
 * 
 * 此文件定义人岗匹配的模拟数据，供开发环境使用。
 * 正式环境后端从相关表获取数据，返回相同格式的真实数据。
 */

/**
 * 获取人岗匹配统计数据
 */
export function getPeopleMatchStatsMock() {
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: {
      totalPeople: 42,
      matchRate: 87,
      trainingCoverage: 95,
      schedulingTime: 15
    }
  })
}

/**
 * 获取岗位人才库状态
 */
export function getPositionPoolMock() {
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: [
      { name: '绑定岗', count: 8, fillRate: 80, color: '#1890ff', persons: ['张三', '刘一', '陈二', '杨三', '黄四', '赵五', '孙六', '周七'] },
      { name: '镜检岗', count: 6, fillRate: 60, color: '#52c41a', persons: ['李四', '吴一', '郑二', '王三', '冯四', '陈五'] },
      { name: '外观检', count: 10, fillRate: 100, color: '#fa8c16', persons: ['周五', '许一', '何二', '吕三', '施四', '张五', '孔六', '曹七', '严八', '华九'] },
      { name: '切割岗', count: 5, fillRate: 50, color: '#722ed1', persons: ['赵六', '金一', '魏二', '陶三', '姜四'] },
      { name: '组装岗', count: 7, fillRate: 70, color: '#eb2f96', persons: ['王五', '戚一', '谢二', '邹三', '喻四', '柏五', '水六'] },
      { name: '检测岗', count: 6, fillRate: 60, color: '#13c2c2', persons: ['孙七', '窦一', '章二', '云三', '苏四', '潘五'] }
    ]
  })
}

/**
 * 获取推荐排班计划
 */
export function getSchedulePlanMock() {
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: [
      { id: 1, line: 'A线', position: '绑定岗', personName: '张三', level: '高级', levelClass: 'senior', upph: 85 },
      { id: 2, line: 'A线', position: '镜检岗', personName: '李四', level: '中级', levelClass: 'mid', upph: 78 },
      { id: 3, line: 'A线', position: '组装岗', personName: '王五', level: '高级', levelClass: 'senior', upph: 92 },
      { id: 4, line: 'B线', position: '切割岗', personName: '赵六', level: '中级', levelClass: 'mid', upph: 72 },
      { id: 5, line: 'B线', position: '检测岗', personName: '孙七', level: '高级', levelClass: 'senior', upph: 88 },
      { id: 6, line: 'B线', position: '外观检', personName: '周五', level: '初级', levelClass: 'junior', upph: 65 }
    ]
  })
}

/**
 * 获取人员技能数据
 */
export function getPersonSkillMock(personId) {
  const skillsData = {
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
  
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: skillsData[personId] || skillsData[1]
  })
}

/**
 * 获取智能排班建议
 */
export function getSchedulingSuggestMock(model, production) {
  const suggestData = {
    modelX: { totalNeed: 28, matchRate: 92 },
    modelY: { totalNeed: 22, matchRate: 88 },
    modelZ: { totalNeed: 18, matchRate: 85 }
  }
  
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: suggestData[model] || suggestData.modelX
  })
}

/**
 * 确认应用排班
 */
export function applySchedule(params) {
  return Promise.resolve({
    code: 200,
    msg: '排班应用成功',
    data: {
      success: true,
      scheduleId: Date.now(),
      appliedAt: new Date().toISOString()
    }
  })
}
