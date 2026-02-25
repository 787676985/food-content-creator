import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, platform, category } = body

    if (!content) {
      return NextResponse.json({ error: '请输入内容' }, { status: 400 })
    }

    const aiConfig = await db.aIConfig.findUnique({ where: { id: 'default' } })

    const categoryConfig: Record<string, string> = {
      food: '美食',
      pet: '宠物',
    }

    const platformPrompts: Record<string, string> = {
      douyin: '抖音标题风格：简短有力、悬念感、数字开头、引发好奇',
      xiaohongshu: '小红书标题风格：精致感、情感共鸣、带emoji、种草感',
      toutiao: '今日头条标题风格：新闻感、信息量大、有争议性',
    }

    const systemPrompt = `你是一位专业的${categoryConfig[category] || '美食'}领域标题优化专家。
平台特点：${platformPrompts[platform] || platformPrompts.douyin}

请根据用户提供的内容，生成5个爆款标题。要求：
1. 每个标题都要有吸引力，能引发点击欲望
2. 符合平台调性和用户习惯
3. 标题要有差异化，覆盖不同角度
4. 直接输出标题列表，每行一个，不要编号`

    let titlesText: string

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
            { role: 'user', content: `请为以下内容生成爆款标题：\n${content}` },
          ],
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`AI请求失败: ${response.status}`)
      }

      const data = await response.json()
      titlesText = data.choices[0]?.message?.content || ''
    } else {
      const zai = await ZAI.create()
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `请为以下内容生成爆款标题：\n${content}` },
        ],
      })
      titlesText = completion.choices[0]?.message?.content || ''
    }

    const titles = titlesText.split('\n').filter((t) => t.trim())

    return NextResponse.json({ success: true, titles, platform })
  } catch (error) {
    console.error('Title generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '标题生成失败，请重试' },
      { status: 500 }
    )
  }
}
