'use client';
import { useState, useRef } from 'react';
import axios from 'axios';

export default function Home() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [message, setMessage] = useState('');
  const [transcription, setTranscription] = useState('');
  const [progress, setProgress] = useState(0);
  const [videoPreview, setVideoPreview] = useState(null);
  const videoRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('video/')) {
        setMessage('Please select a valid video file (e.g., .mp4).');
        return;
      }
      setFile(selectedFile);
      setTranscription('');
      setMessage('');
      setVideoPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a video file.');
      return;
    }
    setUploading(true);
    setMessage('Uploading video...');
    try {
      const response = await axios.get('<invoke-url>/presigned-url');
      const { presigned_url, video_key, txt_url } = response.data;
      await axios.put(presigned_url, file, {
        headers: { 'Content-Type': 'video/mp4' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });
      setMessage('Video uploaded! Waiting for transcription...');
      setProgress(100);
      await pollTranscription(txt_url);
    } catch (error) {
      const errorMsg = error.response
        ? `Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
        : `Error: ${error.message}`;
      setMessage(errorMsg);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const pollTranscription = async (txtUrl) => {
    setPolling(true);
    for (let i = 0; i < 20; i++) {
      try {
        const response = await axios.get(txtUrl);
        setTranscription(response.data);
        setMessage('Transcription loaded!');
        setPolling(false);
        return;
      } catch (error) {
        if (error.response?.status !== 404) {
          setMessage(`Error fetching transcription: ${error.message}`);
          setPolling(false);
          return;
        }
        setMessage(`Waiting for transcription (${(i + 1) * 5}s)...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
    setMessage('Transcription not available yet. Try refreshing later.');
    setPolling(false);
  };

  const handleDownload = () => {
    const blob = new Blob([transcription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcription.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-dark-text mb-8 text-center">Video Captioning</h1>
        <div className="bg-dark-card rounded-xl shadow-lg p-6 mb-6 transition-all duration-300 hover:shadow-2xl">
          <input
            type="file"
            accept="video/mp4"
            onChange={handleFileChange}
            disabled={uploading || polling}
            className="w-full text-dark-muted bg-dark-bg border border-dark-muted rounded-lg p-2 mb-4 focus:outline-none focus:border-dark-accent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-dark-accent file:text-dark-text file:cursor-pointer"
          />
          {videoPreview && (
            <video
              ref={videoRef}
              src={videoPreview}
              controls
              className="w-full max-w-xs mx-auto rounded-lg mb-4 shadow-md" // Changed max-w-md to max-w-xs
            />
          )}
          {uploading && (
            <div className="mb-4">
              <div className="w-full bg-dark-muted rounded-full h-2.5">
                <div
                  className="bg-dark-accent h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-dark-muted mt-2 text-center">Upload Progress: {progress}%</p>
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={uploading || polling || !file}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-dark-text transition-all duration-300 ${
              uploading || polling
                ? 'bg-dark-muted cursor-not-allowed'
                : 'bg-dark-accent hover:bg-blue-600'
            }`}
          >
            {uploading ? 'Uploading...' : polling ? 'Processing...' : 'Upload Video'}
          </button>
          {message && (
            <p
              className={`mt-4 text-center text-sm ${
                message.includes('Error') ? 'text-red-400' : 'text-green-400'
              }`}
            >
              {message}
            </p>
          )}
        </div>
        {transcription && (
          <div className="bg-dark-card rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-2xl">
            <h2 className="text-2xl font-semibold text-dark-text mb-4">Transcription</h2>
            <pre className="bg-dark-bg text-dark-muted p-4 rounded-lg whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
              {transcription}
            </pre>
            <button
              onClick={handleDownload}
              className="mt-4 w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-dark-text rounded-lg font-semibold transition-all duration-300"
            >
              Download Transcription
            </button>
          </div>
        )}
      </div>
    </div>
  );
}