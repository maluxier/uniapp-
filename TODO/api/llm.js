/**
 * api/llm.js — LLM 直调核心模块
 *
 * 职责：
 * 1. 从本地存储读取用户配置的 API Key / Endpoint / Model
 * 2. 根据表单参数拼装高质量 Prompt
 * 3. uni.request 直调 LLM API（兼容 OpenAI / DeepSeek 格式）
 * 4. 响应清洗：正则提取 JSON → 去除尾随逗号 → JSON.parse → 字段校验
 * 5. 没有 Key 时降级为 Mock 模式
 * 6. 统一错误处理
 */

// ==================== Mock 数据（开发 / 无 Key 时使用） ====================

const MOCK_TASKS = [
  {
    time: '09:00-10:30',
    task: '收集PPT所需的素材与数据资料，整理归档',
    category: 'study',
    ap: 2,
    exp: 40,
    status: 0
  },
  {
    time: '10:30-12:00',
    task: '搭建PPT整体框架与大纲结构',
    category: 'work',
    ap: 3,
    exp: 50,
    status: 0
  },
  {
    time: '12:00-13:30',
    task: '午餐休息，适当放松恢复精力',
    category: 'life',
    ap: 1,
    exp: 10,
    status: 0
  },
  {
    time: '13:30-15:00',
    task: '撰写PPT核心内容的初稿（市场分析部分）',
    category: 'work',
    ap: 4,
    exp: 70,
    status: 0
  },
  {
    time: '15:00-16:30',
    task: '设计PPT视觉元素与排版方案',
    category: 'work',
    ap: 3,
    exp: 50,
    status: 0
  },
  {
    time: '16:30-17:30',
    task: '回顾当日产出，列明日待办清单',
    category: 'study',
    ap: 2,
    exp: 30,
    status: 0
  }
]

// ==================== 分类映射 ====================

/**
 * category 中文映射表
 * 前端展示用中文，AI 返回英文标签，这里做双向映射
 */
const CATEGORY_MAP = {
  study: { label: '学习', color: '#5E81AC', icon: '📚' },
  work: { label: '工作', color: '#BF616A', icon: '💼' },
  sports: { label: '运动', color: '#A3BE8C', icon: '🏃' },
  life: { label: '生活', color: '#EBCB8B', icon: '🏠' },
  rest: { label: '休息', color: '#D08770', icon: '☕' }
}

const VALID_CATEGORIES = Object.keys(CATEGORY_MAP)

// ==================== 配置读取 ====================

/**
 * 从本地存储读取用户配置的 AI 参数
 * @returns {Object} { apiKey, endpoint, model }
 */
function getUserAIConfig() {
  const config = uni.getStorageSync('aiConfig')
  return config || {}
}

/**
 * 检查用户是否已配置 API Key
 */
function hasAPIKey() {
  const config = getUserAIConfig()
  return !!(config && config.apiKey && config.apiKey.trim())
}

// ==================== Prompt 拼装 ====================

/**
 * 拼装 System Prompt
 * 核心：强制 LLM 输出严格的 JSON 数组
 */
function buildSystemPrompt() {
  return `你是一位专业的日程规划师，精通时间管理和任务分解。
你需要根据用户的目标和时间条件，生成一份科学合理的每日任务计划。

## 输出要求
你必须返回一个严格的 JSON 数组，不要包含任何 markdown 代码块标记或解释性文字。
数组中每个元素是一个任务对象，包含以下字段：

{
  "time": "09:00-10:30",        // 时间节点，格式 HH:MM-HH:MM
  "task": "具体任务描述",         // 简短清晰的任务名称
  "category": "study",           // 分类：study/work/sports/life/rest
  "ap": 3,                       // 行动点（精力消耗），1=极轻松 2=轻松 3=中等 4=较难 5=非常消耗
  "exp": 50,                     // 完成后可获得的经验值
  "status": 0                    // 0=待完成 1=进行中 2=已完成
}

## 规划原则
1. 根据用户的专注力时段分配高难度任务（ap≥3）到高效时间段
2. 每 45-90 分钟设置一个任务节点，任务之间留适当缓冲或休息时间
3. study 和 work 类型任务 ap 值一般在 3-5，exp 值 40-80
4. life 和 rest 类型任务 ap 值 1-2，exp 值 10-30
5. sports 类型任务 ap 值 2-4，exp 值 30-60
6. 任务数量根据每日可用时间合理分配（一般 4-8 个）

## 严格限制
- 只返回 JSON 数组本身，不要任何其他文字
- JSON 必须合法可解析，不要有尾随逗号`
}

/**
 * 拼装 User Prompt（注入用户的具体参数）
 * @param {Object} params - 表单参数 { goal, startDate, endDate, dailyHours, focusPreference }
 */
function buildUserPrompt(params) {
  const focusMap = {
    morning: '清晨高效型（早晨 6:00-10:00 精力最充沛、思维最清晰）',
    forenoon: '上午工作型（上午 9:00-12:00 专注力最佳）',
    night: '夜猫子型（晚间 19:00-23:00 创造力和效率最高）',
    flexible: '灵活型（全天随时可投入，没有特定高效时段）'
  }

  const focusDesc = focusMap[params.focusPreference] || focusMap.flexible

  return `请为以下目标生成一份详细的每日任务计划：

## 目标信息
- 目标描述：${params.goal}
- 计划周期：${params.startDate} 至 ${params.endDate}
- 每天可用时间：约 ${params.dailyHours} 小时
- 专注力类型：${focusDesc}

## 额外要求
- 为每一天单独规划任务（从 ${params.startDate} 开始）
- 每项任务的 time 字段用具体的时间段表示（如 09:00-10:30）
- 合理安排休息和缓冲时间
- 确保任务有明确的可行性和执行顺序`
}

// ==================== LLM API 调用 ====================

/**
 * 直接调用 LLM API
 *
 * @param {Array} messages - [{ role: 'system'|'user', content: '...' }]
 * @returns {Promise<Object>} { success, tasks, error }
 */
async function callLLM(messages) {
  const config = getUserAIConfig()

  if (!config.apiKey || !config.endpoint) {
    return { success: false, tasks: [], error: '请先在设置中配置 API Key 和接口地址' }
  }

  // 根据 endpoint 自动适配请求体格式
  const isAnthropic = config.endpoint.toLowerCase().includes('anthropic')

  let body
  if (isAnthropic) {
    // Anthropic Claude API 格式
    const systemMsg = messages.find(m => m.role === 'system')
    const userMsgs = messages.filter(m => m.role !== 'system')
    body = {
      model: config.model || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemMsg ? systemMsg.content : '',
      messages: userMsgs
    }
  } else {
    // OpenAI 兼容格式（OpenAI / DeepSeek / 通义千问 等）
    body = {
      model: config.model || 'deepseek-chat',
      messages: messages,
      max_tokens: 4096,
      temperature: 0.7
    }
  }

  try {
    const response = await new Promise((resolve, reject) => {
      const requestTask = uni.request({
        url: config.endpoint,
        method: 'POST',
        timeout: 120000, // LLM 可能较慢，给 2 分钟超时
        header: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        data: body,
        success: (res) => {
          // uni.request success 回调：即使 HTTP 状态码非 2xx 也会进来
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve(res.data)
          } else {
            reject(new Error(`API 返回错误 (${res.statusCode}): ${JSON.stringify(res.data)}`))
          }
        },
        fail: (err) => {
          reject(new Error(`网络请求失败: ${err.errMsg || '未知错误'}`))
        }
      })

      // 暴露 abort 供外部取消请求（暂未使用，预留）
      return requestTask
    })

    return { success: true, rawResponse: response }
  } catch (error) {
    console.error('[LLM] 调用失败:', error)
    return { success: false, tasks: [], error: error.message || 'AI 请求失败，请检查网络和配置' }
  }
}

// ==================== 响应清洗与 JSON 解析 ====================

/**
 * 从 LLM 原始响应中提取并解析任务数组
 *
 * 处理策略：
 * 1. 提取响应文本（兼容 OpenAI 和 Anthropic 格式）
 * 2. 尝试找到 JSON 数组块（处理 markdown 代码块包裹的情况）
 * 3. 清理尾随逗号
 * 4. JSON.parse
 * 5. 逐条校验并补全字段
 *
 * @param {Object} rawResponse - LLM 返回的原始数据
 * @returns {Object} { success, tasks, error }
 */
function parseAIResponse(rawResponse) {
  try {
    // 1. 提取文本内容
    let text = ''

    if (rawResponse.choices && rawResponse.choices[0]) {
      // OpenAI / DeepSeek 格式
      text = rawResponse.choices[0].message?.content || ''
    } else if (rawResponse.content && rawResponse.content[0]) {
      // Anthropic 格式
      text = rawResponse.content[0].text || ''
    } else if (rawResponse.content) {
      text = rawResponse.content
    } else {
      return { success: false, tasks: [], error: '无法解析 AI 返回的数据格式' }
    }

    console.log('[LLM] 原始返回文本:', text)

    // 2. 提取 JSON 数组
    let jsonStr = text

    // 尝试匹配 markdown 代码块内的 JSON
    const jsonBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
    if (jsonBlockMatch) {
      jsonStr = jsonBlockMatch[1].trim()
    }

    // 尝试找到 JSON 数组 [ ... ]
    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/)
    if (arrayMatch) {
      jsonStr = arrayMatch[0]
    }

    // 3. 清洗 JSON 字符串
    jsonStr = cleanJSONString(jsonStr)

    // 4. 解析
    let tasks = []
    try {
      tasks = JSON.parse(jsonStr)
    } catch (parseErr) {
      console.error('[LLM] JSON 解析失败:', parseErr, '\n清洗后文本:', jsonStr)
      return { success: false, tasks: [], error: 'AI 返回的 JSON 格式异常，请重试' }
    }

    if (!Array.isArray(tasks)) {
      return { success: false, tasks: [], error: 'AI 返回的不是任务数组，请重试' }
    }

    // 5. 逐条校验并补全
    tasks = tasks.map((item, index) => validateAndFixTaskItem(item, index)).filter(Boolean)

    if (tasks.length === 0) {
      return { success: false, tasks: [], error: 'AI 未生成有效任务，请尝试调整目标描述后重试' }
    }

    console.log(`[LLM] 成功解析 ${tasks.length} 条任务`)
    return { success: true, tasks }
  } catch (error) {
    console.error('[LLM] 响应解析异常:', error)
    return { success: false, tasks: [], error: 'AI 数据解析异常，请重试' }
  }
}

/**
 * 清洗 JSON 字符串：去除尾随逗号、BOM、不可见字符
 */
function cleanJSONString(str) {
  return str
    .replace(/^﻿/, '')           // 去除 BOM
    .replace(/,\s*}/g, '}')           // 对象尾随逗号
    .replace(/,\s*\]/g, ']')          // 数组尾随逗号
    .replace(/,\s*,/g, ',')           // 连续逗号
    .replace(/[ -]+/g, ' ') // 控制字符替换为空格（保留换行等）
    .trim()
}

/**
 * 校验并补全单个任务对象的所有字段
 *
 * @param {Object} item - AI 返回的原始任务对象
 * @param {number} index - 数组中的位置
 * @returns {Object|null} 补全后的任务对象，无效则返回 null
 */
function validateAndFixTaskItem(item, index) {
  if (!item || typeof item !== 'object') return null

  // time: 必填，补默认值
  if (!item.time || typeof item.time !== 'string') {
    item.time = `任务${index + 1}`
  }

  // task: 必填，补默认值
  if (!item.task || typeof item.task !== 'string') {
    item.task = item.time || `任务${index + 1}`
  }

  // category: 校验是否在有效列表中，否则默认 study
  if (!VALID_CATEGORIES.includes(item.category)) {
    item.category = 'study'
  }

  // ap: 1-5 整数，补默认值 3
  let ap = Number(item.ap)
  if (isNaN(ap) || ap < 1) ap = 1
  if (ap > 5) ap = 5
  item.ap = Math.round(ap)

  // exp: 正整数，补默认值
  let exp = Number(item.exp)
  if (isNaN(exp) || exp < 0) {
    // 根据 ap 自动估算 exp
    exp = item.ap * 20
  }
  item.exp = Math.round(exp)

  // status: 补默认值 0
  if (![0, 1, 2].includes(item.status)) {
    item.status = 0
  }

  // 生成唯一 ID
  item.id = item.id || `ai_${Date.now()}_${index}`

  // 标记为 AI 生成
  item.isAIGenerated = true

  return item
}

// ==================== Mock 模式 ====================

/**
 * Mock 模式下模拟 AI 生成（用于开发调试或无 Key 时体验）
 * @returns {Promise<Object>}
 */
function mockGeneratePlan() {
  return new Promise((resolve) => {
    // 模拟网络延迟
    const delay = 2500 + Math.random() * 2000
    setTimeout(() => {
      const tasks = JSON.parse(JSON.stringify(MOCK_TASKS))
      // 重新打时间戳 ID
      tasks.forEach((t, i) => {
        t.id = `mock_${Date.now()}_${i}`
        t.isAIGenerated = true
      })
      resolve({ success: true, tasks, isMock: true })
    }, delay)
  })
}

// ==================== 主导出函数 ====================

/**
 * 生成 AI 计划 —— 核心入口函数
 *
 * 所有 AI 表单页面只需调用这一个函数：
 *   import { generatePlan } from '@/api/llm.js'
 *   const result = await generatePlan({ goal, startDate, endDate, dailyHours, focusPreference })
 *
 * @param {Object} params
 * @param {string} params.goal            - 目标描述
 * @param {string} params.startDate       - 开始日期 YYYY-MM-DD
 * @param {string} params.endDate         - 结束日期 YYYY-MM-DD
 * @param {number} params.dailyHours      - 每天可用时间（小时）
 * @param {string} params.focusPreference - 专注力时段 morning|forenoon|night|flexible
 * @param {boolean} [forceMock=false]     - 强制使用 Mock 模式（加载页调试用）
 * @returns {Promise<{ success: boolean, tasks: Array, error?: string, isMock?: boolean }>}
 */
export async function generatePlan(params, forceMock = false) {
  // 参数校验
  if (!params || !params.goal || !params.startDate || !params.endDate) {
    return { success: false, tasks: [], error: '参数不完整：缺少目标、开始日期或结束日期' }
  }

  // Mock 模式：无 Key 或强制 Mock
  if (forceMock || !hasAPIKey()) {
    console.log('[LLM] 使用 Mock 模式生成计划')
    return mockGeneratePlan()
  }

  // 真实 API 模式
  console.log('[LLM] 使用真实 API 模式生成计划')

  // 1. 拼装 Prompt
  const messages = [
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: buildUserPrompt(params) }
  ]

  // 2. 调用 LLM
  const callResult = await callLLM(messages)
  if (!callResult.success) {
    return callResult // 返回错误
  }

  // 3. 清洗解析响应
  const parseResult = parseAIResponse(callResult.rawResponse)
  return parseResult
}

/**
 * 测试 API 连接（供设置页调用）
 *
 * @param {Object} config - { apiKey, endpoint, model }
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function testConnection(config) {
  const body = {
    model: config.model || 'deepseek-chat',
    messages: [{ role: 'user', content: '你好，请简短回复"连接成功"。' }],
    max_tokens: 50
  }

  try {
    const response = await new Promise((resolve, reject) => {
      uni.request({
        url: config.endpoint,
        method: 'POST',
        timeout: 20000,
        header: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        data: body,
        success: (res) => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve(res.data)
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(res.data)}`))
          }
        },
        fail: (err) => {
          reject(new Error(err.errMsg || '网络请求失败'))
        }
      })
    })

    // 验证响应是否可解析
    let reply = ''
    if (response.choices && response.choices[0]) {
      reply = response.choices[0].message?.content || ''
    }

    return { success: true, message: reply || '连接成功，API 响应正常' }
  } catch (error) {
    return { success: false, message: error.message || '连接失败' }
  }
}

/**
 * 导出分类映射表，供其他页面使用
 */
export function getCategoryInfo(categoryKey) {
  return CATEGORY_MAP[categoryKey] || { label: '其他', color: '#999', icon: '📋' }
}

export function getValidCategories() {
  return VALID_CATEGORIES
}

export function getCategoryMap() {
  return CATEGORY_MAP
}
