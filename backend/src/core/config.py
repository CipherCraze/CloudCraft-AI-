import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    AWS_S3_BUCKET_NAME: str = os.getenv("AWS_S3_BUCKET_NAME", "cloudcraft-vernacular-assets")
    AWS_SNS_TOPIC_ARN: str = os.getenv("AWS_SNS_TOPIC_ARN", "")
    
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")
    
    class Config:
        case_sensitive = True

settings = Settings()
