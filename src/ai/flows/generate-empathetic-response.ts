'use server';

/**
 * @fileOverview A flow that generates empathetic responses based on the user's emotional state.
 *
 * - generateEmpatheticResponse - A function that generates empathetic responses.
 * - GenerateEmpatheticResponseInput - The input type for the generateEmpatheticResponse function.
 * - GenerateEmpatheticResponseOutput - The return type for the generateEmpatheticResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEmpatheticResponseInputSchema = z.object({
  emotionalState: z
    .string()
    .describe('The current emotional state of the user.'),
  userInput: z.string().describe('The user input to respond to.'),
});
export type GenerateEmpatheticResponseInput = z.infer<
  typeof GenerateEmpatheticResponseInputSchema
>;

const GenerateEmpatheticResponseOutputSchema = z.object({
  response: z.string().describe('The empathetic response to the user input.'),
});
export type GenerateEmpatheticResponseOutput = z.infer<
  typeof GenerateEmpatheticResponseOutputSchema
>;

export async function generateEmpatheticResponse(
  input: GenerateEmpatheticResponseInput
): Promise<GenerateEmpatheticResponseOutput> {
  return generateEmpatheticResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEmpatheticResponsePrompt',
  input: {schema: GenerateEmpatheticResponseInputSchema},
  output: {schema: GenerateEmpatheticResponseOutputSchema},
  prompt: `You are an empathetic mental health companion.  Respond to the user in a way that acknowledges their feelings and offers support.

User's emotional state: {{{emotionalState}}}
User input: {{{userInput}}}

Empathetic response:`,
});

const generateEmpatheticResponseFlow = ai.defineFlow(
  {
    name: 'generateEmpatheticResponseFlow',
    inputSchema: GenerateEmpatheticResponseInputSchema,
    outputSchema: GenerateEmpatheticResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
