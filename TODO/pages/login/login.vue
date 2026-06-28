<template>
	<view class="page">
		

		<view class="welcome">
			<text class="welcome-title">欢迎回来！</text>
			<text class="welcome-sub">登录以继续使用</text>
		</view>

		<view class="form">
			<view class="input-group">
				<input class="input-field" type="text" v-model="account" placeholder="账号" placeholder-class="ph" />
			</view>
			<view class="input-group">
				<input class="input-field" :type="showPwd ? 'text' : 'password'" v-model="password" placeholder="密码" placeholder-class="ph" />
			</view>

			<button class="login-btn" @click="handleLogin">登录</button>
		</view>

		<view class="footer">
			<text class="footer-text">还没有账号？</text>
			<text class="footer-link" @click="goRegister">注册账号</text>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'

const account = ref('')
const password = ref('')
const showPwd = ref(false)

function handleLogin() {
	const acc = account.value.trim()
	const pwd = password.value

	if (!acc || !pwd) {
		uni.showToast({ title: '请填写账号和密码', icon: 'none' })
		return
	}

	const users = uni.getStorageSync('users') || []
	const user = users.find(u => u.account === acc && u.password === pwd)

	if (!user) {
		uni.showToast({ title: '账号或密码错误', icon: 'none' })
		return
	}

	uni.setStorageSync('currentUser', user)
	uni.showToast({ title: '登录成功', icon: 'success' })
	setTimeout(() => uni.reLaunch({ url: '/pages/main_mission/main_mission' }), 800)
}

function goRegister() {
	uni.navigateTo({ url: '/pages/register/register' })
}
</script>

<style>
.page {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100vh;
	padding: 0 60rpx;
	background-color: #ECEFF4;
	box-sizing: border-box;
}

.brand {
	margin-bottom: 40rpx;
}

.brand-text {
	font-size: 80rpx;
	font-weight: bold;
	color: #2E3440;
	letter-spacing: 16rpx;
}

.welcome {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 60rpx;
}

.welcome-title {
	font-size: 60rpx;
	font-weight: 600;
	color: #2E3440;
	margin-bottom: 12rpx;
}

.welcome-sub {
	font-size: 28rpx;
	color: #888;
}

.form {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 32rpx;
}

.input-group {
	display: flex;
	align-items: center;
	background-color: #fff;
	border-radius: 16rpx;
	padding: 0 30rpx;
	height: 100rpx;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}

.input-field {
	flex: 1;
	height: 100%;
	font-size: 30rpx;
	color: #2E3440;
}

.ph {
	color: #bbb;
	font-size: 30rpx;
}

.login-btn {
	width: 100%;
	height: 96rpx;
	line-height: 96rpx;
	background-color: #5E81AC;
	color: #fff;
	font-size: 34rpx;
	border-radius: 48rpx;
	margin-top: 20rpx;
	border: none;
	text-align: center;
	font-weight: 500;
}

.login-btn::after {
	border: none;
}

.footer {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 60rpx;
	gap: 8rpx;
}

.footer-text {
	font-size: 28rpx;
	color: #888;
}

.footer-link {
	font-size: 28rpx;
	color: #5E81AC;
	font-weight: 500;
}
</style>
