/**
 * 阿里云通义千问模型调用服务
 * 使用 OpenAI 兼容接口调用阿里云 DashScope API
 *
 * 注意：出于比赛评审 & 安全考虑，API Key 建议由用户在页面上手动输入，
 * 本模块只接受从外部传入的 apiKey，不在代码中硬编码。
 */

const DEFAULT_BASE_URL =
  import.meta.env.VITE_DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
const DEFAULT_MODEL = import.meta.env.VITE_MODEL_NAME || 'qwen-turbo'

/**
 * 调用阿里云通义千问模型生成文本
 * @param {string} prompt - 用户输入的提示词
 * @param {Object} options - 可选参数
 * @param {string} options.apiKey - 必填，阿里云 DashScope API Key（由用户在前端输入）
 * @param {string} [options.baseUrl] - DashScope 兼容接口 Base URL
 * @param {string} [options.model] - 模型名称，默认 qwen-turbo
 * @param {number} [options.maxTokens] - 最大生成 token 数
 * @param {number} [options.temperature] - 温度参数，控制随机性
 * @returns {Promise<string>} 生成的文本内容
 */
export async function generateText(prompt, options = {}) {
  const {
    apiKey,
    baseUrl = DEFAULT_BASE_URL,
    model = DEFAULT_MODEL,
    maxTokens = 2000,
    temperature = 0.7,
  } = options

  if (!apiKey) {
    throw new Error('请先在左侧输入阿里云 DashScope API Key')
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `API 请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim()
    } else {
      throw new Error('模型返回数据格式异常')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`调用模型失败: ${error.message || '未知错误'}`)
  }
}

/**
 * 生成多种类型的文案
 */
export const PROMPT_TEMPLATES = {
  // 营销文案
  marketing: (product, target) => `请为以下产品撰写一份吸引人的营销文案：
产品名称：${product}
目标受众：${target}

要求：
1. 突出产品核心卖点
2. 语言生动有趣，有感染力
3. 包含行动号召（CTA）
4. 字数控制在 200-300 字`,

  // 产品介绍
  product: (name, features) => `请为以下产品撰写一份专业的产品介绍：
产品名称：${name}
产品特点：${features}

要求：
1. 结构清晰，层次分明
2. 突出产品优势和价值
3. 语言专业但不失亲和力
4. 字数控制在 300-400 字`,

  // 社交媒体文案
  social: (topic, platform, tone) => `请为${platform}平台撰写一份${tone}风格的社交媒体文案：
主题：${topic}

要求：
1. 符合${platform}平台的风格特点
2. 语言${tone}，吸引用户互动
3. 适当使用话题标签
4. 字数控制在 100-200 字`,

  // 邮件模板
  email: (purpose, recipient) => `请撰写一份专业的商务邮件：
邮件目的：${purpose}
收件人：${recipient}

要求：
1. 格式规范，包含主题和正文
2. 语言礼貌专业
3. 目的明确，表达清晰
4. 字数控制在 200-300 字`,

  // 创意故事
  story: (theme, style) => `请创作一个${style}风格的短故事：
主题：${theme}

要求：
1. 情节完整，有起承转合
2. 人物形象鲜明
3. 语言${style}，引人入胜
4. 字数控制在 500-800 字`,

  // 自定义
  custom: (prompt) => prompt
}
