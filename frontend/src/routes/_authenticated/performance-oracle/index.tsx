import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "sonner"
import {
  Loader2, TrendingUp, Target, PieChart as PieIcon, BarChart as BarIcon,
  MessageSquareQuote, ChevronLeft, History, Clock, Share2,
  ArrowUpRight, Gauge, Activity, ShieldCheck, Zap,
  Image as ImageIcon, Sparkles, AlertCircle, Rocket,
  Fingerprint, Cpu, Globe, Layers, CheckCircle2, Terminal,
  ChevronRight, BrainCircuit
} from "lucide-react"
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, LabelList
} from 'recharts'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from "@/lib/utils"

const LIB_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const topNav = [
  { title: 'Overview', href: '/dashboard', isActive: false, disabled: false },
  { title: 'Brand Brain', href: '/brand_brain', isActive: false, disabled: false },
  { title: 'Performance Oracle', href: '/performance-oracle', isActive: true, disabled: false },
  { title: 'The Forge', href: '/forge', isActive: false, disabled: false },
  { title: 'Settings', href: '/settings', isActive: false, disabled: false },
]

type OracleState = 'idle' | 'scanning' | 'results'

export default function PerformanceOraclePage() {
  const [activeState, setActiveState] = useState<OracleState>('idle')
  const [content, setContent] = useState('')
  const [visualUrl, setVisualUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [terminalIndex, setTerminalIndex] = useState(0)

  const scanSteps = [
    { label: "Uplink Established", icon: <Globe className="h-3 w-3" /> },
    { label: "Sentiment Ingest", icon: <Layers className="h-3 w-3" /> },
    { label: "Visual DNA Audit", icon: <ImageIcon className="h-3 w-3" /> },
    { label: "Viral Trigger Synthesis", icon: <Zap className="h-3 w-3" /> },
    { label: "Strategy Formulation", icon: <Cpu className="h-3 w-3" /> }
  ]

  useEffect(() => {
    if (activeState === 'scanning') {
      setTerminalIndex(0)
      const interval = setInterval(() => {
        setTerminalIndex(prev => (prev < scanSteps.length ? prev + 1 : prev))
      }, 500)
      return () => clearInterval(interval)
    }
  }, [activeState])

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/v1/oracle/history')
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch (e) {
      console.error("Failed to fetch history", e)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handlePredict = async () => {
    if (!content.trim()) return
    setActiveState('scanning')
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('http://localhost:8000/api/v1/oracle/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          visual_url: visualUrl || null
        }),
      })
      if (!response.ok) throw new Error("Oracle connection failed")
      const data = await response.json()

      const enrichedData = {
        ...data,
        sentiment: data.sentiment || [
          { name: 'Excitement', value: 45 },
          { name: 'Trust', value: 25 },
          { name: 'Urgency', value: 20 },
          { name: 'Logic', value: 10 },
        ],
        platform_reach: data.platform_reach || [
          { name: 'Linked-In', value: 92 },
          { name: 'Insta', value: 75 },
          { name: 'X', value: 68 },
          { name: 'Web', value: 45 },
        ]
      }

      setTimeout(() => {
        setResult(enrichedData)
        setActiveState('results')
        toast.success("Prediction finalized")
      }, 400)

    } catch (err: any) {
      toast.error("Prediction failed")
      setActiveState('idle')
    } finally {
      setLoading(false)
    }
  }

  const resetAll = () => {
    setActiveState('idle')
    setContent('')
    setVisualUrl('')
    setResult(null)
  }

  return (
    <>
      <Header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md px-4 sm:px-6 h-14">
        <div className="flex items-center gap-4">
          <TopNav links={topNav} />
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="px-6 py-8 md:px-10 max-w-[1400px] mx-auto space-y-12 relative w-full bg-background min-h-screen">
        {/* REFINED BACKGROUND ELEMENTS (Shared with other premium pages) */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02] neural-grid" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* --- PAGE HEADER --- */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 max-w-6xl relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary border-primary/20 bg-primary/5 shadow-inner">Predictive Hub</Badge>
              <div className="h-px w-12 bg-primary/20" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground uppercase italic leading-[0.9]">Performance <span className="text-primary not-italic">Oracle</span></h1>
            <p className="text-muted-foreground text-base md:text-lg font-light max-w-2xl leading-relaxed opacity-70 italic">
              Synchronize your content with real-time market sentiment and engagement velocity.
            </p>
          </div>
        </div>

        {activeState === 'idle' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10 animate-in fade-in duration-700">
            <Card className="lg:col-span-8 bg-card/40 backdrop-blur-3xl border border-white/5 p-1 rounded-2xl shadow-2xl overflow-hidden group/input">
              <Textarea
                placeholder="Paste Draft (LinkedIn, Twitter, Ads, or Campaign Script)..."
                className="min-h-[300px] text-lg bg-transparent border-none focus-visible:ring-0 resize-none font-medium p-8 placeholder:opacity-30"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="px-8 py-4 bg-muted/20 border-t border-border/10 flex items-center gap-4">
                <ImageIcon className="h-4 w-4 text-primary/40" />
                <Input
                  placeholder="Asset URL (Rekognition Audit)..."
                  className="bg-transparent border-none focus-visible:ring-0 shadow-none text-xs italic h-8"
                  value={visualUrl}
                  onChange={(e) => setVisualUrl(e.target.value)}
                />
              </div>
            </Card>

            <div className="lg:col-span-4 space-y-6">
              <Card className="bg-primary/[0.03] border border-primary/10 p-10 rounded-[2rem] flex flex-col justify-between items-center text-center shadow-xl group/cta min-h-[300px]">
                <div className="space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto shadow-inner border border-primary/10 transition-transform group-hover/cta:scale-110 duration-500">
                    <Zap className="h-8 w-8" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Ready to Scan</p>
                </div>
                <Button
                  onClick={handlePredict}
                  disabled={!content.trim()}
                  className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-[0.3em] shadow-xl hover:translate-y-[-2px] transition-all"
                >
                  Authorize Prediction <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" onClick={fetchHistory} className="w-full h-14 rounded-xl border border-border/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/50 transition-all gap-4">
                    <History className="h-4 w-4" /> Forecast History
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[450px] border-l border-border/40 bg-background/95 backdrop-blur-2xl">
                  <SheetHeader className="pb-8 border-b border-border/10">
                    <SheetTitle className="font-black uppercase tracking-widest text-xl italic flex items-center gap-3">
                      <History className="h-5 w-5 text-primary" /> Signal <span className="text-primary not-italic">Archives</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-8 space-y-4 overflow-y-auto max-h-[80vh] pr-2 no-scrollbar">
                    {historyLoading ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Accessing Logs...</span>
                      </div>
                    ) : history.map((item) => (
                      <Card
                        key={item.id}
                        className="bg-card/30 border border-border/40 p-5 rounded-2xl hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer"
                        onClick={() => {
                          setContent(item.input_content)
                          setResult(item.response)
                          setActiveState('results')
                        }}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <Badge variant="outline" className="text-[9px] border-border/20 uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</Badge>
                          <span className="text-xs font-black text-primary italic">{item.response.viral_score}% VIRAL</span>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground/80 line-clamp-2 italic leading-relaxed">"{item.input_content}"</p>
                      </Card>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        )}

        {loading && activeState === 'scanning' && (
          <div className="flex flex-col items-center justify-center pt-20 animate-in fade-in duration-500 relative z-10">
            <div className="w-full max-w-md space-y-6 bg-card/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <div className="flex items-center justify-between pb-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-80">Oracle Handshake</h4>
                </div>
                <Loader2 className="h-4 w-4 animate-spin text-primary/40" />
              </div>

              <div className="space-y-2">
                {scanSteps.map((step, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl transition-all duration-300",
                      i < terminalIndex ? "bg-emerald-500/[0.03] text-emerald-500/80" : i === terminalIndex ? "bg-primary/5 text-primary" : "opacity-10"
                    )}
                  >
                    <div className="h-8 w-8 rounded-lg bg-current/5 flex items-center justify-center">
                      {i < terminalIndex ? <CheckCircle2 className="h-4 w-4" /> : step.icon}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest">{step.label}</p>
                    {i === terminalIndex && <Loader2 className="ml-auto h-3 w-3 animate-spin" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeState === 'results' && result && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out pb-32 relative z-10 w-full">

            {/* --- HERO SCORE SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="lg:col-span-3 bg-card/40 backdrop-blur-3xl p-12 min-h-[300px] relative overflow-hidden flex flex-col justify-center rounded-[2.5rem] border-none shadow-xl border border-white/5">
                <Fingerprint className="absolute -right-8 -top-8 h-80 w-80 text-primary opacity-[0.02] -z-10" />
                <div className="space-y-8 relative z-10 w-full">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-primary/10 text-primary border-primary/20 font-bold px-4 py-1 text-[10px] tracking-widest rounded-full uppercase">Tactical Forecast</Badge>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 italic">Confidence: {result.confidence_level}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground leading-[0.9] uppercase italic">
                      Performance <span className="text-primary not-italic">Synchronized</span>
                    </h2>
                    <p className="text-muted-foreground text-lg italic max-w-2xl opacity-60 leading-relaxed font-light">
                      "Strategic predictive analysis complete. Viral engagement probability is locked with hardware-accelerated precision."
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="lg:col-span-1 bg-primary/[0.03] p-10 flex flex-col items-center justify-center gap-8 rounded-[2.5rem] border-none shadow-xl border border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer-subtle" />
                <div className="text-center space-y-1 relative z-10">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">Viral Velocity</p>
                </div>
                <div className="relative h-44 w-44 flex items-center justify-center relative z-10">
                  <svg className="absolute w-full h-full -rotate-90">
                    <circle cx="88" cy="88" r="82" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                    <circle cx="88" cy="88" r="82" stroke="currentColor" strokeWidth="12" fill="transparent"
                      strokeDasharray="515"
                      strokeDashoffset={515 - (515 * result.viral_score) / 100}
                      className="text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.6)] transition-all duration-2000 ease-out"
                      strokeLinecap="round" />
                  </svg>
                  <span className="text-7xl font-black text-foreground tracking-tighter italic">{result.viral_score}</span>
                </div>
                <Badge className="text-[9px] bg-primary/15 text-primary border-primary/20 px-4 py-1.5 rounded-full font-bold uppercase tracking-[0.2em] relative z-10">Score Index</Badge>
              </Card>
            </div>

            {/* --- CORE INSIGHTS GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Radar: Market Fit */}
              <Card className="bg-card/40 backdrop-blur-3xl p-8 space-y-10 rounded-[2rem] border border-white/5 border-t-2 border-t-indigo-500/20 shadow-sm flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 border border-indigo-500/10 shadow-inner">
                    <Target className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[9px] border-indigo-500/20 text-indigo-400 px-4 py-1 font-bold uppercase tracking-widest rounded-full">Attribute Pulse</Badge>
                </div>
                <div className="h-[240px] flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={result.radar_data} outerRadius="80%">
                      <PolarGrid stroke="#fff" opacity={0.05} />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: '900', fill: '#888', letterSpacing: '0.1em' }} />
                      <Radar dataKey="score" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Area Graph: Engagement Entropy */}
              <Card className="bg-card/40 backdrop-blur-3xl p-8 space-y-10 rounded-[2rem] border border-white/5 border-t-2 border-t-emerald-500/20 shadow-sm flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/10 shadow-inner">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-400 px-4 py-1 font-bold uppercase tracking-widest rounded-full">24H Velocity Proj.</Badge>
                </div>
                <div className="h-[240px] flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.forecast_data}>
                      <defs>
                        <linearGradient id="colorEng2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fff" opacity={0.03} />
                      <XAxis dataKey="time" tick={{ fontSize: 9, fontWeight: 'bold' }} stroke="#888" axisLine={false} />
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', background: '#000', opacity: 0.9 }} />
                      <Area type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={3} fill="url(#colorEng2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* ANALYST ASSESSMENT (Red Side) */}
              <Card className="p-8 space-y-10 rounded-[2rem] bg-card/60 backdrop-blur-3xl border-l-[3px] border-l-primary relative flex flex-col justify-between shadow-xl overflow-hidden border-y border-r border-white/5">
                <Rocket className="absolute -right-8 -bottom-8 h-48 w-48 text-primary opacity-[0.03] rotate-12 -z-10 shadow-3xl" />
                <div className="space-y-8 relative z-10">
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-bold px-4 py-1.5 uppercase tracking-widest rounded-full">Directive Extract</Badge>
                  <div className="space-y-3">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">System Assessment</p>
                    <h3 className="text-xl font-black text-foreground leading-tight italic uppercase tracking-tighter">Strategic Impact High</h3>
                  </div>
                  <p className="text-sm text-muted-foreground italic font-light leading-relaxed opacity-80 border-t border-white/5 pt-6">
                    "{result.analysis_report}"
                  </p>
                </div>
              </Card>
            </div>

            {/* --- ENHANCED VISUAL DNA (Rekognition) --- */}
            {result.visual_audit && (
              <Card className="bg-card/40 backdrop-blur-3xl border border-white/5 p-12 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/[0.01] -z-10" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 border-b border-white/5 pb-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Visual DNA Audit</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center border-r border-white/5 pr-8">
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 mb-1">Sentiment</p>
                      <span className="text-xs font-black uppercase italic tracking-widest text-emerald-500">{result.visual_audit.sentiment}</span>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 mb-1">Tech Quality</p>
                      <span className="text-2xl font-black italic tracking-tighter">{result.visual_audit.technical_quality}<span className="text-[10px] opacity-20 ml-1">/100</span></span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Rekognition Intercepts</p>
                    <div className="flex flex-wrap gap-2">
                      {result.visual_audit.labels.map((label: string, i: number) => (
                        <div key={i} className="px-5 py-2.5 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-bold uppercase tracking-widest hover:border-primary/30 transition-all cursor-default">{label}</div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 space-y-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Optimization Directive</p>
                    <p className="text-base font-light italic leading-relaxed text-foreground/90 leading-relaxed border-l-2 border-primary/30 pl-6 uppercase tracking-wider text-sm">
                      "{result.visual_audit.recommendation}"
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* --- ACTION TERMINAL --- */}
            <div className="pt-16 pb-32">
              <div className="max-w-4xl mx-auto text-center space-y-10">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-black text-foreground italic uppercase tracking-tighter leading-none select-none">
                    Weaponize <span className="text-primary not-italic">Intelligence</span>
                  </h2>
                  <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-2xl mx-auto opacity-70 italic font-serif leading-loose">
                    "Authorizing transfer of predictive vectors to the Forge and Architect nodes."
                  </p>
                </div>

                <div className="flex flex-col items-center gap-8">
                  <Button
                    onClick={resetAll}
                    className="h-16 px-16 rounded-2xl bg-primary text-primary-foreground text-xl font-black italic uppercase tracking-[0.1em] shadow-2xl premium-button-glow hover:translate-y-[-4px] transition-all duration-500 group relative overflow-hidden w-full max-w-md"
                  >
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer-subtle" />
                    <span className="relative z-10 flex items-center justify-center gap-4">
                      <Rocket className="h-6 w-6 group-hover:rotate-6 transition-transform" />
                      Execute New Forecast
                    </span>
                  </Button>
                  <div className="flex items-center gap-3 px-8 py-3 bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-inner">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Uplink Status: Secure Integration</p>
                  </div>
                </div>

                <div className="w-full bg-card/20 border border-white/5 rounded-[3rem] p-12 backdrop-blur-3xl shadow-3xl text-center group/src relative">
                  <div className="absolute top-0 left-0 w-2 h-full bg-primary/20" />
                  <History className="h-6 w-6 text-primary/20 absolute right-8 top-8" />
                  <p className="text-xl font-light italic leading-relaxed text-muted-foreground/60 select-none">"{content}"</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/performance-oracle/')({
  component: PerformanceOraclePage,
})