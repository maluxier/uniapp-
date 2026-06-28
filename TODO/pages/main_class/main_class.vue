<template>
	<view class="page">
		<!-- 顶部：标题 -->
		<view class="header">
			<text class="page-title">计划分类</text>
		</view>

		<!-- 分类卡片列表 -->
		<view class="card-list">
			<view
				v-for="item in categories"
				:key="item.name"
				class="category-card"
				@click="onCardClick(item)"
			>
				<view class="card-top">
					<view class="card-left">
						<view class="circle-icon"></view>
						<text class="category-name">{{ item.name }}</text>
					</view>
					<view class="card-stats">
						<text class="stat-total">{{ item.total }}个任务</text>
						<text class="stat-pending">{{ item.pending }}个待完成</text>
					</view>
				</view>
				<view class="progress-wrap">
					<view class="progress-bar">
						<view class="progress-fill" :style="{ width: item.percent + '%' }"></view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const statusBarHeight = uni.$ui?.statusBarHeight || 44

const refreshKey = ref(0)

const categories = computed(() => {
	refreshKey.value
	const tasks = uni.getStorageSync('tasks') || []
	const types = ['工作', '生活', '学习']

	return types.map(name => {
		const filtered = tasks.filter(t => t.type === name)
		const total = filtered.length
		const pending = filtered.filter(t => !t.done).length
		const percent = total > 0 ? Math.round(((total - pending) / total) * 100) : 0
		return { name, total, pending, percent }
	})
})

onShow(() => {
	refreshKey.value++
})

function onCardClick(item) {
	uni.showToast({ title: item.name, icon: 'none' })
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
	margin-bottom: 30rpx;
}

.page-title {
	font-size: 44rpx;
	font-weight: 700;
	color: #2E3440;
}

/* ===== 分类卡片 ===== */
.card-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.category-card {
	background-color: #fff;
	border-radius: 20rpx;
	padding: 32rpx 36rpx;
	box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}

.card-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 28rpx;
}

.card-left {
	display: flex;
	align-items: center;
	gap: 24rpx;
}

.circle-icon {
	width: 48rpx;
	height: 48rpx;
	border-radius: 50%;
	border: 4rpx solid #5E81AC;
	flex-shrink: 0;
}

.category-name {
	font-size: 34rpx;
	font-weight: 700;
	color: #2E3440;
}

.card-stats {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 4rpx;
}

.stat-total {
	font-size: 26rpx;
	color: #888;
}

.stat-pending {
	font-size: 24rpx;
	color: #aaa;
}

/* ===== 进度条 ===== */
.progress-wrap {
	width: 100%;
}

.progress-bar {
	width: 100%;
	height: 16rpx;
	border-radius: 8rpx;
	background-color: #E1ECF4;
	overflow: hidden;
}

.progress-fill {
	height: 100%;
	border-radius: 8rpx;
	background-color: #5E81AC;
	transition: width 0.3s ease;
}
</style>
