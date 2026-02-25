import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic') || '美食';
    const num = parseInt(searchParams.get('num') || '10');

    const zai = await ZAI.create();

    // 搜索美食相关热点
    const searchResults = await zai.functions.invoke('web_search', {
      query: `${topic} 热点 趋势 2024`,
      num,
    });

    // 使用AI分析热点趋势
    const trendsContext = searchResults
      .slice(0, 8)
      .map((r: { name: string; snippet: string; url: string }) => `${r.name}\n${r.snippet}`)
      .join('\n\n');

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: '你是一位专业的美食领域趋势分析师。请分析给定的搜索结果，提取出当前美食领域的热点趋势和关键词。',
        },
        {
          role: 'user',
          content: `请分析以下美食相关搜索结果，提取热点趋势：\n\n${trendsContext}`,
        },
      ],
    });

    const analysis = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      trends: searchResults,
      analysis,
      topic,
    });
  } catch (error) {
    console.error('Trends search error:', error);
    return NextResponse.json(
      { error: '热点搜索失败，请重试' },
      { status: 500 }
    );
  }
}
