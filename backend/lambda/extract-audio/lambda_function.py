import json
import boto3
import subprocess
import os

s3 = boto3.client('s3')

def lambda_handler(event, context):
    if 'Records' in event:
        for record in event['Records']:
            bucket = record['s3']['bucket']['name']
            video_key = record['s3']['object']['key']
            process_video(bucket, video_key)
    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Processing started'})
    }

def process_video(bucket, video_key):
    video_path = f'/tmp/{os.path.basename(video_key)}'
    audio_key = video_key.replace('.mp4', '.mp3')
    audio_path = f'/tmp/{os.path.basename(audio_key)}'
    s3.download_file(bucket, video_key, video_path)
    subprocess.run(['ffmpeg', '-i', video_path, '-q:a', '0', '-map', 'a', audio_path], check=True)
    s3.upload_file(audio_path, bucket, audio_key)
    os.remove(video_path)
    os.remove(audio_path)