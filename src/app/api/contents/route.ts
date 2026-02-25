import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取内容列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'food'
    const status = searchParams.get('status')
    
    const where: Record<string, unknown> = { category }
    if (status) where.status = status
    
    const contents = await db.content.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { account: true }
    })
    
    return NextResponse.json({ success: true, contents })
  } catch (error) {
    console.error('Get contents error:', error)
    return NextResponse.json({ success: false, error: '获取内容失败' }, { status: 500 })
  }
}

// 创建内容
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, content, category, platform, style, type, 
      tags, coverImage, accountId 
    } = body
    
    if (!title || !content) {
      return NextResponse.json({ success: false, error: '标题和内容必填' }, { status: 400 })
    }
    
    const newContent = await db.content.create({
      data: {
        title,
        content,
        category: category || 'food',
        platform: platform || 'xiaohongshu',
        style,
        type: type || 'copywriting',
        tags,
        coverImage,
        accountId,
        status: 'draft',
      }
    })
    
    return NextResponse.json({ success: true, content: newContent, message: '内容保存成功' })
  } catch (error) {
    console.error('Create content error:', error)
    return NextResponse.json({ success: false, error: '保存内容失败' }, { status: 500 })
  }
}

// 更新内容
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, content, tags, coverImage, status, likes, comments, shares, views, publishedAt } = body
    
    const updatedContent = await db.content.update({
      where: { id },
      data: {
        title,
        content,
        tags,
        coverImage,
        status,
        likes,
        comments,
        shares,
        views,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
      }
    })
    
    return NextResponse.json({ success: true, content: updatedContent, message: '内容更新成功' })
  } catch (error) {
    console.error('Update content error:', error)
    return NextResponse.json({ success: false, error: '更新内容失败' }, { status: 500 })
  }
}

// 删除内容
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: '缺少内容ID' }, { status: 400 })
    }
    
    await db.content.delete({ where: { id } })
    
    return NextResponse.json({ success: true, message: '内容删除成功' })
  } catch (error) {
    console.error('Delete content error:', error)
    return NextResponse.json({ success: false, error: '删除内容失败' }, { status: 500 })
  }
}
