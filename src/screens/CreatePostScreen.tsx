import React, { useState, useRef } from 'react';
import { CameraIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

export const CreatePostScreen: React.FC = () => {
  const [caption, setCaption] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handlePost = () => {
    if (!selectedMedia && !caption.trim()) {
      alert('Please add some content to your post');
      return;
    }
    
    // Placeholder for post creation logic
    alert('Post created successfully!');
    setCaption('');
    setSelectedMedia(null);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
        audio: false
      });
      
      setStream(mediaStream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setSelectedMedia(imageDataUrl);
        stopCamera();
      }
    }
  };

  const handleMediaSelect = (type: 'camera' | 'gallery') => {
    if (type === 'camera') {
      startCamera();
    } else {
      // Simulate gallery selection
      setSelectedMedia(`https://picsum.photos/800/600?random=${Date.now()}`);
    }
  };

  const removeMedia = () => {
    setSelectedMedia(null);
  };

  // Camera Preview Component
  if (showCamera) {
    return (
      <div className="h-full bg-black flex flex-col">
        {/* Camera Header */}
        <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm">
          <button
            onClick={stopCamera}
            className="text-white p-2 rounded-full hover:bg-gray-800 active:scale-95 transition-all"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-white">Take Photo</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Camera Preview */}
        <div className="flex-1 relative overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Camera Controls */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <button
              onClick={capturePhoto}
              className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:border-gray-400 active:scale-95 transition-all shadow-lg"
            >
              <div className="w-full h-full bg-white rounded-full" />
            </button>
          </div>
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="h-full bg-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-white">Create Post</h1>
          <button
            onClick={handlePost}
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={!selectedMedia && !caption.trim()}
          >
            Share
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User Info */}
        <div className="flex items-center space-x-3">
          <img
            src="https://i.pravatar.cc/300?img=default"
            alt="Your profile"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
          />
          <div>
            <h3 className="font-semibold text-white">Alex Johnson</h3>
          </div>
        </div>

        {/* Caption Input */}
        <div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's happening?"
            className="w-full h-32 px-0 py-0 bg-transparent border-none text-white placeholder-gray-400 focus:outline-none resize-none text-lg"
            maxLength={500}
          />
          <div className="flex justify-end mt-2">
            <span className={`text-xs ${caption.length > 450 ? 'text-red-400' : 'text-gray-400'}`}>
              {caption.length}/500
            </span>
          </div>
        </div>

        {/* Selected Media Preview */}
        {selectedMedia && (
          <div className="relative">
            <img
              src={selectedMedia}
              alt="Selected media"
              className="w-full h-64 object-cover rounded-lg"
            />
            <button
              onClick={removeMedia}
              className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/80 active:scale-95 transition-all"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Media Upload Options */}
        {!selectedMedia && (
          <div className="border-2 border-dashed border-gray-700 rounded-xl p-8">
            <div className="text-center">
              <div className="flex justify-center space-x-6 mb-4">
                <button 
                  onClick={() => handleMediaSelect('camera')}
                  className="flex flex-col items-center p-6 bg-gray-800 rounded-xl hover:bg-gray-700 active:scale-95 transition-all"
                >
                  <CameraIcon className="w-10 h-10 text-blue-400 mb-3" />
                  <span className="text-sm font-medium text-white">Camera</span>
                  <span className="text-xs text-gray-400 mt-1">Take a photo</span>
                </button>
                <button 
                  onClick={() => handleMediaSelect('gallery')}
                  className="flex flex-col items-center p-6 bg-gray-800 rounded-xl hover:bg-gray-700 active:scale-95 transition-all"
                >
                  <PhotoIcon className="w-10 h-10 text-green-400 mb-3" />
                  <span className="text-sm font-medium text-white">Gallery</span>
                  <span className="text-xs text-gray-400 mt-1">Choose from library</span>
                </button>
              </div>
              <p className="text-gray-400 text-sm">Add photos or videos to your post</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};