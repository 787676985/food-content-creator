'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, TrendingUp, Image as ImageIcon, LayoutDashboard,
  Copy, Check, Loader2, Zap, Target, Send, Download,
  Clock, Heart, MessageCircle, Share2, Eye, Flame,
  Utensils, Camera, FileText, Lightbulb, Star, Bookmark,
  Settings, Plus, Trash2, Edit, Save, X, Cat, Dog, PawPrint,
  ChevronRight, RefreshCw
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

// 类型定义
type Platform = 'douyin' | 'xiaohongshu' | 'toutiao'
type Style = 'professional' | 'casual' | 'emotional' | 'educational'
type ContentType = 'copywriting' | 'script' | 'article'
type ImageStyle = 'food' | 'lifestyle' | 'minimal' | 'vibrant'
type Category = 'food' | 'pet'

interface SocialAccount {
  id: string
  platform: string
  accountName: string
  accountId?: string
  avatar?: string
  fansCount: number
  notesCount: number
  status: string
  _count?: { contents: number }
}

interface Content {
  id: string
  title: string
  content: string
  category: string
  platform: string
  status: string
  likes: number
  comments: number
  shares: number
  createdAt: string
}

// 平台配置
const platformConfig = {
  douyin: { name: '抖音', color: 'bg-black', icon: '🎵' },
  xiaohongshu: { name: '小红书', color: 'bg-red-500', icon: '📕' },
  toutiao: { name: '今日头条', color: 'bg-red-600', icon: '📰' },
}

// 领域配置
const categoryConfig = {
  food: { name: '美食', icon: Utensils, color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-100' },
  pet: { name: '宠物', icon: PawPrint, color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-100' },
}

export default function Home() {
  // 领域选择
  const [category, setCategory] = useState<Category>('food')
  
  // 内容生成状态
  const [activeTab, setActiveTab] = useState('create')
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState<Platform>('xiaohongshu')
  const [style, setStyle] = useState<Style>('casual')
  const [contentType, setContentType] = useState<ContentType>('copywriting')
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  // 标题优化状态
  const [titleContent, setTitleContent] = useState('')
  const [titlePlatform, setTitlePlatform] = useState<Platform>('xiaohongshu')
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([])
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false)

  // 图片生成状态
  const [imagePrompt, setImagePrompt] = useState('')
  const [imageStyle, setImageStyle] = useState<ImageStyle>('food')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  // 社交账号状态
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [showAccountDialog, setShowAccountDialog] = useState(false)
  const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(null)
  const [accountForm, setAccountForm] = useState({ platform: 'xiaohongshu', accountName: '', fansCount: 0 })

  // 内容管理状态
  const [savedContents, setSavedContents] = useState<Content[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [contentTitle, setContentTitle] = useState('')

  // 设置面板状态
  const [showSettings, setShowSettings] = useState(false)
  const [aiConfig, setAiConfig] = useState({ provider: 'openai', apiKey: '', baseUrl: '', model: '', enabled: false })
  const [imageConfig, setImageConfig] = useState({ provider: 'openai', apiKey: '', baseUrl: '', model: '', enabled: false })

  // 加载数据
  useEffect(() => {
    loadAccounts()
    loadContents()
    loadConfig()
  }, [category])

  const loadAccounts = async () => {
    try {
      const res = await fetch('/api/accounts')
      const data = await res.json()
      if (data.success) setAccounts(data.accounts)
    } catch (e) {
      console.error('Load accounts error:', e)
    }
  }

  const loadContents = async () => {
    try {
      const res = await fetch(`/api/contents?category=${category}`)
      const data = await res.json()
      if (data.success) setSavedContents(data.contents)
    } catch (e) {
      console.error('Load contents error:', e)
    }
  }

  const loadConfig = async () => {
    try {
      const [aiRes, imgRes] = await Promise.all([
        fetch('/api/config/ai'),
        fetch('/api/config/image')
      ])
      const aiData = await aiRes.json()
      const imgData = await imgRes.json()
      if (aiData.success) setAiConfig(aiData.config)
      if (imgData.success) setImageConfig(imgData.config)
    } catch (e) {
      console.error('Load config error:', e)
    }
  }

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
        body: JSON.stringify({ topic, platform, style, contentType, category }),
      })

      const data = await response.json()
      if (data.success) {
        setGeneratedContent(data.content)
        setContentTitle(topic.slice(0, 20))
        toast.success('内容生成成功！')
      } else {
        toast.error(data.error || '生成失败')
      }
    } catch {
      toast.error('网络错误，请重试')
    } finally {
      setIsGenerating(false)
    }
  }, [topic, platform, style, contentType, category])

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
        body: JSON.stringify({ content: titleContent, platform: titlePlatform, category }),
      })

      const data = await response.json()
      if (data.success) {
        setGeneratedTitles(data.titles)
        toast.success('标题生成成功！')
      } else {
        toast.error(data.error || '生成失败')
      }
    } catch {
      toast.error('网络错误，请重试')
    } finally {
      setIsGeneratingTitles(false)
    }
  }, [titleContent, titlePlatform, category])

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
        body: JSON.stringify({ prompt: imagePrompt, style: imageStyle, category }),
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
  }, [imagePrompt, imageStyle, category])

  // 保存内容
  const handleSaveContent = useCallback(async () => {
    if (!contentTitle.trim() || !generatedContent) {
      toast.error('请输入标题')
      return
    }

    try {
      const response = await fetch('/api/contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: contentTitle,
          content: generatedContent,
          category,
          platform,
          type: contentType,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('内容已保存')
        setShowSaveDialog(false)
        loadContents()
      } else {
        toast.error(data.error || '保存失败')
      }
    } catch {
      toast.error('保存失败')
    }
  }, [contentTitle, generatedContent, category, platform, contentType])

  // 添加账号
  const handleAddAccount = useCallback(async () => {
    if (!accountForm.accountName.trim()) {
      toast.error('请输入账号名称')
      return
    }

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountForm),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('账号添加成功')
        setShowAccountDialog(false)
        setAccountForm({ platform: 'xiaohongshu', accountName: '', fansCount: 0 })
        loadAccounts()
      } else {
        toast.error(data.error || '添加失败')
      }
    } catch {
      toast.error('添加失败')
    }
  }, [accountForm])

  // 删除账号
  const handleDeleteAccount = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/accounts?id=${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        toast.success('账号已删除')
        loadAccounts()
      }
    } catch {
      toast.error('删除失败')
    }
  }, [])

  // 删除内容
  const handleDeleteContent = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/contents?id=${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        toast.success('内容已删除')
        loadContents()
      }
    } catch {
      toast.error('删除失败')
    }
  }, [])

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
    link.download = `${category}-cover-${Date.now()}.png`
    link.click()
    toast.success('图片已下载')
  }, [generatedImage, category])

  // 保存AI配置
  const handleSaveAIConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/config/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiConfig),
      })
      const data = await response.json()
      if (data.success) {
        toast.success('AI配置已保存')
        setAiConfig(data.config)
      }
    } catch {
      toast.error('保存失败')
    }
  }, [aiConfig])

  // 保存图片配置
  const handleSaveImageConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/config/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imageConfig),
      })
      const data = await response.json()
      if (data.success) {
        toast.success('图片配置已保存')
        setImageConfig(data.config)
      }
    } catch {
      toast.error('保存失败')
    }
  }, [imageConfig])

  const CategoryIcon = categoryConfig[category].icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${categoryConfig[category].color} text-white shadow-lg`}>
                <CategoryIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  内容创作平台
                </h1>
                <p className="text-xs text-muted-foreground">AI驱动 · 爆款内容一键生成</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* 领域切换 */}
              <div className="flex rounded-lg border p-1">
                {(Object.keys(categoryConfig) as Category[]).map((cat) => {
                  const Icon = categoryConfig[cat].icon
                  return (
                    <Button
                      key={cat}
                      variant={category === cat ? 'default' : 'ghost'}
                      size="sm"
                      className={`gap-1 ${category === cat ? `bg-gradient-to-r ${categoryConfig[cat].color}` : ''}`}
                      onClick={() => setCategory(cat)}
                    >
                      <Icon className="h-4 w-4" />
                      {categoryConfig[cat].name}
                    </Button>
                  )
                })}
              </div>
              
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4" />
                设置
              </Button>
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
            <TabsTrigger value="accounts" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">账号管理</span>
            </TabsTrigger>
            <TabsTrigger value="contents" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">内容管理</span>
            </TabsTrigger>
            <TabsTrigger value="assets" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">素材工具</span>
            </TabsTrigger>
          </TabsList>

          {/* AI创作模块 */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* 输入区域 */}
              <Card className="border-2 border-orange-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${categoryConfig[category].bgColor}`}>
                      <Lightbulb className="h-4 w-4 text-orange-600" />
                    </div>
                    {categoryConfig[category].name}内容创作
                  </CardTitle>
                  <CardDescription>输入话题，AI自动生成爆款内容</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">话题/关键词</label>
                    <Textarea
                      placeholder={category === 'food' ? '例如：春季养生汤、家常红烧肉、减脂餐食谱...' : '例如：猫咪日常、狗狗训练、养宠攻略...'}
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">目标平台</label>
                      <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                    className={`w-full bg-gradient-to-r ${categoryConfig[category].color}`}
                  >
                    {isGenerating ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />AI正在创作中...</>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" />一键生成爆款内容</>
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
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCopy(generatedContent)}>
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          复制
                        </Button>
                        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Save className="h-4 w-4 mr-1" />
                              保存
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>保存内容</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div className="space-y-2">
                                <Label>标题</Label>
                                <Input
                                  value={contentTitle}
                                  onChange={(e) => setContentTitle(e.target.value)}
                                  placeholder="输入内容标题"
                                />
                              </div>
                              <Button onClick={handleSaveContent} className="w-full">
                                <Save className="mr-2 h-4 w-4" />
                                确认保存
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {generatedContent ? (
                    <ScrollArea className="h-[300px] rounded-lg border bg-muted/30 p-4">
                      <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
                    </ScrollArea>
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
                      placeholder={category === 'food' ? '输入你的内容要点，例如：分享一道简单易学的家常菜...' : '输入你的内容要点，例如：分享养猫的日常趣事...'}
                      value={titleContent}
                      onChange={(e) => setTitleContent(e.target.value)}
                      className="min-h-[120px]"
                    />
                    <div className="flex gap-2">
                      <Select value={titlePlatform} onValueChange={(v) => setTitlePlatform(v as Platform)}>
                        <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="xiaohongshu">小红书</SelectItem>
                          <SelectItem value="douyin">抖音</SelectItem>
                          <SelectItem value="toutiao">今日头条</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleGenerateTitles} disabled={isGeneratingTitles}>
                        {isGeneratingTitles ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                        生成标题
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {generatedTitles.length > 0 ? generatedTitles.map((title, index) => (
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
                    )) : (
                      <div className="flex h-[150px] items-center justify-center text-muted-foreground">
                        <p className="text-sm">输入内容要点生成标题</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 账号管理模块 */}
          <TabsContent value="accounts" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">社交媒体账号</h2>
                <p className="text-muted-foreground">管理您的社交媒体账号</p>
              </div>
              <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-1">
                    <Plus className="h-4 w-4" />
                    添加账号
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>添加社交媒体账号</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>平台</Label>
                      <Select value={accountForm.platform} onValueChange={(v) => setAccountForm({ ...accountForm, platform: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="xiaohongshu">📕 小红书</SelectItem>
                          <SelectItem value="douyin">🎵 抖音</SelectItem>
                          <SelectItem value="toutiao">📰 今日头条</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>账号名称</Label>
                      <Input
                        value={accountForm.accountName}
                        onChange={(e) => setAccountForm({ ...accountForm, accountName: e.target.value })}
                        placeholder="输入账号名称"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>粉丝数</Label>
                      <Input
                        type="number"
                        value={accountForm.fansCount}
                        onChange={(e) => setAccountForm({ ...accountForm, fansCount: parseInt(e.target.value) || 0 })}
                        placeholder="粉丝数量"
                      />
                    </div>
                    <Button onClick={handleAddAccount} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      添加账号
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accounts.length > 0 ? accounts.map((account) => (
                <Card key={account.id} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${platformConfig[account.platform as keyof typeof platformConfig]?.color || 'bg-gray-500'} text-white`}>
                          {platformConfig[account.platform as keyof typeof platformConfig]?.icon || '📱'}
                        </div>
                        <div>
                          <p className="font-medium">{account.accountName}</p>
                          <p className="text-sm text-muted-foreground">{platformConfig[account.platform as keyof typeof platformConfig]?.name}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteAccount(account.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">粉丝</span>
                      <span className="font-medium">{account.fansCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted-foreground">内容数</span>
                      <span className="font-medium">{account._count?.contents || 0}</span>
                    </div>
                    <Badge variant={account.status === 'active' ? 'default' : 'secondary'} className="mt-3">
                      {account.status === 'active' ? '已连接' : '未连接'}
                    </Badge>
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-full flex h-[200px] items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <LayoutDashboard className="mx-auto h-12 w-12 opacity-20" />
                    <p className="mt-2">暂无账号，点击上方添加</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* 内容管理模块 */}
          <TabsContent value="contents" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">内容管理</h2>
                <p className="text-muted-foreground">管理您创作的内容</p>
              </div>
              <Button variant="outline" size="sm" onClick={loadContents}>
                <RefreshCw className="mr-2 h-4 w-4" />
                刷新
              </Button>
            </div>

            <div className="space-y-4">
              {savedContents.length > 0 ? savedContents.map((content) => (
                <Card key={content.id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={platformConfig[content.platform as keyof typeof platformConfig]?.color}>
                            {platformConfig[content.platform as keyof typeof platformConfig]?.icon} {platformConfig[content.platform as keyof typeof platformConfig]?.name}
                          </Badge>
                          <Badge variant={content.status === 'published' ? 'default' : 'secondary'}>
                            {content.status === 'published' ? '已发布' : '草稿'}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-lg">{content.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{content.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                          {content.status === 'published' && (
                            <>
                              <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {content.likes}</span>
                              <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {content.comments}</span>
                              <span className="flex items-center gap-1"><Share2 className="h-3 w-3" /> {content.shares}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleCopy(content.content)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteContent(content.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 opacity-20" />
                    <p className="mt-2">暂无保存的内容</p>
                  </div>
                </div>
              )}
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
                  <CardDescription>输入描述，AI自动生成精美封面图</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">图片描述</label>
                    <Textarea
                      placeholder={category === 'food' ? '例如：一碗热气腾腾的红烧肉，色泽红亮...' : '例如：一只可爱的橘猫在阳光下打盹...'}
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
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
                  >
                    {isGeneratingImage ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />AI正在生成图片...</>
                    ) : (
                      <><ImageIcon className="mr-2 h-4 w-4" />生成封面图</>
                    )}
                  </Button>

                  {generatedImage && (
                    <div className="space-y-2">
                      <div className="relative overflow-hidden rounded-lg border">
                        <img src={`data:image/png;base64,${generatedImage}`} alt="Generated" className="w-full object-cover" />
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
                  <CardDescription>精选内容模板，快速开始创作</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {(category === 'food' ? [
                        { id: 1, name: '美食探店模板', description: '适合餐厅探店、美食测评类内容', type: '探店' },
                        { id: 2, name: '食谱分享模板', description: '适合家常菜、烘焙等食谱分享', type: '食谱' },
                        { id: 3, name: '美食Vlog模板', description: '适合美食制作过程记录', type: 'Vlog' },
                      ] : [
                        { id: 1, name: '萌宠日常模板', description: '适合宠物日常生活记录', type: '日常' },
                        { id: 2, name: '养宠攻略模板', description: '适合养宠知识、技巧分享', type: '攻略' },
                        { id: 3, name: '宠物训练模板', description: '适合宠物训练教程内容', type: '训练' },
                      ]).map((template) => (
                        <div key={template.id} className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h4 className="font-medium">{template.name}</h4>
                              <p className="text-sm text-muted-foreground">{template.description}</p>
                            </div>
                            <Badge variant="outline">{template.type}</Badge>
                          </div>
                          <Button variant="ghost" size="sm" className="mt-2">
                            使用模板 <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* 设置面板 */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI服务配置</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* AI文本配置 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">文本生成服务</CardTitle>
                    <CardDescription>用于内容创作、标题生成</CardDescription>
                  </div>
                  <Switch
                    checked={aiConfig.enabled}
                    onCheckedChange={(checked) => setAiConfig({ ...aiConfig, enabled: checked })}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>服务商</Label>
                    <Select value={aiConfig.provider} onValueChange={(v) => setAiConfig({ ...aiConfig, provider: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="deepseek">DeepSeek</SelectItem>
                        <SelectItem value="claude">Claude</SelectItem>
                        <SelectItem value="zhipu">智谱AI</SelectItem>
                        <SelectItem value="moonshot">Moonshot</SelectItem>
                        <SelectItem value="qwen">通义千问</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>模型</Label>
                    <Input
                      value={aiConfig.model}
                      onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                      placeholder="gpt-4o-mini"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={aiConfig.apiKey}
                    onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                    placeholder="sk-..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>API地址</Label>
                  <Input
                    value={aiConfig.baseUrl}
                    onChange={(e) => setAiConfig({ ...aiConfig, baseUrl: e.target.value })}
                    placeholder="https://api.openai.com/v1"
                  />
                </div>
                <Button onClick={handleSaveAIConfig} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  保存AI配置
                </Button>
              </CardContent>
            </Card>

            {/* 图片配置 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">图片生成服务</CardTitle>
                    <CardDescription>用于AI封面图生成</CardDescription>
                  </div>
                  <Switch
                    checked={imageConfig.enabled}
                    onCheckedChange={(checked) => setImageConfig({ ...imageConfig, enabled: checked })}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>服务商</Label>
                    <Select value={imageConfig.provider} onValueChange={(v) => setImageConfig({ ...imageConfig, provider: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI DALL-E</SelectItem>
                        <SelectItem value="stability">Stability AI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>模型</Label>
                    <Input
                      value={imageConfig.model}
                      onChange={(e) => setImageConfig({ ...imageConfig, model: e.target.value })}
                      placeholder="dall-e-3"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={imageConfig.apiKey}
                    onChange={(e) => setImageConfig({ ...imageConfig, apiKey: e.target.value })}
                    placeholder="sk-..."
                  />
                </div>
                <Button onClick={handleSaveImageConfig} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  保存图片配置
                </Button>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* 底部 */}
      <footer className="border-t bg-white/80 backdrop-blur-md py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>内容创作平台 · AI驱动 · 助力创作者快速成长</p>
        </div>
      </footer>
    </div>
  )
}
