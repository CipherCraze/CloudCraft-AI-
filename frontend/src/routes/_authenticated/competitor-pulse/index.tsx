import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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
  Network
} from "lucide-react"

export default function CompetitorPulsePage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Terminal animation state
  const [logs, setLogs] = useState<string[]>([])
  const bootSequence = [
    "INITIATING AWS STEP FUNCTIONS ORCHESTRATOR...",
    "SPINNING UP AMAZON REKOGNITION VISION AGENTS...",
    "EXTRACTING COMPETITOR COMPLAINTS VIA AWS COMPREHEND...",
    "DEPLOYING RED TEAM BEDROCK SWARM...",
    "MAPPING THREAT GRAPH IN AMAZON NEPTUNE...",
    "SYNTHESIZING ZERO-DAY EXPLOIT PLAN..."
  ]

  useEffect(() => {
    if (loading) {
      let currentLogIndex = 0;
      setLogs([]);
      const interval = setInterval(() => {
        if (currentLogIndex < bootSequence.length) {
          setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${bootSequence[currentLogIndex]}`]);
          currentLogIndex++;
        } else {
          clearInterval(interval);
        }
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [loading]);

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

      if (!response.ok) throw new Error("Failed to fetch competitor pulse")

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || "Engine error during web search")
    } finally {
      // Small timeout to let the last log render before showing results
      setTimeout(() => setLoading(false), 500)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:space-y-8 md:p-10 bg-background text-foreground overflow-x-hidden min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-500/10 p-2 md:p-3 border border-red-500/20">
            <Radar className="h-6 w-6 md:h-8 md:w-8 text-red-500 animate-[spin_3s_linear_infinite]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-3xl font-mono uppercase text-red-50">Project Panopticon</h1>
            <p className="text-red-500/80 text-xs md:text-sm font-mono tracking-widest uppercase">Multi-Modal Threat Engine // AWS Native</p>
          </div>
        </div>
      </div>

      <Separator className="bg-red-500/20" />

      {/* Search Input Section */}
      <Card className="border-red-500/20 bg-card/50 shadow-sm backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500/50 group-focus-within:text-red-500 transition-colors" />
              <Input
                placeholder="Target Competitor Handle or URI..."
                className="pl-10 h-12 bg-background/50 border-red-500/30 focus-visible:ring-red-500 font-mono"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={loading}
              />
            </div>
            <Button
              size="lg"
              onClick={handleSearch}
              disabled={loading}
              className="h-12 px-8 font-bold font-mono uppercase bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]"
            >
              <Zap className="mr-2 h-4 w-4" />
              Initiate Pulse
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Terminal Loading State */}
      {loading && (
        <Card className="border-green-500/30 bg-black/90 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
          <CardHeader className="border-b border-green-500/20 bg-green-500/5 py-3 flex flex-row items-center gap-3">
            <Terminal className="h-4 w-4 text-green-500" />
            <span className="text-xs font-mono font-bold text-green-500 uppercase tracking-widest">AWS Orchestrator Terminal</span>
            <div className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </CardHeader>
          <CardContent className="p-6 font-mono text-xs md:text-sm space-y-2 min-h-[200px]">
            {logs.map((log, i) => (
              <div key={i} className="text-green-400 animate-in slide-in-from-bottom-2 fade-in">
                {log}
              </div>
            ))}
            <div className="text-green-500/50 animate-pulse mt-4">_</div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-600 bg-red-950/50">
          <CardContent className="pt-6 font-mono text-red-400 flex items-center gap-3">
            <Activity className="h-5 w-5 animate-pulse" />
            CRITICAL ERROR: {error}
          </CardContent>
        </Card>
      )}

      {/* Panopticon Results Dashboard */}
      {result && !loading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* Header Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="md:col-span-3 border-red-500/30 bg-red-500/5 shadow-inner">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono text-red-500 uppercase tracking-widest mb-1">Target Acquired</p>
                  <h2 className="text-2xl font-black uppercase text-foreground">{result.competitor_handle}</h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                  <Badge className="bg-red-500 animate-pulse text-white">VULNERABLE</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-500 border-2 bg-red-950/20 flex flex-col justify-center items-center p-6 text-center shadow-[0_0_20px_rgba(220,38,38,0.2)]">
              <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-red-500 mb-2">Threat Level</h4>
              <span className="text-4xl font-black text-red-500">{result.threat_level}<span className="text-lg opacity-50">%</span></span>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">

            {/* AWS Sensory Layer */}
            <Card className="border-border bg-card shadow-lg overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border py-4">
                <CardTitle className="text-sm font-mono font-bold uppercase tracking-widest flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" /> Sensory Intercepts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 divide-y divide-border">

                  {/* Rekognition */}
                  <div className="p-5 bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <h5 className="text-[11px] font-bold font-mono uppercase text-blue-500 tracking-widest">Amazon Rekognition</h5>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Visual Palette: <span className="text-foreground">{result.sensory_layer.rekognition.color_palette}</span></p>
                    <p className="text-xs text-muted-foreground mb-2">Demographic: <span className="text-foreground">{result.sensory_layer.rekognition.target_demographic_visuals}</span></p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {result.sensory_layer.rekognition.visual_themes.map((theme: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-[9px] bg-background border-blue-500/30 text-blue-400">{theme}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Transcribe */}
                  <div className="p-5 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <Headphones className="h-4 w-4 text-cyan-500" />
                      <h5 className="text-[11px] font-bold font-mono uppercase text-cyan-500 tracking-widest">Amazon Transcribe</h5>
                    </div>
                    <div className="space-y-2">
                      {result.sensory_layer.transcribe.sonic_hooks.map((hook: string, i: number) => (
                        <p key={i} className="text-xs text-foreground/80 italic border-l-2 border-cyan-500/50 pl-2">"{hook}"</p>
                      ))}
                    </div>
                  </div>

                  {/* Comprehend */}
                  <div className="p-5 bg-orange-500/5 hover:bg-orange-500/10 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4 text-orange-500" />
                        <h5 className="text-[11px] font-bold font-mono uppercase text-orange-500 tracking-widest">Amazon Comprehend</h5>
                      </div>
                      <Badge className="bg-orange-600 hover:bg-orange-600 text-[9px] font-mono">
                        Sentiment: NEGATIVE ({result.sensory_layer.comprehend.negative_sentiment_score})
                      </Badge>
                    </div>
                    <p className="text-sm font-bold text-orange-500/90 mb-3">{result.sensory_layer.comprehend.critical_vulnerability}</p>
                    <div className="space-y-1">
                      {result.sensory_layer.comprehend.user_complaints.map((complaint: string, i: number) => (
                        <p key={i} className="text-[11px] text-muted-foreground flex gap-2">
                          <span className="text-orange-500">-</span> {complaint}
                        </p>
                      ))}
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Agent Swarm output */}
            <div className="space-y-6">
              <Card className="border-red-500/40 bg-card shadow-xl overflow-hidden">
                <CardHeader className="bg-red-950/30 border-b border-red-500/20 py-4">
                  <CardTitle className="text-sm font-mono font-bold uppercase tracking-widest flex items-center gap-2">
                    <Crosshair className="h-4 w-4 text-red-500" /> Agent Swarm Deployment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">

                  {/* Red Team */}
                  <div>
                    <h5 className="text-[10px] font-bold font-mono uppercase text-red-500 mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Red Team Strategy</h5>
                    <div className="bg-background rounded-md border border-red-500/20 p-4 space-y-3">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Pricing Vulnerability</span>
                        <p className="text-xs font-semibold text-foreground/90 mt-1">{result.agent_swarm.red_team.pricing_vulnerability}</p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Undercut Strategy</span>
                        <p className="text-xs font-semibold text-red-400 mt-1">{result.agent_swarm.red_team.undercut_strategy}</p>
                      </div>
                    </div>
                  </div>

                  {/* Poacher Segment */}
                  <div>
                    <h5 className="text-[10px] font-bold font-mono uppercase text-emerald-500 mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Customer Poacher</h5>
                    <div className="bg-emerald-500/5 rounded-md border border-emerald-500/20 p-4 relative overflow-hidden">
                      <Zap className="absolute -right-4 -bottom-4 h-16 w-16 text-emerald-500/10 pointer-events-none" />
                      <div className="relative z-10">
                        <span className="text-[9px] uppercase tracking-widest text-emerald-500/80">Zero-Day Ad Copy</span>
                        <p className="text-sm font-black italic text-emerald-400 mt-2">"{result.agent_swarm.customer_poacher.zero_day_ad_copy}"</p>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Threat Graph Simulation */}
              <Card className="border-black bg-zinc-950/80 shadow-inner overflow-hidden relative">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                <CardHeader className="pb-2 relative z-10">
                  <CardTitle className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <Network className="h-3 w-3" /> Amazon Neptune Threat Graph
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 relative z-10">
                  <div className="flex flex-wrap gap-3">
                    {result.threat_graph.nodes.map((node: any, i: number) => (
                      <Badge key={i} className="bg-zinc-900 border-zinc-700 text-zinc-300 font-mono text-[10px]">
                        <Server className="h-3 w-3 mr-1.5 opacity-50 text-indigo-400" />
                        {node.label} [{node.type}]
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                    {result.threat_graph.links.map((link: any, i: number) => {
                      const sourceNode = result.threat_graph.nodes.find((n: any) => n.id === link.source)?.label || 'Unknown';
                      const targetNode = result.threat_graph.nodes.find((n: any) => n.id === link.target)?.label || 'Unknown';
                      return (
                        <div key={i} className="text-[10px] font-mono text-zinc-500 flex items-center gap-2">
                          <span className="text-zinc-300">{sourceNode}</span>
                          <span className="w-12 h-px bg-zinc-700 relative">
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-zinc-500 uppercase">{link.relationship}</span>
                            <span className="absolute right-0 -top-1 border-t-4 border-b-4 border-l-4 border-transparent border-l-zinc-700 w-0 h-0" />
                          </span>
                          <span className="text-zinc-300">{targetNode}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

        </div>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/5 p-12 md:p-24 flex flex-col items-center justify-center text-center">
          <Crosshair className="h-12 w-12 md:h-16 md:w-16 text-red-500/20 mb-4 md:mb-6" />
          <h3 className="text-lg md:text-xl font-mono uppercase tracking-widest font-bold text-red-500">Engine Offline</h3>
          <p className="text-muted-foreground font-mono max-w-sm mt-2 text-xs">
            Awaiting target parameters to initiate Panopticon intelligence sweep.
          </p>
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/competitor-pulse/')({
  component: CompetitorPulsePage,
})