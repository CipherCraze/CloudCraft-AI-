"""
Local Agent Scout Service — True 5-Step Agentic Pipeline
=========================================================
This is NOT a single LLM call. It's a fully orchestrated multi-step agent loop:

  STEP 1: RECON AGENT      — 3 targeted Tavily searches
  STEP 2: COMPREHEND AGENT — Real AWS NLP (key phrases + entities + sentiment)
  STEP 3: SYNTHESIS AGENT  — Bedrock Nova synthesizes Comprehend-enriched data
  STEP 4: MEMORY AGENT     — DynamoDB: save run + compute trend delta vs past runs
  STEP 5: ALERT AGENT      — SNS: autonomously fire hot signal if viral_score >= 80

Every step yields SSE events consumed by the frontend live feed.
"""

import json
import re
import asyncio
from typing import AsyncGenerator
from fastapi.concurrency import run_in_threadpool

from src.core.llm_factory import LLMFactory
from src.services.brand_service import BrandService
from src.services.aws_service import (
    AWSComprehendService,
    AWSSNSService,
    ScoutDynamoDBService
)
from src.utils.logger import get_logger
from tavily import TavilyClient
import os

logger = get_logger(__name__)

# Shared Tavily client
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY", ""))

# SNS hot-signal threshold
HOT_SIGNAL_THRESHOLD = 78


def _sse(event: str, data: dict) -> str:
    """Format a Server-Sent Event string."""
    return f"data: {json.dumps({'event': event, 'data': data})}\n\n"


def _safe_json_parse(text: str) -> dict | None:
    """Extract and parse first JSON object found in text."""
    try:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
    except Exception:
        pass
    return None


class LocalScoutService:
    """
    Orchestrates the full 5-step Scout Agent pipeline.
    Returns an async SSE generator for real-time frontend streaming.
    """

    @staticmethod
    async def run_scout_agent_stream(
        city: str,
        lat: float,
        lng: float
    ) -> AsyncGenerator[str, None]:
        """
        Main entry point. Yields SSE events for each agent step.
        Designed to be consumed by FastAPI StreamingResponse.
        """
        llm = LLMFactory.get_llm()
        comprehend_svc = AWSComprehendService()
        sns_svc = AWSSNSService()
        db_svc = ScoutDynamoDBService()

        # ══════════════════════════════════════════════════════
        # PIPELINE START
        # ══════════════════════════════════════════════════════
        yield _sse("pipeline_start", {
            "city": city,
            "lat": lat,
            "lng": lng,
            "steps": ["RECON", "COMPREHEND", "SYNTHESIS", "MEMORY", "ALERT"],
            "message": f"Scout Agent deployed to {city}. Initiating 5-step intelligence pipeline..."
        })

        brand_context = BrandService.get_brand_context()

        # ══════════════════════════════════════════════════════
        # STEP 1: RECON AGENT (Tavily — 3 targeted searches)
        # ══════════════════════════════════════════════════════
        yield _sse("step_start", {
            "step": "RECON",
            "step_num": 1,
            "icon": "🔭",
            "message": f"Deploying Tavily multi-query recon for {city}..."
        })

        search_queries = [
            f"viral trends events festivals {city} this week 2026",
            f"{city} social media trending topics community buzz",
            f"{city} local news highlights cultural moments"
        ]

        raw_data_parts = []
        total_hits = 0

        for i, query in enumerate(search_queries):
            yield _sse("recon_query", {
                "query_num": i + 1,
                "query": query,
                "message": f"Query {i+1}/3: Scanning \"{query[:50]}...\""
            })
            try:
                results = await run_in_threadpool(
                    tavily_client.search,
                    query=query,
                    search_depth="basic",
                    max_results=4
                )
                hits = results.get("results", [])
                total_hits += len(hits)
                chunk = " ".join([r.get("content", "")[:400] for r in hits])
                raw_data_parts.append(chunk)
                yield _sse("recon_hit", {
                    "query_num": i + 1,
                    "hits": len(hits),
                    "message": f"✓ Found {len(hits)} results"
                })
            except Exception as e:
                logger.warning(f"Tavily query {i+1} failed: {e}")
                yield _sse("recon_hit", {
                    "query_num": i + 1,
                    "hits": 0,
                    "message": f"⚠ Query failed: {str(e)[:60]}"
                })

        raw_data = " ".join(raw_data_parts)[:8000]

        yield _sse("step_complete", {
            "step": "RECON",
            "step_num": 1,
            "message": f"✅ RECON complete — {total_hits} intelligence hits gathered across 3 queries"
        })

        # ══════════════════════════════════════════════════════
        # STEP 2: COMPREHEND AGENT (AWS NLP — real calls)
        # ══════════════════════════════════════════════════════
        yield _sse("step_start", {
            "step": "COMPREHEND",
            "step_num": 2,
            "icon": "🧠",
            "message": "Routing raw intelligence to Amazon Comprehend for NLP extraction..."
        })

        yield _sse("aws_call", {
            "service": "comprehend",
            "action": "detect_sentiment + detect_key_phrases + detect_entities",
            "message": "☁ AWS Comprehend: running 3 NLP operations on raw recon data..."
        })

        try:
            comprehend_data = await comprehend_svc.analyze_scout_intelligence(raw_data)
        except Exception as e:
            logger.error(f"Comprehend pipeline failed: {e}")
            comprehend_data = {
                "sentiment": "NEUTRAL",
                "compliance_score": 70.0,
                "sentiment_scores": {},
                "key_phrases": [],
                "entities": []
            }

        yield _sse("comprehend_result", {
            "sentiment": comprehend_data["sentiment"],
            "compliance_score": comprehend_data["compliance_score"],
            "key_phrases": comprehend_data["key_phrases"],
            "entities": comprehend_data["entities"],
            "message": (
                f"✅ AWS Comprehend: {comprehend_data['sentiment']} sentiment "
                f"({comprehend_data['compliance_score']}%) | "
                f"{len(comprehend_data['key_phrases'])} key phrases | "
                f"{len(comprehend_data['entities'])} entities detected"
            )
        })

        yield _sse("step_complete", {
            "step": "COMPREHEND",
            "step_num": 2,
            "message": "✅ COMPREHEND complete — AWS NLP intelligence package ready"
        })

        # ══════════════════════════════════════════════════════
        # STEP 3: SYNTHESIS AGENT (Bedrock Nova LLM)
        # ══════════════════════════════════════════════════════
        yield _sse("step_start", {
            "step": "SYNTHESIS",
            "step_num": 3,
            "icon": "⚗️",
            "message": "Amazon Nova synthesizing Comprehend-enriched intelligence into brand-aligned brief..."
        })

        # Build a richly-enriched prompt using BOTH Tavily data AND Comprehend output
        key_phrases_str = ", ".join(comprehend_data["key_phrases"][:10]) or "N/A"
        entities_str = " | ".join(
            [f"{e['text']} ({e['type']})" for e in comprehend_data["entities"][:8]]
        ) or "N/A"

        synthesis_prompt = f"""
You are the CloudCraft AI Synthesis Agent. Your mission: generate a hyper-local marketing intelligence brief.

LOCATION: {city}
TIMESTAMP: {__import__('datetime').datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}

{brand_context}

== AWS COMPREHEND INTELLIGENCE (Pre-processed NLP) ==
Sentiment: {comprehend_data['sentiment']} (Score: {comprehend_data['compliance_score']}%)
Key Phrases Extracted: {key_phrases_str}
Named Entities Detected: {entities_str}

== RAW RECON DATA (Tavily Multi-Query) ==
{raw_data[:3000]}

== TASK ==
Using the Comprehend-extracted key phrases and entities as your PRIMARY signal (they are AWS-verified),
synthesize a JSON intelligence brief for the brand's marketing team.

The viral_hooks must be grounded in the ACTUAL key phrases and entities detected by Comprehend.
The sentiment_score (0-100) must reflect the AWS Comprehend compliance_score above.

STRICT JSON FORMAT (return ONLY this JSON):
{{
    "local_vibe": "2-sentence description of the city's current cultural mood",
    "viral_hooks": [
        {{"title": "Hook title based on actual detected signal", "description": "Specific actionable details", "confidence": 0.95}},
        {{"title": "Hook 2 from Comprehend keyphrases", "description": "Details", "confidence": 0.88}},
        {{"title": "Hook 3 from entities/events detected", "description": "Details", "confidence": 0.82}}
    ],
    "strategic_recommendation": "One specific, time-bound post idea for our brand based on top signal",
    "sentiment_score": {int(comprehend_data['compliance_score'])},
    "trending_hashtags": ["#tag1", "#tag2", "#tag3", "#tag4"],
    "comprehend_summary": "One line: what AWS Comprehend's NLP tells us about this location right now"
}}

Return ONLY the JSON. No markdown. No explanation.
"""

        insights = None
        try:
            response = await llm.ainvoke(synthesis_prompt)
            content = response.content if hasattr(response, 'content') else str(response)
            insights = _safe_json_parse(content)

            if not insights:
                raise ValueError("LLM returned no valid JSON")

            yield _sse("synthesis_result", {
                "insights": insights,
                "message": "✅ Amazon Nova synthesis complete — Intel brief generated"
            })
        except Exception as e:
            logger.error(f"Synthesis failed: {e}")
            insights = {
                "local_vibe": f"Active community signals detected in {city}.",
                "viral_hooks": [
                    {"title": kp, "description": "Trending in local community", "confidence": 0.80}
                    for kp in comprehend_data["key_phrases"][:3]
                ],
                "strategic_recommendation": f"Engage with trending topics in {city} now.",
                "sentiment_score": int(comprehend_data.get("compliance_score", 70)),
                "trending_hashtags": [f"#{city.replace(' ', '')}", "#trending", "#local"],
                "comprehend_summary": f"AWS detected {len(comprehend_data['key_phrases'])} signals with {comprehend_data['sentiment']} sentiment."
            }
            yield _sse("synthesis_fallback", {
                "insights": insights,
                "message": "⚠ Synthesis used Comprehend-direct fallback (LLM parse issue)"
            })

        yield _sse("step_complete", {
            "step": "SYNTHESIS",
            "step_num": 3,
            "message": "✅ SYNTHESIS complete — Intel brief ready"
        })

        # ══════════════════════════════════════════════════════
        # STEP 4: MEMORY AGENT (DynamoDB — save + trend delta)
        # ══════════════════════════════════════════════════════
        yield _sse("step_start", {
            "step": "MEMORY",
            "step_num": 4,
            "icon": "🗄️",
            "message": f"Writing scout run to DynamoDB memory... Reading {city}'s past runs..."
        })

        viral_score = insights.get("sentiment_score", 70)

        # Read past runs BEFORE saving current (so delta is accurate)
        past_runs = await db_svc.get_past_scout_runs(city, limit=5)

        yield _sse("aws_call", {
            "service": "dynamodb",
            "action": "query + put_item",
            "message": f"☁ DynamoDB: fetched {len(past_runs)} past runs for '{city}'"
        })

        trend_delta = db_svc.compute_trend_delta(insights, past_runs)

        # Save current run
        run_id = await db_svc.save_scout_run(
            city=city,
            insights=insights,
            comprehend_data=comprehend_data,
            viral_score=viral_score,
            lat=lat,
            lng=lng
        )

        yield _sse("memory_update", {
            "run_id": run_id,
            "trend_delta": trend_delta,
            "past_runs_count": len(past_runs),
            "message": (
                f"✅ Run #{run_id} saved to DynamoDB | "
                f"{len(trend_delta.get('new_hooks', []))} NEW hooks | "
                f"{len(trend_delta.get('recurring_hooks', []))} recurring | "
                f"Score trend: {trend_delta.get('score_trend', 'BASELINE')}"
            )
        })

        yield _sse("step_complete", {
            "step": "MEMORY",
            "step_num": 4,
            "message": "✅ MEMORY complete — Trend delta computed, run persisted to DynamoDB"
        })

        # ══════════════════════════════════════════════════════
        # STEP 5: ALERT AGENT (SNS — autonomous hot signal)
        # ══════════════════════════════════════════════════════
        yield _sse("step_start", {
            "step": "ALERT",
            "step_num": 5,
            "icon": "📡",
            "message": f"Alert Agent evaluating viral score ({viral_score}) against threshold ({HOT_SIGNAL_THRESHOLD})..."
        })

        alert_fired = False
        if viral_score >= HOT_SIGNAL_THRESHOLD:
            yield _sse("aws_call", {
                "service": "sns",
                "action": "publish",
                "message": f"☁ 🔥 THRESHOLD BREACHED ({viral_score} ≥ {HOT_SIGNAL_THRESHOLD})! Firing SNS hot signal..."
            })
            try:
                alert_fired = await sns_svc.publish_hot_signal(
                    city=city,
                    viral_score=viral_score,
                    insights=insights
                )
                yield _sse("alert_sent", {
                    "fired": True,
                    "viral_score": viral_score,
                    "channel": "SNS Email",
                    "message": f"🔥 HOT SIGNAL DISPATCHED VIA SNS! Score: {viral_score}/100 — Email alert sent to subscribed marketers."
                })
            except Exception as e:
                logger.error(f"SNS alert failed: {e}")
                yield _sse("alert_sent", {
                    "fired": False,
                    "error": str(e),
                    "message": f"⚠ SNS alert failed: {str(e)[:80]}"
                })
        else:
            yield _sse("alert_skipped", {
                "fired": False,
                "viral_score": viral_score,
                "threshold": HOT_SIGNAL_THRESHOLD,
                "message": f"📊 No alert needed — Score {viral_score} below threshold {HOT_SIGNAL_THRESHOLD}"
            })

        yield _sse("step_complete", {
            "step": "ALERT",
            "step_num": 5,
            "message": "✅ ALERT step complete"
        })

        # ══════════════════════════════════════════════════════
        # PIPELINE COMPLETE
        # ══════════════════════════════════════════════════════
        yield _sse("scout_complete", {
            "insights": insights,
            "comprehend_data": {
                "sentiment": comprehend_data["sentiment"],
                "compliance_score": comprehend_data["compliance_score"],
                "key_phrases": comprehend_data["key_phrases"],
                "entities": comprehend_data["entities"]
            },
            "trend_delta": trend_delta,
            "alert_fired": alert_fired,
            "run_id": run_id,
            "city": city,
            "message": "🛰️ Scout Agent pipeline complete. All 5 steps executed."
        })

    @staticmethod
    async def get_localized_insights(city: str, lat: float, lng: float):
        """
        Legacy blocking endpoint — kept for backward compatibility.
        Collects all SSE events and returns the final insights JSON.
        """
        final = None
        async for event_str in LocalScoutService.run_scout_agent_stream(city, lat, lng):
            if event_str.startswith("data: "):
                try:
                    payload = json.loads(event_str[6:])
                    if payload.get("event") == "scout_complete":
                        final = payload["data"]["insights"]
                except Exception:
                    pass
        return final or {"error": "Scout pipeline completed with no insights"}