'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  LayoutDashboard,
  ChevronRight,
  Copy,
  Check,
  Loader2,
  Zap,
  Target,
  BookOpen,
  Send,
  RefreshCw,
  Download,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Flame,
  Utensils,
  Camera,
  FileText,
  Lightbulb,
  Star,
  Bookmark,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

// 类型定义
type Platform = 'douyin' | 'xiaohongshu' | 'toutiao'
type Style = 'professional' | 'casual' | 'emotional' | 'educational'
type ContentType = 'copywriting' | 'script' | 'article'
type ImageStyle = 'food' | 'lifestyle' | 'minimal' | 'vibrant'

interface GeneratedContent {
  content: string
  platform: Platform
  style: Style
  contentType: ContentType
}

interface TrendItem {
  name: string
  snippet: string
  url: string
  host_name: string
}

interface GeneratedTitle {
  titles: string[]
  platform: Platform
}

// 平台配置
const platformConfig = {
  douyin: { name: '抖音', color: 'bg-black', icon: '🎵' },
  xiaohongshu: { name: '小红书', color: 'bg-red-500', icon: '📕' },
  toutiao: { name: '今日头条', color: 'bg-red-600', icon: '📰' },
}

// 模拟数据
const mockTrends: TrendItem[] = [
  { name: '春季养生食谱大合集', snippet: '春季养生正当时，这些食谱帮你调理身体...', url: '#', host_name: '小红书' },
  { name: '网红餐厅打卡攻略', snippet: '最新网红餐厅推荐，拍照超出片...', url: '#', host_name: '抖音' },
  { name: '家常菜做法大全', snippet: '100道家常菜详细做法，新手也能学会...', url: '#', host_name: '今日头条' },
  { name: '减脂餐食谱分享', snippet: '健康减脂不挨饿，这些食谱让你瘦得健康...', url: '#', host_name: '小红书' },
  { name: '美食博主推荐', snippet: '2024年最值得关注的美食博主...', url: '#', host_name: '抖音' },
]

const mockPublishHistory = [
  { id: 1, title: '春季养生汤谱', platform: 'xiaohongshu', status: 'published', likes: 1234, comments: 89, shares: 45, time: '2小时前' },
  { id: 2, title: '家常红烧肉做法', platform: 'douyin', status: 'published', likes: 5678, comments: 234, shares: 123, time: '5小时前' },
  { id: 3, title: '减脂餐一周食谱', platform: 'xiaohongshu', status: 'draft', likes: 0, comments: 0, shares: 0, time: '昨天' },
]

const mockTemplates = [
  { id: 1, name: '美食探店模板', description: '适合餐厅探店、美食测评类内容', type: '探店' },
  { id: 2, name: '食谱分享模板', description: '适合家常菜、烘焙等食谱分享', type: '食谱' },
  { id: 3, name: '美食Vlog模板', description: '适合美食制作过程记录', type: 'Vlog' },
  { id: 4, name: '美食科普模板', description: '适合食材知识、烹饪技巧科普', type: '科普' },
]

export default function Home() {
  // 状态管理
  const [activeTab, setActiveTab] = useState('create')
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState<Platform>('xiaohongshu')
  const [style, setStyle] = useState<Style>('casual')
  const [contentType, setContentType] = useState<ContentType>('copywriting')
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  // 标题优化状态
  const [titleContent, setTitleContent] = useState('')
  const [titlePlatform, setTitlePlatform] = useState<Platform>('xiaohongshu')
  const [generatedTitles, setGeneratedTitles] = useState<GeneratedTitle | null>(null)
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false)

  // 热点趋势状态
  const [trendsTopic, setTrendsTopic] = useState('美食')
  const [trends, setTrends] = useState<TrendItem[]>(mockTrends)
  const [trendsAnalysis, setTrendsAnalysis] = useState('')
  const [isLoadingTrends, setIsLoadingTrends] = useState(false)

  // 图片生成状态
  const [imagePrompt, setImagePrompt] = useState('')
  const [imageStyle, setImageStyle] = useState<ImageStyle>('food')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  // 内容生成
  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      toast.error('请输入话题')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, style, contentType }),
      })

      const data = await response.json()
      if (data.success) {
        setGeneratedContent(data)
        toast.success('内容生成成功！')
      } else {
        toast.error(data.error || '生成失败')
      }
    } catch {
      toast.error('网络错误，请重试')
    } finally {
      setIsGenerating(false)
    }
  }, [topic, platform, style, contentType])

  // 标题优化
  const handleGenerateTitles = useCallback(async () => {
    if (!titleContent.trim()) {
      toast.error('请输入内容')
      return
    }

    setIsGeneratingTitles(true)
    try {
      const response = await fetch('/api/content/titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: titleContent, platform: titlePlatform }),
      })

      const data = await response.json()
      if (data.success) {
        setGeneratedTitles(data)
        toast.success('标题生成成功！')
      } else {
        toast.error(data.error || '生成失败')
      }
    } catch {
      toast.error('网络错误，请重试')
    } finally {
      setIsGeneratingTitles(false)
    }
  }, [titleContent, titlePlatform])

  // 热点搜索
  const handleSearchTrends = useCallback(async () => {
    setIsLoadingTrends(true)
    try {
      const response = await fetch(`/api/trends/search?topic=${encodeURIComponent(trendsTopic)}`)
      const data = await response.json()
      if (data.success) {
        setTrends(data.trends)
        setTrendsAnalysis(data.analysis)
        toast.success('热点获取成功！')
      } else {
        toast.error(data.error || '获取失败')
      }
    } catch {
      toast.error('网络错误，请重试')
    } finally {
      setIsLoadingTrends(false)
    }
  }, [trendsTopic])

  // 图片生成
  const handleGenerateImage = useCallback(async () => {
    if (!imagePrompt.trim()) {
      toast.error('请输入图片描述')
      return
    }

    setIsGeneratingImage(true)
    try {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, style: imageStyle }),
      })

      const data = await response.json()
      if (data.success) {
        setGeneratedImage(data.image)
        toast.success('图片生成成功！')
      } else {
        toast.error(data.error || '生成失败')
      }
    } catch {
      toast.error('网络错误，请重试')
    } finally {
      setIsGeneratingImage(false)
    }
  }, [imagePrompt, imageStyle])

  // 复制内容
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('已复制到剪贴板')
    setTimeout(() => setCopied(false), 2000)
  }, [])

  // 下载图片
  const handleDownloadImage = useCallback(() => {
    if (!generatedImage) return
    const link = document.createElement('a')
    link.href = `data:image/png;base64,${generatedImage}`
    link.download = `food-cover-${Date.now()}.png`
    link.click()
    toast.success('图片已下载')
  }, [generatedImage])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                <Utensils className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  美食内容创作平台
                </h1>
                <p className="text-xs text-muted-foreground">AI驱动 · 爆款内容一键生成</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Flame className="h-3 w-3" />
                美食领域
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Zap className="h-3 w-3 text-yellow-500" />
                AI驱动
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="create" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI创作</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">热点趋势</span>
            </TabsTrigger>
            <TabsTrigger value="assets" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">素材工具</span>
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">多平台管理</span>
            </TabsTrigger>
          </TabsList>

          {/* AI创作模块 */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* 输入区域 */}
              <Card className="border-2 border-orange-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                      <Lightbulb className="h-4 w-4 text-orange-600" />
                    </div>
                    内容创作
                  </CardTitle>
                  <CardDescription>输入话题，AI自动生成爆款美食内容</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">话题/关键词</label>
                    <Textarea
                      placeholder="例如：春季养生汤、家常红烧肉、减脂餐食谱..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">目标平台</label>
                      <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="xiaohongshu">📕 小红书</SelectItem>
                          <SelectItem value="douyin">🎵 抖音</SelectItem>
                          <SelectItem value="toutiao">📰 今日头条</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">内容风格</label>
                      <Select value={style} onValueChange={(v) => setStyle(v as Style)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="casual">轻松幽默</SelectItem>
                          <SelectItem value="professional">专业严谨</SelectItem>
                          <SelectItem value="emotional">情感共鸣</SelectItem>
                          <SelectItem value="educational">知识科普</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">内容类型</label>
                      <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="copywriting">图文文案</SelectItem>
                          <SelectItem value="script">视频脚本</SelectItem>
                          <SelectItem value="article">长文章</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        AI正在创作中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        一键生成爆款内容
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* 输出区域 */}
              <Card className="border-2 border-orange-100 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                        <FileText className="h-4 w-4 text-green-600" />
                      </div>
                      生成结果
                    </CardTitle>
                    {generatedContent && (
                      <Button variant="outline" size="sm" onClick={() => handleCopy(generatedContent.content)}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        复制
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {generatedContent ? (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Badge className={`${platformConfig[generatedContent.platform].color} text-white`}>
                          {platformConfig[generatedContent.platform].icon} {platformConfig[generatedContent.platform].name}
                        </Badge>
                        <Badge variant="outline">{generatedContent.contentType === 'copywriting' ? '图文' : generatedContent.contentType === 'script' ? '脚本' : '文章'}</Badge>
                      </div>
                      <ScrollArea className="h-[300px] rounded-lg border bg-muted/30 p-4">
                        <pre className="whitespace-pre-wrap text-sm">{generatedContent.content}</pre>
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Sparkles className="mx-auto h-12 w-12 opacity-20" />
                        <p className="mt-2">输入话题，开始创作</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 标题优化器 */}
            <Card className="border-2 border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <Target className="h-4 w-4 text-blue-600" />
                  </div>
                  爆款标题生成器
                </CardTitle>
                <CardDescription>输入内容要点，AI生成吸引眼球的爆款标题</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="输入你的内容要点，例如：分享一道简单易学的家常菜，适合新手，10分钟就能做好..."
                      value={titleContent}
                      onChange={(e) => setTitleContent(e.target.value)}
                      className="min-h-[120px]"
                    />
                    <div className="flex gap-2">
                      <Select value={titlePlatform} onValueChange={(v) => setTitlePlatform(v as Platform)}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="xiaohongshu">小红书</SelectItem>
                          <SelectItem value="douyin">抖音</SelectItem>
                          <SelectItem value="toutiao">今日头条</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleGenerateTitles} disabled={isGeneratingTitles}>
                        {isGeneratingTitles ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Zap className="mr-2 h-4 w-4" />
                        )}
                        生成标题
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {generatedTitles?.titles.map((title, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
                      >
                        <span className="text-sm">{title}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleCopy(title)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    )) || (
                      <div className="flex h-[150px] items-center justify-center text-muted-foreground">
                        <p className="text-sm">输入内容要点生成标题</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 热点趋势模块 */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* 热点搜索 */}
              <Card className="lg:col-span-2 border-2 border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    实时热点追踪
                  </CardTitle>
                  <CardDescription>获取美食领域最新热点趋势</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="输入关键词搜索热点..."
                      value={trendsTopic}
                      onChange={(e) => setTrendsTopic(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSearchTrends} disabled={isLoadingTrends}>
                      {isLoadingTrends ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {trends.map((trend, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h4 className="font-medium">{trend.name}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">{trend.snippet}</p>
                            </div>
                            <Badge variant="secondary">{trend.host_name}</Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* 趋势分析 */}
              <div className="space-y-6">
                <Card className="border-2 border-green-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                        <BookOpen className="h-4 w-4 text-green-600" />
                      </div>
                      AI趋势分析
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {trendsAnalysis ? (
                      <ScrollArea className="h-[200px]">
                        <p className="text-sm whitespace-pre-wrap">{trendsAnalysis}</p>
                      </ScrollArea>
                    ) : (
                      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                        <p className="text-sm text-center">搜索热点后<br />AI将自动分析趋势</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 热门关键词 */}
                <Card className="border-2 border-yellow-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100">
                        <Star className="h-4 w-4 text-yellow-600" />
                      </div>
                      热门关键词
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {['春季养生', '减脂餐', '家常菜', '网红餐厅', '烘焙', '下午茶', '早餐', '夜宵'].map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => {
                            setTrendsTopic(keyword)
                            toast.info(`已选择: ${keyword}`)
                          }}
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 最佳发布时间 */}
                <Card className="border-2 border-blue-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      最佳发布时间
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">早高峰</span>
                      <Badge variant="secondary">7:00-9:00</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">午休时段</span>
                      <Badge variant="secondary">12:00-14:00</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">晚高峰</span>
                      <Badge className="bg-green-500">18:00-21:00</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">深夜时段</span>
                      <Badge variant="secondary">22:00-24:00</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 素材工具模块 */}
          <TabsContent value="assets" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* AI封面生成 */}
              <Card className="border-2 border-pink-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100">
                      <Camera className="h-4 w-4 text-pink-600" />
                    </div>
                    AI封面生成
                  </CardTitle>
                  <CardDescription>输入描述，AI自动生成精美美食封面图</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">图片描述</label>
                    <Textarea
                      placeholder="例如：一碗热气腾腾的红烧肉，色泽红亮，摆盘精致..."
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">图片风格</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'food', label: '美食摄影', icon: '🍽️' },
                        { value: 'lifestyle', label: '生活方式', icon: '🏠' },
                        { value: 'minimal', label: '极简风格', icon: '⬜' },
                        { value: 'vibrant', label: '鲜艳活泼', icon: '🌈' },
                      ].map((s) => (
                        <Button
                          key={s.value}
                          variant={imageStyle === s.value ? 'default' : 'outline'}
                          className="justify-start"
                          onClick={() => setImageStyle(s.value as ImageStyle)}
                        >
                          <span className="mr-2">{s.icon}</span>
                          {s.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    {isGeneratingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        AI正在生成图片...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="mr-2 h-4 w-4" />
                        生成封面图
                      </>
                    )}
                  </Button>

                  {generatedImage && (
                    <div className="space-y-2">
                      <div className="relative overflow-hidden rounded-lg border">
                        <img
                          src={`data:image/png;base64,${generatedImage}`}
                          alt="Generated"
                          className="w-full object-cover"
                        />
                      </div>
                      <Button variant="outline" className="w-full" onClick={handleDownloadImage}>
                        <Download className="mr-2 h-4 w-4" />
                        下载图片
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 模板中心 */}
              <Card className="border-2 border-indigo-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                      <Bookmark className="h-4 w-4 text-indigo-600" />
                    </div>
                    模板中心
                  </CardTitle>
                  <CardDescription>精选美食内容模板，快速开始创作</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {mockTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h4 className="font-medium">{template.name}</h4>
                              <p className="text-sm text-muted-foreground">{template.description}</p>
                            </div>
                            <Badge variant="outline">{template.type}</Badge>
                          </div>
                          <Button variant="ghost" size="sm" className="mt-2">
                            使用模板
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 多平台管理模块 */}
          <TabsContent value="manage" className="space-y-6">
            {/* 数据概览 */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-2 border-orange-100">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">总发布数</p>
                      <p className="text-2xl font-bold">128</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                      <Send className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-red-100">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">总点赞数</p>
                      <p className="text-2xl font-bold">45.2K</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                      <Heart className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-100">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">总评论数</p>
                      <p className="text-2xl font-bold">3.8K</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <MessageCircle className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-100">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">总分享数</p>
                      <p className="text-2xl font-bold">2.1K</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <Share2 className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 发布历史 */}
            <Card className="border-2 border-gray-100 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <Eye className="h-4 w-4 text-gray-600" />
                    </div>
                    发布历史
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    刷新
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPublishHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border bg-card p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${platformConfig[item.platform].color} text-white`}>
                          {platformConfig[item.platform].icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{platformConfig[item.platform].name}</span>
                            <span>{item.time}</span>
                            <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                              {item.status === 'published' ? '已发布' : '草稿'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {item.status === 'published' && (
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-red-500" />
                            {item.likes}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4 text-blue-500" />
                            {item.comments}
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="h-4 w-4 text-green-500" />
                            {item.shares}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 平台账号管理 */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-2 border-red-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">📕</span>
                    小红书账号
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-red-600 font-bold">美</span>
                      </div>
                      <div>
                        <p className="font-medium">美食达人小王</p>
                        <p className="text-sm text-muted-foreground">粉丝: 12.5K</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500">已连接</Badge>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground">本月发布进度: 15/20篇</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">🎵</span>
                    抖音账号
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-600 font-bold">美</span>
                      </div>
                      <div>
                        <p className="font-medium">美食探店日记</p>
                        <p className="text-sm text-muted-foreground">粉丝: 8.2K</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500">已连接</Badge>
                  </div>
                  <Progress value={60} className="h-2" />
                  <p className="text-xs text-muted-foreground">本月发布进度: 12/20条</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* 底部 */}
      <footer className="border-t bg-white/80 backdrop-blur-md py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>美食内容创作平台 · AI驱动 · 助力美食博主快速成长</p>
        </div>
      </footer>
    </div>
  )
}
