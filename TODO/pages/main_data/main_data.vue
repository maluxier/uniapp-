<template>
	<view class="page">
		<!-- 顶部：标题 -->
		<view class="header">
			<text class="page-title">日程</text>
		</view>

		<!-- 日历卡片 -->
		<view class="calendar-card">
			<!-- 月份导航 -->
			<view class="cal-header">
				<text class="cal-nav-arrow" @click="prevMonth">&lt;</text>
				<text class="cal-year-month">{{ yearMonth }}</text>
				<text class="cal-nav-arrow" @click="nextMonth">&gt;</text>
			</view>

			<!-- 星期行 -->
			<view class="week-row">
				<text v-for="w in weekDays" :key="w" class="week-text">{{ w }}</text>
			</view>

			<!-- 日期网格 -->
			<view class="date-grid">
				<text
					v-for="(d, i) in dateCells"
					:key="i"
					class="date-cell"
					:class="{
						'date-other': !d.isCurrent,
						'date-selected': d.isSelected,
						'date-today': d.isToday
					}"
					@click="selectDate(d)"
				>{{ d.day }}</text>
			</view>
		</view>

		<!-- 任务列表 -->
		<view class="section-title">任务列表</view>
		<view class="task-list">
			<view
				v-for="item in selectedDateTasks"
				:key="item.id"
				class="task-card"
				@click="goDetail(item)"
			>
				<text class="task-name">{{ item.name }}</text>
				<text class="task-tag" :class="'tag-' + item.type">{{ item.type }}</text>
			</view>
			<view v-if="selectedDateTasks.length === 0" class="empty-hint">当日暂无任务</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())
const selectedDay = ref(today.getDate())

const yearMonth = computed(() => {
	const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
	return `${months[currentMonth.value]} ${currentYear.value}`
})

const dateCells = computed(() => {
	const year = currentYear.value
	const month = currentMonth.value
	const firstDay = new Date(year, month, 1).getDay()
	const daysInMonth = new Date(year, month + 1, 0).getDate()
	const daysInPrev = new Date(year, month, 0).getDate()

	const cells = []
	for (let i = firstDay - 1; i >= 0; i--) {
		cells.push({ day: daysInPrev - i, isCurrent: false, date: '', isToday: false, isSelected: false })
	}
	for (let d = 1; d <= daysInMonth; d++) {
		const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
		const isToday = year === today.getFullYear() && month === today.getMonth() && d === today.getDate()
		const isSelected = d === selectedDay.value
		cells.push({ day: d, isCurrent: true, date: dateStr, isToday, isSelected })
	}
	const remaining = 42 - cells.length
	for (let d = 1; d <= remaining; d++) {
		cells.push({ day: d, isCurrent: false, date: '', isToday: false, isSelected: false })
	}
	return cells
})

function selectDate(d) {
	selectedDay.value = d.day
	if (!d.isCurrent) {
		d.day > 15 ? prevMonth() : nextMonth()
		selectedDay.value = 1
	}
}

function prevMonth() {
	if (currentMonth.value === 0) {
		currentMonth.value = 11
		currentYear.value--
	} else {
		currentMonth.value--
	}
	selectedDay.value = 1
}

function nextMonth() {
	if (currentMonth.value === 11) {
		currentMonth.value = 0
		currentYear.value++
	} else {
		currentMonth.value++
	}
	selectedDay.value = 1
}

const allTasks = ref([])

onShow(() => {
	allTasks.value = uni.getStorageSync('tasks') || []
})

const selectedDateTasks = computed(() => {
	const selDate = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2,'0')}-${String(selectedDay.value).padStart(2,'0')}`
	return allTasks.value.filter(t => t.startDate && t.endDate && t.startDate <= selDate && selDate <= t.endDate)
})

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

.calendar-card {
	background-color: #fff;
	border-radius: 20rpx;
	padding: 30rpx 24rpx 20rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}

.cal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;
	padding: 0 8rpx;
}

.cal-year-month {
	font-size: 30rpx;
	font-weight: 700;
	color: #2E3440;
}

.cal-nav-arrow {
	font-size: 36rpx;
	color: #5E81AC;
	font-weight: 600;
	padding: 0 12rpx;
}

.week-row {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	text-align: center;
	margin-bottom: 12rpx;
}

.week-text {
	font-size: 22rpx;
	color: #888;
	font-weight: 500;
}

.date-grid {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	text-align: center;
	gap: 8rpx 0;
}

.date-cell {
	font-size: 28rpx;
	color: #888;
	padding: 10rpx 0;
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto;
	border-radius: 50%;
}

.date-other {
	color: #ddd;
}

.date-today {
	color: #5E81AC;
	font-weight: 600;
}

.date-selected {
	background-color: #5E81AC;
	color: #fff;
	font-weight: 600;
}

.section-title {
	font-size: 32rpx;
	font-weight: 700;
	color: #2E3440;
	margin-bottom: 20rpx;
}

.task-list {
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
	background-color: #fff;
	border-radius: 16rpx;
}
</style>
