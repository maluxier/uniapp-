<template>
  <view class="page">
    <!-- 脉冲动画 Logo -->
    <view class="center-content">
      <!-- 呼吸光环 -->
      <view class="pulse-ring ring-1"></view>
      <view class="pulse-ring ring-2"></view>
      <view class="pulse-ring ring-3"></view>

      <!-- Logo -->
      <view class="logo-area">
        <text class="logo-text">✨</text>
      </view>

      <!-- 状态文案 -->
      <view class="status-area">
        <text class="status-text">{{ currentTip }}</text>
        <view class="dots-row">
          <text class="dot" :class="{ active: tipIndex >= 0 }"></text>
          <text class="dot" :class="{ active: tipIndex >= 1 }"></text>
          <text class="dot" :class="{ active: tipIndex >= 2 }"></text>
        </view>
      </view>

      <!-- 进度条 -->
      <view class="progress-wrap">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progress + '%' }"></view>
        </view>
        <text class="progress-text">{{ progressText }}</text>
      </view>

      <!-- 失败时的操作按钮 -->
      <view v-if="hasError" class="error-area">
        <text class="error-text">{{ errorMessage }}</text>
        <view class="error-btns">
          <view class="retry-btn" @click="handleRetry">
            <text>重新生成</text>
          </view>
          <view class="back-form-btn" @click="goBack">
            <text>修改参数</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部提示：仅在正常加载时显示 -->
    <text v-if="!hasError" class="bottom-hint">AI 正在为你定制专属计划，请稍候…</text>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { generatePlan } from '@/api/llm.js'

// ===== 路由参数解析 =====
let formParams = null

onMounted(() => {
  // 从路由参数中恢复表单数据
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const rawParams = currentPage.$page?.options?.params

  if (rawParams) {
    try {
      formParams = JSON.parse(decodeURIComponent(rawParams))
    } catch (e) {
      console.error('参数解析失败:', e)
      showError('参数传递异常，请返回重试')
      return
    }
  } else {
    showError('未收到任务参数，请返回重试')
    return
  }

  // 开始加载流程
  startGeneration()
})

// ===== 状态 =====
const progress = ref(0)
const tipIndex = ref(0)
const hasError = ref(false)
const errorMessage = ref('')
let tipTimer = null
let progressTimer = null

// 提示文案列表
const tips = [
  '正在分析你的目标…',
  '正在拆解关键任务…',
  '正在智能排列优先级…'
]

const currentTip = ref(tips[0])
const progressText = ref('0%')

// ===== 加载流程 =====
async function startGeneration() {
  hasError.value = false
  errorMessage.value = ''

  // 启动文案轮播
  startTipRotation()

  // 启动模拟进度（0 → 90%）
  startFakeProgress()

  // 调用 AI 生成
  const result = await generatePlan(formParams)

  // 停止模拟进度
  stopAllTimers()

  if (result.success && result.tasks && result.tasks.length > 0) {
    // 成功：快速跳到 100%
    progress.value = 100
    progressText.value = '生成完成！'

    // 短暂停留让用户看到 100%，然后跳转
    setTimeout(() => {
      const encodedTasks = encodeURIComponent(JSON.stringify(result.tasks))
      const encodedParams = encodeURIComponent(JSON.stringify(formParams))
      uni.redirectTo({
        url: `/pages/ai_preview/ai_preview?tasks=${encodedTasks}&params=${encodedParams}`
      })
    }, 600)
  } else {
    // 失败
    showError(result.error || 'AI 生成失败，请检查配置后重试')
  }
}

// ===== 文案轮播 =====
function startTipRotation() {
  tipIndex.value = 0
  currentTip.value = tips[0]

  tipTimer = setInterval(() => {
    tipIndex.value = (tipIndex.value + 1) % tips.length
    currentTip.value = tips[tipIndex.value]
  }, 2200)
}

// ===== 假进度条（0 → 90%，最后 10% 留给真实响应） =====
function startFakeProgress() {
  let p = 0
  progress.value = p
  progressText.value = '0%'

  progressTimer = setInterval(() => {
    if (p < 50) {
      p += 3 + Math.random() * 5  // 前期快
    } else if (p < 75) {
      p += 1.5 + Math.random() * 2.5  // 中期稳
    } else if (p < 88) {
      p += 0.4 + Math.random() * 0.8  // 后期慢
    } else {
      // 卡在 88-90 之间等真实响应
      p += Math.random() * 0.2
    }
    if (p >= 90) p = 90

    progress.value = Math.round(p)
    progressText.value = `${Math.round(p)}%`
  }, 400)
}

// ===== 失败处理 =====
function showError(msg) {
  stopAllTimers()
  hasError.value = true
  errorMessage.value = msg || '生成失败，请重试'
  progress.value = 0
}

function handleRetry() {
  startGeneration()
}

function goBack() {
  uni.navigateBack()
}

// ===== 清理 =====
function stopAllTimers() {
  if (tipTimer) clearInterval(tipTimer)
  if (progressTimer) clearInterval(progressTimer)
}

onUnmounted(() => {
  stopAllTimers()
})
</script>

<style>
/* ===== 全屏深色主题 ===== */
.page {
  min-height: 100vh;
  background: linear-gradient(160deg, #2E3440 0%, #3B4252 40%, #434C5E 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60rpx;
  box-sizing: border-box;
}

/* ===== 脉冲光环 ===== */
.center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  border: 2rpx solid rgba(255,255,255,0.15);
  transform: translate(-50%, -50%);
}

.ring-1 {
  width: 240rpx;
  height: 240rpx;
  animation: pulse 2.8s ease-in-out infinite;
}

.ring-2 {
  width: 320rpx;
  height: 320rpx;
  animation: pulse 2.8s ease-in-out 0.6s infinite;
}

.ring-3 {
  width: 400rpx;
  height: 400rpx;
  animation: pulse 2.8s ease-in-out 1.2s infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.85);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05);
    opacity: 0.15;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.85);
    opacity: 0.6;
  }
}

/* ===== Logo ===== */
.logo-area {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 60rpx;
  position: relative;
  z-index: 1;
}

.logo-text {
  font-size: 72rpx;
  animation: breathe 2s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.12); opacity: 0.8; }
}

/* ===== 状态文字 ===== */
.status-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 60rpx;
  position: relative;
  z-index: 1;
}

.status-text {
  font-size: 32rpx;
  font-weight: 500;
  color: rgba(255,255,255,0.85);
  letter-spacing: 2rpx;
}

.dots-row {
  display: flex;
  gap: 16rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: rgba(255,255,255,0.2);
  transition: all 0.4s;
}

.dot.active {
  background-color: rgba(255,255,255,0.8);
}

/* ===== 进度条 ===== */
.progress-wrap {
  width: 480rpx;
  position: relative;
  z-index: 1;
}

.progress-bar {
  width: 100%;
  height: 6rpx;
  border-radius: 3rpx;
  background-color: rgba(255,255,255,0.1);
  overflow: hidden;
  margin-bottom: 16rpx;
}

.progress-fill {
  height: 100%;
  border-radius: 3rpx;
  background: linear-gradient(90deg, #5E81AC, #81A1C1, #88C0D0);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 22rpx;
  color: rgba(255,255,255,0.5);
  text-align: center;
  display: block;
}

/* ===== 错误状态 ===== */
.error-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36rpx;
  margin-top: 20rpx;
  position: relative;
  z-index: 1;
}

.error-text {
  font-size: 28rpx;
  color: #D08770;
  text-align: center;
  line-height: 1.5;
}

.error-btns {
  display: flex;
  gap: 24rpx;
}

.retry-btn {
  width: 200rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: #5E81AC;
  color: #fff;
  font-size: 28rpx;
  border-radius: 40rpx;
}

.back-form-btn {
  width: 200rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.7);
  font-size: 28rpx;
  border-radius: 40rpx;
  border: 2rpx solid rgba(255,255,255,0.2);
}

/* ===== 底部提示 ===== */
.bottom-hint {
  position: fixed;
  bottom: 80rpx;
  font-size: 24rpx;
  color: rgba(255,255,255,0.35);
  text-align: center;
}
</style>
