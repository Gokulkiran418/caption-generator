import json
import boto3
import uuid
import os

s3 = boto3.client('s3')

def lambda_handler(event, context):
    bucket_name = os.environ['BUCKET_NAME']
    key = f'videos/{uuid.uuid4()}.mp4'
    upload_url = s3.generate_presigned_url(
        'put_object',
        Params={'Bucket': bucket_name, 'Key': key, 'ContentType': 'video/mp4'},
        ExpiresIn=3600
    )
    txt_key = key.replace('.mp4', '.mp3.txt')  # Fix: .mp3.txt
    txt_url = s3.generate_presigned_url(
        'get_object',
        Params={'Bucket': bucket_name, 'Key': txt_key},
        ExpiresIn=3600
    )
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'presigned_url': upload_url,
            'video_key': key,
            'txt_key': txt_key,
            'txt_url': txt_url
        })
    }