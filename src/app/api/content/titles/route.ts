import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, platform, count = 5 } = body;

    if (!content) {
      return NextResponse.json({ error: '请输入内容' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const platformPrompts: Record<string, string> = {
      douyin: '抖音标题风格：简短有力、悬念感、数字开头、引发好奇',
      xiaohongshu: '小红书标题风格：精致感、情感共鸣、带emoji、种草感',
      toutiao: '今日头条标题风格：新闻感、信息量大、有争议性',
    };

    const systemPrompt = `你是一位专业的美食领域标题优化专家。
平台特点：${platformPrompts[platform] || platformPrompts.douyin}

请根据用户提供的内容，生成${count}个爆款标题。要求：
1. 每个标题都要有吸引力，能引发点击欲望
2. 符合平台调性和用户习惯
3. 标题要有差异化，覆盖不同角度
4. 直接输出标题列表，每行一个，不要编号`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `请为以下美食内容生成爆款标题：\n${content}` },
      ],
    });

    const titlesText = completion.choices[0]?.message?.content || '';
    const titles = titlesText.split('\n').filter((t) => t.trim());

    return NextResponse.json({
      success: true,
      titles,
      platform,
    });
  } catch (error) {
    console.error('Title generation error:', error);
    return NextResponse.json(
      { error: '标题生成失败，请重试' },
      { status: 500 }
    );
  }
}
