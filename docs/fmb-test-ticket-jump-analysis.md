# FMB Test 页面首次跳转异常分析

## 问题现象

页面文件：

- `src/views/fmb/test/index.vue`

页面功能：

- 打开页面时自动生成 ticket
- 生成成功后跳转到 Angular 系统
- 页面上也提供一个 `openAngular()` 按钮用于手动跳转

异常现象：

- 第一次点击按钮跳转失败，提示“用户不存在”
- 第二次点击按钮通常可以成功

## 原因分析

原始代码中，`openAngular()` 的执行顺序存在问题。

原逻辑大致如下：

```js
function openAngular() {
  handleLogin()
  const targetUrl = '/fmc/monitor/layout/RW3F'
  const angularUrl = lastAngularUrl.value || `${ANGULAR_BASE_URL}/#${targetUrl}`
  window.open(angularUrl, '_blank')
}
```

这里有两个关键问题：

### 1. `handleLogin()` 是异步的，但没有等待执行完成

`handleLogin()` 内部会请求后端接口 `/system/angular/ticket` 来生成 ticket。

但在 `openAngular()` 中，调用 `handleLogin()` 后，代码会立刻继续执行 `window.open(...)`，不会等待 ticket 生成完成。

这会导致：

- 第一次点击时，`lastAngularUrl` 很可能还没有更新
- 页面就已经先跳到了一个不带 ticket 或使用旧地址的页面
- 目标系统因此提示“用户不存在”

### 2. 页面中存在重复跳转

原来的 `handleLogin()` 内部本身也会执行一次：

```js
window.open(angularUrl, '_blank')
```

这意味着一次点击实际上可能触发两次跳转：

- 第一次：`openAngular()` 立即打开页面
- 第二次：`handleLogin()` 请求完成后再次打开页面

这种重复开窗会带来时序混乱，也会让问题更难定位。

### 3. 页面加载时也会自动触发同一套逻辑

页面 `onMounted()` 中会自动调用 `handleLogin()`。

如果这时用户又点击按钮，就会和自动流程并发执行，进一步增加 ticket 生成和页面跳转的竞态风险。

## 为什么第二次点击通常会成功

因为第一次点击虽然跳转失败，但异步请求通常已经在后台完成了：

- ticket 已经生成
- `lastAngularUrl` 已经被更新为带 ticket 的正确地址

所以第二次点击时，页面更容易使用到已经准备好的跳转地址，因此看起来就“成功了”。

## 修改目标

将页面逻辑统一为一条稳定链路：

1. 先请求后端生成 ticket
2. 拿到最新 ticket 对应的跳转地址
3. 再执行 `window.open(...)`

同时避免重复开窗和异步抢跑。

## 修改方案

本次修改后的核心思路：

- `handleLogin()` 只负责生成 ticket 并返回最终跳转地址
- `openAngular()` 负责等待 `handleLogin()` 执行完成后再打开页面
- 页面自动跳转和按钮手动跳转都统一走 `openAngular()`
- 页面中只保留一处真正的 `window.open(...)`

## 修改后的效果

修改完成后，页面行为如下：

- 打开页面时仍然会自动跳转
- 点击按钮时也会走同样的流程
- 每次跳转前都会先拿到最新 ticket
- 不再出现“先打开页面，后生成 ticket”的时序问题
- 不再重复打开多个窗口

## 当前修改文件

- `src/views/fmb/test/index.vue`

## 测试建议

建议重点验证以下场景：

### 1. 页面首次打开

确认：

- 是否会自动触发 ticket 生成
- 是否能直接跳转到目标系统

### 2. 手动点击按钮首次跳转

确认：

- 第一次点击是否仍然提示“用户不存在”
- 是否可以一次成功进入目标系统

### 3. 自动跳转被浏览器拦截时

确认：

- 点击“立即访问”或“重试”按钮后，是否能够正常进入系统

## 如果仍然存在问题

如果前端时序已经修正后，仍然出现“用户不存在”，则需要继续排查后端接口：

- `/system/angular/ticket`

重点关注：

- 首次生成的 ticket 是否有效
- ticket 对应的用户信息是否已在目标系统完成同步
- 目标系统是否对首次登录存在缓存、延迟或用户初始化过程

## 结论

本次问题的主要根因不是按钮本身失效，而是前端跳转时机早于 ticket 准备完成，导致第一次请求使用了未准备好的地址。

通过调整为“先生成 ticket，再跳转”，可以显著降低首次跳转失败的概率，并让自动跳转与手动跳转行为保持一致。
