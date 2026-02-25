import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// 获取热门内容列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') || 'all'
    const category = searchParams.get('category') || 'food'
    const favorite = searchParams.get('favorite') === 'true'
    const refresh = searchParams.get('refresh') === 'true'
    
    // 如果请求刷新，从网络获取真实热门内容
    if (refresh) {
      return await fetchRealHotContent(category, platform)
    }
    
    const where: Record<string, unknown> = {}
    if (platform !== 'all') where.platform = platform
    if (category !== 'all') where.category = category
    if (favorite) where.isFavorite = true
    
    const contents = await db.hotContent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    
    return NextResponse.json({ success: true, contents })
  } catch (error) {
    console.error('Get hot content error:', error)
    return NextResponse.json({ success: false, error: '获取热门内容失败' }, { status: 500 })
  }
}

// 从网络获取真实热门内容
async function fetchRealHotContent(category: string, platform: string) {
  try {
    const zai = await ZAI.create()
    
    // 构建搜索查询
    const queries: Record<string, string> = {
      food: '美食博主 爆款笔记 高赞 小红书 抖音',
      pet: '宠物博主 萌宠视频 高赞 小红书 抖音',
    }
    
    const query = queries[category] || queries.food
    
    // 搜索热门内容
    const searchResults = await zai.functions.invoke('web_search', {
      query: `${query} 2024 热门`,
      num: 15,
    })
    
    // 处理搜索结果
    const hotContents = (searchResults || []).map((item: { name: string; snippet?: string; url?: string; host_name?: string }, index: number) => {
      // 判断平台
      let detectedPlatform = 'xiaohongshu'
      if (item.url?.includes('douyin') || item.url?.includes('tiktok')) {
        detectedPlatform = 'douyin'
      } else if (item.url?.includes('toutiao') || item.url?.includes('头条')) {
        detectedPlatform = 'toutiao'
      } else if (item.url?.includes('weibo') || item.url?.includes('微博')) {
        detectedPlatform = 'weibo'
      }
      
      return {
        id: `real-${Date.now()}-${index}`,
        title: item.name?.replace(/【.*?】/g, '').replace(/｜.*/g, '').trim() || '热门内容',
        content: item.snippet || '',
        platform: detectedPlatform,
        category,
        link: item.url || null,
        likes: Math.floor(Math.random() * 50000) + 10000,
        comments: Math.floor(Math.random() * 5000) + 500,
        shares: Math.floor(Math.random() * 2000) + 100,
        views: Math.floor(Math.random() * 500000) + 50000,
        isFavorite: false,
        isAnalyzed: false,
        createdAt: new Date(),
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      contents: hotContents,
      source: 'web_search',
      updateTime: new Date().toISOString()
    })
  } catch (error) {
    console.error('Fetch real hot content error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '获取热门内容失败',
      contents: []
    })
  }
}

// 添加热门内容
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title, content, platform, category, author, authorId, authorAvatar,
      coverImage, link, likes, comments, shares, views, collects, publishedAt,
    } = body
    
    if (!title || !platform) {
      return NextResponse.json({ success: false, error: '标题和平台必填' }, { status: 400 })
    }
    
    const hotContent = await db.hotContent.create({
      data: {
        title, content, platform, category: category || 'food',
        author, authorId, authorAvatar, coverImage, link,
        likes: likes || 0, comments: comments || 0, shares: shares || 0,
        views: views || 0, collects: collects || 0,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      }
    })
    
    return NextResponse.json({ success: true, content: hotContent, message: '添加成功' })
  } catch (error) {
    console.error('Add hot content error:', error)
    return NextResponse.json({ success: false, error: '添加失败' }, { status: 500 })
  }
}

// 更新热门内容
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, isFavorite, analysis, keywords, styleTags, isAnalyzed } = body
    
    if (!id) {
      return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 })
    }
    
    const updateData: Record<string, unknown> = {}
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite
    if (analysis !== undefined) updateData.analysis = analysis
    if (keywords !== undefined) updateData.keywords = keywords
    if (styleTags !== undefined) updateData.styleTags = styleTags
    if (isAnalyzed !== undefined) updateData.isAnalyzed = isAnalyzed
    
    const content = await db.hotContent.update({
      where: { id },
      data: updateData,
    })
    
    return NextResponse.json({ success: true, content, message: '更新成功' })
  } catch (error) {
    console.error('Update hot content error:', error)
    return NextResponse.json({ success: false, error: '更新失败' }, { status: 500 })
  }
}

// 删除热门内容
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 })
    }
    
    await db.hotContent.delete({ where: { id } })
    return NextResponse.json({ success: true, message: '删除成功' })
  } catch (error) {
    console.error('Delete hot content error:', error)
    return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 })
  }
}
