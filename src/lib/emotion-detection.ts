/**
 * Emotion Detection using MediaPipe Face Landmarks and simple heuristics
 * This provides real-time emotion detection from facial landmarks
 */

export type Emotion = 'happy' | 'sad' | 'angry' | 'surprised' | 'fearful' | 'disgusted' | 'neutral';

export interface EmotionResult {
  emotion: Emotion;
  confidence: number;
  landmarks?: number[];
}

/**
 * Simple emotion classifier based on facial landmark positions
 * Uses distance ratios and angles between key facial points
 */
export function classifyEmotionFromLandmarks(landmarks: any[]): EmotionResult {
  // MediaPipe Face Landmarks returns 468 points
  if (!landmarks || landmarks.length < 10) {
    return { emotion: 'neutral', confidence: 0 };
  }

  // Key landmark indices (based on 68-point model)
  // Left eyebrow outer, right eyebrow outer
  // Left eye corners, right eye corners
  // Mouth corners, nose tip
  // Top and bottom of mouth
  
  try {
    // MediaPipe Face Landmarks Model returns 468 points
    // Key landmarks indices (approximate for MediaPipe)
    const noseTip = landmarks[4] || landmarks[1];
    const leftMouthCorner = landmarks[61] || landmarks[291];
    const rightMouthCorner = landmarks[291] || landmarks[61];
    const leftEyeInner = landmarks[33] || landmarks[133];
    const rightEyeInner = landmarks[263] || landmarks[362];
    const leftEyeOuter = landmarks[33] || landmarks[7];
    const rightEyeOuter = landmarks[263] || landmarks[276];
    const foreheadCenter = landmarks[10] || landmarks[151];

    // Basic validation
    if (!landmarks[0] || landmarks.length < 10) {
      return { emotion: 'neutral', confidence: 0.3 };
    }

    // Calculate mouth width and height from available landmarks
    const mouthWidth = Math.abs((leftMouthCorner?.x || 0.5) - (rightMouthCorner?.x || 0.5));
    const mouthTopY = landmarks[13]?.y || landmarks[14]?.y || (noseTip?.y || 0.5) - 0.05;
    const mouthBottomY = landmarks[14]?.y || landmarks[17]?.y || (noseTip?.y || 0.5) + 0.05;
    const mouthHeight = Math.abs(mouthTopY - mouthBottomY);
    const mouthRatio = mouthHeight / (mouthWidth + 0.001);

    // Calculate eye/eyebrow position (stress indicator)
    const leftEyeHeight = leftEyeInner ? Math.abs((foreheadCenter?.y || 0.3) - (leftEyeInner.y || 0.5)) : 0;
    const rightEyeHeight = rightEyeInner ? Math.abs((foreheadCenter?.y || 0.3) - (rightEyeInner.y || 0.5)) : 0;
    const avgEyebrowHeight = (leftEyeHeight + rightEyeHeight) / 2;

    // Calculate mouth curvature (smile/frown)
    const mouthLeftY = leftMouthCorner?.y || 0.5;
    const mouthRightY = rightMouthCorner?.y || 0.5;
    const mouthCenterY = (mouthLeftY + mouthRightY) / 2;
    const mouthCurvature = mouthCenterY - mouthBottomY;

    // Emotion classification heuristics
    let emotion: Emotion = 'neutral';
    let confidence = 0.6;

    // Happy: upward mouth curvature, wider mouth
    if (mouthCurvature < -0.01 && mouthRatio < 0.3) {
      emotion = 'happy';
      confidence = 0.75;
    }
    // Sad: downward mouth curvature, narrow mouth
    else if (mouthCurvature > 0.01 && mouthRatio < 0.25) {
      emotion = 'sad';
      confidence = 0.7;
    }
    // Surprised: wide mouth, raised eyebrows
    else if (mouthRatio > 0.4 && avgEyebrowHeight > 0.03) {
      emotion = 'surprised';
      confidence = 0.7;
    }
    // Angry: lowered eyebrows, tight mouth
    else if (avgEyebrowHeight < 0.02 && mouthRatio < 0.2) {
      emotion = 'angry';
      confidence = 0.65;
    }
    // Fearful: wide eyes, raised eyebrows
    else if (avgEyebrowHeight > 0.025 && mouthRatio > 0.3) {
      emotion = 'fearful';
      confidence = 0.65;
    }

    return { emotion, confidence, landmarks: landmarks.map(p => [p.x, p.y, p.z]).flat() };
  } catch (error) {
    console.error('Error classifying emotion:', error);
    return { emotion: 'neutral', confidence: 0.3 };
  }
}

/**
 * Enhanced emotion detection using TensorFlow.js (if available)
 */
export async function detectEmotionFromVideo(video: HTMLVideoElement): Promise<EmotionResult | null> {
  if (!video || !video.videoWidth || !video.videoHeight) {
    return null;
  }

  // Use a canvas to capture frame
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return null;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  // Try to use MediaPipe Face Landmarks if available
  try {
    // This will be initialized in the component
    // For now, return a placeholder that will be enhanced
    return { emotion: 'neutral', confidence: 0 };
  } catch (error) {
    console.error('Emotion detection error:', error);
    return null;
  }
}

