import { NextRequest, NextResponse } from 'next/server'
import { AIConfig, ImageConfig, DEFAULT_AI_CONFIG, DEFAULT_IMAGE_CONFIG } from '@/lib/ai-config'

// 内存存储配置（生产环境应使用数据库）
let currentAIConfig: AIConfig = { ...DEFAULT_AI_CONFIG }
let currentImageConfig: ImageConfig = { ...DEFAULT_IMAGE_CONFIG }

/**
 * 获取当前配置
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    config: {
      ai: {
        ...currentAIConfig,
        // 隐藏API Key的中间部分
        apiKey: currentAIConfig.apiKey 
          ? `${currentAIConfig.apiKey.slice(0, 8)}...${currentAIConfig.apiKey.slice(-4)}`
          : '',
        apiKeyConfigured: !!currentAIConfig.apiKey,
      },
      image: {
        ...currentImageConfig,
        apiKey: currentImageConfig.apiKey
          ? `${currentImageConfig.apiKey.slice(0, 8)}...${currentImageConfig.apiKey.slice(-4)}`
          : '',
        apiKeyConfigured: !!currentImageConfig.apiKey,
      },
    },
  })
}

/**
 * 更新配置
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ai, image } = body

    // 更新AI配置
    if (ai) {
      // 如果apiKey不是掩码格式，则更新
      if (ai.apiKey && !ai.apiKey.includes('...')) {
        currentAIConfig = {
          provider: ai.provider || currentAIConfig.provider,
          apiKey: ai.apiKey,
          baseURL: ai.baseURL || currentAIConfig.baseURL,
          model: ai.model || currentAIConfig.model,
          enabled: ai.enabled ?? true,
        }
      } else if (ai.apiKey?.includes('...')) {
        // 保持原有API Key
        currentAIConfig = {
          ...currentAIConfig,
          provider: ai.provider || currentAIConfig.provider,
          baseURL: ai.baseURL || currentAIConfig.baseURL,
          model: ai.model || currentAIConfig.model,
          enabled: ai.enabled ?? currentAIConfig.enabled,
        }
      }
    }

    // 更新图片配置
    if (image) {
      if (image.apiKey && !image.apiKey.includes('...')) {
        currentImageConfig = {
          provider: image.provider || currentImageConfig.provider,
          apiKey: image.apiKey,
          baseURL: image.baseURL || currentImageConfig.baseURL,
          model: image.model || currentImageConfig.model,
          enabled: image.enabled ?? true,
        }
      } else if (image.apiKey?.includes('...')) {
        currentImageConfig = {
          ...currentImageConfig,
          provider: image.provider || currentImageConfig.provider,
          baseURL: image.baseURL || currentImageConfig.baseURL,
          model: image.model || currentImageConfig.model,
          enabled: image.enabled ?? currentImageConfig.enabled,
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: '配置已保存',
      config: {
        ai: {
          ...currentAIConfig,
          apiKey: currentAIConfig.apiKey
            ? `${currentAIConfig.apiKey.slice(0, 8)}...${currentAIConfig.apiKey.slice(-4)}`
            : '',
          apiKeyConfigured: !!currentAIConfig.apiKey,
        },
        image: {
          ...currentImageConfig,
          apiKey: currentImageConfig.apiKey
            ? `${currentImageConfig.apiKey.slice(0, 8)}...${currentImageConfig.apiKey.slice(-4)}`
            : '',
          apiKeyConfigured: !!currentImageConfig.apiKey,
        },
      },
    })
  } catch (error) {
    console.error('Config update error:', error)
    return NextResponse.json(
      { success: false, error: '配置保存失败' },
      { status: 500 }
    )
  }
}

/**
 * 导出当前配置（用于其他API调用）
 */
export function getCurrentAIConfig(): AIConfig {
  return currentAIConfig
}

export function getCurrentImageConfig(): ImageConfig {
  return currentImageConfig
}
