/**
 * AI配置类型定义
 * 支持主流AI服务商的标准化接口配置
 */

// AI服务商类型
export type AIProvider = 'openai' | 'deepseek' | 'claude' | 'zhipu' | 'moonshot' | 'qwen' | 'custom'

// AI配置接口
export interface AIConfig {
  provider: AIProvider
  apiKey: string
  baseURL: string
  model: string
  enabled: boolean
}

// 图片生成配置
export interface ImageConfig {
  provider: 'openai' | 'stability' | 'midjourney' | 'custom'
  apiKey: string
  baseURL: string
  model: string
  enabled: boolean
}

// 完整配置
export interface AppConfig {
  ai: AIConfig
  image: ImageConfig
}

// AI服务商预设配置
export const AI_PROVIDER_PRESETS: Record<AIProvider, { name: string; baseURL: string; models: string[]; defaultModel: string }> = {
  openai: {
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o-mini',
  },
  deepseek: {
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'],
    defaultModel: 'deepseek-chat',
  },
  claude: {
    name: 'Claude (Anthropic)',
    baseURL: 'https://api.anthropic.com/v1',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    defaultModel: 'claude-3-5-sonnet-20241022',
  },
  zhipu: {
    name: '智谱AI (GLM)',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    models: ['glm-4-plus', 'glm-4-0520', 'glm-4-air', 'glm-4-flash'],
    defaultModel: 'glm-4-flash',
  },
  moonshot: {
    name: 'Moonshot (Kimi)',
    baseURL: 'https://api.moonshot.cn/v1',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    defaultModel: 'moonshot-v1-8k',
  },
  qwen: {
    name: '通义千问 (阿里云)',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-max-longcontext'],
    defaultModel: 'qwen-turbo',
  },
  custom: {
    name: '自定义服务',
    baseURL: '',
    models: [],
    defaultModel: '',
  },
}

// 图片生成服务商预设
export const IMAGE_PROVIDER_PRESETS: Record<string, { name: string; baseURL: string; models: string[]; defaultModel: string }> = {
  openai: {
    name: 'OpenAI DALL-E',
    baseURL: 'https://api.openai.com/v1',
    models: ['dall-e-3', 'dall-e-2'],
    defaultModel: 'dall-e-3',
  },
  stability: {
    name: 'Stability AI',
    baseURL: 'https://api.stability.ai/v1',
    models: ['stable-diffusion-xl-1024-v1-0', 'stable-diffusion-v1-6'],
    defaultModel: 'stable-diffusion-xl-1024-v1-0',
  },
  custom: {
    name: '自定义服务',
    baseURL: '',
    models: [],
    defaultModel: '',
  },
}

// 默认配置
export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'openai',
  apiKey: '',
  baseURL: AI_PROVIDER_PRESETS.openai.baseURL,
  model: AI_PROVIDER_PRESETS.openai.defaultModel,
  enabled: false,
}

export const DEFAULT_IMAGE_CONFIG: ImageConfig = {
  provider: 'openai',
  apiKey: '',
  baseURL: IMAGE_PROVIDER_PRESETS.openai.baseURL,
  model: IMAGE_PROVIDER_PRESETS.openai.defaultModel,
  enabled: false,
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  ai: DEFAULT_AI_CONFIG,
  image: DEFAULT_IMAGE_CONFIG,
}
