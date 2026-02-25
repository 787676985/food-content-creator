import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAIConfig } from '@/app/api/config/route'
import { AIClient } from '@/lib/ai-client'
import ZAI from 'z-ai-web-dev-sdk'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const topic = searchParams.get('topic') || '美食'
    const num = parseInt(searchParams.get('num') || '10')

    const zai = await ZAI.create()

    // 搜索美食相关热点
    const searchResults = await zai.functions.invoke('web_search', {
      query: `${topic} 热点 趋势 2024`,
      num,
    })

    // 获取AI配置
    const aiConfig = getCurrentAIConfig()

    // 使用AI分析热点趋势
    const trendsContext = searchResults
      .slice(0, 8)
      .map((r: { name: string; snippet: string; url: string }) => `${r.name}\n${r.snippet}`)
      .join('\n\n')

    const systemPrompt = '你是一位专业的美食领域趋势分析师。请分析给定的搜索结果，提取出当前美食领域的热点趋势和关键词。'

    let analysis: string

    // 优先使用用户配置的AI服务
    if (aiConfig.enabled && aiConfig.apiKey) {
      const client = new AIClient(aiConfig)
      analysis = await client.chatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `请分析以下美食相关搜索结果，提取热点趋势：\n\n${trendsContext}` },
      ])
    } else {
      // 使用默认的z-ai服务
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `请分析以下美食相关搜索结果，提取热点趋势：\n\n${trendsContext}` },
        ],
      })
      analysis = completion.choices[0]?.message?.content || ''
    }

    return NextResponse.json({
      success: true,
      trends: searchResults,
      analysis,
      topic,
      usedCustomAI: aiConfig.enabled && !!aiConfig.apiKey,
    })
  } catch (error) {
    console.error('Trends search error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '热点搜索失败，请重试' },
      { status: 500 }
    )
  }
}
