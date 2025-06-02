# Caption Generator
A serverless video captioning application that automatically transcribes uploaded videos into text using an AI-driven pipeline. Built with modern tech to deliver fast, accurate captions in a scalable way—perfect for creators and developers looking to add transcription to their workflows!

# Features
Upload videos via a sleek Next.js frontend and get transcriptions in seconds.
Automatically extracts audio from videos and transcribes it using OpenAI Whisper API.
Stores videos, audio, and transcriptions in AWS S3 with an event-driven architecture.

# Tech Stack
- **Frontend**: Next.js (React framework for video uploads and transcription display)
- **Backend**: AWS Lambda (Python 3.9 for serverless audio extraction and transcription)
- **Storage**: AWS S3 (file storage for .mp4, .mp3, and .txt)
- **Transcription**: OpenAI Whisper API (AI-powered audio-to-text conversion)
- **Infrastructure**: AWS IAM (permissions), AWS CloudWatch (logging)
- **Language**: Python 3.9 (Lambda), JavaScript (Next.js)
- **Libraries**: boto3 (AWS SDK), openai (Whisper API), @aws-sdk/client-s3 (S3 access in Next.js)

# Architecture
- **The app follows an event-driven pipeline**:
  - Users upload videos (.mp4) via the Next.js frontend to an S3 bucket (video-caption-bucket).
  - An extract-audio Lambda function triggers on .mp4 uploads, converts videos to .mp3, and stores them in S3.
  - A transcribe_audio Lambda function triggers on .mp3 files, uses OpenAI Whisper API to transcribe audio, and saves the .txt transcription back to S3.
  - The Next.js frontend retrieves and displays the transcription for the user.

# Prerequisites
- AWS account (Free Tier recommended for low-cost testing)
- OpenAI API Whisper
- Node.js and npm for the Next.js frontend
- Python 3.9 for Lambda development
