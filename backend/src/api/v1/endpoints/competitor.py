from fastapi import APIRouter, HTTPException
from src.models.schemas import CompetitorRequest, CompetitorPulseResponse
from src.services.competitor_service import CompetitorService
from src.utils.logger import get_logger
import json

logger = get_logger(__name__)

router = APIRouter()

@router.post("/pulse", response_model=CompetitorPulseResponse)
async def get_competitor_pulse(request: CompetitorRequest):
    """
    Endpoint for 'Competitor Pulse'.
    Performs deep research on a niche/competitor and returns a strategic counter-play.
    """
    try:
        # 1. Get structured analysis (JSON string) from Service
        raw_json_str = await CompetitorService.analyze_competitor(request.query)
        
        # 2. Parse the JSON
        analysis_data = json.loads(raw_json_str)
        
        # 3. Construct and return the response
        # The keys in analysis_data must match our CompetitorPulseResponse schema
        return CompetitorPulseResponse(
            competitor_handle=analysis_data.get("competitor_handle", request.query),
            threat_level=analysis_data.get("threat_level", 85),
            sensory_layer=analysis_data.get("sensory_layer", {}),
            agent_swarm=analysis_data.get("agent_swarm", {}),
            threat_graph=analysis_data.get("threat_graph", {}),
            status="success"
        )
        
    except json.JSONDecodeError as je:
        logger.error(f"Failed to parse Agent JSON: {je}")
        raise HTTPException(status_code=500, detail="Intelligence report formatting error. Please try again.")
    except Exception as e:
        logger.error(f"Competitor Pulse API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))