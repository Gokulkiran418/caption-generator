# Video Captioning Web Application

A web application that uploads videos, extracts audio, and generates transcriptions using AWS services and a Next.js frontend. Built with AWS Free Tier in the `ap-southeast-1` region.

## Features

- **Video Upload**: Upload `.mp4` videos via a Next.js frontend to Amazon S3 using pre-signed URLs.
- **Audio Extraction**: AWS Lambda with `ffmpeg` converts `.mp4` to `.mp3`.
- **Transcription**: Python script on EC2 generates `.txt` transcriptions.
- **Frontend Display**: Shows video preview, upload progress, transcription text, and download option.
- **Responsive UI**: Styled with Tailwind CSS, includes loading states and error handling.

## Architecture

- **Frontend**: Next.js app for video upload and transcription display.
- **Backend**:
  - **Amazon S3**: Stores `.mp4`, `.mp3`, and `.txt` files.
  - **AWS Lambda**: Generates pre-signed URLs and extracts audio.
  - **Amazon EC2**: Runs `poll_s3.py` and `transcribe.py` for transcription.
  - **API Gateway**: Handles pre-signed URL requests.


