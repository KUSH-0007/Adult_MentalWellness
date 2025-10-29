import { config } from 'dotenv';
config();

import '@/ai/flows/generate-empathetic-response.ts';
import '@/ai/flows/detect-user-emotion.ts';
import '@/ai/flows/summarize-progress.ts';
import '@/ai/flows/transcribe-audio.ts';
import '@/ai/flows/get-dialogflow-response.ts';
import '@/ai/flows/get-mood-forecast.ts';
import '@/ai/flows/get-video-recommendations.ts';
import '@/ai/flows/text-to-speech.ts';
