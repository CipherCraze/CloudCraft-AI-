import { useState, useEffect, useRef, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Satellite, MapPin, Compass, Loader2, Terminal,
  Search, Cpu, Layers, Database, Bell, CheckCircle2,
  Circle, Clock, TrendingUp, TrendingDown, Minus,
  Tag, Target, Zap, Building2, CalendarDays, User,
  Activity, AlertCircle, ChevronRight, Hash, Plus,
  RefreshCw, Globe, Shield
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────
interface ViralHook { title: string; description: string; confidence?: number }
interface Entity { text: string; type: string; score: number }
interface ScoutInsights {
  local_vibe: string
  viral_hooks: ViralHook[]
  strategic_recommendation: string
  sentiment_score: number
  trending_hashtags: string[]
  comprehend_summary?: string
}
interface ComprehendData {
  sentiment: string
  compliance_score: number
  key_phrases: string[]
  entities: Entity[]
}
interface TrendDelta {
  is_first_run: boolean
  new_hooks: string[]
  recurring_hooks: string[]
  new_hashtags: string[]
  score_trend: string
  avg_past_score?: number
  past_runs_count: number
}
interface LogLine {
  id: number; step: string; message: string; type: string; ts: string
}
interface StepState {
  status: 'pending' | 'running' | 'done' | 'error'
  startedAt?: number
  elapsed?: number
  meta?: string
}

type Step = 'RECON' | 'COMPREHEND' | 'SYNTHESIS' | 'MEMORY' | 'ALERT'
const STEPS: Step[] = ['RECON', 'COMPREHEND', 'SYNTHESIS', 'MEMORY', 'ALERT']

const STEP_META: Record<Step, { label: string; Icon: any; logColor: string }> = {
  RECON: { label: 'Recon Agent', Icon: Search, logColor: '#60a5fa' },
  COMPREHEND: { label: 'AWS Comprehend', Icon: Cpu, logColor: '#f59e0b' },
  SYNTHESIS: { label: 'Nova Synthesis', Icon: Layers, logColor: '#a78bfa' },
  MEMORY: { label: 'DynamoDB Memory', Icon: Database, logColor: '#34d399' },
  ALERT: { label: 'SNS Alert Agent', Icon: Bell, logColor: '#f87171' },
}

const ENTITY_ICON: Record<string, any> = {
  EVENT: CalendarDays, LOCATION: MapPin, PERSON: User,
  ORGANIZATION: Building2, DATE: Clock,
}

// ── Helpers ────────────────────────────────────────────────────────────
function cx(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}

function ArcGauge({ score, animated }: { score: number; animated: boolean }) {
  const [val, setVal] = useState(0)
  const R = 44
  const circ = 2 * Math.PI * R
  const arc = (270 / 360) * circ

  useEffect(() => {
    if (!animated || score === 0) return
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 1000, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(ease * score))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [score, animated])

  const offset = arc - (val / 100) * arc
  const color = val >= 80 ? '#ef4444' : val >= 60 ? '#f59e0b' : '#22c55e'

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 80" width="120" height="96">
        <circle cx="50" cy="58" r={R} fill="none" stroke="hsl(var(--border))" strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circ - arc}`}
          transform="rotate(-135 50 58)" />
        <circle cx="50" cy="58" r={R} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circ - arc}`}
          strokeDashoffset={offset}
          transform="rotate(-135 50 58)"
          style={{ transition: 'stroke 0.4s ease', filter: `drop-shadow(0 0 6px ${color}88)` }} />
        <text x="50" y="54" textAnchor="middle" fontSize="22" fontWeight="700"
          fill={color} fontFamily="inherit">{val}</text>
        <text x="50" y="66" textAnchor="middle" fontSize="7"
          fill="hsl(var(--muted-foreground))" fontFamily="inherit">VIRAL SCORE</text>
      </svg>
    </div>
  )
}

function ConfidenceBadge({ value }: { value: number }) {
  const R = 10
  const circ = 2 * Math.PI * R
  const offset = circ - (value / 100) * circ
  const color = value >= 90 ? '#22c55e' : value >= 75 ? '#f59e0b' : '#94a3b8'
  return (
    <div className="flex items-center gap-1.5">
      <svg viewBox="0 0 24 24" width="20" height="20">
        <circle cx="12" cy="12" r={R} fill="none" stroke="hsl(var(--border))" strokeWidth="2.5" />
        <circle cx="12" cy="12" r={R} fill="none" stroke={color} strokeWidth="2.5"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 12 12)" />
      </svg>
      <span className="text-[10px] font-semibold tabular-nums" style={{ color }}>{value}%</span>
    </div>
  )
}

// ── Execution Trace (left panel) ───────────────────────────────────────
function ExecutionTrace({
  steps, activeStep, runElapsed, runId
}: {
  steps: Record<Step, StepState>
  activeStep: Step | null
  runElapsed: number
  runId: string
}) {
  return (
    <div className="flex flex-col gap-1">
      {/* Run metadata */}
      {runId && (
        <div className="mb-3 px-3 py-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Run ID</span>
            <span className="text-[11px] font-mono text-foreground/70">{runId.slice(0, 8)}…</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Elapsed</span>
            <span className="text-[11px] font-mono text-foreground/70">{runElapsed}s</span>
          </div>
        </div>
      )}

      {STEPS.map((step, i) => {
        const { label, Icon } = STEP_META[step]
        const s = steps[step]
        const isDone = s.status === 'done'
        const isRunning = s.status === 'running'
        const isPending = s.status === 'pending'

        return (
          <div key={step} className="flex gap-3">
            {/* Timeline column */}
            <div className="flex flex-col items-center" style={{ width: 20 }}>
              <div className={cx(
                'flex h-5 w-5 items-center justify-center rounded-full shrink-0 z-10 transition-all duration-300',
                isDone ? 'bg-emerald-500/10 border border-emerald-500/50' :
                  isRunning ? 'bg-primary/10 border border-primary/60' :
                    'bg-muted/40 border border-border/60'
              )}>
                {isDone
                  ? <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  : isRunning
                    ? <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    : <Circle className="h-2.5 w-2.5 text-muted-foreground/30" />
                }
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-px flex-1 min-h-[28px] mt-0.5"
                  style={{
                    background: isDone
                      ? 'linear-gradient(to bottom, hsl(143 71% 45% / 0.5), hsl(143 71% 45% / 0.1))'
                      : 'hsl(var(--border))'
                  }} />
              )}
            </div>

            {/* Step content */}
            <div className={cx(
              'pb-5 flex-1 min-w-0 transition-opacity duration-300',
              isPending ? 'opacity-35' : 'opacity-100'
            )}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon className={cx(
                  'h-3 w-3 shrink-0',
                  isDone ? 'text-emerald-500' : isRunning ? 'text-primary' : 'text-muted-foreground'
                )} />
                <span className={cx(
                  'text-xs font-semibold',
                  isDone ? 'text-foreground' : isRunning ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {label}
                </span>
              </div>
              {s.meta && (
                <p className="text-[10px] text-muted-foreground leading-tight truncate pl-0.5">
                  {s.meta}
                </p>
              )}
              {s.elapsed !== undefined && (
                <p className="text-[10px] text-muted-foreground/50 pl-0.5 font-mono mt-0.5">
                  {s.elapsed}s
                </p>
              )}
              {isRunning && (
                <p className="text-[10px] text-primary/70 pl-0.5 animate-pulse">Running…</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Agent Terminal ─────────────────────────────────────────────────────
function AgentTerminal({ lines, loading }: { lines: LogLine[]; loading: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [lines])

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border-b border-border">
        <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground font-mono">
          agent.live — scout@cloudcraft
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground/50">{lines.length} events</span>
          {loading && (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              LIVE
            </span>
          )}
        </div>
      </div>
      <div ref={ref}
        className="h-48 overflow-y-auto bg-[#09090b] px-4 py-3 font-mono text-[11px] space-y-0.5"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a transparent' }}>
        {lines.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-2 opacity-20">
              <Satellite className="h-7 w-7 mx-auto" style={{ animationDuration: '3s' }} />
              <p className="text-xs uppercase tracking-widest">Awaiting deployment…</p>
            </div>
          </div>
        ) : lines.map(line => {
          const col = STEP_META[line.step as Step]?.logColor ?? '#71717a'
          return (
            <div key={line.id}
              className="flex items-start gap-2 scout-log-line leading-relaxed"
              style={{ '--log-delay': '0ms' } as any}>
              <span className="text-zinc-600 shrink-0 tabular-nums select-none">{line.ts}</span>
              <span className="font-bold shrink-0 uppercase text-[9px] tracking-wider"
                style={{ color: col }}>{line.step}</span>
              <span className={cx(
                'break-all',
                line.type === 'success' ? 'text-emerald-400' :
                  line.type === 'warning' ? 'text-amber-400' :
                    line.type === 'fire' ? 'text-red-400' :
                      line.type === 'aws' ? 'text-blue-300' :
                        'text-zinc-400'
              )}>
                {line.message}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Page Component ────────────────────────────────────────────────
export default function LocalScoutPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [city, setCity] = useState('Locating…')
  const [insights, setInsights] = useState<ScoutInsights | null>(null)
  const [comprehendData, setComprehendData] = useState<ComprehendData | null>(null)
  const [trendDelta, setTrendDelta] = useState<TrendDelta | null>(null)
  const [alertFired, setAlertFired] = useState(false)
  const [alertScore, setAlertScore] = useState(0)
  const [runId, setRunId] = useState('')
  const [loading, setLoading] = useState(false)
  const [gaugeAnimated, setGaugeAnimated] = useState(false)
  const [logLines, setLogLines] = useState<LogLine[]>([])
  const [runElapsed, setRunElapsed] = useState(0)
  const runStartRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logIdRef = useRef(0)

  const [stepStates, setStepStates] = useState<Record<Step, StepState>>(() =>
    Object.fromEntries(STEPS.map(s => [s, { status: 'pending' } as StepState])) as Record<Step, StepState>
  )
  const [activeStep, setActiveStep] = useState<Step | null>(null)

  const addLog = useCallback((step: string, message: string, type = 'info') => {
    setLogLines(prev => [...prev.slice(-100), {
      id: ++logIdRef.current, step, message, type,
      ts: new Date().toLocaleTimeString('en-IN', { hour12: false })
    }])
  }, [])

  const markStepRunning = useCallback((step: Step) => {
    setActiveStep(step)
    setStepStates(prev => ({
      ...prev,
      [step]: { ...prev[step], status: 'running', startedAt: Date.now() }
    }))
  }, [])

  const markStepDone = useCallback((step: Step, meta?: string) => {
    setActiveStep(null)
    setStepStates(prev => {
      const elapsed = prev[step].startedAt
        ? parseFloat(((Date.now() - prev[step].startedAt!) / 1000).toFixed(1))
        : undefined
      return { ...prev, [step]: { status: 'done', elapsed, meta } }
    })
  }, [])

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) { setCity('GPS Unavailable'); return }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          )
          const d = await r.json()
          setCity(d.address?.city || d.address?.town || d.address?.village || 'Local Region')
        } catch { setCity('Unknown Area') }
      },
      () => setCity('GPS Denied')
    )
  }, [])

  const runScout = useCallback(async () => {
    if (!location) return
    setLoading(true)
    setInsights(null); setComprehendData(null); setTrendDelta(null)
    setAlertFired(false); setLogLines([]); setRunId('')
    setRunElapsed(0); setGaugeAnimated(false)
    setStepStates(Object.fromEntries(STEPS.map(s => [s, { status: 'pending' } as StepState])) as Record<Step, StepState>)
    setActiveStep(null)

    runStartRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setRunElapsed(Math.floor((Date.now() - runStartRef.current) / 1000))
    }, 1000)

    const url = `http://localhost:8000/api/v1/scout/stream?city=${encodeURIComponent(city)}&lat=${location.lat}&lng=${location.lng}`
    const es = new EventSource(url)

    es.onmessage = (e) => {
      try {
        const { event, data } = JSON.parse(e.data)

        if (event === 'pipeline_start') {
          addLog('SYSTEM', `Deploying Scout Agent → ${data.city} (${data.lat?.toFixed(3)}, ${data.lng?.toFixed(3)})`)
        }
        else if (event === 'step_start') {
          markStepRunning(data.step as Step)
          addLog(data.step, `Starting ${data.step} phase`)
        }
        else if (event === 'step_complete') {
          const metaMap: Record<string, string | undefined> = {}
          markStepDone(data.step as Step, metaMap[data.step])
          addLog(data.step, data.message, 'success')
        }
        else if (event === 'recon_query') {
          addLog('RECON', data.message)
        }
        else if (event === 'recon_hit') {
          const meta = `${data.hits} result${data.hits !== 1 ? 's' : ''} from query ${data.query_num}`
          addLog('RECON', data.message, data.hits > 0 ? 'success' : 'info')
          setStepStates(prev => ({
            ...prev,
            RECON: { ...prev.RECON, meta }
          }))
        }
        else if (event === 'aws_call') {
          addLog(data.service?.toUpperCase() || 'AWS', data.message, 'aws')
        }
        else if (event === 'comprehend_result') {
          setComprehendData({
            sentiment: data.sentiment,
            compliance_score: data.compliance_score,
            key_phrases: data.key_phrases || [],
            entities: data.entities || []
          })
          markStepDone('COMPREHEND', `${data.sentiment} · ${data.entities?.length ?? 0} entities · ${data.key_phrases?.length ?? 0} phrases`)
          addLog('COMPREHEND', data.message, 'success')
        }
        else if (event === 'synthesis_result' || event === 'synthesis_fallback') {
          setInsights(data.insights)
          setGaugeAnimated(true)
          markStepDone('SYNTHESIS', `${data.insights?.viral_hooks?.length ?? 0} hooks · score ${data.insights?.sentiment_score ?? '?'}`)
          addLog('SYNTHESIS', data.message, event === 'synthesis_result' ? 'success' : 'warning')
        }
        else if (event === 'memory_update') {
          setTrendDelta(data.trend_delta)
          setRunId(data.run_id || '')
          const d = data.trend_delta
          markStepDone('MEMORY', d?.is_first_run
            ? 'Baseline established'
            : `${d?.score_trend} · ${d?.new_hooks?.length ?? 0} new signals`)
          addLog('MEMORY', data.message, 'success')
        }
        else if (event === 'alert_sent') {
          if (data.fired) { setAlertFired(true); setAlertScore(data.viral_score || 0) }
          markStepDone('ALERT', data.fired ? `SNS fired — score ${data.viral_score}` : 'Below threshold')
          addLog('ALERT', data.message || '', data.fired ? 'fire' : 'info')
        }
        else if (event === 'alert_skipped') {
          markStepDone('ALERT', `Score ${data.viral_score} below threshold ${data.threshold}`)
          addLog('ALERT', data.message, 'info')
        }
        else if (event === 'scout_complete') {
          if (data.insights && !insights) { setInsights(data.insights); setGaugeAnimated(true) }
          if (data.comprehend_data && !comprehendData) setComprehendData(data.comprehend_data)
          if (data.trend_delta && !trendDelta) setTrendDelta(data.trend_delta)
          if (data.alert_fired) setAlertFired(true)
          if (data.run_id) setRunId(data.run_id)
          addLog('SYSTEM', 'Pipeline complete. All 5 steps executed successfully.', 'success')
          es.close(); setLoading(false)
          if (timerRef.current) clearInterval(timerRef.current)
        }
      } catch { /* ignore */ }
    }

    es.onerror = () => {
      addLog('SYSTEM', 'Stream connection error', 'warning')
      es.close(); setLoading(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [location, city, addLog, markStepRunning, markStepDone])

  const allDone = STEPS.every(s => stepStates[s].status === 'done')
  const trendIcon = trendDelta?.score_trend === 'RISING'
    ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
    : trendDelta?.score_trend === 'FALLING'
      ? <TrendingDown className="h-3.5 w-3.5 text-red-500" />
      : <Minus className="h-3.5 w-3.5 text-muted-foreground" />

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-[1400px]">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cx(
            'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300',
            location
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-muted/40 border-border'
          )}>
            <Satellite className={cx(
              'h-5 w-5',
              location ? 'text-emerald-500' : 'text-muted-foreground',
              loading ? 'animate-pulse' : ''
            )} />
            {location && !loading && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
            )}
            {loading && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary animate-ping" />
            )}
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
              Local Agent Scout
              {loading && (
                <Badge variant="outline"
                  className="text-[10px] border-primary/40 text-primary bg-primary/5 animate-pulse font-mono">
                  RUNNING
                </Badge>
              )}
              {allDone && !loading && runId && (
                <Badge variant="outline"
                  className="text-[10px] border-emerald-500/40 text-emerald-500 bg-emerald-500/5 font-mono">
                  COMPLETE · {runElapsed}s
                </Badge>
              )}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-red-500" />
              <span>{city}</span>
              {runId && (
                <span className="font-mono text-muted-foreground/40 text-[10px]">
                  · run/{runId.slice(0, 8)}
                </span>
              )}
            </p>
          </div>
        </div>
        <Button onClick={runScout} disabled={loading || !location}
          className="gap-2 font-semibold shadow-sm">
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Scanning…</>
            : <><Compass className="h-4 w-4" /> Deploy Agent</>}
        </Button>
      </div>

      {/* ── Alert banner ── */}
      {alertFired && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3">
          <Zap className="h-4 w-4 text-red-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-500">
              Hot Signal Dispatched — SNS Alert Fired Autonomously
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Viral score {alertScore}/100 exceeded threshold. Email alert sent via AWS SNS to subscribed marketers. No human triggered this.
            </p>
          </div>
          <span className="text-2xl font-black tabular-nums text-red-500 shrink-0">{alertScore}</span>
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '220px 1fr' }}>

        {/* LEFT: Execution trace */}
        <div className="space-y-4">

          {/* Pipeline header */}
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Execution Trace
            </span>
          </div>

          <ExecutionTrace
            steps={stepStates}
            activeStep={activeStep}
            runElapsed={runElapsed}
            runId={runId}
          />

          {/* Viral score gauge */}
          {insights && (
            <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
              <ArcGauge score={insights.sentiment_score} animated={gaugeAnimated} />
              {trendDelta && !trendDelta.is_first_run && (
                <div className="flex items-center justify-center gap-1.5 text-xs font-medium">
                  {trendIcon}
                  <span className={
                    trendDelta.score_trend === 'RISING' ? 'text-emerald-500' :
                      trendDelta.score_trend === 'FALLING' ? 'text-red-500' : 'text-muted-foreground'
                  }>{trendDelta.score_trend}</span>
                  {trendDelta.avg_past_score != null && (
                    <span className="text-muted-foreground">(avg {trendDelta.avg_past_score})</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* DynamoDB memory */}
          {trendDelta && (
            <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">Memory</span>
                <Badge variant="outline" className="ml-auto text-[10px] font-mono">
                  {trendDelta.past_runs_count} runs
                </Badge>
              </div>
              {trendDelta.is_first_run ? (
                <p className="text-xs text-muted-foreground">Baseline established for {city}</p>
              ) : (
                <div className="space-y-1.5">
                  {trendDelta.new_hooks.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                      <Plus className="h-3 w-3 shrink-0" />
                      <span>{trendDelta.new_hooks.length} new signals this scan</span>
                    </div>
                  )}
                  {trendDelta.recurring_hooks.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-500">
                      <RefreshCw className="h-3 w-3 shrink-0" />
                      <span>{trendDelta.recurring_hooks.length} recurring trends</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Trending tags */}
          {insights?.trending_hashtags && (
            <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">Trending</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {insights.trending_hashtags.map(tag => (
                  <Badge key={tag} variant="secondary"
                    className="text-[10px] font-mono bg-muted/60">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Content area */}
        <div className="space-y-5 min-w-0">

          {/* Agent terminal */}
          <AgentTerminal lines={logLines} loading={loading} />

          {/* AWS Comprehend */}
          {comprehendData && (
            <div className="rounded-xl border border-border bg-card/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">AWS Comprehend</h3>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono gap-1">
                  <Globe className="h-3 w-3" /> Real NLP
                </Badge>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Sentiment', value: comprehendData.sentiment },
                  { label: 'Confidence', value: `${comprehendData.compliance_score}%` },
                  { label: 'Key Phrases', value: String(comprehendData.key_phrases.length) },
                  { label: 'Entities', value: String(comprehendData.entities.length) },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-muted/40 border border-border/60 px-3 py-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
                    <p className="text-sm font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              {/* Entities */}
              {comprehendData.entities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Detected Entities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {comprehendData.entities.map((ent, i) => {
                      const Icon = ENTITY_ICON[ent.type] ?? Tag
                      return (
                        <div key={i}
                          className="scout-decode inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1"
                          style={{ animationDelay: `${i * 0.06}s` }}>
                          <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-[11px] font-medium text-foreground">{ent.text}</span>
                          <span className="text-[9px] text-muted-foreground/60 font-mono uppercase">{ent.type}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Key phrases */}
              {comprehendData.key_phrases.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Key Phrases</p>
                  <div className="flex flex-wrap gap-1.5">
                    {comprehendData.key_phrases.slice(0, 12).map((phrase, i) => (
                      <span key={i}
                        className="scout-decode inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground"
                        style={{ animationDelay: `${i * 0.04}s` }}>
                        <Tag className="h-2.5 w-2.5 shrink-0" />
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Intel brief */}
          {insights && (
            <div className="space-y-4">

              {/* Local vibe */}
              <div className="rounded-xl border border-border bg-card/60 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Local Intelligence</h3>
                </div>
                <p className="text-sm leading-relaxed text-foreground/80 italic">
                  "{insights.local_vibe}"
                </p>
                {insights.comprehend_summary && (
                  <div className="flex items-start gap-2 pt-2 border-t border-border/60">
                    <Cpu className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {insights.comprehend_summary}
                    </p>
                  </div>
                )}
              </div>

              {/* Viral hook cards */}
              <div className="grid grid-cols-3 gap-3">
                {insights.viral_hooks.map((hook, idx) => {
                  const conf = hook.confidence != null ? Math.round(hook.confidence * 100) : 80
                  return (
                    <div key={idx}
                      className={cx(
                        'scout-hook-rise rounded-xl border bg-card/60 p-4 space-y-2 group hover:border-primary/40 transition-colors',
                        idx === 0 ? 'border-emerald-500/30' : 'border-border'
                      )}
                      style={{ animationDelay: `${idx * 0.1}s` }}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Hook #{String(idx + 1).padStart(2, '0')}
                        </span>
                        <ConfidenceBadge value={conf} />
                      </div>
                      <h4 className="text-sm font-semibold leading-snug text-foreground">{hook.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{hook.description}</p>
                      {idx === 0 && (
                        <div className="flex items-center gap-1 pt-1">
                          <AlertCircle className="h-3 w-3 text-emerald-500" />
                          <span className="text-[10px] font-semibold text-emerald-500">Top Signal</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Mission strategy */}
              <div className="rounded-xl border border-border bg-card/60 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Mission Strategy</h3>
                  <div className="ml-auto flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <Database className="h-3 w-3" /> Saved
                    </Badge>
                    {alertFired && (
                      <Badge variant="outline" className="text-[10px] gap-1 border-red-500/40 text-red-500 bg-red-500/5">
                        <Bell className="h-3 w-3" /> SNS Sent
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground/90 leading-relaxed">
                  {insights.strategic_recommendation}
                </p>
              </div>

            </div>
          )}

          {/* Empty state */}
          {!insights && !loading && (
            <div className="flex flex-col items-center justify-center py-24 rounded-xl border-2 border-dashed border-border">
              <Shield className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-muted-foreground/50">
                Deploy the Scout Agent to begin intelligence pipeline
              </p>
              <p className="text-xs text-muted-foreground/30 mt-1">
                5 steps · AWS Comprehend · DynamoDB · SNS
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/local-scout/')({
  component: LocalScoutPage,
})