import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, style } = body;

    if (!prompt) {
      return NextResponse.json({ error: '请输入图片描述' }, { status: 400 });
    }

    const zai = await ZAI.create();

    // 根据风格优化prompt
    const stylePrompts: Record<string, string> = {
      food: '美食摄影风格，专业打光，精致摆盘，高清细节，食欲感十足',
      lifestyle: '生活方式风格，温馨氛围，自然光线，生活气息',
      minimal: '极简风格，简洁构图，留白设计，高级感',
      vibrant: '鲜艳活泼风格，色彩丰富，充满活力，年轻化',
    };

    const enhancedPrompt = `${prompt}，${stylePrompts[style] || stylePrompts.food}，适合社交媒体封面`;

    const response = await zai.images.generations.create({
      prompt: enhancedPrompt,
      size: '1024x1024',
    });

    const imageBase64 = response.data[0]?.base64 || '';

    return NextResponse.json({
      success: true,
      image: imageBase64,
      prompt: enhancedPrompt,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: '图片生成失败，请重试' },
      { status: 500 }
    );
  }
}
