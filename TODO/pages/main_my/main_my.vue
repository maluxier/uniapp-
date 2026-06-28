<template>
	<view class="page">
		<!-- 用户信息卡片 -->
		<view class="user-card">
			<view class="avatar">{{ userInitial }}</view>
			<view class="user-info">
				<text class="nickname">{{ nickname }}</text>
			</view>
		</view>

		<!-- 设置选项 -->
		<view class="settings-card">
			<view class="setting-item" @click="onSetting('account')">
				<text class="setting-label">账户设置</text>
				<uni-icons type="right" size="16" color="#ccc"></uni-icons>
			</view>
			<view class="setting-item" @click="onSetting('notification')">
				<text class="setting-label">通知设置</text>
				<uni-icons type="right" size="16" color="#ccc"></uni-icons>
			</view>
			<view class="setting-item" @click="onSetting('about')">
				<text class="setting-label">关于我们</text>
				<uni-icons type="right" size="16" color="#ccc"></uni-icons>
			</view>
		</view>

		<!-- 退出登录按钮 -->
		<view class="logout-btn" @click="handleLogout">退出登录</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const statusBarHeight = uni.$ui?.statusBarHeight || 44

const nickname = ref(uni.getStorageSync('currentUser')?.nickname || uni.getStorageSync('currentUser')?.account || '用户')
const userInitial = computed(() => nickname.value.charAt(0))

onShow(() => {
	const user = uni.getStorageSync('currentUser') || {}
	nickname.value = user.nickname || user.account || '用户'
})

function onSetting(type) {
	if (type === 'account') {
		uni.navigateTo({ url: '/pages/settings_ID/settings_ID' })
	} else if (type === 'notification') {
		uni.showToast({ title: '通知设置', icon: 'none' })
	} else if (type === 'about') {
		uni.showToast({ title: '关于我们', icon: 'none' })
	}
}

function handleLogout() {
	uni.showModal({
		title: '提示',
		content: '确定要退出登录吗？',
		success: (res) => {
			if (res.confirm) {
				uni.removeStorageSync('currentUser')
				uni.reLaunch({ url: '/pages/index/index' })
			}
		}
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

/* ===== 用户卡片 ===== */
.user-card {
	display: flex;
	align-items: center;
	gap: 28rpx;
	background-color: #fff;
	border-radius: 20rpx;
	padding: 32rpx 36rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}

.avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	background-color: #D8DEE9;
	color: #888;
	font-size: 40rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.nickname {
	font-size: 36rpx;
	font-weight: 700;
	color: #2E3440;
}

/* ===== 设置卡片 ===== */
.settings-card {
	background-color: #fff;
	border-radius: 20rpx;
	margin-bottom: 40rpx;
	box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
	overflow: hidden;
}

.setting-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 36rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.setting-item:last-child {
	border-bottom: none;
}

.setting-label {
	font-size: 30rpx;
	color: #2E3440;
}

/* ===== 退出登录 ===== */
.logout-btn {
	width: 100%;
	height: 96rpx;
	line-height: 96rpx;
	text-align: center;
	background-color: #BF616A;
	color: #fff;
	font-size: 34rpx;
	font-weight: 600;
	border-radius: 48rpx;
}
</style>
