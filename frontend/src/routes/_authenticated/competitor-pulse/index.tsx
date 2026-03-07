import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from 'sonner'
import {
  Radar,
  Search,
  Zap,
  Activity,
  Terminal,
  Eye,
  Headphones,
  BrainCircuit,
  Crosshair,
  Server,
  Network,
  Rocket,
  ShieldAlert,
  Fingerprint,
  ChevronRight,
  Target,
  AlertTriangle,
  Flame,
  Globe,
  Cpu,
  Lock,
  ArrowUpRight,
  TrendingDown,
  Layers,
  Container
} from "lucide-react"

export default function CompetitorPulsePage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [deploying, setDeploying] = useState(false)
  const [terminalIndex, setTerminalIndex] = useState(0)

  const bootSequence = [
    { label: "INITIATING AWS STEP FUNCTIONS", icon: <Cpu className="h-3 w-3" />, color: "text-blue-400" },
    { label: "SPINNING UP REKOGNITION AGENTS", icon: <Eye className="h-3 w-3" />, color: "text-indigo-400" },
    { label: "MINING BRAND DNA VIA COMPREHEND", icon: <BrainCircuit className="h-3 w-3" />, color: "text-orange-400" },
    { label: "ORCHESTRATING RED TEAM BEDROCK SWARM", icon: <ShieldAlert className="h-3 w-3" />, color: "text-red-400" },
    { label: "MAPPING THREAT GRAPH IN NEPTUNE", icon: <Network className="h-3 w-3" />, color: "text-emerald-400" },
    { label: "LOCKING ON TARGET PARAMETERS", icon: <Target className="h-3 w-3" />, color: "text-zinc-400" }
  ]

  useEffect(() => {
    if (loading) {
      setTerminalIndex(0)
      const interval = setInterval(() => {
        setTerminalIndex(prev => (prev < bootSequence.length ? prev + 1 : prev))
      }, 700)
      return () => clearInterval(interval)
    }
  }, [loading])

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await fetch('http://localhost:8000/api/v1/competitor/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      if (!response.ok) throw new Error("Intelligence link severed by remote host")
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setTimeout(() => setLoading(false), 500)
    }
  }

  const handleDeploy = () => {
    setDeploying(true)
    toast.success("WAR ROOM DEPLOYMENT INITIATED", {
      description: "Asymmetric directives transferred to Architect core.",
      icon: <Rocket className="h-4 w-4" />,
      className: "bg-red-600 border-red-500 text-white font-bold rounded-xl"
    })
    setTimeout(() => setDeploying(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 font-sans selection:bg-red-500/30 overflow-x-hidden">
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/[0.03] blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/[0.02] blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
        <div className="absolute inset-0 panopticon-grid opacity-[0.15]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/20 via-[#050507]/90 to-[#050507]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-12 space-y-12">

        {/* Elite Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="relative h-16 w-16 flex items-center justify-center">
                <div className="absolute inset-0 bg-red-600/10 rounded-2xl rotate-12 blur-sm" />
                <div className="absolute inset-0 border border-red-500/20 rounded-2xl -rotate-3 transition-transform hover:rotate-0 duration-500" />
                <Radar className="h-8 w-8 text-red-500 relative z-10 animate-panopticon-pulse" />
              </div>
              <div className="space-y-1">
                <h1 className="text-6xl font-[1000] tracking-tighter uppercase text-white leading-none">
                  Panopticon<span className="text-red-600 italic">.</span>
                </h1>
                <div className="flex items-center gap-3 text-zinc-500 font-mono text-[9px] uppercase tracking-[0.6em]">
                  <span className="w-12 h-px bg-red-600/30" />
                  Apex Strategic Intelligence Swarm
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-10 bg-white/[0.03] backdrop-blur-xl rounded-[2rem] border border-white/10 p-5 px-8 shadow-2xl">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">System</div>
              <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                Live Link
              </div>
            </div>
            <Separator orientation="vertical" className="h-10 bg-white/10" />
            <div className="space-y-1 text-right">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Model</div>
              <div className="text-zinc-200 font-black text-xs uppercase tracking-tighter">AWS NOVA-LITE</div>
            </div>
          </div>
        </header>

        {/* Tactical Searchbar */}
        <section className="relative group max-w-4xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 via-indigo-600/20 to-red-600/20 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition duration-1000" />
          <div className="relative bg-[#09090b]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-3 flex flex-col md:flex-row shadow-2xl transition-all duration-500 hover:border-white/20">
            <div className="flex-1 flex items-center px-6 gap-5">
              <Search className="h-6 w-6 text-red-500/40" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={loading}
                placeholder="Target Handle or Strategic Niche..."
                className="h-16 bg-transparent border-none text-2xl font-bold placeholder:text-zinc-800 text-white focus-visible:ring-0 shadow-none px-0"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="h-16 px-12 bg-red-600 hover:bg-red-500 text-white font-[900] uppercase tracking-[0.2em] text-sm rounded-[1.5rem] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_15px_40px_-10px_rgba(220,38,38,0.4)]"
            >
              <Zap className="h-5 w-5 mr-4 fill-current" />
              Pulse
            </Button>
          </div>
        </section>

        {/* Global Dashboard */}
        <main className="min-h-[600px]">
          {loading && (
            <div className="max-w-4xl mx-auto space-y-10 pt-16">
              <div className="panopticon-glass rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] relative">
                <div className="absolute inset-0 bg-gradient-to-b from-green-500/[0.02] to-transparent pointer-events-none" />
                <div className="flex items-center justify-between px-8 py-5 bg-white/[0.02] border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <Terminal className="h-4 w-4 text-emerald-500" />
                    <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-[0.3em]">AWS ORCHESTRATOR TERMINAL</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                </div>
                <div className="p-10 font-mono text-sm space-y-6 min-h-[350px]">
                  {bootSequence.slice(0, terminalIndex).map((step, i) => (
                    <div key={i} className="flex items-center gap-6 animate-panopticon-reveal">
                      <span className="text-zinc-600 font-bold tabular-nums">[{new Date().toISOString().split('T')[1].slice(0, 8)}]</span>
                      <span className={step.color + " font-black uppercase flex items-center gap-3 tracking-wider"}>
                        {step.icon} {step.label}
                      </span>
                      <div className="flex-1 h-px bg-white/[0.05]" />
                      <span className="text-emerald-500 font-black tracking-tighter">COMPLETE</span>
                    </div>
                  ))}
                  {terminalIndex < bootSequence.length && (
                    <div className="flex items-center gap-6 animate-pulse opacity-50">
                      <span className="text-zinc-600 font-bold tabular-nums">[{new Date().toISOString().split('T')[1].slice(0, 8)}]</span>
                      <span className="w-12 h-1 bg-zinc-700 rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="max-w-2xl mx-auto bg-red-950/20 border border-red-600/30 rounded-[2rem] p-12 text-center space-y-6 backdrop-blur-xl">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto animate-panopticon-pulse" />
              <div className="space-y-2">
                <h3 className="text-3xl font-black uppercase text-white tracking-widest leading-none">Intercept Failure</h3>
                <p className="text-red-400 font-mono text-xs uppercase tracking-widest">{error}</p>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-[1.2s] ease-out">

              {/* TOP IDENTITY BENTO */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <div className="xl:col-span-3 h-[250px] relative rounded-[2.5rem] bg-white/[0.03] border border-white/10 p-12 flex flex-col justify-end overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[#050507] to-transparent z-10" />
                  <div className="absolute -right-16 -top-16 opacity-[0.03] transition-opacity group-hover:opacity-[0.08] duration-1000 pointer-events-none scale-[2]">
                    <Fingerprint className="h-96 w-96 text-red-600" />
                  </div>
                  <div className="relative z-20 space-y-6">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-red-600 text-white font-[900] rounded-full px-4 py-1.5 text-[10px] tracking-[0.2em] shadow-2xl">THREAT: CRITICAL</Badge>
                      <Separator orientation="vertical" className="h-4 bg-white/20" />
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.5em]">Target Acquired</span>
                    </div>
                    <h2 className="text-8xl md:text-[7rem] font-[1000] tracking-tighter uppercase leading-[0.8] text-white break-all">
                      {result.competitor_handle}
                    </h2>
                  </div>
                </div>

                <div className="rounded-[2.5rem] bg-[#0c0c0e] border border-red-600/30 p-10 flex flex-col items-center justify-center text-center shadow-[0_30px_80px_-20px_rgba(220,38,38,0.25)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-red-600/5 transition-opacity group-hover:opacity-100 opacity-50 pulse-bg pointer-events-none" />
                  <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.4em] mb-8 relative z-10">Strategic Impact</div>
                  <div className="relative w-48 h-48 flex items-center justify-center z-10">
                    <svg className="absolute w-full h-full -rotate-90">
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-zinc-900" />
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="6" fill="transparent"
                        strokeDasharray="553"
                        strokeDashoffset={553 - (553 * result.threat_level) / 100}
                        className="text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] transition-all duration-1000"
                        strokeLinecap="round" />
                    </svg>
                    <div className="text-center space-y-1">
                      <div className="text-7xl font-[1000] text-white leading-none tracking-tighter">{result.threat_level}</div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">% DANGER</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* THE INTELLIGENCE BENTO GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

                {/* 1. Rekognition Vision Analysis */}
                <Card className="rounded-[2rem] bg-white/[0.02] border border-white/10 p-10 space-y-8 flex flex-col justify-between hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-600/10 rounded-2xl">
                        <Eye className="h-5 w-5 text-indigo-400" />
                      </div>
                      <span className="text-xs font-black text-white uppercase tracking-[0.3em]">AWS Rekognition</span>
                    </div>
                    <Badge variant="outline" className="border-indigo-500/20 text-indigo-400 text-[9px]">VISUAL CORE</Badge>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Visual DNA</div>
                      <p className="text-lg font-bold text-zinc-200 leading-tight">{result.sensory_layer.rekognition.color_palette}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {result.sensory_layer.rekognition.visual_themes.map((theme: string, i: number) => (
                        <Badge key={i} className="bg-indigo-600/10 text-indigo-300 border-indigo-500/10 rounded-lg text-[10px] py-1 px-3 uppercase font-black">{theme}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/5">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Target Persona</div>
                    <p className="text-sm font-medium text-zinc-400">{result.sensory_layer.rekognition.target_demographic_visuals}</p>
                  </div>
                </Card>

                {/* 2. Transcribe Sonic Intercept */}
                <Card className="rounded-[2rem] bg-white/[0.02] border border-white/10 p-10 space-y-8 flex flex-col justify-between hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-cyan-600/10 rounded-2xl">
                      <Headphones className="h-5 w-5 text-cyan-400" />
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-[0.3em]">AWS Transcribe</span>
                  </div>
                  <div className="space-y-4">
                    <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Sonic Hook Cluster</div>
                    <div className="space-y-4">
                      {result.sensory_layer.transcribe.sonic_hooks.map((hook: string, i: number) => (
                        <div key={i} className="relative p-5 bg-black/40 rounded-2xl border border-white/5 italic text-sm text-cyan-50/70 border-l-[6px] border-l-cyan-600/50">
                          <Zap className="absolute -top-2 -right-2 h-4 w-4 text-cyan-500 opacity-20" />
                          "{hook}"
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* 3. Red Team Strike Strategy */}
                <Card className="rounded-[2.5rem] bg-gradient-to-br from-red-600/20 to-transparent border border-red-500/40 p-10 space-y-10 xl:row-span-2 relative overflow-hidden flex flex-col justify-between group">
                  <Flame className="absolute -right-10 -bottom-10 w-48 h-48 text-red-500 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-1000" />
                  <div className="space-y-8 relative z-10 text-left">
                    <div className="flex items-center gap-4 text-left">
                      <div className="h-4 w-4 rounded-full bg-red-600 animate-pulse shadow-[0_0_15px_rgba(220,38,38,1)]" />
                      <span className="text-sm font-black text-red-500 uppercase tracking-[0.3em]">Red Team Offensive</span>
                    </div>
                    <div className="space-y-10">
                      <div className="space-y-3 pt-6 border-t border-red-500/20 text-left">
                        <div className="text-[11px] font-black text-red-400 uppercase tracking-widest">Market Vulnerability</div>
                        <p className="text-xl font-[900] text-white leading-tight">{result.agent_swarm.red_team.pricing_vulnerability}</p>
                      </div>
                      <div className="bg-red-600 p-8 rounded-[2rem] shadow-[0_30px_60px_-10px_rgba(220,38,38,0.5)] transform transition-transform hover:-translate-y-2 text-left">
                        <div className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-3">Primary Directive</div>
                        <p className="text-2xl font-black text-white uppercase leading-[1.1]">{result.agent_swarm.red_team.undercut_strategy}</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10 pt-10 text-left">
                    <div className="flex items-center gap-2 text-red-400 font-mono text-[10px] uppercase font-black">
                      <TrendingDown className="h-4 w-4" />
                      Asymmetric Advantage Confirmed
                    </div>
                  </div>
                </Card>

                {/* 4. Comprehend Sentiment Drift */}
                <Card className="rounded-[2rem] bg-white/[0.02] border border-white/10 p-10 space-y-8 hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-600/10 rounded-2xl">
                        <BrainCircuit className="h-5 w-5 text-orange-400" />
                      </div>
                      <span className="text-xs font-black text-white uppercase tracking-[0.3em]">AWS Comprehend</span>
                    </div>
                    <div className="text-[11px] font-black text-orange-500 flex items-center gap-2">
                      <ShieldAlert className="h-3 w-3" /> {result.sensory_layer.comprehend.negative_sentiment_score}% CHURN RISK
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="p-6 bg-orange-600/5 border border-orange-500/20 rounded-2xl">
                      <p className="text-2xl font-[900] text-white leading-none uppercase tracking-tighter">"{result.sensory_layer.comprehend.critical_vulnerability}"</p>
                    </div>
                    <div className="space-y-3">
                      {result.sensory_layer.comprehend.user_complaints.map((c: string, i: number) => (
                        <div key={i} className="flex gap-4 text-sm text-zinc-500 items-start font-medium">
                          <Layers className="h-4 w-4 text-orange-600 mt-1 shrink-0" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* 5. Customer Poacher Segment */}
                <Card className="rounded-[2rem] bg-[#09090b] border border-emerald-500/20 p-10 space-y-10 relative group hover:border-emerald-500/40 transition-all">
                  <div className="absolute top-0 right-0 p-8 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                    <Target className="h-16 w-16" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-3.5 w-3.5 rounded-full bg-emerald-600 animate-pulse shadow-[0_0_12px_rgba(16,185,129,1)]" />
                    <span className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em]">Market Poacher Core</span>
                  </div>
                  <div className="space-y-6 relative z-10">
                    <div className="text-[11px] font-black text-emerald-500/50 uppercase tracking-widest">Exploitative Hook</div>
                    <div className="bg-black/80 backdrop-blur-xl border-2 border-dashed border-emerald-500/20 p-8 rounded-[2rem] shadow-inner">
                      <p className="text-3xl font-[1000] italic text-emerald-400 leading-[1.2] tracking-tighter shrink-0 break-words font-serif">"{result.agent_swarm.customer_poacher.zero_day_ad_copy}"</p>
                    </div>
                  </div>
                </Card>

                {/* 6. Neptune Infrastructure Visualization */}
                <Card className="rounded-[2.5rem] bg-[#060608] border border-white/5 p-8 relative overflow-hidden xl:col-span-2 shadow-inner">
                  <div className="absolute inset-0 panopticon-grid pointer-events-none opacity-[0.05]" />
                  <div className="flex items-center justify-between relative z-10 mb-8 px-4">
                    <span className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em] flex items-center gap-3">
                      <Globe className="h-4 w-4" /> Neptune Threat Graph Topology
                    </span>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="border-white/5 text-zinc-600 text-[9px] font-mono">ENCRYPTED LINK</Badge>
                      <Lock className="h-4 w-4 text-zinc-800" />
                    </div>
                  </div>

                  <div className="relative h-[250px] flex items-center justify-center relative z-10">
                    <div className="w-full flex justify-around items-center px-20">
                      {result.threat_graph.nodes.slice(0, 3).map((node: any, i: number) => (
                        <div key={i} className={`
                            relative z-20 px-8 py-5 rounded-3xl border transition-all duration-700 cursor-crosshair group/node
                            ${i === 0 ? 'bg-red-600 border-red-500 scale-125 shadow-[0_0_40px_rgba(220,38,38,0.4)]' : 'bg-zinc-900 border-white/10 hover:border-red-500/50'}
                          `}>
                          <div className="text-[10px] font-bold text-white/40 uppercase mb-2 text-center tracking-widest">{node.type}</div>
                          <div className={`text-sm font-black uppercase text-center ${i === 0 ? 'text-white' : 'text-zinc-200'}`}>{node.label}</div>
                          <div className="absolute -inset-1 rounded-[1.8rem] opacity-0 group-hover/node:opacity-100 border border-red-500/50 animate-panopticon-pulse pointer-events-none" />
                        </div>
                      ))}

                      {/* Connecting Lines */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                        <path d="M 25% 50% L 50% 50% L 75% 50%" stroke="rgba(239,68,68,0.1)" strokeWidth="2" strokeDasharray="8 8" className="animate-panopticon-dash" />
                        <circle cx="25%" cy="50%" r="4" fill="rgba(239,68,68,0.3)" />
                        <circle cx="75%" cy="50%" r="4" fill="rgba(239,68,68,0.3)" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </div>

              {/* THE ULTIMATE DEPLOYMENT CTA */}
              <div className="pt-24 pb-48 flex flex-col items-center">
                <div className="relative group w-full max-w-3xl">
                  <div className="absolute -inset-8 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 rounded-[3rem] blur-[80px] opacity-10 group-hover:opacity-30 transition duration-[2s] animate-pulse" />

                  <Button
                    onClick={handleDeploy}
                    disabled={deploying}
                    className="w-full h-auto py-10 rounded-[3.5rem] bg-[#0c0c0e] border-[3px] border-red-600/30 hover:border-red-500 relative overflow-hidden group transition-all duration-[0.8s] flex flex-col sm:flex-row items-center justify-between px-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]"
                  >
                    {/* Kinetic Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1.5s] ease-in-out" />

                    <div className="flex items-center gap-10 relative z-10 w-full justify-center sm:justify-start">
                      <div className="relative">
                        <div className="absolute inset-0 bg-red-600 rounded-[1.5rem] blur-xl opacity-30 group-hover:opacity-100 transition duration-500" />
                        <div className="relative bg-red-600 p-5 rounded-[1.8rem] transform group-hover:scale-125 group-hover:rotate-[15deg] transition-all duration-700">
                          <Rocket className="w-10 h-10 text-white fill-current" />
                        </div>
                      </div>

                      <div className="flex flex-col items-start text-left">
                        <span className="text-4xl font-[1000] uppercase tracking-[-0.04em] text-white leading-none">Deploy Counter-Strike</span>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-[11px] font-black text-red-500 uppercase tracking-[0.4em]">Execute Directive #CC-99</span>
                          <ChevronRight className="h-4 w-4 text-red-700 animate-panopticon-float" />
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 text-zinc-800 group-hover:text-red-600/50 transition-colors duration-700 pr-4">
                      <ArrowUpRight className="w-16 h-16 transform group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-700" />
                    </div>

                    {deploying && (
                      <div className="absolute inset-0 bg-red-600 flex flex-col items-center justify-center animate-panopticon-reveal">
                        <Activity className="h-12 w-12 text-white animate-pulse mb-3" />
                        <span className="font-black text-2xl text-white uppercase tracking-[0.5em]">Transmitting Directive...</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>

            </div>
          )}

          {/* Empty State Overlay */}
          {!result && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-40 animate-in fade-in duration-1000">
              <div className="relative h-56 w-56 mb-12">
                <div className="absolute inset-0 border-[3px] border-dashed border-white/[0.03] rounded-full animate-[spin_30s_linear_infinite]" />
                <div className="absolute inset-6 border-t-2 border-red-500/10 rounded-full animate-spin duration-1000" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Target className="h-16 w-16 text-zinc-900" />
                </div>
              </div>
              <div className="space-y-4 text-center">
                <h3 className="text-3xl font-[1000] uppercase text-zinc-800 tracking-[0.6em] leading-none">Scanning Core Offline</h3>
                <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                  Provide strategic target identity via the primary interface to authorize Panopticon intercept sequence.
                </p>
              </div>
            </div>
          )}
        </main>

      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/competitor-pulse/')({
  component: CompetitorPulsePage,
})