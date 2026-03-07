from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from src.services.scout_service import LocalScoutService
from src.services.aws_service import ScoutDynamoDBService
from src.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


class ScoutRequest(BaseModel):
    city: str
    lat: float
    lng: float


@router.get("/stream")
async def scout_stream(city: str, lat: float, lng: float):
    """
    SSE endpoint — streams all 5 agent steps live to the frontend.
    This is the PRIMARY endpoint used by the enhanced Local Scout page.

    Steps streamed:
      1. RECON    — 3 Tavily targeted searches
      2. COMPREHEND — AWS detect_sentiment + detect_key_phrases + detect_entities
      3. SYNTHESIS — Bedrock Nova enriched synthesis
      4. MEMORY   — DynamoDB save + trend delta vs past runs
      5. ALERT    — SNS hot signal if viral_score >= 78
    """
    logger.info(f"[Scout SSE] Agent deployed: {city} ({lat}, {lng})")
    return StreamingResponse(
        LocalScoutService.run_scout_agent_stream(city=city, lat=lat, lng=lng),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        }
    )


@router.get("/history/{city}")
async def get_scout_history(city: str, limit: int = 5):
    """
    Returns the N most recent Scout runs for a given city from DynamoDB.
    Used by the Trend Memory panel in the frontend.
    """
    logger.info(f"[Scout History] Fetching last {limit} runs for: {city}")
    try:
        db_svc = ScoutDynamoDBService()
        history = await db_svc.get_past_scout_runs(city=city, limit=limit)
        return {
            "city": city,
            "runs": history,
            "count": len(history)
        }
    except Exception as e:
        logger.error(f"[Scout History] Failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/scout")
async def scout_location(request: ScoutRequest):
    """
    Legacy blocking endpoint kept for backward compatibility.
    Internally runs the full 5-step pipeline and returns final insights.
    """
    logger.info(f"[Scout Legacy] Agent deployed for: {request.city}")
    try:
        insights = await LocalScoutService.get_localized_insights(
            city=request.city,
            lat=request.lat,
            lng=request.lng
        )
        return {
            "insights": insights,
            "status": "success",
            "metadata": {
                "location": request.city,
                "agent": "CloudCraft-Scout-5Step-AWS",
                "pipeline": ["RECON", "COMPREHEND", "SYNTHESIS", "MEMORY", "ALERT"]
            }
        }
    except Exception as e:
        logger.error(f"Scout Agent Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Agent pipeline failed: {str(e)}"
        )