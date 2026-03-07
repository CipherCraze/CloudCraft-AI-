from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import List
from src.services.campaign_service import CampaignService, CampaignIntelligenceService
from src.services.brand_service import BrandService
from src.agents.marketing_strategist_agent import MarketingStrategistAgent
from src.models.schemas import Campaign, CampaignCreate, CampaignStrategy
from fastapi.concurrency import run_in_threadpool
import json
import re

router = APIRouter()
_legacy_agent = MarketingStrategistAgent()


# ── Primary SSE endpoint ───────────────────────────────────────────────────
@router.get("/{campaign_id}/intelligence-stream")
async def intelligence_stream(campaign_id: str):
    """
    SSE endpoint: runs the 4-step intelligence pipeline for a campaign.
    Steps: RECON → COMPREHEND → SYNTHESIS → MEMORY (+ optional SNS opportunity alert).
    """
    campaigns = await run_in_threadpool(CampaignService.get_all_campaigns)
    campaign = next((c for c in campaigns if c.id == campaign_id), None)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    return StreamingResponse(
        CampaignIntelligenceService.run_intelligence_stream(
            campaign_id=campaign.id,
            campaign_name=campaign.name,
            goal=campaign.goal,
            duration=campaign.duration or "Flexible",
            budget=campaign.budget or "TBD",
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        }
    )


# ── CRUD endpoints (unchanged) ──────────────────────────────────────────────
@router.post("/", response_model=Campaign)
def create_campaign(campaign: CampaignCreate):
    return CampaignService.create_campaign(campaign)


@router.get("/", response_model=List[Campaign])
def get_all_campaigns():
    return CampaignService.get_all_campaigns()


# ── Rival Radar Endpoint ────────────────────────────────────────────────────
@router.post("/{campaign_id}/rival-radar/scan")
async def rival_radar_scan(campaign_id: str):
    campaigns = await run_in_threadpool(CampaignService.get_all_campaigns)
    campaign = next((c for c in campaigns if c.id == campaign_id), None)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    result = await CampaignIntelligenceService.run_radar_scan(
        campaign.id, campaign.name, campaign.goal
    )
    return result


# ── Legacy blocking strategy endpoint (kept for compatibility) ──────────────
@router.post("/{campaign_id}/generate-strategy", response_model=Campaign)
async def generate_strategy(campaign_id: str):
    campaigns = await run_in_threadpool(CampaignService.get_all_campaigns)
    campaign = next((c for c in campaigns if c.id == campaign_id), None)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    brand_context = await run_in_threadpool(BrandService.get_brand_context)

    prompt = f"""
    {brand_context}

    Verify formatting: Output MUST be valid JSON.

    TASK: Develop a marketing strategy for the following campaign:
    Name: {campaign.name}
    Goal: {campaign.goal}
    Duration: {campaign.duration}
    Budget: {campaign.budget}
    """

    response = await _legacy_agent.async_run(prompt)
    output_text = response.output

    try:
        cleaned = output_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        strategy_dict = json.loads(cleaned.strip())
        strategy = CampaignStrategy(**strategy_dict)
        await run_in_threadpool(CampaignService.update_campaign_strategy, campaign_id, strategy)
        campaign.strategy = strategy
        campaign.status = "active"
        return campaign
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate valid strategy: {str(e)}")
