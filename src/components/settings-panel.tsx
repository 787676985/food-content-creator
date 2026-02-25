'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  X,
  Key,
  Server,
  Cpu,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  AI_PROVIDER_PRESETS,
  IMAGE_PROVIDER_PRESETS,
  type AIConfig,
  type ImageConfig,
  type AIProvider,
} from '@/lib/ai-config'

interface SettingsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  // AI配置状态
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    provider: 'openai',
    apiKey: '',
    baseURL: AI_PROVIDER_PRESETS.openai.baseURL,
    model: AI_PROVIDER_PRESETS.openai.defaultModel,
    enabled: false,
  })

  // 图片配置状态
  const [imageConfig, setImageConfig] = useState<ImageConfig>({
    provider: 'openai',
    apiKey: '',
    baseURL: IMAGE_PROVIDER_PRESETS.openai.baseURL,
    model: IMAGE_PROVIDER_PRESETS.openai.defaultModel,
    enabled: false,
  })

  // UI状态
  const [showAiKey, setShowAiKey] = useState(false)
  const [showImageKey, setShowImageKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [aiKeyConfigured, setAiKeyConfigured] = useState(false)
  const [imageKeyConfigured, setImageKeyConfigured] = useState(false)

  // 加载配置
  useEffect(() => {
    if (open) {
      loadConfig()
    }
  }, [open])

  const loadConfig = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/config')
      const data = await response.json()
      if (data.success) {
        setAiConfig(data.config.ai)
        setImageConfig(data.config.image)
        setAiKeyConfigured(data.config.ai.apiKeyConfigured)
        setImageKeyConfigured(data.config.image.apiKeyConfigured)
      }
    } catch {
      toast.error('加载配置失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 保存配置
  const saveConfig = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ai: aiConfig, image: imageConfig }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success('配置已保存')
        setAiKeyConfigured(data.config.ai.apiKeyConfigured)
        setImageKeyConfigured(data.config.image.apiKeyConfigured)
      } else {
        toast.error(data.error || '保存失败')
      }
    } catch {
      toast.error('保存配置失败')
    } finally {
      setIsSaving(false)
    }
  }

  // 切换AI服务商
  const handleAiProviderChange = (provider: AIProvider) => {
    const preset = AI_PROVIDER_PRESETS[provider]
    setAiConfig({
      ...aiConfig,
      provider,
      baseURL: preset.baseURL,
      model: preset.defaultModel,
    })
  }

  // 切换图片服务商
  const handleImageProviderChange = (provider: string) => {
    const preset = IMAGE_PROVIDER_PRESETS[provider]
    setImageConfig({
      ...imageConfig,
      provider: provider as ImageConfig['provider'],
      baseURL: preset.baseURL,
      model: preset.defaultModel,
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* 设置面板 */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl dark:bg-gray-900"
          >
            {/* 头部 */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/95 p-4 backdrop-blur dark:bg-gray-900/95">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <h2 className="text-lg font-semibold">AI服务配置</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="p-4 space-y-6">
                {/* 提示信息 */}
                <Card className="border-blue-100 bg-blue-50/50">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium">配置说明</p>
                        <p className="mt-1 text-blue-600">
                          配置您自己的AI服务API密钥，支持OpenAI、DeepSeek、Claude等主流服务商。
                          未配置时将使用系统默认服务。
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="ai" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ai" className="gap-2">
                      <Cpu className="h-4 w-4" />
                      文本生成
                    </TabsTrigger>
                    <TabsTrigger value="image" className="gap-2">
                      <ImageIcon className="h-4 w-4" />
                      图片生成
                    </TabsTrigger>
                  </TabsList>

                  {/* AI文本配置 */}
                  <TabsContent value="ai" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">文本生成服务</CardTitle>
                            <CardDescription>用于内容创作、标题生成、趋势分析</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {aiKeyConfigured && (
                              <Badge variant="outline" className="gap-1 text-green-600">
                                <Check className="h-3 w-3" />
                                已配置
                              </Badge>
                            )}
                            <Switch
                              checked={aiConfig.enabled}
                              onCheckedChange={(checked) => setAiConfig({ ...aiConfig, enabled: checked })}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* 服务商选择 */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">服务商</label>
                          <Select value={aiConfig.provider} onValueChange={(v) => handleAiProviderChange(v as AIProvider)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(AI_PROVIDER_PRESETS).map(([key, preset]) => (
                                <SelectItem key={key} value={key}>
                                  {preset.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* API Key */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">API Key</label>
                          <div className="relative">
                            <Input
                              type={showAiKey ? 'text' : 'password'}
                              placeholder="sk-..."
                              value={aiConfig.apiKey}
                              onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowAiKey(!showAiKey)}
                            >
                              {showAiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        {/* Base URL */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">API地址</label>
                          <div className="flex gap-2">
                            <Input
                              value={aiConfig.baseURL}
                              onChange={(e) => setAiConfig({ ...aiConfig, baseURL: e.target.value })}
                              placeholder="https://api.openai.com/v1"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            兼容OpenAI接口格式的服务均可使用
                          </p>
                        </div>

                        {/* 模型选择 */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">模型</label>
                          {aiConfig.provider !== 'custom' ? (
                            <Select value={aiConfig.model} onValueChange={(v) => setAiConfig({ ...aiConfig, model: v })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {AI_PROVIDER_PRESETS[aiConfig.provider]?.models.map((model) => (
                                  <SelectItem key={model} value={model}>
                                    {model}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={aiConfig.model}
                              onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                              placeholder="gpt-4o-mini"
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* 图片生成配置 */}
                  <TabsContent value="image" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">图片生成服务</CardTitle>
                            <CardDescription>用于AI封面图生成</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {imageKeyConfigured && (
                              <Badge variant="outline" className="gap-1 text-green-600">
                                <Check className="h-3 w-3" />
                                已配置
                              </Badge>
                            )}
                            <Switch
                              checked={imageConfig.enabled}
                              onCheckedChange={(checked) => setImageConfig({ ...imageConfig, enabled: checked })}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* 服务商选择 */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">服务商</label>
                          <Select value={imageConfig.provider} onValueChange={(v) => handleImageProviderChange(v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(IMAGE_PROVIDER_PRESETS).map(([key, preset]) => (
                                <SelectItem key={key} value={key}>
                                  {preset.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* API Key */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">API Key</label>
                          <div className="relative">
                            <Input
                              type={showImageKey ? 'text' : 'password'}
                              placeholder="sk-..."
                              value={imageConfig.apiKey}
                              onChange={(e) => setImageConfig({ ...imageConfig, apiKey: e.target.value })}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowImageKey(!showImageKey)}
                            >
                              {showImageKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        {/* Base URL */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">API地址</label>
                          <Input
                            value={imageConfig.baseURL}
                            onChange={(e) => setImageConfig({ ...imageConfig, baseURL: e.target.value })}
                            placeholder="https://api.openai.com/v1"
                          />
                        </div>

                        {/* 模型选择 */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">模型</label>
                          {imageConfig.provider !== 'custom' ? (
                            <Select value={imageConfig.model} onValueChange={(v) => setImageConfig({ ...imageConfig, model: v })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {IMAGE_PROVIDER_PRESETS[imageConfig.provider]?.models.map((model) => (
                                  <SelectItem key={model} value={model}>
                                    {model}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={imageConfig.model}
                              onChange={(e) => setImageConfig({ ...imageConfig, model: e.target.value })}
                              placeholder="dall-e-3"
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <Separator />

                {/* 保存按钮 */}
                <div className="flex gap-2">
                  <Button
                    onClick={saveConfig}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        保存配置
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    关闭
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
