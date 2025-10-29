'use server';

import { z } from 'zod';
import { db } from '@/firebase/server';
import { addDoc, collection } from 'firebase/firestore';
import { detectUserEmotion } from '@/ai/flows/detect-user-emotion';
import { generateEmpatheticResponse } from '@/ai/flows/generate-empathetic-response';
import { summarizeProgress } from '@/ai/flows/summarize-progress';
import { transcribeAudio as transcribeAudioFlow, TranscribeAudioInput, TranscribeAudioOutput } from '@/ai/flows/transcribe-audio';
import { getDialogflowResponse as getDialogflowResponseFlow, GetDialogflowResponseInput, GetDialogflowResponseOutput } from '@/ai/flows/get-dialogflow-response';
import { getMoodForecast as getMoodForecastFlow, MoodForecastOutput } from '@/ai/flows/get-mood-forecast';
import { textToSpeech as textToSpeechFlow, TextToSpeechInput, TextToSpeechOutput } from '@/ai/flows/text-to-speech';
import { mockPastWeekEntries } from '@/lib/data';
import type { JournalAnalysis } from '@/lib/definitions';
import { getVideoRecommendations } from '@/ai/flows/get-video-recommendations';

const journalSchema = z.object({
  entry: z.string().min(10, { message: 'Your entry should be at least 10 characters long.' }).max(1000, { message: 'Your entry should be no more than 1000 characters.' }),
});

export interface JournalFormState {
  message: string | null;
  analysis: JournalAnalysis | null;
  timestamp: number;
}

const symptomSchema = z.object({
  symptoms: z.string().min(3, { message: 'Symptoms should be at least 3 characters long.' }),
});

export interface SymptomFormState {
    message: string | null;
    success: boolean;
}

/**
 * Placeholder function to simulate sending an SOS alert.
 * In a real application, this would trigger a backend service.
 * @param userId - The ID of the user in crisis.
 * @param entry - The journal entry that triggered the alert.
 */
async function sendSosAlertToCaretakers(userId: string, entry: string) {
  // TODO: Implement actual backend logic here.
  // 1. Fetch the user's location using Google Maps Geolocation API or Find My Device.
  // 2. Fetch the user's designated caretakers from Firestore.
  // 3. For each caretaker, get their FCM token.
  // 4. Construct a notification payload via Firebase Cloud Messaging (FCM) including the user's name, a warning, and their location.
  // 5. Use the Firebase Admin SDK to send the message.
  console.log(`SOS Alert triggered for user ${userId}. Entry: "${entry}". Notifying caretakers with location.`);
  // This is a simulation. In a real app, do not log sensitive entry data.
}

export async function analyzeJournalEntry(
  prevState: JournalFormState,
  formData: FormData
): Promise<JournalFormState> {
  const validatedFields = journalSchema.safeParse({
    entry: formData.get('entry'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.entry?.[0] || 'Invalid input.',
      analysis: null,
      timestamp: Date.now(),
    };
  }

  const userInput = validatedFields.data.entry;

  try {
    const { emotion, sentimentScore, isCrisis } = await detectUserEmotion({ text: userInput });
    const { response } = await generateEmpatheticResponse({ emotionalState: emotion, userInput });

    if (isCrisis) {
      // In a real app, you would get the authenticated user's ID here.
      const mockUserId = 'user-123-mock'; 
      await sendSosAlertToCaretakers(mockUserId, userInput);
    }

    const { recommendations } = await getVideoRecommendations({ emotion, userInput });

    return {
      message: 'Analysis complete.',
      analysis: {
        emotion,
        sentimentScore,
        response,
        isCrisis,
        recommendations,
      },
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Sorry, I had trouble analyzing your entry. Please try again.',
      analysis: null,
      timestamp: Date.now(),
    };
  }
}


export interface SummaryFormState {
  message: string | null;
  summary: string | null;
  timestamp: number;
}

export async function generateWeeklySummary(
  prevState: SummaryFormState,
  formData: FormData
): Promise<SummaryFormState> {
  try {
    const { summary } = await summarizeProgress({ pastWeekEntries: mockPastWeekEntries });
    return {
      message: 'Summary generated.',
      summary,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Sorry, I had trouble generating the summary. Please try again.',
      summary: null,
      timestamp: Date.now(),
    };
  }
}

export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  return await transcribeAudioFlow(input);
}

export async function getDialogflowResponse(input: GetDialogflowResponseInput): Promise<GetDialogflowResponseOutput> {
    return await getDialogflowResponseFlow(input);
}

export async function getMoodForecast(): Promise<MoodForecastOutput> {
    return await getMoodForecastFlow();
}

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return await textToSpeechFlow(input);
}


export interface AuthFormState {
  message: string | null;
  success: boolean;
}

export async function saveSymptoms(
    prevState: SymptomFormState,
    formData: FormData
): Promise<SymptomFormState> {
    const validatedFields = symptomSchema.safeParse({
        symptoms: formData.get('symptoms'),
    });

    if (!validatedFields.success) {
        return {
            message: validatedFields.error.flatten().fieldErrors.symptoms?.[0] || 'Invalid input.',
            success: false,
        };
    }

    const { symptoms } = validatedFields.data;

    try {
        await addDoc(collection(db, 'symptoms'), {
            symptoms,
            timestamp: new Date(),
        });

        return {
            message: 'Symptoms saved successfully.',
            success: true,
        };
    } catch (error) {
        console.error('Error saving symptoms:', error);
        return {
            message: 'Sorry, I had trouble saving your symptoms. Please try again.',
            success: false,
        };
    }
}
