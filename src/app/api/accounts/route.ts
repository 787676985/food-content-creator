import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取所有账号
export async function GET() {
  try {
    const accounts = await db.socialAccount.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { contents: true } } }
    })
    
    return NextResponse.json({ success: true, accounts })
  } catch (error) {
    console.error('Get accounts error:', error)
    return NextResponse.json({ success: false, error: '获取账号失败' }, { status: 500 })
  }
}

// 创建账号
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, accountName, accountId, avatar, fansCount, accessToken } = body
    
    if (!platform || !accountName) {
      return NextResponse.json({ success: false, error: '平台和账号名称必填' }, { status: 400 })
    }
    
    const account = await db.socialAccount.create({
      data: {
        platform,
        accountName,
        accountId,
        avatar,
        fansCount: fansCount || 0,
        accessToken,
        status: 'active',
      }
    })
    
    return NextResponse.json({ success: true, account, message: '账号添加成功' })
  } catch (error) {
    console.error('Create account error:', error)
    return NextResponse.json({ success: false, error: '添加账号失败' }, { status: 500 })
  }
}

// 更新账号
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, accountName, accountId, avatar, fansCount, notesCount, status } = body
    
    const account = await db.socialAccount.update({
      where: { id },
      data: {
        accountName,
        accountId,
        avatar,
        fansCount,
        notesCount,
        status,
      }
    })
    
    return NextResponse.json({ success: true, account, message: '账号更新成功' })
  } catch (error) {
    console.error('Update account error:', error)
    return NextResponse.json({ success: false, error: '更新账号失败' }, { status: 500 })
  }
}

// 删除账号
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: '缺少账号ID' }, { status: 400 })
    }
    
    await db.socialAccount.delete({ where: { id } })
    
    return NextResponse.json({ success: true, message: '账号删除成功' })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ success: false, error: '删除账号失败' }, { status: 500 })
  }
}
