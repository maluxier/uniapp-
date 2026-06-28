<template>
	<view class="page">
		<!-- 顶部：标题（计划名称） -->
		<view class="header">
			<text class="page-title">{{ mission.name }}</text>
		</view>

		<!-- 计划详情 -->
		<view class="form">
			<!-- 计划类型 -->
			<view class="form-group">
				<text class="form-label">计划类型</text>
				<view class="type-row">
					<view class="type-tag active">
						<text>{{ mission.type }}</text>
					</view>
				</view>
			</view>

			<!-- 起始时间 -->
			<view class="form-group">
				<text class="form-label">起始时间</text>
				<view class="date-row">
					<view class="date-input"><text>{{ sYear || '年' }}</text></view>
					<text class="date-sep">年</text>
					<view class="date-input"><text>{{ sMonth || '月' }}</text></view>
					<text class="date-sep">月</text>
					<view class="date-input"><text>{{ sDay || '日' }}</text></view>
					<text class="date-sep">日</text>
				</view>
			</view>

			<!-- 结束时间 -->
			<view class="form-group">
				<text class="form-label">结束时间</text>
				<view class="date-row">
					<view class="date-input"><text>{{ eYear || '年' }}</text></view>
					<text class="date-sep">年</text>
					<view class="date-input"><text>{{ eMonth || '月' }}</text></view>
					<text class="date-sep">月</text>
					<view class="date-input"><text>{{ eDay || '日' }}</text></view>
					<text class="date-sep">日</text>
				</view>
			</view>

			<!-- 计划描述 -->
			<view class="form-group">
				<text class="form-label">计划描述</text>
				<view class="desc-box">
					<text class="desc-text">{{ mission.description || '暂无描述' }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

const mission = ref({
	name: '',
	type: '',
	startDate: '',
	endDate: '',
	description: ''
})

const sYear = computed(() => mission.value.startDate ? mission.value.startDate.split('-')[0] : '')
const sMonth = computed(() => mission.value.startDate ? mission.value.startDate.split('-')[1] : '')
const sDay = computed(() => mission.value.startDate ? mission.value.startDate.split('-')[2] : '')

const eYear = computed(() => mission.value.endDate ? mission.value.endDate.split('-')[0] : '')
const eMonth = computed(() => mission.value.endDate ? mission.value.endDate.split('-')[1] : '')
const eDay = computed(() => mission.value.endDate ? mission.value.endDate.split('-')[2] : '')

// 从路由参数获取任务数据
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1]
if (currentPage.$page && currentPage.$page.options) {
	const item = currentPage.$page.options.item
	if (item) {
		mission.value = JSON.parse(decodeURIComponent(item))
	}
}
</script>

<style>
.page {
	min-height: 100vh;
	padding: 30rpx 30rpx 40rpx;
	background-color: #ECEFF4;
	box-sizing: border-box;
}

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
	gap: 16rpx;
}

.type-tag {
	padding: 16rpx 40rpx;
	border-radius: 30rpx;
	background-color: #5E81AC;
	color: #fff;
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
	font-size: 30rpx;
	color: #2E3440;
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}

.date-input text {
	color: #bbb;
}

.date-input text:not(:empty) {
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
}

.desc-text {
	font-size: 30rpx;
	color: #2E3440;
	line-height: 1.6;
}
</style>
