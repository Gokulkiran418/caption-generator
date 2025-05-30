import boto3
import time
import os
import subprocess
import logging

logging.basicConfig(filename='poll_s3.log', level=logging.INFO)

s3 = boto3.client('s3')
BUCKET_NAME = '<bucket_name>'  # Replace with your bucket name
PROCESSED_FILES = set()

def check_new_files():
    logging.info("Checking for new files")
    try:
        response = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix='')
        if 'Contents' not in response:
            logging.info("No files found")
            return
        for obj in response['Contents']:
            key = obj['Key']
            if key.endswith('.mp3') and key not in PROCESSED_FILES:
                logging.info(f"Processing {key}")
                subprocess.run(['python3.8', 'transcribe.py', BUCKET_NAME, key], check=True)
                PROCESSED_FILES.add(key)
    except Exception as e:
        logging.error(f"Error: {str(e)}")

if __name__ == '__main__':
    while True:
        check_new_files()
        time.sleep(30)