import axios from 'axios'

// 创建独立的 axios 实例用于 Angular 系统
const angularService = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  // 允许跨域携带 cookie
  withCredentials: true
})

// Angular 监控系统统一登录配置
const ANGULAR_CONFIG = {
  defaultUsername: '66000424',
  defaultPassword: '1'
}

/**
 * Angular 监控系统登录
 * @param {string} username - 用户名（可选，默认使用配置的用户名）
 * @param {string} password - 密码（可选，默认使用配置的密码）
 */
export function angularLogin(username, password) {
  return angularService.post('/bidm/', {
    method: 'authenticate',
    params: {
      encrypt: false,
      username: username || ANGULAR_CONFIG.defaultUsername,
      password: password || ANGULAR_CONFIG.defaultPassword
    }
  }).then(res => res.data)
}

/**
 * 获取 Angular 系统当前登录状态
 */
export function getAngularLoginStatus() {
  return angularService.post('/bidm/', {
    method: 'getUserInfo',
    params: {}
  }).then(res => res.data)
}

/**
 * 生成 Angular 系统访问 Ticket
 * @param {string} username - Angular 用户名（可选）
 * @param {string} password - Angular 密码（可选）
 * @param {string} targetUrl - Angular 目标页面路径（可选，如：/fmc/monitor/layout/RW3F）
 * @returns {Promise<{ticket: string, redirectUrl: string, angularBaseUrl: string, expireSeconds: number}>}
 */
export function generateAngularTicket(username, password, targetUrl) {
  return axios.post('/system/angular/ticket', null, {
    params: { username, password, targetUrl }
  }).then(res => res.data)
}

export default {
  angularLogin,
  getAngularLoginStatus,
  generateAngularTicket
}
