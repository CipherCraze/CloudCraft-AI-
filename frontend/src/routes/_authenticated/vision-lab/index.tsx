import { useState, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Sparkles, Download, Loader2, Wand2, Camera,
  ArrowRight, Maximize2, CheckCircle2, RefreshCw,
  Eye, Upload, X, Copy, Zap, Search as SearchIcon, Aperture, ScanLine, Layers
} from "lucide-react"
import { VisionAudit } from "@/components/persona/VisionAudit"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Input } from '@/components/ui/input'

const topNav = [
  { title: 'Overview', href: '/dashboard', isActive: false, disabled: false },
  { title: 'Brand Brain', href: '/brand_brain', isActive: false, disabled: false },
  { title: 'The Forge', href: '/forge', isActive: false, disabled: false },
  { title: 'Vision Lab', href: '/vision-lab', isActive: true, disabled: false },
  { title: 'Settings', href: '/settings', isActive: false, disabled: false },
]

const QUICK_PROMPTS = [
  { label: "Neon Skyline", style: "Urban", prompt: "Futuristic cyberpunk skyline at night, neon lights, rain-soaked streets, cinematic 8k" },
  { label: "Bioluminescence", style: "Nature", prompt: "Ethereal forest with bioluminescent plants, floating particles, dreamlike atmosphere 8k" },
  { label: "Product Spotlight", style: "Commercial", prompt: "Luxury product on dark marble surface, dramatic studio lighting, magazine quality shot" },
  { label: "Abstract Space", style: "Digital Art", prompt: "Abstract geometric art, flowing gradients, deep space aesthetic, hyper-detailed 4k" },
  { label: "Epic Vista", style: "Landscape", prompt: "Epic mountain range at golden hour, dramatic clouds, aerial perspective, National Geographic" },
]

const VL_STYLE = `
  @keyframes vlAperture{0%,100%{transform:rotate(0deg)}50%{transform:rotate(30deg)}}
  @keyframes vlFilm{0%{background-position:0 0}100%{background-position:60px 0}}
  @keyframes vlExpose{0%{opacity:0;filter:brightness(3)}100%{opacity:1;filter:brightness(1)}}
  @keyframes vlLens{0%,100%{box-shadow:0 0 20px rgba(251,191,36,.2),0 0 60px rgba(251,191,36,0)}50%{box-shadow:0 0 30px rgba(251,191,36,.4),0 0 80px rgba(251,191,36,.1)}}
  @keyframes vlSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  @keyframes vlBlade{0%,100%{transform:rotate(0deg) scaleY(0.4)}50%{transform:rotate(60deg) scaleY(1)}}
  @keyframes vlPulse{0%,100%{opacity:.5;transform:scale(.95)}50%{opacity:1;transform:scale(1.05)}}
  @keyframes vlReveal{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0% 0 0)}}
  @keyframes vlShutter{0%{transform:scaleX(1)}40%{transform:scaleX(0)}60%{transform:scaleX(0)}100%{transform:scaleX(1)}}
  .vl-filmstrip{background-image:repeating-linear-gradient(90deg,transparent,transparent 12px,rgba(255,255,255,.04) 12px,rgba(255,255,255,.04) 14px);background-size:60px 100%}
  .vl-aperture-blade{position:absolute;width:50%;height:8px;top:50%;left:50%;transform-origin:left center;border-radius:0 4px 4px 0;background:currentColor}
`

type VisionMode = 'generate' | 'enhance'
type ResultTab = 'visual' | 'audit'

export default function VisionLabPage() {
  const [mode, setMode] = useState<VisionMode | null>(null)
  const [prompt, setPrompt] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ image_url: string; refined_prompt: string } | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null)
  const [analyzingImage, setAnalyzingImage] = useState(false)
  const [imageAnalysis, setImageAnalysis] = useState<any>(null)
  const [enhancing, setEnhancing] = useState(false)
  const [enhancedResult, setEnhancedResult] = useState<{ enhanced_image_url: string; enhancement_prompt: string } | null>(null)
  const [activeTab, setActiveTab] = useState<ResultTab>('visual')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasResult = !!(result || enhancedResult)
  const finalImageUrl = enhancedResult?.enhanced_image_url || result?.image_url
  const isProcessing = loading || enhancing

  const resetAll = () => {
    setMode(null); setPrompt(""); setResult(null); setImageAnalysis(null)
    setUploadedImageUrl(null); setUploadedImageBase64(null); setEnhancedResult(null)
    setActiveTab('visual')
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true); setResult(null)
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/vision/generate-image', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }),
      })
      setResult(await res.json()); toast.success("Visual developed")
    } catch { toast.error("Generation failed") }
    finally { setLoading(false) }
  }

  const handleFileUpload = (file: File) => {
    setUploadedImageUrl(null); setImageAnalysis(null); setEnhancedResult(null)
    const reader = new FileReader()
    reader.onloadend = () => { setUploadedImageUrl(reader.result as string); setUploadedImageBase64(reader.result as string); setMode('enhance') }
    reader.readAsDataURL(file)
  }

  const handleAudit = async () => {
    if (!uploadedImageBase64) return; setAnalyzingImage(true)
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/vision/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image_base64: uploadedImageBase64 })
      })
      if (res.ok) { setImageAnalysis(await res.json()); toast.success("Aesthetic audit complete") }
      else toast.error("Audit failed")
    } catch { toast.error("Audit failed") } finally { setAnalyzingImage(false) }
  }

  const handleEnhance = async () => {
    if (!uploadedImageBase64 || !imageAnalysis) return; setEnhancing(true)
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/vision/enhance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: uploadedImageBase64, audit_results: imageAnalysis, user_prompt: prompt })
      })
      if (res.ok) { setEnhancedResult(await res.json()); toast.success("Master asset ready") }
      else toast.error("Enhancement failed")
    } catch { toast.error("Enhancement failed") } finally { setEnhancing(false) }
  }

  const handleDownload = async () => {
    if (!finalImageUrl) return
    try {
      const blob = await fetch(finalImageUrl).then(r => r.blob())
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `vision-${Date.now()}.png` })
      document.body.appendChild(a); a.click(); URL.revokeObjectURL(a.href)
    } catch { console.error("Download failed") }
  }

  return (
    <>
      <style>{VL_STYLE}</style>
      <Header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4"><TopNav links={topNav} /></div>
        <div className="ms-auto flex items-center space-x-2 sm:space-x-4">
          <div className="relative hidden md:flex items-center">
            <SearchIcon className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-64 bg-secondary/50 border-secondary rounded-lg text-sm shadow-none" />
            {searchQuery && <X className="absolute right-2.5 h-4 w-4 text-muted-foreground cursor-pointer" onClick={() => setSearchQuery('')} />}
          </div>
          <ThemeSwitch /><ProfileDropdown />
        </div>
      </Header>

      <Main className="px-4 py-6 md:px-6 space-y-6 relative w-full">
        {/* Darkroom ambient glow — unique to Vision Lab */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[300px] rounded-full bg-amber-500/4 blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[200px] rounded-full bg-violet-500/5 blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.02]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,currentColor 1px,transparent 0)', backgroundSize: '24px 24px' }} />
        </div>

        {/* ── PAGE HEADER ── */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3">
            {/* Unique film-strip badge */}
            <div className="inline-flex items-center gap-0 overflow-hidden rounded-full border border-amber-500/30">
              <div className="vl-filmstrip px-3 py-1 bg-amber-500/10 border-r border-amber-500/20">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-sm bg-amber-500/60" />)}
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-500">Darkroom Online</span>
              </div>
              <div className="vl-filmstrip px-3 py-1 bg-amber-500/10 border-l border-amber-500/20">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-sm bg-amber-500/60" />)}
                </div>
              </div>
            </div>

            <div className="flex items-end gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">Vision Lab</h1>
                <p className="text-sm text-muted-foreground mt-1">Develop visual intelligence — generate from imagination or master existing assets.</p>
              </div>
              {/* Camera metadata HUD */}
              {mode && (
                <div className="hidden md:flex items-center gap-3 mb-0.5 ml-2">
                  {[
                    { label: 'ƒ', val: mode === 'generate' ? '1.4' : '2.8' },
                    { label: 'ISO', val: mode === 'generate' ? '100' : '800' },
                    { label: '1/', val: mode === 'generate' ? '125' : '60' },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex items-baseline gap-0.5 px-2.5 py-1 rounded-lg bg-secondary/50 border border-border/40">
                      <span className="text-[9px] text-muted-foreground font-mono">{label}</span>
                      <span className="text-xs font-bold font-mono text-amber-500">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(mode || hasResult) && (
            <Button variant="outline" className="h-9 font-medium self-start shrink-0" onClick={resetAll}>
              <RefreshCw className="w-4 h-4 mr-2" />New Session
            </Button>
          )}
        </div>

        {/* ── CONTENT ── */}
        <div className="relative z-10 space-y-6">

          {/* MODE SELECTOR */}
          {!mode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-400">

              {/* Oracle — Generate */}
              <div onClick={() => setMode('generate')} style={{ transition: 'all .35s cubic-bezier(.34,1.4,.64,1)' }}
                className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm cursor-pointer overflow-hidden hover:-translate-y-1.5 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/8">
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {/* Film frame corners */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-500/30 rounded-tl-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-500/30 rounded-tr-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-500/30 rounded-bl-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-500/30 rounded-br-sm opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="p-8 flex flex-col items-center text-center gap-5">
                  {/* Aperture icon */}
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full bg-amber-500/8 border border-amber-500/20 group-hover:bg-amber-500/14 transition-colors" />
                    <div className="absolute inset-0 rounded-full border border-amber-500/10 group-hover:border-amber-500/30"
                      style={{ animation: 'vlSpin 12s linear infinite' }} />
                    <div className="absolute inset-[6px] rounded-full border-t border-amber-500/30"
                      style={{ animation: 'vlSpin 8s linear infinite reverse' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Aperture className="h-8 w-8 text-amber-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-px w-8 bg-amber-500/30" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-500/70">Mode A</span>
                      <div className="h-px w-8 bg-amber-500/30" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">The Oracle</h3>
                    <p className="text-sm text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
                      Describe your vision. AI expands, stylizes, and renders it into a photorealistic masterpiece.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full">
                    {[{ icon: Sparkles, label: 'AI Prompt Expand' }, { icon: Layers, label: 'Style Optimization' }, { icon: Eye, label: '4K Render' }].map(({ icon: Icon, label }) => (
                      <div key={label} className="p-2 rounded-lg bg-secondary/40 border border-border/40 text-center">
                        <Icon className="h-3.5 w-3.5 text-amber-500 mx-auto mb-1" />
                        <p className="text-[9px] font-medium text-muted-foreground leading-tight">{label}</p>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" size="sm" className="h-8 text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10 hover:border-amber-500/50 group-hover:border-amber-500/50 transition-all gap-1.5">
                    <Aperture className="h-3.5 w-3.5" />Enter Oracle <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Master — Enhance */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f?.type.startsWith('image/')) handleFileUpload(f) }}
                style={{ transition: 'all .35s cubic-bezier(.34,1.4,.64,1)' }}
                className={cn("group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm cursor-pointer overflow-hidden hover:-translate-y-1.5 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/8",
                  dragOver && "border-blue-500/60 bg-blue-500/5 scale-[1.01]")}>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-blue-500/30 rounded-tl-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-blue-500/30 rounded-tr-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-blue-500/30 rounded-bl-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-blue-500/30 rounded-br-sm opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="p-8 flex flex-col items-center text-center gap-5">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full bg-blue-500/8 border border-blue-500/20 group-hover:bg-blue-500/14 transition-colors" />
                    <div className="absolute inset-0 rounded-full border border-blue-500/10 group-hover:border-blue-500/25"
                      style={{ animation: 'vlSpin 15s linear infinite' }} />
                    <div className="absolute inset-[6px] rounded-full border-t border-blue-400/30"
                      style={{ animation: 'vlSpin 10s linear infinite reverse' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-blue-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-px w-8 bg-blue-500/30" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-500/70">Mode B</span>
                      <div className="h-px w-8 bg-blue-500/30" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">The Master</h3>
                    <p className="text-sm text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
                      Upload your asset. AI runs an aesthetic intelligence audit then enhances to master quality.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full">
                    {[{ icon: ScanLine, label: 'Aesthetic Audit' }, { icon: Zap, label: 'AI Enhance' }, { icon: Layers, label: 'Before/After' }].map(({ icon: Icon, label }) => (
                      <div key={label} className={cn("p-2 rounded-lg bg-secondary/40 border border-border/40 text-center", dragOver && "border-blue-500/30")}>
                        <Icon className="h-3.5 w-3.5 text-blue-500 mx-auto mb-1" />
                        <p className="text-[9px] font-medium text-muted-foreground leading-tight">{label}</p>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" size="sm" className="h-8 text-xs border-blue-500/30 text-blue-600 hover:bg-blue-500/10 hover:border-blue-500/50 group-hover:border-blue-500/50 transition-all gap-1.5">
                    <Upload className="h-3.5 w-3.5" />{dragOver ? 'Drop to Upload' : 'Upload Asset'} <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }} />
              </div>
            </div>
          )}

          {/* ── GENERATE MODE ── */}
          {mode === 'generate' && !hasResult && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              <div className="lg:col-span-2 space-y-4">
                {/* Darkroom console */}
                <div className="rounded-2xl border border-amber-500/15 bg-card/60 overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/12 bg-amber-500/4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                      </div>
                      <span className="text-xs font-mono text-amber-500/60 ml-2">oracle://vision-prompt</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[10px] font-mono text-amber-500/70">READY</span>
                    </div>
                  </div>

                  {!loading ? (
                    <CardContent className="p-0">
                      <Textarea
                        placeholder={"› Describe your visual directive...\n\n  e.g., 'A lone lighthouse on a stormy coast, long exposure, cinematic grain, dramatic sky'"}
                        className="min-h-[200px] bg-transparent border-0 focus-visible:ring-0 text-sm font-mono leading-relaxed placeholder:text-muted-foreground/35 resize-none px-5 py-5"
                        value={prompt} onChange={e => setPrompt(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey && prompt && !loading) handleGenerate() }}
                      />
                      <div className="px-4 py-3 border-t border-amber-500/10 bg-amber-500/3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {prompt && <span className="text-xs text-amber-500/60 font-mono">{prompt.length} ch</span>}
                          <span className="text-xs text-muted-foreground/50 hidden sm:block font-mono">
                            <kbd className="px-1.5 py-0.5 bg-secondary border border-border/60 rounded text-[10px]">⌃</kbd>+<kbd className="px-1.5 py-0.5 bg-secondary border border-border/60 rounded text-[10px] ml-1">↵</kbd>
                          </span>
                        </div>
                        <Button className="h-8 px-4 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/25"
                          onClick={handleGenerate} disabled={!prompt.trim()}>
                          <Aperture className="h-3.5 w-3.5 mr-1.5" />Develop
                        </Button>
                      </div>
                    </CardContent>
                  ) : (
                    <div className="p-12 flex flex-col items-center gap-8">
                      {/* Aperture loading animation */}
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" style={{ animation: 'vlSpin 8s linear infinite' }} />
                        <div className="absolute inset-2 rounded-full border border-amber-500/30" style={{ animation: 'vlSpin 5s linear infinite reverse' }} />
                        <div className="absolute inset-4 rounded-full border-t-2 border-amber-500/60" style={{ animation: 'vlSpin 3s linear infinite' }} />
                        <div className="absolute w-3 h-3 rounded-full bg-amber-500/30 blur-sm" style={{ animation: 'vlPulse 1.5s ease-in-out infinite' }} />
                        <Aperture className="w-6 h-6 text-amber-500" style={{ animation: 'vlSpin 2s linear infinite' }} />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-sm font-semibold">Developing your vision...</p>
                        <p className="text-xs text-muted-foreground font-mono">Neural rendering in progress</p>
                      </div>
                      <div className="flex gap-5">
                        {['Prompt Expand', 'Style Apply', 'Render', 'Upscale'].map((s, i) => (
                          <div key={s} className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-lg border border-amber-500/20 bg-amber-500/5 flex items-center justify-center">
                              <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" style={{ animationDelay: `${i * .2}s` }} />
                            </div>
                            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick starters */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Quick Directives</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map(({ label, style, prompt: qp }) => (
                      <button key={label} onClick={() => setPrompt(qp)}
                        className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-secondary/30 hover:border-amber-500/35 hover:bg-amber-500/5 transition-all">
                        <span className="text-[9px] text-amber-500/60 font-mono uppercase">{style}</span>
                        <div className="h-3 w-px bg-border/60" />
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT INFO */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Oracle Pipeline</p>
                <div className="space-y-2">
                  {[
                    { n: '01', label: 'Prompt Intelligence', desc: 'Expands your brief into detailed scene description', color: 'text-amber-500', bg: 'bg-amber-500/8', b: 'border-amber-500/20' },
                    { n: '02', label: 'Style Synthesis', desc: 'Applies cinematic photography techniques automatically', color: 'text-violet-400', bg: 'bg-violet-500/8', b: 'border-violet-500/20' },
                    { n: '03', label: 'Neural Render', desc: 'Vertex AI generates the high-fidelity visual output', color: 'text-blue-400', bg: 'bg-blue-500/8', b: 'border-blue-500/20' },
                    { n: '04', label: 'Quality Export', desc: '300 DPI PNG delivered with refined prompt metadata', color: 'text-emerald-400', bg: 'bg-emerald-500/8', b: 'border-emerald-500/20' },
                  ].map(({ n, label, desc, color, bg, b }) => (
                    <div key={n} className={`flex items-start gap-3 p-3 rounded-xl border ${b} ${bg}`}>
                      <span className={`text-[10px] font-black font-mono ${color} mt-0.5 shrink-0`}>{n}</span>
                      <div><p className={`text-xs font-semibold ${color}`}>{label}</p><p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ENHANCE MODE ── */}
          {mode === 'enhance' && !hasResult && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              <div className="space-y-4">
                {/* Source asset */}
                <div className="rounded-2xl border border-blue-500/15 bg-card/60 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-blue-500/12 bg-blue-500/4">
                    <span className="text-xs font-mono text-blue-400/60">master://source-asset</span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-400/60 hover:text-blue-400 gap-1" onClick={() => fileInputRef.current?.click()}>
                      <RefreshCw className="h-3 w-3" />Replace
                    </Button>
                  </div>
                  <div className="p-3">
                    <div className="relative rounded-xl overflow-hidden border border-border/40 bg-black group">
                      <img src={uploadedImageUrl || ""} className="w-full object-cover max-h-[200px]" alt="Source" />
                      {/* Film frame overlay */}
                      <div className="absolute inset-0 pointer-events-none border-[6px] border-black/40 rounded-xl" />
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white uppercase tracking-wider font-mono">RAW</div>
                    </div>
                  </div>
                </div>

                {/* Audit panel */}
                <div className="rounded-2xl border border-blue-500/12 bg-card/60 overflow-hidden">
                  <div className="px-4 py-3 border-b border-blue-500/10 bg-blue-500/3">
                    <span className="text-xs font-mono text-blue-400/60">master://aesthetic-audit</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <Button
                      className={cn("w-full h-9 text-xs font-semibold gap-2 rounded-xl transition-all",
                        imageAnalysis
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 hover:bg-emerald-500/15"
                          : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20")}
                      disabled={analyzingImage || !!imageAnalysis} onClick={handleAudit}>
                      {analyzingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : imageAnalysis ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ScanLine className="h-3.5 w-3.5" />}
                      {analyzingImage ? 'Scanning...' : imageAnalysis ? 'Audit Complete' : 'Launch Aesthetic Scan'}
                    </Button>

                    {imageAnalysis && (
                      <div className="space-y-3 animate-in fade-in duration-500">
                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Scan Results</p>
                            <Badge variant="outline" className="text-[9px] border-emerald-500/25 text-emerald-500">{imageAnalysis.suggested_tone}</Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground italic">"{imageAnalysis.vibe_description}"</p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-muted-foreground font-mono">Clarity</span>
                              <span className="font-bold text-emerald-500 font-mono">{imageAnalysis.aesthetic_audit?.clarity_score}%</span>
                            </div>
                            <Progress value={imageAnalysis.aesthetic_audit?.clarity_score} className="h-1.5" />
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                            {[
                              { k: 'Brightness', v: imageAnalysis.aesthetic_audit?.brightness?.toFixed?.(1) + 'x' },
                              { k: 'Contrast', v: imageAnalysis.aesthetic_audit?.contrast?.toFixed?.(1) + 'x' },
                              { k: 'Saturation', v: imageAnalysis.aesthetic_audit?.saturation?.toFixed?.(1) + 'x' },
                              { k: 'Temperature', v: imageAnalysis.aesthetic_audit?.temperature },
                            ].map(({ k, v }) => (
                              <div key={k} className="flex justify-between px-2 py-1 rounded bg-secondary/40">
                                <span className="text-muted-foreground">{k}</span><span className="text-foreground font-semibold">{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Enhancement Bias</label>
                          <Textarea
                            placeholder="Guide the AI... (cinematic, moody, vivid, editorial)"
                            className="bg-secondary/30 border-border/50 text-xs rounded-xl h-16 resize-none font-mono placeholder:text-muted-foreground/35"
                            value={prompt} onChange={e => setPrompt(e.target.value)}
                          />
                        </div>
                        <Button className="w-full h-9 text-xs font-semibold gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/20"
                          onClick={handleEnhance} disabled={enhancing}>
                          {enhancing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                          {enhancing ? 'Enhancing...' : 'Generate Master'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Canvas */}
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-blue-500/12 bg-card/60 overflow-hidden h-full shadow-sm">
                  <div className="px-4 py-3 border-b border-blue-500/10 bg-blue-500/3 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-xs font-mono text-blue-400/60">master://canvas</span>
                  </div>
                  <div className="flex items-center justify-center min-h-[380px] p-6">
                    {enhancing ? (
                      <div className="flex flex-col items-center gap-7 text-center">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" style={{ animation: 'vlSpin 8s linear infinite' }} />
                          <div className="absolute inset-3 rounded-full border border-blue-500/35" style={{ animation: 'vlSpin 5s linear infinite reverse' }} />
                          <div className="absolute inset-5 rounded-full border-t-2 border-blue-500/60" style={{ animation: 'vlSpin 3s linear infinite' }} />
                          <Camera className="w-6 h-6 text-blue-500" />
                        </div>
                        <div><p className="text-sm font-semibold">Mastering asset...</p><p className="text-xs text-muted-foreground font-mono mt-1">Aesthetic intelligence processing</p></div>
                        <div className="flex gap-5">
                          {['Parse Audit', 'Calibrate', 'Render Pass', 'QA'].map((s, i) => (
                            <div key={s} className="flex flex-col items-center gap-2">
                              <div className="w-8 h-8 rounded-lg border border-blue-500/20 bg-blue-500/5 flex items-center justify-center">
                                <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" style={{ animationDelay: `${i * .2}s` }} />
                              </div>
                              <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono">{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : !imageAnalysis ? (
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-border/40 flex items-center justify-center mx-auto">
                          <ScanLine className="h-7 w-7 text-muted-foreground/30" />
                        </div>
                        <div><p className="text-sm font-medium text-muted-foreground">Run the Aesthetic Scan first</p><p className="text-xs text-muted-foreground/60 mt-1">Click "Launch Aesthetic Scan" to analyze your image</p></div>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                          <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                        </div>
                        <div><p className="text-sm font-semibold">Scan complete — ready to master</p><p className="text-xs text-muted-foreground/70 mt-1 max-w-xs">{imageAnalysis.aesthetic_audit?.pro_tip || 'Set your enhancement bias and generate the master asset'}</p></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── RESULTS ── */}
          {hasResult && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-500">
              {/* Toolbar */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center bg-secondary/50 rounded-xl p-1 gap-0.5 border border-border/50">
                  {([
                    { id: 'visual' as const, label: mode === 'generate' ? 'Developed Frame' : 'Before / After', Icon: Eye },
                    ...(mode === 'enhance' && imageAnalysis ? [{ id: 'audit' as const, label: 'Aesthetic Report', Icon: ScanLine }] : []),
                  ]).map(({ id, label, Icon }) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                      className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                        activeTab === id ? 'bg-background border border-border shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                      <Icon className={cn('w-3.5 h-3.5', activeTab === id ? mode === 'generate' ? 'text-amber-500' : 'text-blue-500' : '')} />
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs"
                    onClick={() => { navigator.clipboard.writeText(finalImageUrl || ''); toast.success('URL copied') }}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />Copy URL
                  </Button>
                  <Button size="sm" className="h-8 text-xs bg-amber-500 hover:bg-amber-400 text-black font-semibold" onClick={handleDownload}>
                    <Download className="h-3.5 w-3.5 mr-1.5" />Export PNG
                  </Button>
                </div>
              </div>

              {activeTab === 'visual' && (
                <div className={cn("rounded-2xl border bg-card/60 overflow-hidden shadow-sm", mode === 'generate' ? 'border-amber-500/15' : 'border-blue-500/15')}>
                  {mode === 'generate' ? (
                    <>
                      <div className={cn("px-5 py-4 border-b bg-amber-500/4 flex items-center justify-between", "border-amber-500/12")}>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <Aperture className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold">Developed Frame</h3>
                            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Oracle AI · PNG · 300 DPI</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => window.open(result?.image_url, '_blank')}>
                          <Maximize2 className="h-3.5 w-3.5 mr-1.5" />Fullscreen
                        </Button>
                      </div>
                      <div className="p-6 grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <div className="relative rounded-xl overflow-hidden border border-border/30 bg-black group"
                            style={{ boxShadow: '0 0 0 1px rgba(251,191,36,.08),0 20px 60px rgba(0,0,0,.4)' }}>
                            <img src={result?.image_url} alt="Generated" className="w-full object-contain max-h-[65vh]" style={{ animation: 'vlExpose .8s ease-out' }} />
                            {/* Film grain overlay */}
                            <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
                              style={{ backgroundImage: 'url(data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" stitchTiles="stitch"/></filter><rect width="200" height="200" filter="url(%23n)" opacity=".5"/></svg>)' }} />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-3 gap-2">
                              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg" onClick={handleDownload}><Download className="h-4 w-4" /></Button>
                              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg" onClick={() => window.open(result?.image_url, '_blank')}><Maximize2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl border border-amber-500/15 bg-amber-500/4 space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5"><Sparkles className="h-3 w-3" />Refined Prompt</p>
                            <p className="text-xs text-muted-foreground italic leading-relaxed">"{result?.refined_prompt}"</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {[{ l: 'Format', v: 'PNG' }, { l: 'DPI', v: '300' }, { l: 'Engine', v: 'Vertex AI' }, { l: 'Mode', v: 'Oracle' }].map(({ l, v }) => (
                              <div key={l} className="p-3 rounded-lg border border-border/40 bg-secondary/20">
                                <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono">{l}</p>
                                <p className="text-sm font-bold mt-0.5 font-mono">{v}</p>
                              </div>
                            ))}
                          </div>
                          <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5 border-amber-500/25 text-amber-600 hover:bg-amber-500/8"
                            onClick={() => { setResult(null) }}>
                            <RefreshCw className="h-3.5 w-3.5" />Regenerate
                          </Button>
                          <Button size="sm" className="w-full h-8 text-xs gap-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold" onClick={handleDownload}>
                            <Download className="h-3.5 w-3.5" />Download
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="px-5 py-4 border-b border-blue-500/12 bg-blue-500/4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"><Camera className="w-3.5 h-3.5 text-blue-500" /></div>
                          <div><h3 className="text-sm font-semibold">Master Enhancement</h3><p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Before / After · Comparison</p></div>
                        </div>
                        <Badge className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20 font-mono">MASTER</Badge>
                      </div>
                      <div className="p-6 grid md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground font-mono">Before · Raw</span>
                            <Badge variant="secondary" className="text-[10px] font-mono">RAW</Badge>
                          </div>
                          <div className="relative rounded-xl overflow-hidden border border-border/30 bg-black">
                            <img src={uploadedImageUrl || ""} alt="Source" className="w-full object-contain max-h-[60vh]" />
                            <div className="absolute inset-0 border-[6px] border-black/30 rounded-xl pointer-events-none" />
                            <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/70 text-white font-mono">ORIGINAL</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 font-mono">After · Master</span>
                            <Badge className="text-[10px] bg-blue-500 text-white font-mono">MASTER</Badge>
                          </div>
                          <div className="relative rounded-xl overflow-hidden border-2 border-blue-500/25 bg-black group hover:scale-[1.01] transition-transform duration-500"
                            style={{ boxShadow: '0 0 40px rgba(59,130,246,.12)' }}>
                            <img src={enhancedResult?.enhanced_image_url || ""} alt="Master" className="w-full object-contain max-h-[60vh]" style={{ animation: 'vlExpose .8s ease-out' }} />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3 gap-2">
                              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg" onClick={handleDownload}><Download className="h-4 w-4" /></Button>
                              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg" onClick={() => window.open(enhancedResult?.enhanced_image_url, '_blank')}><Maximize2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'audit' && imageAnalysis && (
                <div className="rounded-2xl border border-blue-500/15 bg-card/60 overflow-hidden animate-in fade-in duration-300">
                  <div className="px-5 py-4 border-b border-blue-500/12 bg-blue-500/4 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"><ScanLine className="w-3.5 h-3.5 text-blue-500" /></div>
                    <div><h3 className="text-sm font-semibold">Aesthetic Intelligence Report</h3><p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Vision Audit · Full Analysis</p></div>
                  </div>
                  <div className="p-6"><VisionAudit analysis={imageAnalysis} imageUrl={uploadedImageUrl || ""} /></div>
                </div>
              )}
            </div>
          )}

        </div>
      </Main>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }} />
    </>
  )
}

export const Route = createFileRoute('/_authenticated/vision-lab/')({
  component: VisionLabPage,
})