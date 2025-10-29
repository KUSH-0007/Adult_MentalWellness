'use server';

/**
 * @fileOverview A flow to simulate mood forecasting.
 *
 * - getMoodForecast - A function that returns a simulated mood forecast.
 * - MoodForecastOutput - The return type for the getMoodForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MoodForecastOutputSchema = z.object({
  predictedMood: z.string().describe('The predicted mood for the next day.'),
  confidence: z.number().describe('The confidence score of the prediction (0-1).'),
  reasoning: z.string().describe('A brief explanation for the prediction based on recent trends.'),
});
export type MoodForecastOutput = z.infer<typeof MoodForecastOutputSchema>;

export async function getMoodForecast(): Promise<MoodForecastOutput> {
  return getMoodForecastFlow();
}

const getMoodForecastFlow = ai.defineFlow(
  {
    name: 'getMoodForecastFlow',
    outputSchema: MoodForecastOutputSchema,
  },
  async () => {
    // In a real implementation, this would trigger a Vertex AI Pipeline
    // that runs a BigQuery ML model and returns the result.
    // For now, we'll return a simulated forecast.
    const moods = ['Optimistic', 'Neutral', 'A bit down'];
    const predictedMood = moods[Math.floor(Math.random() * moods.length)];
    const confidence = Math.random() * (0.95 - 0.75) + 0.75;
    
    let reasoning = "Based on your recent journal entries, your mood seems to be on an upward trend.";
    if (predictedMood === 'Neutral') {
        reasoning = "Your emotional state appears stable, with a mix of positive and negative feelings recently."
    } else if (predictedMood === 'A bit down') {
        reasoning = "Some of your recent entries suggest you've been feeling a little overwhelmed. It's okay to have off days."
    }

    return {
      predictedMood,
      confidence,
      reasoning,
    };
  }
);
