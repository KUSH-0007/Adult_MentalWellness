'use server';
/**
 * @fileOverview A flow to transcribe audio input using Google Cloud Speech-to-Text.
 *
 * - transcribeAudio - A function that handles the audio transcription process.
 * - TranscribeAudioInput - The input type for the transcribeAudio function.
 * - TranscribeAudioOutput - The return type for the transcribeAudio function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z.string().describe(
    "A chunk of audio to be transcribed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:audio/webm;base64,<encoded_data>'."
  ),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio input.'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
      // Using a more advanced model that supports audio input.
      // Note: You might need to enable specific APIs in your Google Cloud project.
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        { media: { url: input.audioDataUri } },
        { text: 'Transcribe the following audio recording from a person journaling their thoughts.' },
      ],
      config: {
        temperature: 0.1, // Lower temperature for more deterministic transcription
      },
    });

    return {
      transcription: text,
    };
  }
);
