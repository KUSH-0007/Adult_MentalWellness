'use server';

/**
 * @fileOverview Simulates a response from a Dialogflow CX agent for empathetic conversation.
 *
 * - getDialogflowResponse - A function that handles the conversation turn.
 * - GetDialogflowResponseInput - The input type for the function.
 * - GetDialogflowResponseOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { guidedExercises } from '@/lib/data';
import { GenerateStickerOutput } from './generate-sticker';

const SuggestedExerciseSchema = z.object({
  id: z.string().describe('The unique ID of the exercise.'),
  title: z.string().describe('The title of the exercise.'),
  description: z.string().describe('A brief description of the exercise.'),
});

const getAvailableExercises = ai.defineTool(
  {
    name: 'getAvailableExercises',
    description: 'Get a list of available guided mindfulness and breathing exercises.',
    outputSchema: z.array(SuggestedExerciseSchema),
  },
  async () => {
    return guidedExercises.map(({ id, title, description }) => ({ id, title, description }));
  }
);


const GetDialogflowResponseInputSchema = z.object({
  message: z.string().describe('The user\'s message to the conversational agent.'),
});
export type GetDialogflowResponseInput = z.infer<typeof GetDialogflowResponseInputSchema>;

const GetDialogflowResponseOutputSchema = z.object({
  response: z.string().describe('The empathetic response from the agent.'),
  suggestedExercise: SuggestedExerciseSchema.optional().describe('A relevant exercise suggested to the user.'),
});
export type GetDialogflowResponseOutput = z.infer<typeof GetDialogflowResponseOutputSchema>;

export async function getDialogflowResponse(
  input: GetDialogflowResponseInput
): Promise<GetDialogflowResponseOutput> {
  return getDialogflowResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getDialogflowResponsePrompt',
  input: { schema: GetDialogflowResponseInputSchema },
  output: { schema: GetDialogflowResponseOutputSchema },
  tools: [getAvailableExercises],
  prompt: `You are SentiHeal, an empathetic and supportive AI companion powered by Google's Gemini API. Your persona is warm, caring, and non-judgmental. You are designed to provide helpful, advanced, and natural-sounding conversational responses for a mental wellness app.

Your primary goal is to:
1.  Listen actively and validate the user's feelings with deep understanding.
2.  Respond with empathy, warmth, and genuine compassion.
3.  Offer gentle encouragement or a different, constructive perspective.
4.  Keep responses concise, supportive, and highly conversational, like a real chat. Avoid overly long or clinical answers.
5.  If the user expresses feelings of stress, anxiety, or being overwhelmed, use the getAvailableExercises tool to see what's available and suggest ONE relevant exercise. Include the suggestion in the suggestedExercise field of your response.
6.  Never give medical advice. If the user seems to be in crisis, gently guide them towards the "Need Immediate Support?" section of the app.

User's message: {{{message}}}

Your advanced, empathetic response:`,
});

const getDialogflowResponseFlow = ai.defineFlow(
  {
    name: 'getDialogflowResponseFlow',
    inputSchema: GetDialogflowResponseInputSchema,
    outputSchema: GetDialogflowResponseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
