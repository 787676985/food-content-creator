import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取图片配置
export async function GET() {
  try {
    let config = await db.imageConfig.findUnique({ where: { id: 'default' } })
    
    if (!config) {
      config = await db.imageConfig.create({
        data: {
          id: 'default',
          provider: 'openai',
          apiKey: null,
          baseUrl: 'https://api.openai.com/v1',
          model: 'dall-e-3',
          enabled: false,
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      config: {
        ...config,
        apiKey: config.apiKey 
          ? `${config.apiKey.slice(0, 8)}...${config.apiKey.slice(-4)}`
          : '',
        apiKeyConfigured: !!config.apiKey,
      },
    })
  } catch (error) {
    console.error('Get Image config error:', error)
    return NextResponse.json({ success: false, error: '获取配置失败' }, { status: 500 })
  }
}

// 更新图片配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, apiKey, baseUrl, model, enabled } = body
    
    const existing = await db.imageConfig.findUnique({ where: { id: 'default' } })
    
    const finalApiKey = apiKey?.includes('...') && existing?.apiKey 
      ? existing.apiKey 
      : apiKey
    
    const config = await db.imageConfig.upsert({
      where: { id: 'default' },
      update: {
        provider: provider || existing?.provider || 'openai',
        apiKey: finalApiKey ?? existing?.apiKey,
        baseUrl: baseUrl || existing?.baseUrl,
        model: model || existing?.model,
        enabled: enabled ?? existing?.enabled ?? false,
      },
      create: {
        id: 'default',
        provider: provider || 'openai',
        apiKey: finalApiKey,
        baseUrl: baseUrl || 'https://api.openai.com/v1',
        model: model || 'dall-e-3',
        enabled: enabled ?? false,
      },
    })
    
    return NextResponse.json({
      success: true,
      message: '配置已保存',
      config: {
        ...config,
        apiKey: config.apiKey 
          ? `${config.apiKey.slice(0, 8)}...${config.apiKey.slice(-4)}`
          : '',
        apiKeyConfigured: !!config.apiKey,
      },
    })
  } catch (error) {
    console.error('Save Image config error:', error)
    return NextResponse.json({ success: false, error: '保存配置失败' }, { status: 500 })
  }
}

export async function getFullImageConfig() {
  const config = await db.imageConfig.findUnique({ where: { id: 'default' } })
  return config
}
