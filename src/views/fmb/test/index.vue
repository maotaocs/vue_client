<template>
  <div class="angular-container">
    <div v-if="loginStatus === 'loading'" class="login-overlay">
      <div class="login-box">
        <div class="spinner"></div>
        <p>正在生成 ticket 并跳转，请稍候...</p>
      </div>
    </div>

    <div v-else-if="loginStatus === 'error'" class="login-overlay">
      <div class="login-box error">
        <p class="error-icon">!</p>
        <p>{{ errorMessage }}</p>
        <button @click="openAngular">重试</button>
      </div>
    </div>

    <div v-else-if="loginStatus === 'success'" class="success-panel">
      <div class="success-content">
        <p class="success-icon">OK</p>
        <h3>已生成跳转地址</h3>
        <p>如果浏览器拦截了自动打开，可以点击下面按钮重新进入。</p>
        <button @click="openAngular" class="btn-primary">
          打开 FMB 系统
        </button>
        <button @click="loginStatus = 'idle'" class="btn-secondary">
          返回
        </button>
      </div>
    </div>

    <div v-else class="login-overlay">
      <div class="login-box">
        <h3>FMB 单点登录</h3>
        <p>页面打开时会自动生成 ticket 并跳转，如果没有跳转可以手动重试。</p>
        <button @click="openAngular" class="btn-primary">立即访问</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const ANGULAR_BASE_URL = 'http://172.20.10.3:8089'
const TARGET_URL = '/fmc/monitor/layout/RW3F'

const loginStatus = ref('idle')
const errorMessage = ref('')
const lastAngularUrl = ref('')

onMounted(() => {
  openAngular()
})

async function generateTicket(targetUrl) {
  try {
    return await request.get('/system/angular/ticket', {
      params: { targetUrl }
    })
  } catch (error) {
    console.error('[Vue-Angular SSO] generate ticket failed:', error)
    throw error
  }
}

async function handleLogin() {
  loginStatus.value = 'loading'
  errorMessage.value = ''

  try {
    const ticketRes = await generateTicket(TARGET_URL)
    console.log('[Vue-Angular SSO] Ticket response:', ticketRes)

    if ((ticketRes.code === 200 || ticketRes.code === 0) && ticketRes.data) {
      const ticket = ticketRes.data.ticket
      const redirectTarget = ticketRes.data.targetUrl || TARGET_URL
      const angularUrl = `${ANGULAR_BASE_URL}/#/login?ticket=${encodeURIComponent(ticket)}&target=${encodeURIComponent(redirectTarget)}`

      lastAngularUrl.value = angularUrl
      loginStatus.value = 'success'
      return angularUrl
    }

    throw new Error(ticketRes.msg || '生成 Ticket 失败')
  } catch (error) {
    console.error('[Vue-Angular SSO] login failed:', error)
    errorMessage.value = error.message || '登录失败，请稍后重试'
    loginStatus.value = 'error'
    throw error
  }
}

async function openAngular() {
  try {
    const angularUrl = await handleLogin()
    if (angularUrl) {
      window.open(angularUrl, '_blank')
    }
  } catch (error) {
    console.error('[Vue-Angular SSO] openAngular failed:', error)
  }
}
</script>

<style scoped>
.angular-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.login-box {
  text-align: center;
  padding: 50px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  min-width: 320px;
}

.login-box h3 {
  margin: 0 0 10px;
  color: #333;
  font-size: 24px;
}

.login-box p {
  margin: 0 0 25px;
  color: #666;
  font-size: 14px;
}

.login-box.error p {
  color: #f56c6c;
}

.error-icon {
  width: 60px;
  height: 60px;
  line-height: 60px;
  font-size: 28px;
  color: white;
  background: #f56c6c;
  border-radius: 50%;
  margin: 0 auto 20px;
}

.success-panel {
  width: 100%;
}

.success-content {
  text-align: center;
  padding: 50px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  margin: 0 auto;
}

.success-icon {
  width: 80px;
  height: 80px;
  line-height: 80px;
  font-size: 32px;
  color: white;
  background: #67c23a;
  border-radius: 50%;
  margin: 0 auto 20px;
}

.success-content h3 {
  margin: 0 0 10px;
  color: #333;
  font-size: 24px;
}

.success-content p {
  margin: 0 0 30px;
  color: #666;
  font-size: 14px;
}

.btn-primary {
  display: block;
  width: 100%;
  padding: 14px 30px;
  margin-bottom: 12px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #66b1ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.btn-secondary {
  display: block;
  width: 100%;
  padding: 12px 30px;
  background: transparent;
  color: #909399;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-secondary:hover {
  color: #409eff;
  border-color: #409eff;
}

.login-box button {
  width: 100%;
  padding: 14px 30px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

.login-box button:hover {
  background: #66b1ff;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
