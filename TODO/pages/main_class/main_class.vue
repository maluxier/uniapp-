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
				class="category-group"
			>
				<view class="category-card" @click="toggleExpand(item.name)">
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

				<!-- 任务列表 -->
				<view class="task-list" :class="{ open: expanded === item.name }">
					<view v-if="item.tasks.length === 0" class="empty-hint">暂无任务</view>
					<view
						v-for="t in item.tasks"
						:key="t.id"
						class="task-item"
							@click.stop="goDetail(t)"
					>
						<view class="task-left">
							<view
								class="task-radio"
								:class="{ checked: t.done }"
								@click.stop="toggleTask(t)"
							>
								<uni-icons v-if="t.done" type="checkmarkempty" size="14" color="#fff"></uni-icons>
							</view>
							<text class="task-name" :class="{ done: t.done }">{{ t.name }}</text>
						</view>
						<text class="task-tag" :class="'tag-' + t.type">{{ t.type }}</text>
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
const expanded = ref('')

const categories = computed(() => {
	refreshKey.value
	const tasks = uni.getStorageSync('tasks') || []
	const types = ['工作', '生活', '学习']

	return types.map(name => {
		const filtered = tasks.filter(t => t.type === name)
		const total = filtered.length
		const pending = filtered.filter(t => !t.done).length
		const percent = total > 0 ? Math.round(((total - pending) / total) * 100) : 0
		return { name, total, pending, percent, tasks: filtered }
	})
})

onShow(() => {
	refreshKey.value++
})

function toggleExpand(name) {
	expanded.value = expanded.value === name ? '' : name
}

function toggleTask(t) {
	t.done = !t.done
	const tasks = uni.getStorageSync('tasks') || []
	const idx = tasks.findIndex(i => i.id === t.id)
	if (idx !== -1) {
		tasks[idx].done = t.done
		uni.setStorageSync('tasks', tasks)
		refreshKey.value++
	}
}

function goDetail(t) {
	uni.navigateTo({
		url: '/pages/my_missions/my_missions?item=' + encodeURIComponent(JSON.stringify(t))
	})
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
	margin-bottom: 30rpx;
}

.page-title {
	font-size: 44rpx;
	font-weight: 700;
	color: #2E3440;
}

.card-list {
	display: flex;
	flex-direction: column;
	gap: 0;
}

.category-group {
	margin-bottom: 0;
}

.category-card {
	background-color: #fff;
	border-radius: 20rpx;
	padding: 32rpx 36rpx;
	box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
	position: relative;
	z-index: 1;
	margin-top: 20rpx;
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

/* ===== 任务列表 ===== */
.task-list {
	background-color: #ECEFF4;
	border-radius: 0 0 20rpx 20rpx;
	overflow: hidden;
	max-height: 0;
	transition: max-height 0.3s ease, padding 0.3s ease;
	padding: 0 8rpx;
}

.task-list.open {
	max-height: 1200rpx;
	padding: 8rpx 8rpx 16rpx;
}

.task-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx 20rpx;
	border-bottom: 1rpx solid #e0e0e0;
	background-color: #fff;
	border-radius: 10rpx;
}

.task-item:last-child {
	border-bottom: none;
}

.task-left {
	display: flex;
	align-items: center;
	gap: 20rpx;
	flex: 1;
	min-width: 0;
}

.task-radio {
	width: 36rpx;
	height: 36rpx;
	border-radius: 50%;
	border: 2rpx solid #ccc;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.task-radio.checked {
	background-color: #A3BE8C;
	border-color: #A3BE8C;
}

.task-name {
	font-size: 28rpx;
	color: #555;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.task-name.done {
	text-decoration: line-through;
	color: #ccc;
}

.task-tag {
	font-size: 22rpx;
	color: #888;
	padding: 4rpx 18rpx;
	border-radius: 20rpx;
	border: 2rpx solid #ddd;
	flex-shrink: 0;
	margin-left: 16rpx;
}

.tag-工作 {
	border-color: #EBCB8B;
	color: #EBCB8B;
}

.tag-生活 {
	border-color: #A3BE8C;
	color: #A3BE8C;
}

.tag-学习 {
	border-color: #88C0D0;
	color: #88C0D0;
}

.empty-hint {
	padding: 30rpx 0;
	text-align: center;
	color: #bbb;
	font-size: 26rpx;
}
</style>
