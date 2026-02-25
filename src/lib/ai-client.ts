/**
 * AI客户端 - 标准化AI调用接口
 * 支持多种AI服务商，使用OpenAI兼容格式
 */

import { AIConfig, ImageConfig } from './ai-config'

// Chat completion消息类型
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Chat completion响应类型
export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: ChatMessage
    finish_reason: string
  }[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// 图片生成响应类型
export interface ImageGenerationResponse {
  created: number
  data: {
    url?: string
    b64_json?: string
    revised_prompt?: string
  }[]
}

/**
 * AI客户端类
 */
export class AIClient {
  private config: AIConfig

  constructor(config: AIConfig) {
    this.config = config
  }

  /**
   * 更新配置
   */
  updateConfig(config: AIConfig) {
    this.config = config
  }

  /**
   * 检查是否已配置
   */
  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.baseURL && this.config.model && this.config.enabled)
  }

  /**
   * 发送Chat Completion请求
   */
  async chatCompletion(messages: ChatMessage[], options?: {
    temperature?: number
    maxTokens?: number
    topP?: number
  }): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('AI服务未配置，请在设置中配置API密钥')
    }

    const url = `${this.config.baseURL}/chat/completions`
    
    const body: Record<string, unknown> = {
      model: this.config.model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
      top_p: options?.topP ?? 1,
    }

    // Claude特殊处理
    if (this.config.provider === 'claude') {
      return this.claudeChatCompletion(messages, options)
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`AI请求失败: ${response.status} - ${error}`)
    }

    const data: ChatCompletionResponse = await response.json()
    return data.choices[0]?.message?.content || ''
  }

  /**
   * Claude特殊处理（Anthropic API格式不同）
   */
  private async claudeChatCompletion(messages: ChatMessage[], options?: {
    temperature?: number
    maxTokens?: number
  }): Promise<string> {
    const url = `${this.config.baseURL}/messages`
    
    // 分离system消息
    const systemMessage = messages.find(m => m.role === 'system')?.content || ''
    const chatMessages = messages.filter(m => m.role !== 'system')

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: options?.maxTokens ?? 4096,
        system: systemMessage,
        messages: chatMessages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Claude请求失败: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return data.content?.[0]?.text || ''
  }
}

/**
 * 图片生成客户端
 */
export class ImageClient {
  private config: ImageConfig

  constructor(config: ImageConfig) {
    this.config = config
  }

  /**
   * 更新配置
   */
  updateConfig(config: ImageConfig) {
    this.config = config
  }

  /**
   * 检查是否已配置
   */
  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.baseURL && this.config.model && this.config.enabled)
  }

  /**
   * 生成图片
   */
  async generate(prompt: string, options?: {
    size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792'
    quality?: 'standard' | 'hd'
    n?: number
  }): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('图片生成服务未配置，请在设置中配置API密钥')
    }

    const url = `${this.config.baseURL}/images/generations`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        prompt,
        size: options?.size ?? '1024x1024',
        quality: options?.quality ?? 'standard',
        n: options?.n ?? 1,
        response_format: 'b64_json',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`图片生成失败: ${response.status} - ${error}`)
    }

    const data: ImageGenerationResponse = await response.json()
    return data.data[0]?.b64_json || data.data[0]?.url || ''
  }
}

// 创建默认客户端实例
let defaultAIClient: AIClient | null = null
let defaultImageClient: ImageClient | null = null

/**
 * 获取AI客户端实例
 */
export function getAIClient(config?: AIConfig): AIClient {
  if (config) {
    defaultAIClient = new AIClient(config)
  }
  if (!defaultAIClient) {
    throw new Error('AI客户端未初始化，请先配置')
  }
  return defaultAIClient
}

/**
 * 获取图片客户端实例
 */
export function getImageClient(config?: ImageConfig): ImageClient {
  if (config) {
    defaultImageClient = new ImageClient(config)
  }
  if (!defaultImageClient) {
    throw new Error('图片客户端未初始化，请先配置')
  }
  return defaultImageClient
}
