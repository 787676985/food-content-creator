import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAIConfig } from '@/app/api/config/route'
import { AIClient } from '@/lib/ai-client'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, platform, style, contentType } = body

    if (!topic) {
      return NextResponse.json({ error: '请输入话题' }, { status: 400 })
    }

    // 获取配置
    const aiConfig = getCurrentAIConfig()
    
    // 根据平台和风格生成不同的prompt
    const platformPrompts: Record<string, string> = {
      douyin: '抖音短视频风格，口语化、接地气、有节奏感，适合15-60秒视频',
      xiaohongshu: '小红书风格，精致、有情感共鸣、带emoji表情，适合图文笔记',
      toutiao: '今日头条风格，新闻感、信息量大、标题党',
    }

    const stylePrompts: Record<string, string> = {
      professional: '专业严谨，数据支撑',
      casual: '轻松幽默，接地气',
      emotional: '情感共鸣，走心文案',
      educational: '知识科普，干货满满',
    }

    const contentTypePrompts: Record<string, string> = {
      copywriting: '文案',
      script: '视频脚本',
      article: '长文章',
    }

    const systemPrompt = `你是一位专业的美食领域内容创作专家，擅长为${platform === 'douyin' ? '抖音' : platform === 'xiaohongshu' ? '小红书' : '今日头条'}平台创作爆款内容。
你的创作风格是：${stylePrompts[style] || '专业且有吸引力'}
创作类型：${contentTypePrompts[contentType] || '文案'}
平台特点：${platformPrompts[platform] || platformPrompts.douyin}

请根据用户输入的话题，创作一篇高质量的美食内容。要求：
1. 标题要吸引眼球，有爆款潜质
2. 内容要有价值，能引发用户互动
3. 符合平台调性和用户习惯
4. 如果是小红书，适当使用emoji
5. 如果是抖音脚本，要标注镜头和台词`

    let content: string

    // 优先使用用户配置的AI服务
    if (aiConfig.enabled && aiConfig.apiKey) {
      const client = new AIClient(aiConfig)
      content = await client.chatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `请为美食领域创作内容，话题：${topic}` },
      ])
    } else {
      // 使用默认的z-ai服务
      const zai = await ZAI.create()
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `请为美食领域创作内容，话题：${topic}` },
        ],
      })
      content = completion.choices[0]?.message?.content || ''
    }

    return NextResponse.json({
      success: true,
      content,
      platform,
      style,
      contentType,
      usedCustomAI: aiConfig.enabled && !!aiConfig.apiKey,
    })
  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '内容生成失败，请重试' },
      { status: 500 }
    )
  }
}
