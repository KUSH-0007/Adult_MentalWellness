'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Video, VideoOff, Loader2, Smile, Frown, Meh, Angry, AlertCircle, AlertTriangle, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { Emotion } from '@/lib/emotion-detection';
import { classifyEmotionFromLandmarks } from '@/lib/emotion-detection';

const emotionConfig: Record<string, { name: string; icon: JSX.Element; color: string }> = {
  happy: { name: 'Happy', icon: <Smile className="text-emerald-500" />, color: 'text-emerald-500' },
  sad: { name: 'Sad', icon: <Frown className="text-blue-500" />, color: 'text-blue-500' },
  neutral: { name: 'Neutral', icon: <Meh className="text-amber-500" />, color: 'text-amber-500' },
  angry: { name: 'Angry', icon: <Angry className="text-red-500" />, color: 'text-red-500' },
  surprised: { name: 'Surprised', icon: <AlertCircle className="text-purple-500" />, color: 'text-purple-500' },
  fearful: { name: 'Fearful', icon: <AlertTriangle className="text-orange-500" />, color: 'text-orange-500' },
  disgusted: { name: 'Disgusted', icon: <Frown className="text-lime-600" />, color: 'text-lime-600' },
};

export function FacialEmotionRecognition() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<{ name: string; icon: JSX.Element; confidence: number } | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize MediaPipe Face Landmarker
  useEffect(() => {
    async function initializeFaceLandmarker() {
      try {
        setIsModelLoading(true);
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });

        faceLandmarkerRef.current = faceLandmarker;
        setIsModelLoading(false);
      } catch (error) {
        console.error('Error loading face landmarker model:', error);
        setIsModelLoading(false);
        toast({
          variant: 'destructive',
          title: 'Model Loading Failed',
          description: 'Could not load emotion detection model. Using basic detection.',
        });
      }
    }

    initializeFaceLandmarker();
  }, [toast]);

  const getCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      setHasCameraPermission(true);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      return stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use this feature.',
      });
      return null;
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
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };
  
  const detectEmotion = async () => {
    if (!videoRef.current || !videoRef.current.videoWidth || !faceLandmarkerRef.current) {
      return;
    }

    const video = videoRef.current;
    const faceLandmarker = faceLandmarkerRef.current;
    const canvas = canvasRef.current;
    
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      // Get face landmarks
      const results = faceLandmarker.detectForVideo(video, performance.now());
      
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        
        // Classify emotion from landmarks
        const emotionResult = classifyEmotionFromLandmarks(landmarks);
        
        if (emotionResult) {
          const emotionConfig_item = emotionConfig[emotionResult.emotion] || emotionConfig.neutral;
          setDetectedEmotion({
            name: emotionConfig_item.name,
            icon: emotionConfig_item.icon,
            confidence: emotionResult.confidence
          });
        }

        // Draw subtle face outline for visualization (optional)
        if (landmarks && landmarks.length > 10) {
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          // Draw face outline (simplified - just connect key points)
          const keyPoints = [10, 151, 234, 454, 359, 276, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323];
          for (let i = 0; i < keyPoints.length && keyPoints[i] < landmarks.length; i++) {
            const idx = keyPoints[i];
            const x = landmarks[idx].x * canvas.width;
            const y = landmarks[idx].y * canvas.height;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          ctx.stroke();
        }
      } else {
        // No face detected
        if (detectedEmotion) {
          // Keep last emotion for a moment
          setTimeout(() => {
            setDetectedEmotion(null);
          }, 1000);
        }
      }

      // Continue detection loop
      if (isDetecting) {
        animationFrameRef.current = requestAnimationFrame(detectEmotion);
      }
    } catch (error) {
      console.error('Detection error:', error);
      if (isDetecting) {
        animationFrameRef.current = requestAnimationFrame(detectEmotion);
      }
    }
  };

  const startDetection = async () => {
    const stream = await getCameraPermission();
    if (!stream) return;

    setIsDetecting(true);
    
    // Wait for video to be ready
    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', () => {
        detectEmotion();
      }, { once: true });
    }
  };

  const stopDetection = () => {
    setIsDetecting(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setDetectedEmotion(null);
    stopCamera();
  };

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      stopDetection();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-blue-50/50 border-slate-200/60 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-700">
          <Eye className="w-5 h-5 text-indigo-500" />
          Real-time Emotion Check-in
        </CardTitle>
        <CardDescription className="text-slate-600">
          Use your camera to get real-time feedback on your facial emotion. This is a private and local analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video w-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden flex items-center justify-center shadow-inner border border-slate-200/50">
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover rounded-xl" 
            autoPlay 
            muted 
            playsInline 
          />
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 pointer-events-none"
            style={{ mixBlendMode: 'multiply' }}
          />
          {!isDetecting && hasCameraPermission === false && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-white/90 to-slate-50/90 backdrop-blur-sm rounded-xl p-4 text-center">
                <VideoOff className="w-12 h-12 text-slate-400 mb-4" />
                <p className="text-slate-600 font-medium">Camera is off</p>
                <p className="text-sm text-slate-500 mt-1">Click "Start Check-in" to begin</p>
            </div>
          )}
          {isModelLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
              <p className="text-sm text-slate-600">Loading emotion detection model...</p>
            </div>
          )}
          {isDetecting && !isModelLoading && (
             <div className="absolute top-3 right-3 z-10">
              {detectedEmotion ? (
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-2 text-base px-4 py-2 bg-white/95 backdrop-blur-sm border-slate-200 shadow-lg animate-in fade-in zoom-in duration-300"
                >
                  {detectedEmotion.icon}
                  <span className="font-semibold text-slate-700">{detectedEmotion.name}</span>
                  <span className="text-xs text-slate-500">{(detectedEmotion.confidence * 100).toFixed(0)}%</span>
                </Badge>
              ) : (
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-2 text-base px-4 py-2 bg-white/95 backdrop-blur-sm border-slate-200 shadow-lg"
                >
                  <Loader2 className="animate-spin text-indigo-500" />
                  <span className="text-slate-700">Analyzing...</span>
                </Badge>
              )}
            </div>
          )}
          {isDetecting && (
            <div className="absolute bottom-3 left-3 z-10">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>
        
        {!hasCameraPermission && !isDetecting && (
          <Alert variant="default" className="bg-blue-50/50 border-blue-200/50">
            <AlertTitle className="text-blue-900">Camera Access Required</AlertTitle>
            <AlertDescription className="text-blue-700">
              Please allow camera access to use this feature. Your privacy is protected — all processing happens locally.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center gap-3">
          <Button 
            onClick={startDetection} 
            disabled={isDetecting || isModelLoading}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:scale-105"
          >
            <Video className="mr-2" /> Start Check-in
          </Button>
          <Button 
            onClick={stopDetection} 
            disabled={!isDetecting} 
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-50 transition-all duration-300"
          >
            <VideoOff className="mr-2" /> Stop
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
