import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

export default function OTPQRScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');

  // Start camera
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      // Start scanning frames
      requestAnimationFrame(scanFrame);
    } catch (err) {
      console.error(err);
      setError('Camera access denied. Please use manual entry.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code && code.data.startsWith('otpauth://')) {
        stopCamera();
        onScan(code.data); // OTP URL detected
        return;
      }
    }

    requestAnimationFrame(scanFrame);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <h2 className="text-white text-lg font-semibold">Scan OTP QR Code</h2>
        <button onClick={onClose} className="text-white text-3xl hover:text-gray-300">
          ×
        </button>
      </div>

      {/* Video container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md aspect-square">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-lg"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 border-4 border-white rounded-lg">
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-gray-300"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-gray-300"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-gray-300"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-gray-300"></div>
          </div>
        </div>
      </div>

      {/* Error & fallback */}
      {error && (
        <div className="bg-red-500 text-white p-4 text-center">{error}</div>
      )}

      <div className="bg-gray-800 p-4 text-center">
        <p className="text-white text-sm mb-4">Point your camera at your OTP QR code</p>
        <button onClick={onClose} className="text-gray-300 text-sm hover:text-white">
          Use manual entry instead
        </button>
      </div>
    </div>
  );
}