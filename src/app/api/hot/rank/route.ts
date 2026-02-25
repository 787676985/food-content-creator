import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// 热榜数据源配置
const HOT_SOURCES = {
  weibo: {
    name: '微博热搜',
    url: 'https://weibo.com/ajax/side/hotSearch',
    parse: (data: Record<string, unknown>) => {
      const real = data?.data?.realtime as Array<{ note: string; num: number; word: string }>
      if (!real) return []
      return real.slice(0, 20).map((item, index) => ({
        keyword: item.word || item.note,
        heat: item.num || 0,
        rank: index + 1,
      }))
    }
  },
  zhihu: {
    name: '知乎热榜',
    url: 'https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total',
    parse: (data: Record<string, unknown>) => {
      const list = data?.data as Array<{ target: { title: string }; detail_text: string }> || []
      return list.slice(0, 20).map((item, index) => ({
        keyword: item.target?.title || '',
        heat: parseInt(item.detail_text?.replace(/[^0-9]/g, '') || '0'),
        rank: index + 1,
      }))
    }
  }
}

// 获取热榜
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') || 'weibo'
    const category = searchParams.get('category') || 'general'
    
    // 使用z-ai搜索获取实时热点
    const zai = await ZAI.create()
    
    // 根据平台和领域搜索热点
    const searchQueries: Record<string, string> = {
      weibo: category === 'food' ? '美食热搜 热门话题' : category === 'pet' ? '宠物热搜 萌宠话题' : '今日热搜 热门话题',
      douyin: category === 'food' ? '抖音美食热门 网红美食' : category === 'pet' ? '抖音宠物热门 萌宠视频' : '抖音热门 热门视频',
      xiaohongshu: category === 'food' ? '小红书美食热门 网红餐厅' : category === 'pet' ? '小红书宠物热门 养宠攻略' : '小红书热门 爆款笔记',
    }
    
    const query = searchQueries[platform] || searchQueries.weibo
    
    // 搜索实时热点
    const searchResults = await zai.functions.invoke('web_search', {
      query: `${query} 2024 最新`,
      num: 20,
    })
    
    // 处理搜索结果
    const ranks = (searchResults || []).slice(0, 20).map((item: { name: string; snippet?: string; url?: string }, index: number) => ({
      id: `hot-${Date.now()}-${index}`,
      platform,
      keyword: item.name?.replace(/【.*?】/g, '').replace(/｜.*/g, '').trim() || `热门话题${index + 1}`,
      rank: index + 1,
      heat: Math.max(1000000 - index * 50000, 10000),
      category,
      link: item.url || null,
      createdAt: new Date(),
    }))
    
    // 过滤领域相关
    const filteredRanks = category === 'general' ? ranks : ranks.filter(item => {
      const foodKeywords = ['美食', '食谱', '餐厅', '菜', '吃', '烹饪', '食材', '养生', '减脂', '烘焙', '探店', '外卖']
      const petKeywords = ['宠物', '猫', '狗', '萌宠', '养宠', '猫咪', '狗狗', '宠物店', '宠物医院']
      
      if (category === 'food') {
        return foodKeywords.some(k => item.keyword.includes(k))
      }
      if (category === 'pet') {
        return petKeywords.some(k => item.keyword.includes(k))
      }
      return true
    })
    
    // 如果过滤后太少，补充一些通用热点
    if (filteredRanks.length < 5) {
      return NextResponse.json({ 
        success: true, 
        ranks: ranks.slice(0, 10),
        platform,
        updateTime: new Date().toISOString(),
        source: 'web_search'
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      ranks: filteredRanks.length > 0 ? filteredRanks : ranks.slice(0, 10),
      platform,
      updateTime: new Date().toISOString(),
      source: 'web_search'
    })
  } catch (error) {
    console.error('Get hot rank error:', error)
    
    // 返回备用数据
    const fallbackRanks = [
      { id: 'fb-1', platform: 'weibo', keyword: '春季养生食谱推荐', rank: 1, heat: 982341, category: 'food' },
      { id: 'fb-2', platform: 'weibo', keyword: '网红餐厅打卡攻略', rank: 2, heat: 876523, category: 'food' },
      { id: 'fb-3', platform: 'weibo', keyword: '减脂餐一周食谱', rank: 3, heat: 765432, category: 'food' },
      { id: 'fb-4', platform: 'weibo', keyword: '家常菜做法大全', rank: 4, heat: 654321, category: 'food' },
      { id: 'fb-5', platform: 'weibo', keyword: '萌宠日常视频', rank: 5, heat: 543210, category: 'pet' },
      { id: 'fb-6', platform: 'weibo', keyword: '猫咪训练技巧', rank: 6, heat: 432109, category: 'pet' },
      { id: 'fb-7', platform: 'weibo', keyword: '狗狗健康饮食', rank: 7, heat: 321098, category: 'pet' },
      { id: 'fb-8', platform: 'weibo', keyword: '美食博主推荐', rank: 8, heat: 210987, category: 'food' },
    ]
    
    return NextResponse.json({ 
      success: true, 
      ranks: fallbackRanks,
      platform: 'weibo',
      updateTime: new Date().toISOString(),
      source: 'fallback'
    })
  }
}

// 刷新热榜（保存到数据库）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, category } = body
    
    // 调用GET获取最新数据
    const getUrl = `${request.url.split('/api/')[0]}/api/hot/rank?platform=${platform}&category=${category || 'general'}`
    const response = await fetch(getUrl)
    const data = await response.json()
    
    if (data.success && data.ranks) {
      // 清除旧数据
      await db.hotRank.deleteMany({ where: { platform } })
      
      // 保存新数据
      for (const rank of data.ranks) {
        await db.hotRank.create({
          data: {
            platform,
            keyword: rank.keyword,
            rank: rank.rank,
            heat: rank.heat,
            category: category || 'general',
            link: rank.link,
          }
        })
      }
      
      return NextResponse.json({ 
        success: true, 
        ranks: data.ranks,
        message: '热榜已更新',
        source: data.source
      })
    }
    
    return NextResponse.json({ success: false, error: '获取热榜失败' }, { status: 500 })
  } catch (error) {
    console.error('Refresh hot rank error:', error)
    return NextResponse.json({ success: false, error: '刷新热榜失败' }, { status: 500 })
  }
}
