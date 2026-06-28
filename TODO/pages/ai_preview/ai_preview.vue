<template>
  <view class="page">
    <!-- 顶部 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <uni-icons type="arrowleft" size="22" color="#2E3440"></uni-icons>
      </view>
      <text class="page-title">计划预览</text>
      <view class="header-right">
        <text class="edit-all-btn" @click="toggleEditMode">{{ editMode ? '完成' : '编辑' }}</text>
      </view>
    </view>

    <!-- 摘要卡片 -->
    <view class="summary-card">
      <view class="summary-top">
        <text class="summary-title">{{ planTitle }}</text>
      </view>
      <view class="summary-stats">
        <view class="stat-item">
          <text class="stat-value">{{ confirmedCount }}/{{ allTasks.length }}</text>
          <text class="stat-label">已确认</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ totalEXP }}</text>
          <text class="stat-label">总经验值</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ totalAP }}</text>
          <text class="stat-label">总行动点</text>
        </view>
      </view>
    </view>

    <!-- 日期分组时间轴 -->
    <scroll-view
      class="timeline-scroll"
      scroll-y="true"
      :style="{ height: scrollHeight + 'px' }"
    >
      <view class="timeline">
        <view v-for="(group, gIndex) in groupedTasks" :key="gIndex" class="date-group">
          <!-- 日期标题 -->
          <view class="date-header">
            <view class="date-dot"></view>
            <text class="date-text">{{ formatDateDisplay(group.date) }}</text>
            <text class="date-weekday">{{ getWeekday(group.date) }}</text>
          </view>

          <!-- 该日期下的任务卡片 -->
          <view
            v-for="(item, index) in group.tasks"
            :key="item.id"
            class="task-card"
            :class="{
              confirmed: item._confirmed,
              removed: item._removed
            }"
          >
            <!-- 左侧时间轴连线 -->
            <view class="timeline-axis">
              <view class="axis-line" :class="{ first: index === 0, last: index === group.tasks.length - 1 }"></view>
              <view class="axis-dot" :class="{ active: item._confirmed }"></view>
            </view>

            <!-- 右侧卡片内容 -->
            <view class="card-body" @click="onCardClick(item, group, index)">
              <!-- 时间 -->
              <view class="card-time-row">
                <text class="card-time">{{ item.time }}</text>
                <view class="card-status-icon">
                  <text v-if="item._confirmed">✅</text>
                  <text v-else-if="item._removed">❌</text>
                </view>
              </view>

              <!-- 任务名 -->
              <text class="card-task">{{ item.task }}</text>

              <!-- 底部标签行 -->
              <view class="card-tags">
                <!-- 分类标签 -->
                <view class="tag tag-category" :style="{ backgroundColor: getCatColor(item.category) + '20', color: getCatColor(item.category) }">
                  <text>{{ getCatEmoji(item.category) }} {{ getCatLabel(item.category) }}</text>
                </view>

                <!-- AP 行动点 -->
                <view class="tag tag-ap">
                  <text v-for="n in 5" :key="n" class="ap-star" :class="{ filled: n <= item.ap }">⚡</text>
                </view>

                <!-- EXP -->
                <view class="tag tag-exp">
                  <text>+{{ item.exp }} EXP</text>
                </view>
              </view>

              <!-- 编辑模式下的操作按钮 -->
              <view v-if="editMode && !item._removed" class="card-actions">
                <view class="action-btn confirm-btn" @click.stop="confirmItem(item)">
                  <uni-icons type="checkmarkempty" size="16" color="#fff"></uni-icons>
                  <text>确认</text>
                </view>
                <view class="action-btn edit-inline-btn" @click.stop="openEditPopup(item, group, index)">
                  <uni-icons type="compose" size="14" color="#5E81AC"></uni-icons>
                  <text>编辑</text>
                </view>
                <view class="action-btn remove-btn" @click.stop="removeItem(item)">
                  <uni-icons type="closeempty" size="14" color="#BF616A"></uni-icons>
                  <text>删除</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="allTasks.length === 0" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-title">没有任务数据</text>
        <text class="empty-desc">AI 未能生成有效的任务计划，请返回重试</text>
      </view>
    </scroll-view>

    <!-- 底部固定栏 -->
    <view class="bottom-bar">
      <view class="select-all" @click="toggleSelectAll">
        <view class="checkbox" :class="{ checked: allConfirmed }">
          <uni-icons v-if="allConfirmed" type="checkmarkempty" size="16" color="#fff"></uni-icons>
        </view>
        <text class="select-text">全选</text>
      </view>
      <view class="confirm-all-btn" @click="handleConfirmAll">
        <text>一键确认全部 ({{ confirmedCount }})</text>
      </view>
    </view>

    <!-- 编辑弹窗 -->
    <view v-if="showEditPopup" class="popup-mask" @click="showEditPopup = false">
      <view class="popup-card" @click.stop>
        <text class="popup-title">编辑任务</text>
        <view class="popup-form">
          <view class="popup-field">
            <text class="popup-label">时间段</text>
            <input class="popup-input" v-model="editForm.time" placeholder="09:00-10:30" />
          </view>
          <view class="popup-field">
            <text class="popup-label">任务名称</text>
            <input class="popup-input" v-model="editForm.task" placeholder="任务描述" />
          </view>
          <view class="popup-field">
            <text class="popup-label">分类</text>
            <view class="popup-cats">
              <view
                v-for="cat in validCats"
                :key="cat"
                class="popup-cat"
                :class="{ active: editForm.category === cat }"
                @click="editForm.category = cat"
              >
                <text>{{ getCatEmoji(cat) }} {{ getCatLabel(cat) }}</text>
              </view>
            </view>
          </view>
          <view class="popup-field-row">
            <view class="popup-field half">
              <text class="popup-label">AP (1-5)</text>
              <input class="popup-input" type="number" v-model.number="editForm.ap" placeholder="3" />
            </view>
            <view class="popup-field half">
              <text class="popup-label">EXP</text>
              <input class="popup-input" type="number" v-model.number="editForm.exp" placeholder="50" />
            </view>
          </view>
        </view>
        <view class="popup-btns">
          <view class="popup-btn cancel" @click="showEditPopup = false">取消</view>
          <view class="popup-btn save" @click="saveEdit">保存</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCategoryInfo, getValidCategories } from '@/api/llm.js'

// ===== 常量 =====
const validCats = getValidCategories()

// ===== 数据 =====
const allTasks = ref([])       // 所有任务
const planParams = ref(null)   // 原始表单参数
const editMode = ref(false)    // 是否编辑模式
const showEditPopup = ref(false)
const editForm = ref({})
const editingItem = ref(null)
const editingGroup = ref(null)
const editingIndex = ref(-1)

// ===== 生命周期 =====
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const rawTasks = currentPage.$page?.options?.tasks
  const rawParams = currentPage.$page?.options?.params

  if (rawTasks) {
    try {
      const tasks = JSON.parse(decodeURIComponent(rawTasks))
      // 添加前端确认标记
      tasks.forEach(t => {
        t._confirmed = true   // 默认全部确认
        t._removed = false
      })
      allTasks.value = tasks
    } catch (e) {
      console.error('任务数据解析失败:', e)
      allTasks.value = []
    }
  }

  if (rawParams) {
    try {
      planParams.value = JSON.parse(decodeURIComponent(rawParams))
    } catch (e) {
      planParams.value = null
    }
  }
})

// ===== 计算属性 =====
const planTitle = computed(() => {
  if (planParams.value) {
    return planParams.value.goal || 'AI 生成计划'
  }
  return 'AI 生成计划'
})

// 按日期分组
const groupedTasks = computed(() => {
  const tasks = allTasks.value.filter(t => !t._removed)

  // AI 可能没有 date 字段，按时间顺序模拟分组
  // 如果有 date 字段就按 date 分组，否则全部归到计划开始日期
  const groups = {}
  const baseDate = planParams.value?.startDate || ''

  tasks.forEach(t => {
    const date = t.date || baseDate || '待定'
    if (!groups[date]) groups[date] = []
    groups[date].push(t)
  })

  // 保持日期顺序
  return Object.keys(groups).sort().map(date => ({
    date,
    tasks: groups[date]
  }))
})

const confirmedCount = computed(() => allTasks.value.filter(t => t._confirmed && !t._removed).length)

const allConfirmed = computed(() => {
  const visible = allTasks.value.filter(t => !t._removed)
  return visible.length > 0 && visible.every(t => t._confirmed)
})

const totalEXP = computed(() => {
  return allTasks.value
    .filter(t => t._confirmed && !t._removed)
    .reduce((sum, t) => sum + (t.exp || 0), 0)
})

const totalAP = computed(() => {
  return allTasks.value
    .filter(t => t._confirmed && !t._removed)
    .reduce((sum, t) => sum + (t.ap || 0), 0)
})

// 滚动区高度（减去顶部摘要和底部栏）
const scrollHeight = computed(() => {
  // uni-app 中可用 uni.getSystemInfoSync 获取屏幕高度
  const sysInfo = uni.getSystemInfoSync()
  // 顶部 ~300rpx + 底部 ~140rpx，rpx 到 px 按屏幕宽度换算
  const rpxRatio = sysInfo.screenWidth / 750
  const topHeight = 300 * rpxRatio
  const bottomHeight = 140 * rpxRatio
  return sysInfo.windowHeight - topHeight - bottomHeight
})

// ===== 分类辅助 =====
function getCatLabel(key) {
  return getCategoryInfo(key).label
}

function getCatColor(key) {
  return getCategoryInfo(key).color
}

function getCatEmoji(key) {
  return getCategoryInfo(key).icon
}

// ===== 日期格式化 =====
function formatDateDisplay(dateStr) {
  if (!dateStr || dateStr === '待定') return dateStr
  // 2026-06-30 → 6月30日
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parseInt(parts[1])}月${parseInt(parts[2])}日`
  }
  return dateStr
}

function getWeekday(dateStr) {
  if (!dateStr || dateStr === '待定') return ''
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const d = new Date(dateStr)
  return weekdays[d.getDay()] || ''
}

// ===== 卡片点击（非编辑模式暂不处理，后续可跳详情） =====
function onCardClick(item, group, index) {
  // 预留：后续可跳转到任务详情页
}

// ===== 确认/取消确认 =====
function confirmItem(item) {
  item._confirmed = !item._confirmed
}

function removeItem(item) {
  uni.showModal({
    title: '删除任务',
    content: `确定要删除「${item.task}」吗？`,
    success: (res) => {
      if (res.confirm) {
        item._removed = true
        item._confirmed = false
      }
    }
  })
}

// ===== 编辑弹窗 =====
function openEditPopup(item, group, index) {
  editingItem.value = item
  editingGroup.value = group
  editingIndex.value = index
  editForm.value = {
    time: item.time || '',
    task: item.task || '',
    category: item.category || 'study',
    ap: item.ap || 3,
    exp: item.exp || 50
  }
  showEditPopup.value = true
}

function saveEdit() {
  if (!editForm.value.task.trim()) {
    uni.showToast({ title: '任务名不能为空', icon: 'none' })
    return
  }
  if (!editForm.value.time.trim()) {
    uni.showToast({ title: '时间段不能为空', icon: 'none' })
    return
  }

  const item = editingItem.value
  if (item) {
    item.time = editForm.value.time.trim()
    item.task = editForm.value.task.trim()
    item.category = editForm.value.category
    item.ap = Math.max(1, Math.min(5, Number(editForm.value.ap) || 3))
    item.exp = Math.max(0, Number(editForm.value.exp) || 50)
    item._isEdited = true
  }

  showEditPopup.value = false
  uni.showToast({ title: '已更新', icon: 'success' })
}

// ===== 全选/取消 =====
function toggleSelectAll() {
  const visible = allTasks.value.filter(t => !t._removed)
  const allChecked = visible.every(t => t._confirmed)

  visible.forEach(t => {
    t._confirmed = !allChecked
  })
}

function toggleEditMode() {
  editMode.value = !editMode.value
}

// ===== 一键确认全部 =====
function handleConfirmAll() {
  const confirmedTasks = allTasks.value.filter(t => t._confirmed && !t._removed)

  if (confirmedTasks.length === 0) {
    uni.showToast({ title: '请至少确认一条任务', icon: 'none' })
    return
  }

  // 为每条任务补充日期（如果没有）
  const today = new Date()
  confirmedTasks.forEach((t, i) => {
    if (!t.date && planParams.value?.startDate) {
      t.date = planParams.value.startDate
    }
    if (!t.date) {
      // 按顺序往后排日期
      const d = new Date(today)
      d.setDate(d.getDate() + Math.floor(i / 4)) // 每天约4条任务
      t.date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
    t.status = 0
    t.isAIGenerated = true
  })

  // 保存到本地存储
  let existingTasks = uni.getStorageSync('tasks') || []

  // 避免重复添加（按 id 去重）
  const existingIds = new Set(existingTasks.map(t => t.id))
  const newTasks = confirmedTasks.filter(t => !existingIds.has(t.id))

  existingTasks = [...existingTasks, ...newTasks]
  uni.setStorageSync('tasks', existingTasks)

  // 记录已生成计划（供历史存档使用）
  saveToHistory(confirmedTasks)

  uni.showToast({ title: `已确认 ${confirmedTasks.length} 条任务`, icon: 'success' })
  setTimeout(() => {
    uni.switchTab({ url: '/pages/main_mission/main_mission' })
  }, 800)
}

// ===== 历史存档 =====
function saveToHistory(tasks) {
  const history = uni.getStorageSync('planHistory') || []
  history.unshift({
    id: Date.now(),
    title: planTitle.value,
    createdAt: new Date().toISOString(),
    taskCount: tasks.length,
    totalEXP: tasks.reduce((s, t) => s + (t.exp || 0), 0),
    tasks: tasks
  })
  // 最多保留 20 条
  if (history.length > 20) history.length = 20
  uni.setStorageSync('planHistory', history)
}

// ===== 返回 =====
function goBack() {
  // 有已编辑数据时提示
  uni.showModal({
    title: '返回修改',
    content: '返回将丢弃当前 AI 生成结果，确定吗？',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack({ delta: 2 }) // 跳过加载页，回到表单页
      }
    }
  })
}
</script>

<style>
.page {
  min-height: 100vh;
  background-color: #ECEFF4;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* ===== 顶部 ===== */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 30rpx 20rpx;
  background-color: #ECEFF4;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #2E3440;
}

.header-right {
  min-width: 80rpx;
  text-align: right;
}

.edit-all-btn {
  font-size: 26rpx;
  color: #5E81AC;
  font-weight: 500;
}

/* ===== 摘要卡片 ===== */
.summary-card {
  margin: 0 30rpx 24rpx;
  background: linear-gradient(135deg, #5E81AC, #81A1C1);
  border-radius: 24rpx;
  padding: 28rpx 32rpx;
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(94,129,172,0.3);
}

.summary-top {
  margin-bottom: 20rpx;
}

.summary-title {
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.summary-stats {
  display: flex;
  align-items: center;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 700;
  display: block;
}

.stat-label {
  font-size: 22rpx;
  opacity: 0.8;
  margin-top: 4rpx;
  display: block;
}

.stat-divider {
  width: 2rpx;
  height: 50rpx;
  background-color: rgba(255,255,255,0.25);
}

/* ===== 时间轴滚动区 ===== */
.timeline-scroll {
  flex: 1;
  padding: 0 30rpx;
}

.timeline {
  padding-bottom: 40rpx;
}

/* ===== 日期标题 ===== */
.date-group {
  margin-bottom: 8rpx;
}

.date-header {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 24rpx 0 20rpx 0;
}

.date-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #5E81AC;
  flex-shrink: 0;
}

.date-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #2E3440;
}

.date-weekday {
  font-size: 24rpx;
  color: #888;
}

/* ===== 任务卡片 ===== */
.task-card {
  display: flex;
  padding-bottom: 8rpx;
}

.task-card.removed {
  display: none;
}

/* 左侧时间轴 */
.timeline-axis {
  width: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  margin-right: 24rpx;
}

.axis-line {
  width: 3rpx;
  flex: 1;
  background-color: #d0d0d0;
  min-height: 20rpx;
}

.axis-line.first {
  background: linear-gradient(to bottom, transparent, #d0d0d0);
}

.axis-line.last {
  background: linear-gradient(to bottom, #d0d0d0, transparent);
}

.axis-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #d0d0d0;
  border: 3rpx solid #ECEFF4;
  flex-shrink: 0;
  margin: 8rpx 0;
}

.axis-dot.active {
  background-color: #A3BE8C;
  border-color: #ECEFF4;
}

/* 右侧卡片 */
.card-body {
  flex: 1;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 24rpx 28rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
  min-width: 0;
}

.task-card.confirmed .card-body {
  border-left: 6rpx solid #A3BE8C;
}

.card-time-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.card-time {
  font-size: 24rpx;
  color: #5E81AC;
  font-weight: 600;
}

.card-status-icon {
  font-size: 24rpx;
}

.card-task {
  font-size: 30rpx;
  font-weight: 600;
  color: #2E3440;
  line-height: 1.5;
  margin-bottom: 16rpx;
  display: block;
}

/* 标签行 */
.card-tags {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.tag {
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
  white-space: nowrap;
}

.tag-category {
  font-size: 22rpx;
}

.tag-ap {
  display: flex;
  gap: 2rpx;
}

.ap-star {
  font-size: 20rpx;
  opacity: 0.25;
}

.ap-star.filled {
  opacity: 1;
}

.tag-exp {
  background-color: #f5f0e8;
  color: #D08770;
  font-weight: 600;
}

/* ===== 编辑模式操作按钮 ===== */
.card-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 10rpx 24rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.confirm-btn {
  background-color: #A3BE8C;
  color: #fff;
}

.edit-inline-btn {
  background-color: #E1ECF4;
  color: #5E81AC;
}

.remove-btn {
  background-color: #fce8e8;
  color: #BF616A;
}

/* ===== 空状态 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 60rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2E3440;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999;
  text-align: center;
  line-height: 1.5;
}

/* ===== 底部固定栏 ===== */
.bottom-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: #fff;
  gap: 16rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.04);
}

.select-all {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-shrink: 0;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox.checked {
  background-color: #A3BE8C;
  border-color: #A3BE8C;
}

.select-text {
  font-size: 26rpx;
  color: #555;
}

.confirm-all-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: linear-gradient(135deg, #A3BE8C, #8FBCBB);
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  border-radius: 40rpx;
}

.confirm-all-btn:active {
  opacity: 0.85;
}

/* ===== 编辑弹窗 ===== */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}

.popup-card {
  width: 100%;
  background-color: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 36rpx 30rpx;
  padding-bottom: calc(36rpx + env(safe-area-inset-bottom));
  max-height: 80vh;
  overflow-y: auto;
}

.popup-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #2E3440;
  text-align: center;
  margin-bottom: 28rpx;
  display: block;
}

.popup-form {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.popup-field {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.popup-field.half {
  flex: 1;
}

.popup-field-row {
  display: flex;
  gap: 20rpx;
}

.popup-label {
  font-size: 26rpx;
  font-weight: 500;
  color: #555;
}

.popup-input {
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  height: 80rpx;
  font-size: 28rpx;
  color: #2E3440;
}

.popup-cats {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.popup-cat {
  padding: 10rpx 24rpx;
  border-radius: 20rpx;
  background-color: #f5f5f5;
  font-size: 24rpx;
  color: #888;
}

.popup-cat.active {
  background-color: #5E81AC;
  color: #fff;
}

.popup-btns {
  display: flex;
  gap: 20rpx;
  margin-top: 28rpx;
}

.popup-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.popup-btn.cancel {
  background-color: #f5f5f5;
  color: #888;
}

.popup-btn.save {
  background-color: #5E81AC;
  color: #fff;
}
</style>
