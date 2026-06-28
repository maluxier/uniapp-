<template>
	<view class="page">
		<view class="settings-card">
			<!-- 头像 -->
			<view class="setting-item" @click="onChangeAvatar">
				<text class="setting-label">头像</text>
				<view class="setting-right">
					<view class="avatar">{{ userInitial }}</view>
					<uni-icons type="right" size="16" color="#ccc"></uni-icons>
				</view>
			</view>

			<!-- 昵称 -->
			<view class="setting-item" @click="onEditNickname">
				<text class="setting-label">昵称</text>
				<view class="setting-right">
					<text class="setting-value">{{ nickname }}</text>
					<uni-icons type="right" size="16" color="#ccc"></uni-icons>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentUser = uni.getStorageSync('currentUser') || {}
const nickname = ref(currentUser.nickname || currentUser.account || '昵称')
const userInitial = computed(() => nickname.value.charAt(0))

function onChangeAvatar() {
	uni.showToast({ title: '修改头像', icon: 'none' })
}

function onEditNickname() {
	uni.showModal({
		title: '修改昵称',
		editable: true,
		placeholderText: '请输入新昵称',
		success: (res) => {
			if (res.confirm && res.content) {
				nickname.value = res.content
				currentUser.nickname = res.content
				uni.setStorageSync('currentUser', currentUser)
				uni.showToast({ title: '昵称已更新', icon: 'success' })
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

.settings-card {
	background-color: #fff;
	border-radius: 20rpx;
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

.setting-right {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.setting-value {
	font-size: 28rpx;
	color: #888;
}

.avatar {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	background-color: #D8DEE9;
	color: #888;
	font-size: 30rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
</style>
