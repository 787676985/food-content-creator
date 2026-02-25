import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取热门内容列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') || 'all'
    const category = searchParams.get('category') || 'food'
    const favorite = searchParams.get('favorite') === 'true'
    
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

// 添加热门内容（手动添加或导入）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      content,
      platform,
      category,
      author,
      authorId,
      authorAvatar,
      coverImage,
      link,
      likes,
      comments,
      shares,
      views,
      collects,
      publishedAt,
    } = body
    
    if (!title || !platform) {
      return NextResponse.json({ success: false, error: '标题和平台必填' }, { status: 400 })
    }
    
    const hotContent = await db.hotContent.create({
      data: {
        title,
        content,
        platform,
        category: category || 'food',
        author,
        authorId,
        authorAvatar,
        coverImage,
        link,
        likes: likes || 0,
        comments: comments || 0,
        shares: shares || 0,
        views: views || 0,
        collects: collects || 0,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      }
    })
    
    return NextResponse.json({ success: true, content: hotContent, message: '添加成功' })
  } catch (error) {
    console.error('Add hot content error:', error)
    return NextResponse.json({ success: false, error: '添加失败' }, { status: 500 })
  }
}

// 更新热门内容（收藏、分析等）
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
