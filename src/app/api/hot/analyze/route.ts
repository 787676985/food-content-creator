import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// AI分析热门内容
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, content, category } = body
    
    if (!title) {
      return NextResponse.json({ success: false, error: '缺少内容标题' }, { status: 400 })
    }
    
    // 获取AI配置
    const aiConfig = await db.aIConfig.findUnique({ where: { id: 'default' } })
    
    const categoryConfig: Record<string, string> = {
      food: '美食',
      pet: '宠物',
      general: '综合',
    }
    
    const systemPrompt = `你是一位专业的${categoryConfig[category] || '综合'}领域内容分析专家。
请分析给定的热门内容，从以下维度进行分析：

1. **内容特点**：分析内容的主题、风格、情感倾向
2. **爆款要素**：分析为什么这篇内容会火，有哪些吸引人的点
3. **目标受众**：分析内容的目标用户群体
4. **创作借鉴**：给出创作者可以借鉴学习的要点
5. **关键词提取**：提取3-5个核心关键词
6. **风格标签**：给出2-3个风格标签

请用简洁清晰的语言回答，每个部分用换行分隔。`

    const userPrompt = `请分析以下热门内容：

标题：${title}
${content ? `内容摘要：${content}` : ''}

请给出详细的分析和建议。`

    let analysis: string
    let keywords: string = ''
    let styleTags: string = ''

    // 使用AI分析
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
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`AI请求失败: ${response.status}`)
      }

      const data = await response.json()
      analysis = data.choices[0]?.message?.content || ''
    } else {
      const zai = await ZAI.create()
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      })
      analysis = completion.choices[0]?.message?.content || ''
    }

    // 提取关键词和风格标签（简单处理）
    const keywordMatch = analysis.match(/关键词[：:]\s*([^\n]+)/)
    const styleMatch = analysis.match(/风格标签[：:]\s*([^\n]+)/)
    
    if (keywordMatch) keywords = keywordMatch[1].trim()
    if (styleMatch) styleTags = styleMatch[1].trim()

    // 更新数据库
    if (id) {
      await db.hotContent.update({
        where: { id },
        data: {
          analysis,
          keywords,
          styleTags,
          isAnalyzed: true,
        }
      })
    }

    return NextResponse.json({
      success: true,
      analysis,
      keywords,
      styleTags,
    })
  } catch (error) {
    console.error('Analyze hot content error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '分析失败' },
      { status: 500 }
    )
  }
}

// 批量分析
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = body
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: '请选择要分析的内容' }, { status: 400 })
    }
    
    // 获取未分析的内容
    const contents = await db.hotContent.findMany({
      where: {
        id: { in: ids },
        isAnalyzed: false,
      }
    })
    
    if (contents.length === 0) {
      return NextResponse.json({ success: true, message: '没有需要分析的内容' })
    }
    
    // 批量分析（简化处理，实际可以异步处理）
    const results = []
    for (const content of contents.slice(0, 5)) { // 限制一次最多分析5条
      try {
        const analysisResult = await analyzeContent(content)
        results.push({ id: content.id, success: true })
      } catch {
        results.push({ id: content.id, success: false })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `已分析 ${results.filter(r => r.success).length} 条内容`,
      results,
    })
  } catch (error) {
    console.error('Batch analyze error:', error)
    return NextResponse.json({ success: false, error: '批量分析失败' }, { status: 500 })
  }
}

// 辅助函数：分析单条内容
async function analyzeContent(content: { id: string; title: string; content: string | null; category: string }) {
  const aiConfig = await db.aIConfig.findUnique({ where: { id: 'default' } })
  
  const systemPrompt = '你是一位内容分析专家，请简要分析以下热门内容的特点和可借鉴之处。'
  const userPrompt = `标题：${content.title}\n${content.content || ''}`
  
  let analysis: string
  
  if (aiConfig?.enabled && aiConfig.apiKey) {
    const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    })
    const data = await response.json()
    analysis = data.choices[0]?.message?.content || ''
  } else {
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })
    analysis = completion.choices[0]?.message?.content || ''
  }
  
  await db.hotContent.update({
    where: { id: content.id },
    data: { analysis, isAnalyzed: true }
  })
  
  return analysis
}
