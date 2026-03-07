from pydantic import BaseModel
from typing import List, Dict, Optional, Any

# --- FORGE SCHEMAS ---
class AgentThought(BaseModel):
    agent: str
    thought: str
    output: str

class ForgeResponse(BaseModel):
    final_content: str
    thoughts: List[AgentThought]
    status: str

# --- TRANSMUTE SCHEMAS ---
class TransmuteRequest(BaseModel):
    content: str
    target_format: str # e.g., "Twitter Thread", "Instagram Reel Script", "LinkedIn Post"
    target_language: str = "English" # e.g., "Hindi", "Tamil", "Hinglish"
    tone_modifier: Optional[str] = None

class TransmuteResponse(BaseModel):
    transformed_content: str
    format_notes: str
    regional_nuance: str
    suggested_tags: List[str]
    estimated_reading_time: str
    status: str = "success"

# --- BRAND BRAIN SCHEMAS ---
class BrandProfile(BaseModel):
    brandName: str
    brandDescription: str
    brandVoice: str
    targetAudience: str
    lastUpdated: Optional[str] = None

# --- COMPETITOR PULSE SCHEMAS ---
class CompetitorRequest(BaseModel):
    query: str  # The handle or niche

class SensoryRekognition(BaseModel):
    visual_themes: List[str]
    color_palette: str
    target_demographic_visuals: str

class SensoryTranscribe(BaseModel):
    sonic_hooks: List[str]
    frequent_keywords: List[str]

class SensoryComprehend(BaseModel):
    critical_vulnerability: str
    negative_sentiment_score: int
    user_complaints: List[str]

class PanopticonSensoryLayer(BaseModel):
    rekognition: SensoryRekognition
    transcribe: SensoryTranscribe
    comprehend: SensoryComprehend

class AgentRedTeam(BaseModel):
    pricing_vulnerability: str
    undercut_strategy: str

class AgentTechSniffer(BaseModel):
    detected_stack: List[str]
    migration_target: str

class AgentCustomerPoacher(BaseModel):
    attack_angle: str
    zero_day_ad_copy: str

class PanopticonAgentSwarm(BaseModel):
    red_team: AgentRedTeam
    tech_sniffer: AgentTechSniffer
    customer_poacher: AgentCustomerPoacher

class ThreatNode(BaseModel):
    id: str
    label: str
    type: str # 'Competitor', 'Executive', 'Investor', 'Tech'

class ThreatLink(BaseModel):
    source: str
    target: str
    relationship: str

class PanopticonThreatGraph(BaseModel):
    nodes: List[ThreatNode]
    links: List[ThreatLink]

class CompetitorPulseResponse(BaseModel):
    competitor_handle: str
    threat_level: int # 0-100 indicating danger to our market share
    sensory_layer: PanopticonSensoryLayer
    agent_swarm: PanopticonAgentSwarm
    threat_graph: PanopticonThreatGraph
    status: str = "success"

# --- PERFORMANCE ORACLE SCHEMAS (NEW) ---
class OracleRequest(BaseModel):
    content: str  # The draft post to analyze

class MetricScore(BaseModel):
    subject: str  # e.g., "Hook", "Trend", "Clarity"
    score: int    # 0-100 for Radar Chart
    fullMark: int = 100

class TimePoint(BaseModel):
    time: str     # e.g., "1h", "2h", "6h"
    engagement: int # Predicted value for Area Chart

class OracleResponse(BaseModel):
    viral_score: int
    confidence_level: str
    radar_data: List[MetricScore]
    forecast_data: List[TimePoint]
    analysis_report: str
    status: str = "success"

class OracleHistoryItem(BaseModel):
    id: str
    timestamp: str
    input_content: str
    response: OracleResponse

# --- CAMPAIGN ARCHITECT SCHEMAS ---
class AudienceSegment(BaseModel):
    segment_name: str
    pain_point: str

class CampaignStrategy(BaseModel):
    core_concept: str
    target_audience: List[AudienceSegment]
    usps: List[str]
    tone: str
    tagline: str
    visual_direction: str

class CampaignBase(BaseModel):
    name: str
    goal: str
    duration: str
    budget: str

class CampaignCreate(CampaignBase):
    pass

class Campaign(CampaignBase):
    id: str
    status: str  # draft, active, completed
    strategy: Optional[CampaignStrategy] = None
    created_at: str

# --- PERSONA ENGINE SCHEMAS ---
class PersonaInfo(BaseModel):
    id: str
    name: str
    description: str
    age_range: str
    platforms: List[str]

class PersonaVariant(BaseModel):
    persona_id: str
    persona_name: str
    content: str
    platform_suggestion: str
    tone_used: str

class PersonaRequest(BaseModel):
    content: str
    personas: List[str]  # List of persona IDs to generate for

class PersonaResponse(BaseModel):
    original_content: str
    variants: List[PersonaVariant]
    status: str = "success"

# Performance Prediction Schemas
class PredictedMetrics(BaseModel):
    likes: int
    shares: int
    comments: int
    reach: int

class PerformancePrediction(BaseModel):
    overall_score: int
    engagement_potential: int
    platform_fit: int
    audience_alignment: int
    virality_score: int
    predicted_metrics: PredictedMetrics
    best_platform: str
    best_posting_time: str
    strengths: List[str]
    improvements: List[str]
    confidence: str

class PerformanceRequest(BaseModel):
    content: str
    platform: str = "General"
    persona: str = "General"

class PerformanceResponse(BaseModel):
    content: str
    platform: str
    persona: str
    prediction: PerformancePrediction
    status: str = "success"

# Calendar & Scheduler Schemas
class ScheduledPost(BaseModel):
    id: str
    content: str
    platform: str
    scheduled_time: str # ISO format string
    status: str = "scheduled" # scheduled, auditing, dispatched, failed, draft
    performance_score: Optional[int] = None
    persona_name: Optional[str] = None
    aws_mission_id: Optional[str] = None
    webhook_url: Optional[str] = None
    execution_logs: List[str] = []

class MissionExecutionRequest(BaseModel):
    content: str
    platform: str
    scheduled_at: str # ISO format
    persona_name: Optional[str] = None
    webhook_url: Optional[str] = "https://hook.us1.make.com/your-default-hook" # Placeholder

class MissionExecutionResponse(BaseModel):
    post_id: str
    aws_mission_id: str
    status: str
    message: str

class CalendarResponse(BaseModel):
    posts: List[ScheduledPost]
    status: str = "success"

# --- VISION LAB SCHEMAS ---
class VisionAnalysisRequest(BaseModel):
    image_base64: str
    filename: Optional[str] = None

class AestheticAudit(BaseModel):
    brightness: float
    contrast: float
    saturation: float
    temperature: str
    clarity_score: int
    pro_tip: str

class VisionAnalysisResponse(BaseModel):
    vibe_description: str
    detected_context: str
    suggested_tone: str
    aesthetic_audit: AestheticAudit
    status: str = "success"

class VisionEnhancementRequest(BaseModel):
    image_base64: str
    audit_results: Dict[str, Any]
