<template>
  <div class="app-container">
    <!-- 头部 -->
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="logo">✨ AI 文案工作台</h1>
          <p class="subtitle">基于阿里云通义千问的智能文案生成工具</p>
        </div>
        <button class="key-btn" @click="openKeyModal">🔑 设置 API Key</button>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <div class="content-wrapper">
        <!-- 左侧：输入区 -->
        <div class="input-section">
          <div class="section-card">
            <h2 class="section-title">📝 文案类型</h2>
            <div class="type-selector">
              <button
                v-for="type in promptTypes"
                :key="type.key"
                @click="selectedType = type.key"
                :class="['type-btn', { active: selectedType === type.key }]"
              >
                {{ type.label }}
              </button>
            </div>

            <!-- 动态输入表单 -->
            <div class="input-form">
              <template v-if="selectedType === 'marketing'">
                <div class="form-group">
                  <label>产品名称</label>
                  <input v-model="formData.product" type="text" placeholder="例如：智能手环" />
                </div>
                <div class="form-group">
                  <label>目标受众</label>
                  <input v-model="formData.target" type="text" placeholder="例如：年轻白领" />
                </div>
              </template>

              <template v-else-if="selectedType === 'product'">
                <div class="form-group">
                  <label>产品名称</label>
                  <input v-model="formData.name" type="text" placeholder="例如：AI 智能音箱" />
                </div>
                <div class="form-group">
                  <label>产品特点</label>
                  <textarea v-model="formData.features" placeholder="例如：语音控制、智能家居联动、音质出色"></textarea>
                </div>
              </template>

              <template v-else-if="selectedType === 'social'">
                <div class="form-group">
                  <label>主题内容</label>
                  <input v-model="formData.topic" type="text" placeholder="例如：新品发布" />
                </div>
                <div class="form-group">
                  <label>平台</label>
                  <select v-model="formData.platform">
                    <option value="微博">微博</option>
                    <option value="小红书">小红书</option>
                    <option value="抖音">抖音</option>
                    <option value="微信朋友圈">微信朋友圈</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>风格</label>
                  <select v-model="formData.tone">
                    <option value="轻松活泼">轻松活泼</option>
                    <option value="专业严谨">专业严谨</option>
                    <option value="幽默风趣">幽默风趣</option>
                    <option value="温馨亲切">温馨亲切</option>
                  </select>
                </div>
              </template>

              <template v-else-if="selectedType === 'email'">
                <div class="form-group">
                  <label>邮件目的</label>
                  <input v-model="formData.purpose" type="text" placeholder="例如：项目合作邀请" />
                </div>
                <div class="form-group">
                  <label>收件人</label>
                  <input v-model="formData.recipient" type="text" placeholder="例如：合作伙伴公司" />
                </div>
              </template>

              <template v-else-if="selectedType === 'story'">
                <div class="form-group">
                  <label>故事主题</label>
                  <input v-model="formData.theme" type="text" placeholder="例如：未来科技" />
                </div>
                <div class="form-group">
                  <label>写作风格</label>
                  <select v-model="formData.style">
                    <option value="科幻">科幻</option>
                    <option value="悬疑">悬疑</option>
                    <option value="温馨">温馨</option>
                    <option value="励志">励志</option>
                  </select>
                </div>
              </template>

              <template v-else-if="selectedType === 'custom'">
                <div class="form-group">
                  <label>自定义提示词</label>
                  <textarea
                    v-model="formData.customPrompt"
                    rows="6"
                    placeholder="请输入你的需求，AI 将根据你的描述生成文案..."
                  ></textarea>
                </div>
              </template>
            </div>

            <!-- 生成按钮 -->
            <button
              @click="generateContent"
              :disabled="isGenerating || !canGenerate"
              class="generate-btn"
            >
              <span v-if="isGenerating">⏳ 生成中...</span>
              <span v-else>🚀 生成文案</span>
            </button>
          </div>
        </div>

        <!-- 右侧：结果展示区 -->
        <div class="output-section">
          <div class="section-card">
            <div class="section-header">
              <h2 class="section-title">📄 生成结果</h2>
              <button
                v-if="generatedText"
                @click="copyToClipboard"
                class="copy-btn"
              >
                📋 复制
              </button>
            </div>
            <div class="output-content">
              <div v-if="error" class="error-message">
                ❌ {{ error }}
              </div>
              <div v-else-if="isGenerating" class="loading">
                <div class="spinner"></div>
                <p>AI 正在思考中，请稍候...</p>
              </div>
              <div v-else-if="generatedText" class="generated-text">
                {{ generatedText }}
              </div>
              <div v-else class="placeholder">
                <p>👆 选择文案类型并填写信息，点击"生成文案"按钮开始创作</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- API Key 弹窗 -->
    <div v-if="showKeyModal" class="modal-backdrop">
      <div class="modal">
        <h2>🔑 设置阿里云 DashScope API Key</h2>
        <p class="modal-desc">
          请粘贴你自己的阿里云百炼 API Key（以 <code>sk-</code> 开头）。Key 仅保存在当前浏览器内存中，刷新页面即清空。
        </p>
        <div class="form-group">
          <label>DashScope API Key</label>
          <input
            v-model="tempApiKey"
            type="password"
            placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>
        <div class="modal-actions">
          <button class="modal-btn ghost" @click="closeKeyModal">取消</button>
          <button class="modal-btn primary" :disabled="!tempApiKey.trim()" @click="saveKey">
            保存
          </button>
        </div>
        <p class="hint">
          获取方式：登录阿里云百炼平台 → API-KEY 管理 → 创建 Key。
        </p>
      </div>
    </div>

    <!-- 底部 -->
    <footer class="app-footer">
      <p>本项目由阿里云ESA提供加速、计算和保护</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { generateText, PROMPT_TEMPLATES } from './services/aliyunModel.js'

// DashScope 配置（Base URL / 模型名固定，Key 由用户输入）
const dashscopeApiKey = ref('')
const showKeyModal = ref(false)
const tempApiKey = ref('')

// BaseURL 和模型名直接使用默认值
const dashscopeBaseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1'
const modelName = 'qwen-turbo'

// 文案类型选项
const promptTypes = [
  { key: 'marketing', label: '📢 营销文案' },
  { key: 'product', label: '📦 产品介绍' },
  { key: 'social', label: '📱 社交媒体' },
  { key: 'email', label: '📧 邮件模板' },
  { key: 'story', label: '📖 创意故事' },
  { key: 'custom', label: '✨ 自定义' }
]

const selectedType = ref('marketing')
const formData = ref({
  product: '',
  target: '',
  name: '',
  features: '',
  topic: '',
  platform: '微博',
  tone: '轻松活泼',
  purpose: '',
  recipient: '',
  theme: '',
  style: '科幻',
  customPrompt: ''
})

const generatedText = ref('')
const isGenerating = ref(false)
const error = ref('')

function openKeyModal() {
  tempApiKey.value = dashscopeApiKey.value
  showKeyModal.value = true
}

function closeKeyModal() {
  showKeyModal.value = false
}

function saveKey() {
  dashscopeApiKey.value = tempApiKey.value.trim()
  showKeyModal.value = false
}

// 检查是否可以生成
const canGenerate = computed(() => {
  if (selectedType.value === 'custom') {
    return formData.value.customPrompt.trim().length > 0
  }
  if (selectedType.value === 'marketing') {
    return formData.value.product && formData.value.target
  }
  if (selectedType.value === 'product') {
    return formData.value.name && formData.value.features
  }
  if (selectedType.value === 'social') {
    return formData.value.topic
  }
  if (selectedType.value === 'email') {
    return formData.value.purpose && formData.value.recipient
  }
  if (selectedType.value === 'story') {
    return formData.value.theme
  }
  return false
})

// 生成文案
async function generateContent() {
  if (!canGenerate.value || isGenerating.value) return

  if (!dashscopeApiKey.value.trim()) {
    error.value = '请先通过右上角“设置 API Key”按钮配置阿里云 DashScope API Key'
    showKeyModal.value = true
    return
  }

  isGenerating.value = true
  error.value = ''
  generatedText.value = ''

  try {
    let prompt = ''
    const template = PROMPT_TEMPLATES[selectedType.value]

    if (selectedType.value === 'marketing') {
      prompt = template(formData.value.product, formData.value.target)
    } else if (selectedType.value === 'product') {
      prompt = template(formData.value.name, formData.value.features)
    } else if (selectedType.value === 'social') {
      prompt = template(formData.value.topic, formData.value.platform, formData.value.tone)
    } else if (selectedType.value === 'email') {
      prompt = template(formData.value.purpose, formData.value.recipient)
    } else if (selectedType.value === 'story') {
      prompt = template(formData.value.theme, formData.value.style)
    } else if (selectedType.value === 'custom') {
      prompt = template(formData.value.customPrompt)
    }

    const result = await generateText(prompt, {
      apiKey: dashscopeApiKey.value.trim(),
      baseUrl: dashscopeBaseUrl,
      model: modelName,
      maxTokens: 2000,
      temperature: 0.7,
    })

    generatedText.value = result
  } catch (err) {
    error.value = err.message || '生成失败，请检查 API 配置或网络连接'
    console.error('生成文案失败:', err)
  } finally {
    isGenerating.value = false
  }
}

// 复制到剪贴板
async function copyToClipboard() {
  if (!generatedText.value) return

  try {
    await navigator.clipboard.writeText(generatedText.value)
    alert('✅ 已复制到剪贴板！')
  } catch (err) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = generatedText.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('✅ 已复制到剪贴板！')
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.header-left {
  text-align: left;
}

.logo {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 0.5rem 0 0;
  color: #666;
  font-size: 1rem;
}

.key-btn {
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  border: 1px solid #e0e0e0;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
  color: #555;
  transition: all 0.2s;
  white-space: nowrap;
}

.key-btn:hover {
  background: #f3f3ff;
  border-color: #667eea;
  color: #4c51bf;
}

.main-content {
  flex: 1;
  padding: 2rem;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.section-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.5rem;
  margin: 0 0 1.5rem;
  color: #333;
}

.type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.type-btn {
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
  color: #666;
}

.type-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.type-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.input-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group.small {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-row-inline {
  display: grid;
  grid-template-columns: 2fr 1.3fr;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.hint {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: #888;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  width: min(420px, 92vw);
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.35);
  padding: 1.5rem 1.75rem 1.5rem;
}

.modal h2 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  color: #111827;
}

.modal-desc {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.modal-btn {
  padding: 0.55rem 1.3rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn.ghost {
  background: #f3f4f6;
  color: #374151;
}

.modal-btn.ghost:hover {
  background: #e5e7eb;
}

.modal-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.modal-btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.generate-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.copy-btn {
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.copy-btn:hover {
  background: #e8e8e8;
}

.output-content {
  min-height: 400px;
}

.error-message {
  padding: 1rem;
  background: #fee;
  color: #c33;
  border-radius: 8px;
  border: 1px solid #fcc;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #666;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.generated-text {
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 8px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 1rem;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #999;
  text-align: center;
}

.app-footer {
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5rem;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .type-selector {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .logo {
    font-size: 2rem;
  }

  .main-content {
    padding: 1rem;
  }

  .section-card {
    padding: 1.5rem;
  }

  .type-selector {
    grid-template-columns: 1fr;
  }
}
</style>
