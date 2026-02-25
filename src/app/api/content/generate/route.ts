import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, platform, style, contentType, category } = body

    if (!topic) {
      return NextResponse.json({ error: '请输入话题' }, { status: 400 })
    }

    // 从数据库获取配置
    const aiConfig = await db.aIConfig.findUnique({ where: { id: 'default' } })
    
    // 领域配置
    const categoryConfig: Record<string, { name: string; expert: string }> = {
      food: { name: '美食', expert: '美食领域内容创作专家，擅长美食探店、食谱分享、美食测评' },
      pet: { name: '宠物', expert: '宠物领域内容创作专家，擅长宠物日常、养宠攻略、萌宠分享' },
    }
    
    const currentCategory = categoryConfig[category] || categoryConfig.food

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

    const systemPrompt = `你是一位专业的${currentCategory.expert}，擅长为${platform === 'douyin' ? '抖音' : platform === 'xiaohongshu' ? '小红书' : '今日头条'}平台创作爆款内容。
你的创作风格是：${stylePrompts[style] || '专业且有吸引力'}
创作类型：${contentTypePrompts[contentType] || '文案'}
平台特点：${platformPrompts[platform] || platformPrompts.douyin}

请根据用户输入的话题，创作一篇高质量的${currentCategory.name}内容。要求：
1. 标题要吸引眼球，有爆款潜质
2. 内容要有价值，能引发用户互动
3. 符合平台调性和用户习惯
4. 如果是小红书，适当使用emoji
5. 如果是抖音脚本，要标注镜头和台词`

    let content: string

    // 优先使用用户配置的AI服务
    if (aiConfig?.enabled && aiConfig.apiKey) {
      const url = `${aiConfig.baseUrl}/chat/completions`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `请为${currentCategory.name}领域创作内容，话题：${topic}` },
          ],
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`AI请求失败: ${response.status} - ${error}`)
      }

      const data = await response.json()
      content = data.choices[0]?.message?.content || ''
    } else {
      // 使用默认的z-ai服务
      const zai = await ZAI.create()
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `请为${currentCategory.name}领域创作内容，话题：${topic}` },
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
      category,
      usedCustomAI: aiConfig?.enabled && !!aiConfig.apiKey,
    })
  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '内容生成失败，请重试' },
      { status: 500 }
    )
  }
}
