<template>
	<view class="page">
		<!-- 顶部：标题 + AI标签 -->
		<view class="header">
			<text class="page-title">新的计划</text>
			<view class="ai-tag">
				<text class="ai-tag-text">AI计划</text>
			</view>
		</view>

		<!-- 表单 -->
		<view class="form">
			<!-- 计划名称 -->
			<view class="form-group">
				<text class="form-label">计划名称</text>
				<input class="form-input" type="text" v-model="name" placeholder="输入计划名称" placeholder-class="ph" />
			</view>

			<!-- 计划类型 -->
			<view class="form-group">
				<text class="form-label">计划类型</text>
				<view class="type-row">
					<view
						v-for="t in typeOptions"
						:key="t"
						class="type-tag"
						:class="{ active: type === t }"
						@click="type = t"
					>
						<text>{{ t }}</text>
					</view>
				</view>
			</view>

			<!-- 计划描述 -->
			<view class="form-group">
				<text class="form-label">计划描述</text>
				<textarea
					class="form-textarea"
					v-model="description"
					placeholder="输入计划描述"
					placeholder-class="ph"
				></textarea>
			</view>

			<!-- 起始时间 -->
			<view class="form-group">
				<text class="form-label">起始时间</text>
				<picker mode="date" :value="startDate" @change="e => startDate = e.detail.value">
					<view class="picker-input" :class="{ empty: !startDate }">
						<text>{{ startDate || '选择起始日期' }}</text>
					</view>
				</picker>
			</view>

			<!-- 结束时间 -->
			<view class="form-group">
				<text class="form-label">结束时间</text>
				<picker mode="date" :value="endDate" @change="e => endDate = e.detail.value">
					<view class="picker-input" :class="{ empty: !endDate }">
						<text>{{ endDate || '选择结束日期' }}</text>
					</view>
				</picker>
			</view>

			<!-- 创建按钮 -->
			<button class="create-btn" @click="handleCreate">创建计划</button>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'

const statusBarHeight = uni.$ui?.statusBarHeight || 44

const name = ref('')
const type = ref('')
const description = ref('')
const typeOptions = ['工作', '生活', '学习']
const startDate = ref('')
const endDate = ref('')

// 跳转到 AI 智能规划页面
function goAIForm() {
  uni.navigateTo({ url: '/pages/ai_form/ai_form' })
}

function handleCreate() {
	if (!name.value.trim() || !type.value) {
		uni.showToast({ title: '请填写计划名称和类型', icon: 'none' })
		return
	}
	if (!startDate.value) {
		uni.showToast({ title: '请选择起始时间', icon: 'none' })
		return
	}

	const now = new Date()
	const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

	// 计算明天的日期字符串
	const tomorrowDate = new Date(now.getTime() + 86400000)
	const tomorrowStr = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`

	const deadline = startDate.value === todayStr ? 'today' : 'tomorrow'

	// 保存任务到本地存储（供 main_mission 使用）
	const tasks = uni.getStorageSync('tasks') || []
	tasks.push({
		id: Date.now(),
		name: name.value.trim(),
		type: type.value,
		description: description.value.trim(),
		startDate: startDate.value,
		endDate: endDate.value,
		done: false,
		deadline: deadline
	})
	uni.setStorageSync('tasks', tasks)

	uni.showToast({ title: '创建成功', icon: 'success' })
	setTimeout(() => uni.navigateBack(), 800)
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

.page-title {
	font-size: 44rpx;
	font-weight: 700;
	color: #2E3440;
}

.ai-tag {
	padding: 8rpx 24rpx;
	border-radius: 24rpx;
	background-color: #E1ECF4;
}

.ai-tag-text {
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
	gap: 16rpx;
}

.form-label {
	font-size: 30rpx;
	font-weight: 600;
	color: #2E3440;
}

.form-input {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 0 30rpx;
	height: 90rpx;
	font-size: 30rpx;
	color: #2E3440;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}

.ph {
	color: #bbb;
	font-size: 30rpx;
}

/* ===== 文本框 ===== */
.form-textarea {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 24rpx 30rpx;
	height: 180rpx;
	font-size: 30rpx;
	color: #2E3440;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
	width: 100%;
	box-sizing: border-box;
}

/* ===== 类型选择 ===== */
.type-row {
	display: flex;
	gap: 16rpx;
}

.type-tag {
	padding: 16rpx 40rpx;
	border-radius: 30rpx;
	background-color: #fff;
	color: #888;
	font-size: 28rpx;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}

.type-tag.active {
	background-color: #5E81AC;
	color: #fff;
	font-weight: 500;
}

/* ===== 日期选择器 ===== */
.picker-input {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 0 30rpx;
	height: 90rpx;
	display: flex;
	align-items: center;
	font-size: 30rpx;
	color: #2E3440;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}

.picker-input.empty {
	color: #bbb;
}

/* ===== 创建按钮 ===== */
.create-btn {
	width: 100%;
	height: 96rpx;
	line-height: 96rpx;
	text-align: center;
	background-color: #5E81AC;
	color: #fff;
	font-size: 34rpx;
	font-weight: 600;
	border-radius: 48rpx;
	margin-top: 20rpx;
	border: none;
}

.create-btn::after {
	border: none;
}
</style>
