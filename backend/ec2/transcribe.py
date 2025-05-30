import whisper
import boto3
import os

s3 = boto3.client('s3')

def transcribe_audio(bucket, audio_key):
    local_audio = 'local.mp3'
    s3.download_file(bucket, audio_key, local_audio)
    model = whisper.load_model('tiny')
    result = model.transcribe(local_audio)
    captions = result['text']
    # Use basename to avoid directory prefix
    captions_file = os.path.basename(audio_key) + '.txt'
    with open(captions_file, 'w') as f:
        f.write(captions)
    s3.upload_file(captions_file, bucket, f'{audio_key}.txt')
    os.remove(local_audio)
    os.remove(captions_file)
    return captions_file

if __name__ == '__main__':
    import sys
    bucket, audio_key = sys.argv[1], sys.argv[2]
    transcribe_audio(bucket, audio_key)