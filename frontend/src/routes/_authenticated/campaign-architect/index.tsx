import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useCampaignStore } from '@/stores/campaign-store'
import type { PipelineStep, StepState } from '@/stores/campaign-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Loader2, Plus, Sparkles, ArrowLeft,
  Search, Cpu, Layers, Database, CheckCircle2, Circle,
  TrendingUp, TrendingDown, Minus, Target,
  Building2, Users, Eye, Clock, Activity, Rocket,
  RefreshCw, Radar, LocateFixed, EyeOff, ScanFace
} from 'lucide-react'
import { GenesisCanvas } from '@/features/genesis/GenesisCanvas'

export const Route = createFileRoute('/_authenticated/campaign-architect/')({
  component: CampaignArchitectPage,
})

const STEPS: PipelineStep[] = ['RECON', 'COMPREHEND', 'SYNTHESIS', 'MEMORY']

function cx(...cs: (string | undefined | false | null)[]) {
  return cs.filter(Boolean).join(' ')
}

// ── New Visuals: Horizontal Flow instead of Vertical Trace ──────────────────
function BlueprintFlow({ steps, pipelineRunning }: { steps: Record<PipelineStep, StepState>, pipelineRunning: boolean }) {
  const stepMeta = {
    RECON: { label: 'Market Recon', icon: Search },
    COMPREHEND: { label: 'NLP Extraction', icon: Cpu },
    SYNTHESIS: { label: 'Nova Synthesis', icon: Layers },
    MEMORY: { label: 'Campaign Memory', icon: Database },
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <div className="flex items-center justify-between relative">
        {/* Background connector line */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-border/40 -translate-y-1/2 z-0" />

        {STEPS.map((step, i) => {
          const s = steps[step]
          const isDone = s.status === 'done'
          const isRunning = s.status === 'running'
          const M = stepMeta[step]
          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-3 w-1/4">
              <div className={cx(
                "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                isDone ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]" :
                  isRunning ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-pulse" :
                    "bg-muted border-muted-foreground/30"
              )}>
                {isRunning ? (
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                ) : (
                  <M.icon className={cx("h-4 w-4", isDone ? "text-emerald-500" : "text-muted-foreground/50")} />
                )}
              </div>
              <div className="text-center space-y-1">
                <p className={cx("text-[11px] font-bold uppercase tracking-wider",
                  isDone ? "text-emerald-400" : isRunning ? "text-primary" : "text-muted-foreground/50"
                )}>{M.label}</p>
                {(s.elapsed || isRunning) && (
                  <p className="text-[10px] font-mono text-muted-foreground/60">
                    {isRunning ? "compiling..." : `${s.elapsed}s`}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RivalRadarView({ campaign }: { campaign: any }) {
  const { runRadarScan, radarScanning, radarResult } = useCampaignStore()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
      {/* Visual Radar Component */}
      <div className="rounded-xl border border-border/60 bg-card/40 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.05)_0%,transparent_70%)]" />

        {radarScanning ? (
          <div className="relative flex items-center justify-center">
            <div className="absolute w-64 h-64 border border-emerald-500/30 rounded-full animate-ping shadow-[0_0_40px_rgba(16,185,129,0.2)]" style={{ animationDuration: '3s' }} />
            <div className="absolute w-40 h-40 border border-emerald-500/40 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center z-10 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <ScanFace className="h-8 w-8 text-emerald-500 animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="relative flex items-center justify-center opacity-50">
            <div className="absolute w-64 h-64 border border-border/50 rounded-full" />
            <div className="absolute w-40 h-40 border border-border/50 rounded-full" />
            <div className="w-20 h-20 bg-muted border-2 border-border rounded-full flex items-center justify-center z-10">
              <EyeOff className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        )}

        <div className="z-10 mt-12 text-center space-y-3 max-w-sm">
          <h3 className="text-xl font-bold tracking-tight">Autonomous Watchdog</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Rival Radar automatically scans the competitive landscape every 6 hours via AWS EventBridge. If new competitors emerge or market sentiment drops, it fires an autonomous SNS alert.
          </p>
          <Button
            onClick={() => runRadarScan(campaign.id)}
            disabled={radarScanning}
            className={cx("mt-4 gap-2", radarScanning ? "" : "bg-emerald-600 hover:bg-emerald-700 text-white")}
            size="lg"
          >
            {radarScanning ? <><Loader2 className="h-4 w-4 animate-spin" /> Scanning Horizon...</> : <><Radar className="h-4 w-4 shadow-sm" /> Trigger Manual Scan</>}
          </Button>
        </div>
      </div>

      {/* Radar Results / History */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <LocateFixed className="h-4 w-4 text-emerald-500" /> Latest Scan Results
        </h3>
        {!radarResult ? (
          <div className="h-full min-h-[250px] rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground/50 p-6 text-center">
            <Search className="h-8 w-8 mb-3 opacity-20" />
            <p className="text-xs uppercase tracking-widest font-semibold">No recent scans</p>
            <p className="text-xs max-w-[200px] mt-2">Trigger a manual scan to see competitive deltas plotted here.</p>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Market Trend</p>
                <div className="flex items-center gap-2">
                  {radarResult.delta.market_trend === 'RISING' ? <TrendingUp className="h-4 w-4 text-emerald-500" /> :
                    radarResult.delta.market_trend === 'FALLING' ? <TrendingDown className="h-4 w-4 text-red-500" /> :
                      <Minus className="h-4 w-4 text-muted-foreground" />}
                  <span className={cx("text-base font-bold",
                    radarResult.delta.market_trend === 'RISING' ? 'text-emerald-500' :
                      radarResult.delta.market_trend === 'FALLING' ? 'text-red-500' : 'text-muted-foreground'
                  )}>{radarResult.delta.market_trend}</span>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Sentiment</p>
                <p className="text-base font-bold">{radarResult.comprehend_data.sentiment} ({radarResult.comprehend_data.market_confidence}%)</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Competitor Matrix</p>
              <div className="space-y-2">
                {radarResult.delta.new_competitors.length > 0 && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
                    <Building2 className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-red-500">New Rivals Detected</p>
                      <p className="text-xs text-red-400 mt-0.5">{radarResult.delta.new_competitors.join(', ')}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 p-1">
                  <span className="text-xs text-muted-foreground">Total Tracked Entities:</span>
                  <span className="text-xs font-bold">{radarResult.comprehend_data.competitor_names.length}</span>
                </div>
              </div>
            </div>

            {radarResult.alert_fired && (
              <div className="rounded-xl border border-red-500/50 bg-red-500/5 p-4 flex items-center gap-3">
                <Activity className="h-5 w-5 text-red-500 shrink-0 animate-pulse" />
                <div>
                  <p className="text-sm font-semibold text-red-500">SNS Alert Dispatched</p>
                  <p className="text-xs text-red-400/80">Market shift threshold breached. Email notification sent.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ArchitectBoard({ strategy }: { strategy: any }) {
  if (!strategy) return null
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in zoom-in-95 duration-500">
      <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-gradient-to-br from-card to-card/50 p-6 space-y-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
          <Layers className="h-32 w-32" />
        </div>
        <Badge variant="outline" className="text-[10px] font-mono tracking-widest border-primary/30 text-primary uppercase">Core Campaign DNA</Badge>
        <div>
          <h2 className="text-2xl font-bold font-serif italic text-foreground/90 tracking-tight leading-snug">
            "{strategy.core_concept}"
          </h2>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1 uppercase tracking-widest font-semibold text-[10px]">Differentiated Tagline</p>
          <p className="text-base font-semibold text-primary">{strategy.tagline}</p>
        </div>
        <div className="pt-4 border-t border-border/50">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-3">Market Insight Gained</p>
          <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-primary/50 pl-3">
            {strategy.market_insight}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
            <Users className="h-3 w-3" /> Target Audiences
          </p>
          <div className="space-y-3">
            {strategy.target_audience?.map((aud: any, i: number) => (
              <div key={i} className="space-y-0.5">
                <p className="text-xs font-semibold">{aud.segment_name}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{aud.pain_point}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
            <Target className="h-3 w-3" /> USPs
          </p>
          <ul className="space-y-2">
            {strategy.usps?.map((usp: string, i: number) => (
              <li key={i} className="text-xs flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span className="text-foreground/80 leading-snug">{usp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function CampaignArchitectPage() {
  const {
    campaigns, activeCampaign, isFetching, isSaving, isGenerating,
    fetchCampaigns, createCampaign, setActiveCampaign,
    streamIntelligence, pipelineRunning, pipelineComplete, steps, runElapsed
  } = useCampaignStore()

  const [isCreating, setIsCreating] = useState(false)
  const [showGenesis, setShowGenesis] = useState(false)
  const [activeTab, setActiveTab] = useState<'blueprint' | 'radar'>('blueprint')
  const [formData, setFormData] = useState({ name: '', goal: '', duration: '', budget: '' })

  useEffect(() => { fetchCampaigns() }, [])

  const handleCreate = async () => {
    if (!formData.name || !formData.goal) return toast.error('Name and Goal are required')
    await createCampaign(formData)
    setIsCreating(false)
    setFormData({ name: '', goal: '', duration: '', budget: '' })
    toast.success('Campaign draft created')
  }

  // ── Genesis View ──
  if (activeCampaign && showGenesis) {
    return (
      <div className="relative h-[calc(100vh-6rem)] w-full overflow-hidden rounded-xl border">
        <Button variant="secondary" size="sm" onClick={() => setShowGenesis(false)} className="absolute top-4 left-4 z-50">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Architect
        </Button>
        <GenesisCanvas initialInput={activeCampaign.goal} autoStart={true} />
      </div>
    )
  }

  // ── Detail View ──
  if (activeCampaign) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 max-w-[1400px] mx-auto">
        {/* Header Block */}
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <Button variant="outline" size="icon" className="shrink-0 mt-1 rounded-full h-8 w-8" onClick={() => setActiveCampaign(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{activeCampaign.name}</h1>
                <Badge variant={activeCampaign.status === 'active' ? 'default' : 'secondary'} className="text-[10px] uppercase">
                  {activeCampaign.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{activeCampaign.goal}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {activeCampaign.strategy && (
              <Button variant="outline" onClick={() => setShowGenesis(true)} className="gap-2 border-violet-500/30 text-violet-500 hover:bg-violet-500/10">
                <Sparkles className="h-4 w-4" /> View Genesis Graph
              </Button>
            )}
            <Button onClick={() => streamIntelligence(activeCampaign.id)} disabled={pipelineRunning} className="gap-2">
              {pipelineRunning ? <><Loader2 className="h-4 w-4 animate-spin" /> Compiling Intel...</> : <><RefreshCw className="h-4 w-4" /> Regenerate Strategy</>}
            </Button>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex items-center gap-6 border-b border-border">
          <button
            onClick={() => setActiveTab('blueprint')}
            className={cx("pb-3 text-sm font-semibold transition-colors relative", activeTab === 'blueprint' ? "text-foreground" : "text-muted-foreground hover:text-foreground/80")}
          >
            Strategy Blueprint
            {activeTab === 'blueprint' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('radar')}
            className={cx("pb-3 text-sm font-semibold flex items-center gap-2 transition-colors relative", activeTab === 'radar' ? "text-emerald-500" : "text-muted-foreground hover:text-foreground/80")}
          >
            <Radar className="h-4 w-4" /> Rival Radar Watchdog
            {activeTab === 'radar' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full" />}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'blueprint' && (
          <div className="space-y-6">
            {(pipelineRunning || pipelineComplete) && (
              <BlueprintFlow steps={steps} pipelineRunning={pipelineRunning} />
            )}

            {!activeCampaign.strategy && !pipelineRunning ? (
              <div className="h-64 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center p-6 bg-muted/20">
                <Layers className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-1">Blank Canvas</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-4">
                  Run the Intelligence Pipeline to scan the market, extract NLP insights, and synthesize a differentiated marketing strategy.
                </p>
                <Button onClick={() => streamIntelligence(activeCampaign.id)} className="gap-2" size="lg">
                  <Activity className="h-4 w-4" /> Trigger Intelligence Scan
                </Button>
              </div>
            ) : (
              <ArchitectBoard strategy={activeCampaign.strategy} />
            )}
          </div>
        )}

        {activeTab === 'radar' && (
          <RivalRadarView campaign={activeCampaign} />
        )}
      </div>
    )
  }

  // ── List View ──
  return (
    <div className="flex-1 space-y-8 p-4 md:p-10 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaign Architect</h1>
          <p className="text-sm text-muted-foreground mt-1">Design data-grounded campaigns and deploy autonomous rival watchdogs.</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating} size="lg" className="rounded-full shadow-lg">
          <Plus className="h-4 w-4 mr-2" /> New Campaign
        </Button>
      </div>

      {isCreating && (
        <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold mb-4">Draft New Campaign</h3>
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <div className="space-y-2">
              <Label>Campaign Target Name</Label>
              <Input placeholder="e.g. Summer Launch 2026" className="bg-muted/50" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input placeholder="e.g. 4 Weeks" className="bg-muted/50" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2 mb-5">
            <Label>Strategic Goal</Label>
            <Textarea placeholder="What is the objective? (e.g. Penetrate the D2C apparel market in Tamil Nadu)" className="bg-muted/50 resize-none h-20" value={formData.goal} onChange={e => setFormData({ ...formData, goal: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isSaving} className="px-6">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Create Blueprint
            </Button>
          </div>
        </div>
      )}

      {campaigns.length === 0 && !isCreating ? (
        <div className="h-80 flex flex-col items-center justify-center border border-dashed rounded-3xl opacity-60">
          <Rocket className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-medium">No plans on the board.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {campaigns.map(campaign => (
            <div
              key={campaign.id}
              className="group relative rounded-2xl border border-border/80 bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer overflow-hidden"
              onClick={() => setActiveCampaign(campaign)}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-border group-hover:bg-primary transition-colors" />
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">{campaign.name}</h3>
                <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="text-[10px] scale-90 origin-top-right uppercase">{campaign.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">{campaign.goal}</p>

              <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {campaign.duration || '—'}
                </div>
                {campaign.strategy ? (
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-500 ml-auto bg-emerald-500/10 px-2 py-1 rounded-md">
                    <CheckCircle2 className="h-3 w-3" /> Ready
                  </div>
                ) : (
                  <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50 ml-auto">Draft</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
