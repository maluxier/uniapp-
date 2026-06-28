<template>
	<view class="container">
		<!-- 屏幕中心的 TODO -->
		<view class="center-area">
			<text class="todo-text">TODO</text>
		</view>

		<!-- 底部并排按钮 -->
		<view class="bottom-buttons">
			<button class="btn login-btn" @click="goLogin">登录</button>
			<button class="btn register-btn" @click="goRegister">注册</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {}
		},
		onLoad() {

		},
		methods: {
			goLogin() {
				// TODO: 跳转到登录页
				uni.showToast({ title: '登录', icon: 'none' })
			},
			goRegister() {
				// TODO: 跳转到注册页
				uni.showToast({ title: '注册', icon: 'none' })
			}
		}
	}
</script>

<style>
	.container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100vh;
		background-color: #ECEFF4;
	}

	.center-area {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.todo-text {
		font-size: 120rpx;
		font-weight: bold;
		color: #2E3440;
		letter-spacing: 20rpx;
	}

	.bottom-buttons {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		width: 100%;
		padding: 40rpx 60rpx;
		padding-bottom: 80rpx;
	}

	.btn {
		flex: 1;
		margin: 0 20rpx;
		height: 88rpx;
		line-height: 88rpx;
		font-size: 32rpx;
		border-radius: 44rpx;
		text-align: center;
	}

	.login-btn {
		background-color: #5E81AC;
		color: #ffffff;
	}

	.register-btn {
		background-color: #ffffff;
		color: #2E3440;
		;
	}
</style>
