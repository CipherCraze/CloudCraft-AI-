import boto3
import os
from dotenv import load_dotenv

load_dotenv()

def check_dynamodb():
    try:
        dynamodb = boto3.client(
            'dynamodb',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        response = dynamodb.list_tables()
        print(f"Tables: {response.get('TableNames', [])}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_dynamodb()
