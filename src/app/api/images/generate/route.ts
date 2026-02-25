import { NextRequest, NextResponse } from 'next/server'
import { getCurrentImageConfig } from '@/app/api/config/route'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, style } = body

    if (!prompt) {
      return NextResponse.json({ error: '请输入图片描述' }, { status: 400 })
    }

    // 获取配置
    const imageConfig = getCurrentImageConfig()

    // 根据风格优化prompt
    const stylePrompts: Record<string, string> = {
      food: '美食摄影风格，专业打光，精致摆盘，高清细节，食欲感十足',
      lifestyle: '生活方式风格，温馨氛围，自然光线，生活气息',
      minimal: '极简风格，简洁构图，留白设计，高级感',
      vibrant: '鲜艳活泼风格，色彩丰富，充满活力，年轻化',
    }

    const enhancedPrompt = `${prompt}，${stylePrompts[style] || stylePrompts.food}，适合社交媒体封面`

    let imageBase64: string

    // 优先使用用户配置的图片服务
    if (imageConfig.enabled && imageConfig.apiKey) {
      // 使用自定义图片服务
      const url = `${imageConfig.baseURL}/images/generations`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${imageConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: imageConfig.model,
          prompt: enhancedPrompt,
          size: '1024x1024',
          n: 1,
          response_format: 'b64_json',
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`图片生成失败: ${response.status} - ${error}`)
      }

      const data = await response.json()
      imageBase64 = data.data[0]?.b64_json || data.data[0]?.url || ''
    } else {
      // 使用默认的z-ai服务
      const zai = await ZAI.create()
      const response = await zai.images.generations.create({
        prompt: enhancedPrompt,
        size: '1024x1024',
      })
      imageBase64 = response.data[0]?.base64 || ''
    }

    return NextResponse.json({
      success: true,
      image: imageBase64,
      prompt: enhancedPrompt,
      usedCustomAI: imageConfig.enabled && !!imageConfig.apiKey,
    })
  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '图片生成失败，请重试' },
      { status: 500 }
    )
  }
}
