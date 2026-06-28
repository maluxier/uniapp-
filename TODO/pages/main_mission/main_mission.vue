<template>
	<view class="page">
		<!-- 顶部：标题 + 添加按钮 -->
		<view class="header">
			<text class="page-title">我的计划</text>
			<view class="add-btn" @click="onAdd">
				<text class="add-icon">+</text>
			</view>
		</view>

		<!-- 分类筛选标签 -->
		<scroll-view class="filter-scroll" scroll-x="true" show-scrollbar="false">
			<view class="filter-row">
				<view
					v-for="cat in categories"
					:key="cat"
					class="filter-tag"
					:class="{ active: activeCategory === cat }"
					@click="activeCategory = cat"
				>
					<text>{{ cat }}</text>
				</view>
			</view>
		</scroll-view>

		<!-- 任务卡片列表 -->
		<view class="card-list">
			<!-- 今日任务 -->
			<uni-card :is-shadow="true" :margin="'0 0 24rpx 0'" :padding="'0rpx 20rpx'">
				<template #title>
					<text class="card-title">今日任务</text>
				</template>
				<view class="task-items">
					<view
						v-for="item in todayTasks"
						:key="item.id"
						class="task-item"
						@click="onTaskClick(item)"
					>
						<view class="task-left">
							<view
								class="task-radio"
								:class="{ checked: item.done }"
								@click.stop="toggleTask(item)"
							>
								<uni-icons v-if="item.done" type="checkmarkempty" size="14" color="#fff"></uni-icons>
							</view>
							<text class="task-name" :class="{ done: item.done }">{{ item.name }}</text>
						</view>
						<text class="task-tag">{{ item.type }}</text>
					</view>
					<view v-if="todayTasks.length === 0" class="empty-hint">
						<text>暂无今日任务</text>
					</view>
				</view>
			</uni-card>

			<!-- 明日任务 -->
			<uni-card :is-shadow="true" :margin="'0 0 24rpx 0'" :padding="'24rpx 20rpx'">
				<template #title>
					<text class="card-title">明日任务</text>
				</template>
				<view class="task-items">
					<view
						v-for="item in tomorrowTasks"
						:key="item.id"
						class="task-item"
						@click="onTaskClick(item)"
					>
						<view class="task-left">
							<view
								class="task-radio"
								:class="{ checked: item.done }"
								@click.stop="toggleTask(item)"
							>
								<uni-icons v-if="item.done" type="checkmarkempty" size="14" color="#fff"></uni-icons>
							</view>
							<text class="task-name" :class="{ done: item.done }">{{ item.name }}</text>
						</view>
						<text class="task-tag">{{ item.type }}</text>
					</view>
					<view v-if="tomorrowTasks.length === 0" class="empty-hint">
						<text>暂无明日任务</text>
					</view>
				</view>
			</uni-card>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const categories = ['全部', '工作', '生活', '学习']
const activeCategory = ref('全部')

const tasks = ref(uni.getStorageSync('tasks') || [])

onShow(() => {
	tasks.value = uni.getStorageSync('tasks') || []
})

const filteredTasks = computed(() => {
	if (activeCategory.value === '全部') return tasks.value
	return tasks.value.filter(t => t.type === activeCategory.value)
})

const todayTasks = computed(() => filteredTasks.value.filter(t => t.deadline === 'today'))
const tomorrowTasks = computed(() => filteredTasks.value.filter(t => t.deadline === 'tomorrow'))

function toggleTask(item) {
	item.done = !item.done
	uni.setStorageSync('tasks', tasks.value)
}

function onTaskClick(item) {
}

function onAdd() {
	uni.navigateTo({ url: '/pages/add_mission/add_mission' })
}
</script>

<style>
.page {
	min-height: 100vh;
	padding: 30rpx 30rpx 40rpx;
	background-color: #ECEFF4;
	box-sizing: border-box;
}

.uni-card {
	border-radius: 20rpx !important;
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

.add-btn {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	background-color: #5E81AC;
	display: flex;
	align-items: center;
	justify-content: center;
}

.add-icon {
	font-size: 48rpx;
	color: #fff;
	font-weight: 700;
	line-height: 1;
	margin-top: -4rpx;
}

.filter-scroll {
	width: 100%;
	margin-bottom: 30rpx;
	overflow: hidden;
}

.filter-row {
	display: flex;
	gap: 16rpx;
	white-space: nowrap;
}

.filter-tag {
	padding: 12rpx 32rpx;
	border-radius: 30rpx;
	background-color: #fff;
	color: #888;
	font-size: 26rpx;
	flex-shrink: 0;
}

.filter-tag.active {
	background-color: #5E81AC;
	color: #fff;
	font-weight: 500;
}

.card-list {
	display: flex;
	flex-direction: column;
}

.card-title {
	font-size: 32rpx;
	font-weight: 700;
	color: #2E3440;
}

.task-items {
	display: flex;
	flex-direction: column;
	gap: 0;
	margin-top: 16rpx;
}

.task-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
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

.empty-hint {
	padding: 30rpx 0;
	text-align: center;
	color: #bbb;
	font-size: 26rpx;
}
</style>
