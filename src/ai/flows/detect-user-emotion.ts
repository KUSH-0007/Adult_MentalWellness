'use server';

/**
 * @fileOverview A flow to detect the user's emotion and potential crisis from their text input.
 *
 * - detectUserEmotion - A function that handles the emotion detection process.
 * - DetectUserEmotionInput - The input type for the detectUserEmotion function.
 * - DetectUserEmotionOutput - The return type for the detectUserEmotion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectUserEmotionInputSchema = z.object({
  text: z.string().describe('The text input from the user.'),
});
export type DetectUserEmotionInput = z.infer<typeof DetectUserEmotionInputSchema>;

const DetectUserEmotionOutputSchema = z.object({
  emotion: z.string().describe('The detected emotion from the user input. Common emotions include: joy, sadness, anger, fear, surprise, disgust, love, hope, etc. You can also use more nuanced emotions like "overwhelmed" or "anxious".'),
  sentimentScore: z.number().describe('The sentiment score of the user input. Range from -1 (very negative) to 1 (very positive).'),
  isCrisis: z.boolean().describe('Whether the user input contains phrases indicating a crisis or immediate danger.'),
});
export type DetectUserEmotionOutput = z.infer<typeof DetectUserEmotionOutputSchema>;

export async function detectUserEmotion(input: DetectUserEmotionInput): Promise<DetectUserEmotionOutput> {
  return detectUserEmotionFlow(input);
}

const detectUserEmotionFlow = ai.defineFlow(
  {
    name: 'detectUserEmotionFlow',
    inputSchema: DetectUserEmotionInputSchema,
    outputSchema: DetectUserEmotionOutputSchema,
  },
  async input => {
    
    // First, get the sentiment from the Natural Language API
    const sentimentAnalysis = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `Analyze the sentiment of the following text and provide a score from -1.0 to 1.0. Text: "${input.text}"`,
      output: {
        schema: z.object({ sentimentScore: z.number() }),
      },
      config: {
        temperature: 0.1,
      }
    });
    
    const sentimentScore = sentimentAnalysis.output?.sentimentScore ?? 0;

    // Then, use a model for emotion detection
    const emotionAnalysis = await ai.generate({
      model: 'googleai/gemini-2.5-flash', 
      prompt: `You are an AI that has been trained to classify emotions with high accuracy. Based on the following text, what is the primary emotion being expressed? Text: "${input.text}"`,
      output: {
        schema: z.object({ emotion: z.string() }),
      },
      config: {
        temperature: 0.4,
      }
    });
    
    const emotion = emotionAnalysis.output?.emotion ?? 'neutral';

    // Finally, detect crisis phrases using Natural Language API capabilities
    const crisisDetection = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `You are a crisis detection system. Analyze the following text for any indication that the user is in immediate danger, is considering self-harm, or is in a crisis situation. Respond with only a boolean value. Text: "${input.text}"`,
      output: {
        schema: z.object({ isCrisis: z.boolean() }),
      },
      config: {
        temperature: 0.0,
      }
    });

    const isCrisis = crisisDetection.output?.isCrisis ?? false;

    return {
      emotion,
      sentimentScore,
      isCrisis,
    };
  }
);
