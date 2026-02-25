import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 热榜数据（模拟数据，实际可接入公开API）
const mockHotRanks: Record<string, { keyword: string; heat: number; link?: string }[]> = {
  weibo: [
    { keyword: '春季养生食谱推荐', heat: 982341 },
    { keyword: '网红餐厅打卡攻略', heat: 876523 },
    { keyword: '减脂餐一周食谱', heat: 765432 },
    { keyword: '家常菜做法大全', heat: 654321 },
    { keyword: '美食博主推荐', heat: 543210 },
    { keyword: '宠物日常萌宠视频', heat: 432109 },
    { keyword: '猫咪训练技巧', heat: 321098 },
    { keyword: '狗狗健康饮食', heat: 210987 },
  ],
  douyin: [
    { keyword: '美食探店vlog', heat: 1234567 },
    { keyword: '懒人快手菜', heat: 987654 },
    { keyword: '网红美食测评', heat: 876543 },
    { keyword: '萌宠日常', heat: 765432 },
    { keyword: '宠物训练教程', heat: 654321 },
  ],
  xiaohongshu: [
    { keyword: '春季养生汤谱', heat: 567890 },
    { keyword: '减脂餐食谱分享', heat: 456789 },
    { keyword: '家常菜教程', heat: 345678 },
    { keyword: '猫咪日常', heat: 234567 },
    { keyword: '养宠攻略', heat: 123456 },
  ],
}

// 获取热榜
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') || 'weibo'
    const category = searchParams.get('category') || 'general'
    
    // 尝试从数据库获取
    let ranks = await db.hotRank.findMany({
      where: { platform },
      orderBy: { rank: 'asc' },
      take: 20,
    })
    
    // 如果数据库没有，使用模拟数据
    if (ranks.length === 0) {
      const mockData = mockHotRanks[platform] || mockHotRanks.weibo
      
      // 过滤领域相关
      const filteredData = category === 'general' 
        ? mockData 
        : mockData.filter(item => {
            if (category === 'food') {
              return ['食谱', '美食', '餐厅', '菜', '养生'].some(k => item.keyword.includes(k))
            }
            if (category === 'pet') {
              return ['宠物', '猫', '狗', '萌宠', '养宠'].some(k => item.keyword.includes(k))
            }
            return true
          })
      
      ranks = filteredData.map((item, index) => ({
        id: `mock-${index}`,
        platform,
        keyword: item.keyword,
        rank: index + 1,
        heat: item.heat,
        category,
        link: item.link || null,
        createdAt: new Date(),
      })) as typeof ranks
    }
    
    return NextResponse.json({ 
      success: true, 
      ranks,
      platform,
      updateTime: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Get hot rank error:', error)
    return NextResponse.json({ success: false, error: '获取热榜失败' }, { status: 500 })
  }
}

// 刷新热榜（从公开API获取）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, category } = body
    
    // 清除旧数据
    await db.hotRank.deleteMany({ where: { platform } })
    
    // 获取新数据（这里使用模拟数据，实际可接入公开API）
    const mockData = mockHotRanks[platform] || mockHotRanks.weibo
    
    const ranks = await Promise.all(
      mockData.map((item, index) => 
        db.hotRank.create({
          data: {
            platform,
            keyword: item.keyword,
            rank: index + 1,
            heat: item.heat,
            category: category || 'general',
            link: item.link,
          }
        })
      )
    )
    
    return NextResponse.json({ 
      success: true, 
      ranks,
      message: '热榜已更新' 
    })
  } catch (error) {
    console.error('Refresh hot rank error:', error)
    return NextResponse.json({ success: false, error: '刷新热榜失败' }, { status: 500 })
  }
}
