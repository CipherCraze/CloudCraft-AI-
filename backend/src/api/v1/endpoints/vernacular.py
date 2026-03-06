from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from src.services.vernacular_service import VernacularService
from src.services.aws_service import AWSDynamoDBService, EventBridgeService
from src.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

class VernacularRequest(BaseModel):
    content: str
    state: str

class VernacularResponse(BaseModel):
    original_content: str
    translated_content: str
    state: str
    language: str
    cultural_nuances: List[str]
    local_slang: List[str]
    visual_cues: str
    tone: str
    audio_url: Optional[str] = None
    comprehend_sentiment: str = "UNKNOWN"
    comprehend_score: float = 0.0
    comprehend_raw: Dict[str, Any] = {}
    seo_keywords: List[str] = []
    marketing_hooks: List[str] = []
    taboos_to_avoid: List[str] = []
    reel_script: List[Dict[str, str]] = []
    influencer_strategy: str = ""

class ScheduleRequest(BaseModel):
    campaign_name: str
    state: str
    language: str
    audio_url: str
    translated_content: str = ""
    schedule_time: str  # ISO format: "2026-03-08T10:00:00"

@router.post("/transmute", response_model=VernacularResponse)
async def transmute_vernacular(request: VernacularRequest):
    """Culturally and linguistically adapt content for a specific Indian state."""
    try:
        service = VernacularService()
        result = await service.transmute_content(request.content, request.state)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        logger.error(f"Endpoint error in vernacular transmute: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_campaign_history():
    """Retrieve recent transmutation history from DynamoDB."""
    try:
        db = AWSDynamoDBService()
        items = await db.get_recent_history(limit=10)
        return {"history": items, "source": "AWS DynamoDB"}
    except Exception as e:
        logger.error(f"Failed to fetch history: {str(e)}")
        # Return empty gracefully so the UI still works
        return {"history": [], "source": "fallback", "error": str(e)}

@router.post("/schedule")
async def schedule_broadcast(request: ScheduleRequest):
    """Schedule a vernacular broadcast via AWS EventBridge Scheduler → SNS email."""
    try:
        eb = EventBridgeService()
        scheduled_dt = datetime.fromisoformat(request.schedule_time)
        arn = await eb.create_schedule(
            name=request.campaign_name.replace(" ", "_"),
            scheduled_time=scheduled_dt,
            target_url="",
            payload={
                "state": request.state,
                "language": request.language,
                "audio_url": request.audio_url,
                "translated_content": request.translated_content,
                "campaign": request.campaign_name,
                "source": "cloudcraft.vernacular"
            }
        )
        return {
            "success": True,
            "schedule_arn": arn,
            "scheduled_time": request.schedule_time,
            "message": f"✓ Broadcast for '{request.state} ({request.language})' scheduled. Email will be sent via AWS SNS at {request.schedule_time} UTC."
        }
    except Exception as e:
        logger.error(f"Failed to schedule broadcast: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

