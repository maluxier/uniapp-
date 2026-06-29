<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <uni-icons type="arrowleft" size="22" color="#2E3440"></uni-icons>
      </view>
      <text class="page-title">AI 接口设置</text>
      <view class="placeholder"></view>
    </view>

    <!-- 预设模板 -->
    <view class="section">
      <text class="section-title">快速配置</text>
      <text class="section-desc">选择一个平台自动填入接口地址</text>
      <view class="preset-row">
        <view
          v-for="preset in presets"
          :key="preset.name"
          class="preset-card"
          :class="{ active: currentPreset === preset.name }"
          @click="applyPreset(preset)"
        >
          <text class="preset-name">{{ preset.name }}</text>
          <text class="preset-price">{{ preset.price }}</text>
        </view>
      </view>
    </view>

    <!-- 配置表单 -->
    <view class="section">
      <text class="section-title">自定义配置</text>
      <view class="form">
        <!-- API Endpoint -->
        <view class="form-group">
          <text class="form-label">接口地址 (Endpoint)</text>
          <input
            class="form-input"
            type="text"
            v-model="endpoint"
            placeholder="https://api.deepseek.com/v1/chat/completions"
            placeholder-class="ph"
          />
        </view>

        <!-- API Key -->
        <view class="form-group">
          <text class="form-label">API Key</text>
          <view class="input-wrap">
            <input
              class="form-input key-input"
              :type="showKey ? 'text' : 'password'"
              v-model="apiKey"
              placeholder="sk-xxxxxxxxxxxxxxxx"
              placeholder-class="ph"
            />
            <view class="eye-btn" @click="showKey = !showKey">
              <uni-icons
                :type="showKey ? 'eye-slash-filled' : 'eye-filled'"
                size="20"
                color="#888"
              ></uni-icons>
            </view>
          </view>
        </view>

        <!-- Model -->
        <view class="form-group">
          <text class="form-label">模型名称</text>
          <input
            class="form-input"
            type="text"
            v-model="model"
            placeholder="deepseek-chat"
            placeholder-class="ph"
          />
        </view>

        <!-- 测试连接 -->
        <view class="test-row">
          <button class="test-btn" @click="handleTest" :disabled="testing">
            <text v-if="testing">测试中…</text>
            <text v-else>测试连接</text>
          </button>
          <text class="test-result" :class="testSuccess ? 'success' : 'fail'">
            {{ testMessage }}
          </text>
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="bottom-area">
      <view class="save-btn" @click="handleSave">
        <text>保存配置</text>
      </view>
      <text class="hint">配置保存在本地，不会上传到任何服务器</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { testConnection } from '@/api/llm.js'

// 预设模板
const presets = [
  {
    name: 'DeepSeek',
    price: '¥1起 / 百万Token', // 国内便宜且有免费额度
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat'
  },
  {
    name: 'OpenAI',
    price: '按量付费',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o'
  },
  {
    name: '通义千问',
    price: '有免费额度',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    model: 'qwen-plus'
  }
]

const currentPreset = ref('')

// 表单字段
const endpoint = ref('')
const apiKey = ref('')
const model = ref('')
const showKey = ref(false)

// 测试状态
const testing = ref(false)
const testMessage = ref('')
const testSuccess = ref(false)

// 页面初始化：读取已有配置
onLoad()

function onLoad() {
  const config = uni.getStorageSync('aiConfig')
  if (config) {
    endpoint.value = config.endpoint || ''
    apiKey.value = config.apiKey || ''
    model.value = config.model || ''
  }
}

// 应用预设
function applyPreset(preset) {
  currentPreset.value = preset.name
  endpoint.value = preset.endpoint
  model.value = preset.model
  testMessage.value = ''
}

// 测试连接
async function handleTest() {
  if (!endpoint.value.trim() || !apiKey.value.trim()) {
    testMessage.value = '请先填写接口地址和 API Key'
    testSuccess.value = false
    return
  }

  testing.value = true
  testMessage.value = ''
  testSuccess.value = false

  uni.showLoading({ title: '测试连接…', mask: true })

  const result = await testConnection({
    endpoint: endpoint.value.trim(),
    apiKey: apiKey.value.trim(),
    model: model.value.trim()
  })

  uni.hideLoading()

  testSuccess.value = result.success
  testMessage.value = result.message
  testing.value = false
}

// 保存配置
function handleSave() {
  if (!endpoint.value.trim()) {
    uni.showToast({ title: '请填写接口地址', icon: 'none' })
    return
  }
  if (!apiKey.value.trim()) {
    uni.showToast({ title: '请填写 API Key', icon: 'none' })
    return
  }

  const config = {
    endpoint: endpoint.value.trim(),
    apiKey: apiKey.value.trim(),
    model: model.value.trim()
  }
  uni.setStorageSync('aiConfig', config)

  uni.showToast({ title: '配置已保存', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 800)
}

function goBack() {
  uni.navigateBack()
}
</script>

<style>
.page {
  min-height: 100vh;
  padding: 30rpx 30rpx 40rpx;
  background-color: #ECEFF4;
  box-sizing: border-box;
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

.placeholder {
  width: 64rpx;
}

/* ===== 分区 ===== */
.section {
  margin-bottom: 36rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2E3440;
  display: block;
  margin-bottom: 8rpx;
}

.section-desc {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 20rpx;
}

/* ===== 预设卡片 ===== */
.preset-row {
  display: flex;
  gap: 16rpx;
}

.preset-card {
  flex: 1;
  padding: 24rpx 20rpx;
  border-radius: 20rpx;
  background-color: #fff;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
  transition: all 0.2s;
}

.preset-card.active {
  background-color: #5E81AC;
}

.preset-card.active .preset-name,
.preset-card.active .preset-price {
  color: #fff;
}

.preset-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #2E3440;
  display: block;
  margin-bottom: 6rpx;
}

.preset-price {
  font-size: 20rpx;
  color: #999;
}

/* ===== 表单 ===== */
.form {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.form-label {
  font-size: 26rpx;
  font-weight: 500;
  color: #555;
}

.form-input {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 0 30rpx;
  height: 90rpx;
  font-size: 28rpx;
  color: #2E3440;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}

.ph {
  color: #bbb;
  font-size: 26rpx;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrap .key-input {
  flex: 1;
  padding-right: 80rpx;
}

.eye-btn {
  position: absolute;
  right: 20rpx;
  padding: 10rpx;
}

/* ===== 测试 ===== */
.test-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.test-btn {
  width: 180rpx;
  height: 72rpx;
  line-height: 72rpx;
  text-align: center;
  background-color: #fff;
  color: #5E81AC;
  font-size: 26rpx;
  border-radius: 36rpx;
  border: 2rpx solid #5E81AC;
  flex-shrink: 0;
}

.test-btn::after {
  border: none;
}

.test-btn[disabled] {
  opacity: 0.5;
  pointer-events: none;
}

.test-result {
  font-size: 24rpx;
  flex: 1;
  word-break: break-all;
}

.test-result.success {
  color: #A3BE8C;
}

.test-result.fail {
  color: #BF616A;
}

/* ===== 底部 ===== */
.bottom-area {
  margin-top: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.save-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  text-align: center;
  background-color: #5E81AC;
  color: #fff;
  font-size: 34rpx;
  font-weight: 600;
  border-radius: 48rpx;
}

.hint {
  font-size: 22rpx;
  color: #bbb;
}
</style>
