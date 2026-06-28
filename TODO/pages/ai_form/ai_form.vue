<template>
  <view class="page">
    <!-- 顶部 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <uni-icons type="arrowleft" size="22" color="#2E3440"></uni-icons>
      </view>
      <text class="page-title">AI 智能规划</text>
      <view class="header-right">
        <text class="settings-link" @click="goSettings">API设置</text>
      </view>
    </view>

    <!-- 表单 -->
    <view class="form">
      <!-- 目标描述 -->
      <view class="form-group">
        <view class="label-row">
          <text class="form-label">目标描述</text>
          <text class="form-required">*</text>
        </view>
        <textarea
          class="form-textarea"
          v-model="goal"
          placeholder="详细描述你想完成的目标，AI 会帮你拆解成每日任务&#10;&#10;例如：&#10;• 下周要完成产品评审的PPT，包含市场分析和竞品对比&#10;• 一个月内学习 Python 数据分析，从入门到能处理 Excel 报表&#10;• 三个月备考 CET-6，每天背单词+刷真题"
          placeholder-class="ph"
          :maxlength="500"
          auto-height
        />
        <text class="char-count">{{ goal.length }}/500</text>
      </view>

      <!-- 计划时间段 -->
      <view class="form-group">
        <view class="label-row">
          <text class="form-label">计划时间段</text>
          <text class="form-required">*</text>
        </view>
        <view class="date-row">
          <view class="date-item">
            <text class="date-label">开始</text>
            <picker mode="date" :value="startDate" @change="e => startDate = e.detail.value">
              <view class="picker-box" :class="{ empty: !startDate }">
                <uni-icons type="calendar" size="18" color="#999"></uni-icons>
                <text>{{ startDate || '选择日期' }}</text>
              </view>
            </picker>
          </view>
          <text class="date-arrow">→</text>
          <view class="date-item">
            <text class="date-label">结束</text>
            <picker mode="date" :value="endDate" :start="startDate || todayStr" @change="e => endDate = e.detail.value">
              <view class="picker-box" :class="{ empty: !endDate }">
                <uni-icons type="calendar" size="18" color="#999"></uni-icons>
                <text>{{ endDate || '选择日期' }}</text>
              </view>
            </picker>
          </view>
        </view>
      </view>

      <!-- 每天可用时间 -->
      <view class="form-group">
        <view class="label-row">
          <text class="form-label">每天可用时间</text>
          <text class="form-required">*</text>
        </view>
        <view class="hours-selector">
          <view
            v-for="h in hourOptions"
            :key="h"
            class="hour-chip"
            :class="{ active: dailyHours === h }"
            @click="dailyHours = h"
          >
            <text>{{ h }}h</text>
          </view>
        </view>
        <text class="field-hint" v-if="dailyHours">每天约 {{ dailyHours }} 小时可用于执行计划</text>
      </view>

      <!-- 专注力时段 -->
      <view class="form-group">
        <view class="label-row">
          <text class="form-label">专注力时段</text>
          <text class="form-required">*</text>
        </view>
        <text class="field-hint mb">告诉 AI 你在哪个时段精力最充沛，它会据此安排高难度任务</text>
        <view class="focus-grid">
          <view
            v-for="f in focusOptions"
            :key="f.value"
            class="focus-card"
            :class="{ active: focusPreference === f.value }"
            @click="focusPreference = f.value"
          >
            <text class="focus-emoji">{{ f.emoji }}</text>
            <view class="focus-text">
              <text class="focus-name">{{ f.name }}</text>
              <text class="focus-desc">{{ f.desc }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 生成按钮 -->
    <view class="bottom-area">
      <view
        class="generate-btn"
        :class="{ disabled: !canSubmit }"
        @click="handleGenerate"
      >
        <text class="btn-icon">✨</text>
        <text>AI 智能生成计划</text>
      </view>
      <text class="bottom-hint">AI 将根据你的参数智能拆解任务并可视化展示</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

// ===== 日期处理 =====
const now = new Date()
const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

// ===== 表单数据 =====
const goal = ref('')
const startDate = ref('')
const endDate = ref('')
const dailyHours = ref(0)
const focusPreference = ref('')

// 每天可用时间选项
const hourOptions = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12]

// 专注力时段选项
const focusOptions = [
  { value: 'morning', name: '清晨高效型', desc: '6:00-10:00 思维最清晰', emoji: '🌅' },
  { value: 'forenoon', name: '上午工作型', desc: '9:00-12:00 专注力最佳', emoji: '☀️' },
  { value: 'night', name: '夜猫子型', desc: '19:00-23:00 创造力最高', emoji: '🌙' },
  { value: 'flexible', name: '灵活型', desc: '全天随时可投入', emoji: '🔄' }
]

// ===== 表单校验 =====
const canSubmit = computed(() => {
  return goal.value.trim().length >= 5
    && startDate.value
    && endDate.value
    && dailyHours.value > 0
    && focusPreference.value
})

// ===== 跳转 =====
function goBack() {
  uni.navigateBack()
}

function goSettings() {
  uni.navigateTo({ url: '/pages/ai_settings/ai_settings' })
}

// ===== 生成计划 =====
function handleGenerate() {
  // 前置校验
  if (!canSubmit.value) {
    const checks = []
    if (goal.value.trim().length < 5) checks.push('目标描述（至少5个字）')
    if (!startDate.value) checks.push('开始日期')
    if (!endDate.value) checks.push('结束日期')
    if (dailyHours.value <= 0) checks.push('每日可用时间')
    if (!focusPreference.value) checks.push('专注力时段')
    uni.showToast({ title: `请填写：${checks.join('、')}`, icon: 'none', duration: 2500 })
    return
  }

  // 日期合法性校验
  if (endDate.value < startDate.value) {
    uni.showToast({ title: '结束日期不能早于开始日期', icon: 'none' })
    return
  }

  // 组装参数，通过路由传给加载页
  const params = {
    goal: goal.value.trim(),
    startDate: startDate.value,
    endDate: endDate.value,
    dailyHours: dailyHours.value,
    focusPreference: focusPreference.value
  }

  // URL 参数编码（对象转 JSON 字符串）
  const paramsStr = encodeURIComponent(JSON.stringify(params))
  uni.navigateTo({ url: `/pages/ai_loading/ai_loading?params=${paramsStr}` })
}
</script>

<style>
.page {
  min-height: 100vh;
  padding: 30rpx 30rpx 40rpx;
  background-color: #ECEFF4;
  box-sizing: border-box;
  padding-bottom: 200rpx;
}

/* ===== 顶部 ===== */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #2E3440;
}

.header-right {
  width: 120rpx;
  text-align: right;
}

.settings-link {
  font-size: 24rpx;
  color: #5E81AC;
  font-weight: 500;
}

/* ===== 表单 ===== */
.form {
  display: flex;
  flex-direction: column;
  gap: 36rpx;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.label-row {
  display: flex;
  align-items: center;
  margin-bottom: 14rpx;
}

.form-label {
  font-size: 30rpx;
  font-weight: 600;
  color: #2E3440;
}

.form-required {
  color: #BF616A;
  font-size: 30rpx;
  margin-left: 6rpx;
}

.field-hint {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.field-hint.mb {
  margin-top: 0;
  margin-bottom: 16rpx;
}

/* ===== 多行文本 ===== */
.form-textarea {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  font-size: 28rpx;
  color: #2E3440;
  min-height: 200rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
  line-height: 1.6;
  box-sizing: border-box;
}

.ph {
  color: #bbb;
  font-size: 26rpx;
  line-height: 1.6;
}

.char-count {
  text-align: right;
  font-size: 22rpx;
  color: #bbb;
  margin-top: 8rpx;
}

/* ===== 日期 ===== */
.date-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.date-item {
  flex: 1;
}

.date-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
  display: block;
}

.date-arrow {
  font-size: 32rpx;
  color: #5E81AC;
  margin-top: 20rpx;
  font-weight: bold;
}

.picker-box {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 0 24rpx;
  height: 90rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 28rpx;
  color: #2E3440;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}

.picker-box.empty {
  color: #bbb;
}

/* ===== 时间选择 ===== */
.hours-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.hour-chip {
  width: 100rpx;
  height: 72rpx;
  border-radius: 36rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #888;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
  transition: all 0.2s;
}

.hour-chip.active {
  background-color: #5E81AC;
  color: #fff;
  font-weight: 600;
}

/* ===== 专注力卡片 ===== */
.focus-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.focus-card {
  width: calc(50% - 8rpx);
  padding: 28rpx 24rpx;
  border-radius: 20rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
  box-sizing: border-box;
  transition: all 0.2s;
}

.focus-card.active {
  background-color: #5E81AC;
  box-shadow: 0 4rpx 20rpx rgba(94,129,172,0.35);
}

.focus-card.active .focus-name,
.focus-card.active .focus-desc {
  color: #fff;
}

.focus-emoji {
  font-size: 48rpx;
  flex-shrink: 0;
}

.focus-text {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  min-width: 0;
}

.focus-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #2E3440;
}

.focus-desc {
  font-size: 22rpx;
  color: #888;
}

/* ===== 底部 ===== */
.bottom-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 30rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: linear-gradient(transparent, #ECEFF4 30%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.generate-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  text-align: center;
  background: linear-gradient(135deg, #5E81AC, #81A1C1);
  color: #fff;
  font-size: 34rpx;
  font-weight: 700;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  box-shadow: 0 8rpx 24rpx rgba(94,129,172,0.3);
  transition: all 0.3s;
}

.generate-btn.disabled {
  opacity: 0.4;
  pointer-events: none;
}

.generate-btn:active {
  transform: scale(0.97);
  transition: transform 0.1s;
}

.btn-icon {
  font-size: 38rpx;
}

.bottom-hint {
  font-size: 22rpx;
  color: #bbb;
  text-align: center;
}
</style>
