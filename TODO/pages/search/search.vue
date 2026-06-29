<template>
	<view class="page">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<uni-icons type="search" size="18" color="#888"></uni-icons>
			<input
				class="search-input"
				v-model="keyword"
				type="text"
				placeholder="搜索计划..."
				placeholder-class="ph"
				@input="onSearch"
			/>
		</view>

		<!-- 搜索结果 -->
		<view class="result-area">
			<view
				v-for="item in filteredTasks"
				:key="item.id"
				class="task-card"
				@click="goDetail(item)"
			>
				<text class="task-name">{{ item.name }}</text>
				<text class="task-tag">{{ item.type }}</text>
			</view>
			<view v-if="searched && filteredTasks.length === 0" class="empty-hint">未找到相关计划</view>
			<view v-if="!searched" class="empty-hint init">输入关键词搜索计划</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

const keyword = ref('')
const searched = ref(false)

const filteredTasks = computed(() => {
	if (!keyword.value.trim()) return []
	const kw = keyword.value.trim().toLowerCase()
	const tasks = uni.getStorageSync('tasks') || []
	return tasks.filter(t => t.name.toLowerCase().includes(kw) || t.type.toLowerCase().includes(kw))
})

function onSearch() {
	searched.value = true
}

function goDetail(item) {
	uni.navigateTo({
		url: '/pages/my_missions/my_missions?item=' + encodeURIComponent(JSON.stringify(item))
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

.search-bar {
	display: flex;
	align-items: center;
	background-color: #fff;
	border-radius: 20rpx;
	padding: 0 30rpx;
	height: 80rpx;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
	gap: 16rpx;
	margin-bottom: 30rpx;
}

.search-input {
	flex: 1;
	height: 100%;
	font-size: 28rpx;
	color: #2E3440;
}

.ph {
	color: #bbb;
	font-size: 28rpx;
}

.result-area {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.task-card {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 28rpx 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}

.task-name {
	font-size: 28rpx;
	color: #555;
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

.empty-hint {
	padding: 60rpx 0;
	text-align: center;
	color: #bbb;
	font-size: 28rpx;
}

.empty-hint.init {
	color: #ccc;
}
</style>
