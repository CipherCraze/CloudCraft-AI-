import boto3
import json
import logging
import sys
from botocore.exceptions import ClientError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bucket_name = "cloudcraft-vernacular-assets-hackathon"
region = "us-east-1"

try:
    print(f"Creating S3 Bucket: {bucket_name} in {region}...")
    s3_client = boto3.client('s3', region_name=region)
    
    # Create the bucket
    s3_client.create_bucket(Bucket=bucket_name)
    print(f"Successfully created bucket: {bucket_name}")
    
    # Remove block public access
    print("Disabling Block Public Access...")
    s3_client.put_public_access_block(
        Bucket=bucket_name,
        PublicAccessBlockConfiguration={
            'BlockPublicAcls': False,
            'IgnorePublicAcls': False,
            'BlockPublicPolicy': False,
            'RestrictPublicBuckets': False
        }
    )
    
    # Attach public read policy
    print("Attaching Public Read Policy...")
    bucket_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": f"arn:aws:s3:::{bucket_name}/*"
            }
        ]
    }
    
    s3_client.put_bucket_policy(
        Bucket=bucket_name,
        Policy=json.dumps(bucket_policy)
    )
    print("Bucket Policy successfully attached!")
    print("S3 Architecture fully deployed.")
    sys.exit(0)

except ClientError as e:
    error_code = e.response['Error']['Code']
    if error_code == 'BucketAlreadyExists' or error_code == 'BucketAlreadyOwnedByYou':
        print(f"The bucket {bucket_name} already exists. Attempting to update permissions...")
        try:
             s3_client.put_public_access_block(
                Bucket=bucket_name,
                PublicAccessBlockConfiguration={
                    'BlockPublicAcls': False,
                    'IgnorePublicAcls': False,
                    'BlockPublicPolicy': False,
                    'RestrictPublicBuckets': False
                }
             )
             bucket_policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Sid": "PublicReadGetObject",
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": "s3:GetObject",
                        "Resource": f"arn:aws:s3:::{bucket_name}/*"
                    }
                ]
             }
             s3_client.put_bucket_policy(Bucket=bucket_name, Policy=json.dumps(bucket_policy))
             print("Permissions updated successfully.")
             sys.exit(0)
        except Exception as inner_e:
             print(f"Failed to update permissions on existing bucket: {inner_e}")
             sys.exit(1)
    else:
        print(f"Fatal AWS Error: {e}")
        sys.exit(1)
except Exception as e:
    print(f"Unexpected error: {str(e)}")
    sys.exit(1)
