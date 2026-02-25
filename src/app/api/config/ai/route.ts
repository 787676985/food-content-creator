import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取AI配置
export async function GET() {
  try {
    let config = await db.aIConfig.findUnique({ where: { id: 'default' } })
    
    if (!config) {
      config = await db.aIConfig.create({
        data: {
          id: 'default',
          provider: 'openai',
          apiKey: null,
          baseUrl: 'https://api.openai.com/v1',
          model: 'gpt-4o-mini',
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
    console.error('Get AI config error:', error)
    return NextResponse.json({ success: false, error: '获取配置失败' }, { status: 500 })
  }
}

// 更新AI配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, apiKey, baseUrl, model, enabled } = body
    
    const existing = await db.aIConfig.findUnique({ where: { id: 'default' } })
    
    const finalApiKey = apiKey?.includes('...') && existing?.apiKey 
      ? existing.apiKey 
      : apiKey
    
    const config = await db.aIConfig.upsert({
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
        model: model || 'gpt-4o-mini',
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
    console.error('Save AI config error:', error)
    return NextResponse.json({ success: false, error: '保存配置失败' }, { status: 500 })
  }
}

// 导出获取完整配置的方法
export async function getFullAIConfig() {
  const config = await db.aIConfig.findUnique({ where: { id: 'default' } })
  return config
}
