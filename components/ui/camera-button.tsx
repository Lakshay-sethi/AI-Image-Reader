import React, { useRef } from 'react';
import { Button } from './button';

interface CameraButtonProps {
  onCapture: (imageData: string) => void;
}

export function CameraButton({ onCapture }: CameraButtonProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Add state to track if camera is active
  const [isCameraActive, setIsCameraActive] = React.useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment" 
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        // Update the camera active state
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    // Update the camera active state
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        onCapture(imageData);
        stopCamera();
      }
    }
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="video-container">
      <video 
        className="camera-feed"
        ref={videoRef}
        autoPlay 
        playsInline 
      />
      {!isCameraActive ? (
        <Button onClick={startCamera} type="button" variant="outline">
          Open Camera
        </Button>
      ) : (
        <Button onClick={capturePhoto} type="button" variant="default">
          Take Photo
        </Button>
      )}
    </div>
  );
}
