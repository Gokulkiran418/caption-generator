import json
import boto3
import os
from openai import OpenAI
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    try:
        # Initialize S3 and Secrets Manager clients
        s3_client = boto3.client('s3')
        secrets_client = boto3.client('secretsmanager', region_name='location')

        # Get OpenAI API key from Secrets Manager
        secret_response = secrets_client.get_secret_value(SecretId='my_secret_key')
        my_secret_key = json.loads(secret_response['SecretString'])['my_secret_key']

        # Initialize OpenAI client
        openai_client = OpenAI(api_key=my_secret_key)

        # Process S3 event
        for record in event['Records']:
            bucket = record['s3']['bucket']['name']
            key = record['s3']['object']['key']
            if not key.endswith('.mp3'):
                continue  # Skip non-.mp3 files

            # Download .mp3 to /tmp
            local_path = f'/tmp/{os.path.basename(key)}'
            s3_client.download_file(bucket, key, local_path)

            # Check file size (Whisper API limit: 25 MB)
            file_size = os.path.getsize(local_path) / (1024 * 1024)  # MB
            if file_size > 25:
                raise ValueError(f"File {key} exceeds 25 MB limit")

            # Transcribe with OpenAI Whisper API
            with open(local_path, 'rb') as audio_file:
                transcription = openai_client.audio.transcriptions.create(
                    model='whisper-1',
                    file=audio_file,
                    response_format='text'
                )

            # Save transcription to .txt
            txt_key = f"{key}.txt"
            txt_path = f'/tmp/{os.path.basename(txt_key)}'
            with open(txt_path, 'w') as txt_file:
                txt_file.write(transcription)

            # Upload .txt to S3
            s3_client.upload_file(txt_path, bucket, txt_key)

            # Clean up /tmp
            os.remove(local_path)
            os.remove(txt_path)

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Transcription completed'})
        }

    except ClientError as e:
        error_code = e.response['Error']['Code']
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f"AWS error: {error_code} - {str(e)}"})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }