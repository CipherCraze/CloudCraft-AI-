import json
import asyncio
from typing import Any, Dict

# Assuming the src module is packaged or installed in the Lambda layer
from src.agents.focus_group_agent import FocusGroupAgent
from src.agents.copywriter_agent import CopywriterAgent
from src.utils.logger import get_logger

logger = get_logger(__name__)

# =============================================================================
# AWS Lambda Handlers for CloudCraft Serverless Agents
# =============================================================================

def focus_group_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda entry point for the Focus Group Agent.
    Triggered via API Gateway or Step Functions.
    """
    try:
        content = event.get("content", "")
        persona = event.get("persona", "Gen-Z Trendsetter")
        trait = event.get("trait", "Loves authenticity")
        
        agent = FocusGroupAgent()
        
        # Lambda handlers are typically synchronous, so we run the async method
        loop = asyncio.get_event_loop()
        reaction = loop.run_until_complete(agent.react(content, persona, trait))
        
        return {
            "statusCode": 200,
            "body": {
                "persona": persona,
                "reaction": reaction
            }
        }
    except Exception as e:
        logger.error(f"Lambda Error: {str(e)}")
        return {"statusCode": 500, "body": str(e)}

def copywriter_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda entry point for the Copywriter Agent.
    """
    try:
        task = event.get("task", "")
        context_data = event.get("context", "")
        
        agent = CopywriterAgent()
        loop = asyncio.get_event_loop()
        result = loop.run_until_complete(agent.async_run(task, context=context_data))
        
        return {
            "statusCode": 200,
            "body": {
                "thought": result.thought,
                "output": result.output
            }
        }
    except Exception as e:
        return {"statusCode": 500, "body": str(e)}

# Note: In a real AWS deployment, each of these functions would be deployed 
# as a separate isolated AWS Lambda function (e.g., cloudcraft-copywriter-lambda), Ensure IAM roles allow Bedrock access.
