import json
import re
import asyncio
from typing import Dict, Any, List
from src.core.llm_factory import LLMFactory
from src.utils.logger import get_logger
from langchain_core.messages import HumanMessage, SystemMessage
from src.services.aws_service import AWSPollyService, AWSS3Service, AWSComprehendService, AWSDynamoDBService, EventBridgeService

logger = get_logger(__name__)

STATE_LANGUAGE_MAP = {
    "Maharashtra": {"language": "Marathi", "dialect": "Puneri/Standard", "key_festivals": ["Ganesh Chaturthi", "Gudi Padwa"]},
    "Punjab": {"language": "Punjabi", "dialect": "Majhi", "key_festivals": ["Baisakhi", "Lohri"]},
    "Tamil Nadu": {"language": "Tamil", "dialect": "Chennai/Madurai", "key_festivals": ["Pongal", "Puthandu"]},
    "Kerala": {"language": "Malayalam", "dialect": "Standard", "key_festivals": ["Onam", "Vishu"]},
    "West Bengal": {"language": "Bengali", "dialect": "Kolkata", "key_festivals": ["Durga Puja", "Poila Baisakh"]},
    "Karnataka": {"language": "Kannada", "dialect": "Old Mysore", "key_festivals": ["Ugadi", "Mysuru Dasara"]},
    "Gujarat": {"language": "Gujarati", "dialect": "Standard", "key_festivals": ["Navratri", "Uttarayan"]},
    "Rajasthan": {"language": "Hindi", "dialect": "Marwari", "key_festivals": ["Gangaur", "Teej"]},
    "Uttar Pradesh": {"language": "Hindi", "dialect": "Awadhi/Bhojpuri", "key_festivals": ["Diwali", "Holi"]},
    "Andhra Pradesh": {"language": "Telugu", "dialect": "Standard", "key_festivals": ["Sankranti", "Ugadi"]},
    "Telangana": {"language": "Telugu", "dialect": "Hyderabadi", "key_festivals": ["Bonalu", "Bathukamma"]},
    "Assam": {"language": "Assamese", "dialect": "Standard", "key_festivals": ["Bihu"]},
    "Bihar": {"language": "Hindi", "dialect": "Maithili/Bhojpuri", "key_festivals": ["Chhath Puja"]},
    "Madhya Pradesh": {"language": "Hindi", "dialect": "Malwi/Bundeli", "key_festivals": ["Khajuraho Dance Festival"]},
    "Jammu and Kashmir": {"language": "Kashmiri", "dialect": "Pahari", "key_festivals": ["Navreh", "Eid"]},
    "Kashmir": {"language": "Kashmiri", "dialect": "Pahari", "key_festivals": ["Navreh", "Eid"]},
    "Odisha": {"language": "Odia", "dialect": "Standard", "key_festivals": ["Ratha Yatra"]},
    "Chhattisgarh": {"language": "Hindi", "dialect": "Chhattisgarhi", "key_festivals": ["Bastar Dussehra"]},
    "Uttarakhand": {"language": "Hindi", "dialect": "Garhwali/Kumaoni", "key_festivals": ["Kumbh Mela"]},
}

class VernacularService:
    def __init__(self):
        self.llm = LLMFactory.get_llm()
        self.polly_service = AWSPollyService()
        self.s3_service = AWSS3Service()

    async def transmute_content(self, content: str, state: str) -> Dict[str, Any]:
        """
        Agentic workflow to culturally and linguistically pivot content.
        """
        config = STATE_LANGUAGE_MAP.get(state, {"language": "Hindi", "dialect": "Standard", "key_festivals": ["General Indian"]})
        language = config["language"]
        dialect = config["dialect"]
        self.dynamodb_service = AWSDynamoDBService()
        
        # 1. Cultural & Creator Strategy Analysis
        culture_prompt = f"""
        ACT AS: Elite Regional Native Content Strategist for {state}, India.
        TASK: Deeply analyze how a YouTube / Instagram content creator should authentically market this brand message to the {state} demographic.
        
        You MUST provide the output in purely valid JSON format. Do not use Markdown backticks. Provide exactly this structure:
        {{
            "cultural_nuances": ["Deep insight into local {state} psyche regarding this product", "Specific cultural/festival tie-in"],
            "local_slang_to_use": ["<Local Slang 1> (Meaning)", "<Local Slang 2> (Meaning)"],
            "visual_direction": "Striking visual direction for a billboard/social ad in {state} (mention local landmarks, colors, vibe)",
            "tone_strategy": "A specific, multi-layered tone strategy to capture the local vibe",
            "seo_keywords": ["#NativeLangKeyword1", "#NativeLangKeyword2", "trending english keyword"],
            "marketing_hooks": ["Catchy native language hook 1", "Catchy native language hook 2"],
            "taboos_to_avoid": ["Cultural taboo to avoid in {state} 1", "Taboo 2"],
            "reel_script": [
                {{"timestamp": "0:00-0:03", "visual": "Describe the B-Roll (e.g. Walking down Marine Drive)", "audio": "The localized hook spoken by influencer"}},
                {{"timestamp": "0:03-0:10", "visual": "Main product shot with local spin", "audio": "The core localized value prop"}},
                {{"timestamp": "0:10-0:15", "visual": "Call to action splash screen", "audio": "CTA with urgency"}}
            ],
            "influencer_strategy": "What type of micro-influencers in {state} should push this? (e.g., Marathi fitness vloggers, etc.)"
        }}
        
        BRAND MESSAGE: {content}
        """
        
        # 2. Linguistic Pivot
        translation_prompt = f"""
        ACT AS: Elite Regional Creative Director & Native {language} Speaker (Dialect: {dialect}).
        TASK: Do not just literally translate. TRANSCREATE a high-converting, highly engaging localized marketing masterpiece based on the provided content.
        
        RULES:
        1. Write entirely in native {language} script.
        2. Inject natural {state} emotion, idioms, and flair. Make it sound like a street-smart local wrote it, not a robot.
        3. Structure it as a highly engaging social media post (with a catchy hook, engaging body, and strong localized call-to-action).
        4. Include 2-3 hyper-local emojis if appropriate.
        
        ORIGINAL CONTENT: {content}
        
        OUTPUT: Only output the final high-converting {language} copy. Nothing else.
        """

        try:
            # Run LLM calls
            culture_task = self.llm.ainvoke([SystemMessage(content=culture_prompt), HumanMessage(content="Give me the analysis.")])
            translation_task = self.llm.ainvoke([SystemMessage(content=translation_prompt), HumanMessage(content=content)])
            
            culture_res, trans_res = await asyncio.gather(culture_task, translation_task)
            
            # Extract JSON from culture response using robust regex
            try:
                # Find JSON block using regex to avoid markdown/text wrappers
                match = re.search(r'\{.*\}', culture_res.content, re.DOTALL)
                if match:
                    culture_data = json.loads(match.group(0))
                else:
                    raise ValueError("No valid JSON block found in response.")
            except Exception as e:
                logger.error(f"JSON Parsing failed: {str(e)} - Raw LLM Output: {culture_res.content}")
                culture_data = {
                    "cultural_nuances": ["Emphasize local community values and deep-rooted traditions.", "Align messaging with regional pride."],
                    "local_slang_to_use": [f"Native {language} phrasing"],
                    "visual_direction": f"Vibrant, culturally resonant colors specific to {state}.",
                    "tone_strategy": "Authentic, connected, and highly local."
                }

            translated_content = trans_res.content.strip()

            # -------------------------------------------------------------
            # AWS Integration: Amazon Comprehend (Cultural Safety Shield)
            # -------------------------------------------------------------
            comprehend_service = AWSComprehendService()
            # Analyze sentiment and calculate a simulated "Cultural Safety" score
            # We pass the English cultural meaning / translated content to Comprehend
            safety_analysis = await comprehend_service.analyze_compliance_sentiment(translated_content)
            
            # -------------------------------------------------------------
            # AWS Integration: Generate Regional Audio Track (Polly -> S3)
            # -------------------------------------------------------------
            audio_url = None
            try:
                # 1. Synthesize Speech with native language settings
                audio_bytes = await self.polly_service.synthesize_speech(translated_content, language)
                if audio_bytes:
                    # 2. Upload to S3 immediately
                    filename = f"darshan_{state.lower().replace(' ', '_')}"
                    audio_url = await self.s3_service.upload_audio(audio_bytes, filename)
            except Exception as aws_e:
                logger.error(f"Failed in AWS Polly/S3 pipeline: {str(aws_e)}")
                # We do not use a fallback url; let the UI handle the missing AWS keys.
                audio_url = None

            result = {
                "original_content": content,
                "translated_content": translated_content,
                "state": state,
                "language": language,
                "cultural_nuances": culture_data.get("cultural_nuances", []),
                "local_slang": culture_data.get("local_slang_to_use", []),
                "visual_cues": culture_data.get("visual_direction", ""),
                "tone": culture_data.get("tone_strategy", ""),
                "seo_keywords": culture_data.get("seo_keywords", []),
                "marketing_hooks": culture_data.get("marketing_hooks", []),
                "taboos_to_avoid": culture_data.get("taboos_to_avoid", []),
                "reel_script": culture_data.get("reel_script", []),
                "influencer_strategy": culture_data.get("influencer_strategy", ""),
                "audio_url": audio_url,
                "comprehend_sentiment": safety_analysis.get("sentiment", "UNKNOWN"),
                "comprehend_score": float(safety_analysis.get("compliance_score", 0.0)),
                "comprehend_raw": safety_analysis.get("raw_scores", {})
            }

            # ---------------------------------------------------------------
            # AWS Integration: Log to DynamoDB (Campaign History Vault)
            # ---------------------------------------------------------------
            try:
                await self.dynamodb_service.log_transmutation(result)
            except Exception as db_e:
                logger.error(f"DynamoDB log failed (non-blocking): {str(db_e)}")

            return result

        except Exception as e:
            logger.error(f"Vernacular transmute error: {str(e)}")
            return {
                "error": f"Failed to transmute: {str(e)}",
                "original_content": content
            }
