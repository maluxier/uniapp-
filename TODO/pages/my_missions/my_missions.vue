<template>
	<view class="page">
		<!-- 顶部：计划名称 -->
		<view class="header">
			<text class="page-title">{{ mission.name }}</text>
		</view>

		<!-- 详情 -->
		<view class="form">
			<!-- 计划类型 -->
			<view class="form-group">
				<text class="form-label">计划类型</text>
				<view class="type-row">
					<view class="type-tag"><text>{{ mission.type }}</text></view>
				</view>
			</view>

			<!-- 起始时间 -->
			<view class="form-group">
				<text class="form-label">起始时间</text>
				<view class="date-row">
					<view class="date-input"><text :class="{ ph: !sYear }">{{ sYear || '年' }}</text></view>
					<text class="date-sep">年</text>
					<view class="date-input"><text :class="{ ph: !sMonth }">{{ sMonth || '月' }}</text></view>
					<text class="date-sep">月</text>
					<view class="date-input"><text :class="{ ph: !sDay }">{{ sDay || '日' }}</text></view>
					<text class="date-sep">日</text>
				</view>
			</view>

			<!-- 结束时间 -->
			<view class="form-group">
				<text class="form-label">结束时间</text>
				<view class="date-row">
					<view class="date-input"><text :class="{ ph: !eYear }">{{ eYear || '年' }}</text></view>
					<text class="date-sep">年</text>
					<view class="date-input"><text :class="{ ph: !eMonth }">{{ eMonth || '月' }}</text></view>
					<text class="date-sep">月</text>
					<view class="date-input"><text :class="{ ph: !eDay }">{{ eDay || '日' }}</text></view>
					<text class="date-sep">日</text>
				</view>
			</view>

			<!-- 计划描述 -->
			<view class="form-group">
				<text class="form-label">计划描述</text>
				<view class="desc-box">
					<text :class="{ ph: !mission.description }">{{ mission.description || '暂无描述' }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 从路由参数接收任务数据
const pages = getCurrentPages()
const cur = pages[pages.length - 1]
const raw = cur.$page?.options?.item
const mission = ref(raw ? JSON.parse(decodeURIComponent(raw)) : {})

const sYear = computed(() => (mission.value.startDate || '').split('-')[0] || '')
const sMonth = computed(() => (mission.value.startDate || '').split('-')[1] || '')
const sDay = computed(() => (mission.value.startDate || '').split('-')[2] || '')
const eYear = computed(() => (mission.value.endDate || '').split('-')[0] || '')
const eMonth = computed(() => (mission.value.endDate || '').split('-')[1] || '')
const eDay = computed(() => (mission.value.endDate || '').split('-')[2] || '')
</script>

<style>
.page {
	min-height: 100vh;
	padding: 30rpx 30rpx 40rpx;
	background-color: #ECEFF4;
	box-sizing: border-box;
}

.header {
	margin-bottom: 40rpx;
}

.page-title {
	font-size: 44rpx;
	font-weight: 700;
	color: #2E3440;
}

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

.type-row {
	display: flex;
}

.type-tag {
	padding: 12rpx 36rpx;
	border-radius: 16rpx;
	background-color: #E1ECF4;
	color: #5E81AC;
	font-size: 28rpx;
	font-weight: 500;
}

.date-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.date-input {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 0 24rpx;
	height: 90rpx;
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
	font-size: 30rpx;
	color: #2E3440;
}

.date-sep {
	font-size: 28rpx;
	color: #888;
	flex-shrink: 0;
}

.desc-box {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 24rpx 30rpx;
	min-height: 180rpx;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
	font-size: 30rpx;
	color: #2E3440;
	line-height: 1.6;
}

.ph {
	color: #bbb;
}
</style>
