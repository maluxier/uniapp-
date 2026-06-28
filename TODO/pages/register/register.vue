<template>
	<view class="page">
		<view class="brand">
			<text class="brand-text">TODO</text>
		</view>

		<view class="welcome">
			<text class="welcome-title">创建账号</text>
			<text class="welcome-sub">注册以开始使用</text>
		</view>

		<view class="form">
			<view class="input-group">
				<input class="input-field" type="text" v-model="nickname" placeholder="昵称" placeholder-class="ph" />
			</view>
			<view class="input-group">
				<input class="input-field" type="text" v-model="account" placeholder="账号" placeholder-class="ph" />
			</view>
			<view class="input-group">
				<input class="input-field" :type="showPwd ? 'text' : 'password'" v-model="password" placeholder="密码" placeholder-class="ph" />
			</view>
			<view class="input-group">
				<input class="input-field" :type="showConfirm ? 'text' : 'password'" v-model="confirmPwd" placeholder="确认密码" placeholder-class="ph" />
			</view>

			<button class="register-btn" @click="handleRegister">注册</button>
		</view>

		<view class="footer">
			<text class="footer-text">已有账号？</text>
			<text class="footer-link" @click="goLogin">登录</text>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'

const nickname = ref('')
const account = ref('')
const password = ref('')
const confirmPwd = ref('')
const showPwd = ref(false)
const showConfirm = ref(false)

function handleRegister() {
	const nick = nickname.value.trim()
	const acc = account.value.trim()
	const pwd = password.value
	const confirm = confirmPwd.value

	if (!nick || !acc || !pwd || !confirm) {
		uni.showToast({ title: '请填写所有字段', icon: 'none' })
		return
	}
	if (pwd !== confirm) {
		uni.showToast({ title: '两次密码不一致', icon: 'none' })
		return
	}

	const users = uni.getStorageSync('users') || []
	if (users.some(u => u.account === acc)) {
		uni.showToast({ title: '账号已存在', icon: 'none' })
		return
	}

	users.push({ nickname: nick, account: acc, password: pwd })
	uni.setStorageSync('users', users)

	uni.showToast({ title: '注册成功', icon: 'success' })
	setTimeout(() => uni.navigateBack(), 800)
}

function goLogin() {
	uni.navigateBack()
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
	gap: 28rpx;
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

.register-btn {
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

.register-btn::after {
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
