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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-6 text-blue-800">Video Captioning App</h1>
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <input
          type="file"
          accept="video/mp4"
          onChange={handleFileChange}
          disabled={uploading || polling}
          className="mb-4 w-full text-gray-700 border rounded-lg p-2"
        />
        {videoPreview && (
          <video
            ref={videoRef}
            src={videoPreview}
            controls
            className="mb-4 w-full max-w-xs mx-auto rounded-lg"
          />
        )}
        {uploading && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">Upload progress: {progress}%</p>
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={uploading || polling || !file}
          className={`w-full py-2 px-4 rounded-lg text-white font-semibold ${
            uploading || polling
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {uploading ? 'Uploading...' : polling ? 'Processing...' : 'Upload Video'}
        </button>
        {message && (
          <p
            className={`mt-4 text-center ${
              message.includes('Error') ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {message}
          </p>
        )}
      </div>
      {transcription && (
        <div className="w-full max-w-md mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Transcription</h2>
          <pre className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap break-words">
            {transcription}
          </pre>
          <button
            onClick={handleDownload}
            className="mt-4 w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
          >
            Download Transcription
          </button>
        </div>
      )}
    </div>
  );
}