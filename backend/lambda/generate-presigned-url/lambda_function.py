import json
import boto3
import uuid

s3 = boto3.client('s3')

def lambda_handler(event, context):
    bucket = '<bucket-name>'  # Replace with your bucket name
    key = f'videos/{uuid.uuid4()}.mp4'
    presigned_url = s3.generate_presigned_url(
        'put_object',
        Params={'Bucket': bucket, 'Key': key},
        ExpiresIn=3600  # 1 hour
    )
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'presigned_url': presigned_url, 'video_key': key})
    }